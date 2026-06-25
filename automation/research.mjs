#!/usr/bin/env node
/**
 * 复利发现引擎 — 自动调研脚本
 *
 * 流程：读取 sources.json → 调用 Claude (带 web_search) 发现并分析海外创业项目
 *      → 严格按 schema 产出 JSON → 与现有 projects.json 合并去重 → 写回 data/。
 *
 * 运行：
 *   ANTHROPIC_API_KEY=sk-... node automation/research.mjs
 *   DRY_RUN=1 node automation/research.mjs    # 不写文件，仅打印
 *
 * 人工介入点：
 *   ⚠️ 需要配置 ANTHROPIC_API_KEY（在本地或 GitHub Secrets）
 *   ⚠️ 建议定期人工抽查新增项目的真实性与合规性
 */

import Anthropic from '@anthropic-ai/sdk';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DATA = join(ROOT, 'data');

const MODEL = process.env.RESEARCH_MODEL || 'claude-sonnet-4-6';
const DRY_RUN = process.env.DRY_RUN === '1';
const TARGET_NEW = Number(process.env.TARGET_NEW || 3); // 每次新增项目数

const today = () => new Date().toISOString().slice(0, 10);

async function readJSON(path, fallback) {
  try { return JSON.parse(await readFile(path, 'utf8')); }
  catch { return fallback; }
}

const SYSTEM = `你是一名跨境独立创业研究分析师 + 全栈增长黑客。
使命：发现可被一人 + AI 快速复制、低启动成本、能产生现金流并复利增长的海外创业项目。
要求：
- 用 web_search 检索真实、近期的项目与数据。
- 不要编造数据；无法核实的 ROI/收入必须标注 "(estimate)"。
- 如实标注自动化边界：注册/收款/KYC/商务/审核等必须人工的环节要列入 humanInterventionPoints。
- 严格只输出 JSON 数组，不要任何解释文字、不要 markdown 代码围栏。`;

function buildPrompt(sources, existingNames) {
  const srcList = (sources.sources || []).filter(s => s.enabled).map(s => `- ${s.name} (${s.url})`).join('\n');
  return `请检索以下信息源附近的高潜力海外创业项目：
${srcList}

参考检索词：${(sources.searchQueries || []).join(' / ')}

筛选标准：MVP ≤ 4 周可完成、启动成本 ≤ $1000、现金流路径清晰、可复制、有增长信号。

【已在库，请勿重复】：${existingNames.join('、') || '（空）'}

请发现 ${TARGET_NEW} 个【新】项目，每个严格按以下 JSON 结构输出（automationLevel 取 ai-auto/ai-human/manual 之一，
compoundScore 0-100，metrics 含 estimatedRoi/paybackPeriodMonths/startupCostUsd/monthlyRevenuePotentialUsd/difficulty/timeToMvpWeeks，
并包含 businessModel、competitors[]、analysis、roadshow、claudeReplicability、landingPlan，字段命名与下例完全一致）：

${EXAMPLE}

只输出 JSON 数组。`;
}

const EXAMPLE = `[{
 "id":"example-id","name":"示例","tagline":"一句话","category":"AI工具","sourceUrl":"https://...",
 "discoveredDate":"${today()}","updatedDate":"${today()}","automationLevel":"ai-auto","compoundScore":80,
 "metrics":{"estimatedRoi":"5x (estimate)","paybackPeriodMonths":3,"startupCostUsd":200,"monthlyRevenuePotentialUsd":5000,"difficulty":2,"timeToMvpWeeks":2},
 "businessModel":{"revenueModel":"订阅","pricing":"$19/月","targetMarket":"...","acquisitionChannels":["SEO"]},
 "competitors":[{"name":"...","url":"https://...","strengths":"...","weaknesses":"...","wedge":"..."}],
 "analysis":{"opportunity":"...","risks":"...","moat":"..."},
 "roadshow":{"problem":"...","solution":"...","marketSize":"...","traction":"...","businessModel":"...","replicationPath":"..."},
 "claudeReplicability":{"canClaudeBuild":true,"claudeSteps":["..."],"humanInterventionPoints":["⚠️ 注册收款"]},
 "landingPlan":{"type":"ai-auto","steps":[{"step":"...","owner":"claude","etaDays":1}],"totalEtaDays":7}
}]`;

function extractJSON(text) {
  // 去掉可能的代码围栏，截取第一个 [ 到最后一个 ]
  const cleaned = text.replace(/```json|```/g, '');
  const s = cleaned.indexOf('[');
  const e = cleaned.lastIndexOf(']');
  if (s === -1 || e === -1) throw new Error('模型输出中未找到 JSON 数组');
  return JSON.parse(cleaned.slice(s, e + 1));
}

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('❌ 缺少 ANTHROPIC_API_KEY。请设置环境变量（本地或 GitHub Secrets）。');
    console.error('   这是必须的人工介入点之一。');
    process.exit(1);
  }

  const sources = await readJSON(join(__dirname, 'sources.json'), { sources: [] });
  const existing = await readJSON(join(DATA, 'projects.json'), []);
  const existingNames = existing.map(p => p.name);
  const existingIds = new Set(existing.map(p => p.id));

  console.log(`📚 现有项目 ${existing.length} 个，准备发现 ${TARGET_NEW} 个新项目（模型：${MODEL}）...`);

  const client = new Anthropic({ apiKey });
  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 8000,
    system: SYSTEM,
    tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 8 }],
    messages: [{ role: 'user', content: buildPrompt(sources, existingNames) }],
  });

  const text = res.content.filter(b => b.type === 'text').map(b => b.text).join('\n');
  let discovered;
  try { discovered = extractJSON(text); }
  catch (e) { console.error('❌ 解析失败：', e.message); console.error('原始输出：\n', text.slice(0, 2000)); process.exit(1); }

  // 规整 + 去重
  const fresh = [];
  for (const p of discovered) {
    if (!p || !p.id || existingIds.has(p.id) || fresh.some(x => x.id === p.id)) continue;
    p.discoveredDate = p.discoveredDate || today();
    p.updatedDate = today();
    fresh.push(p);
  }

  const merged = [...fresh, ...existing];
  const meta = {
    siteName: '复利发现引擎',
    tagline: '持续发现海外高潜力创业项目 · 自动分析 · 分级落地',
    lastUpdated: today(),
    projectCount: merged.length,
    goal: '2026 年底前跑通至少一个可盈利的商业闭环',
    stats: {
      aiAuto: merged.filter(p => p.automationLevel === 'ai-auto').length,
      aiHuman: merged.filter(p => p.automationLevel === 'ai-human').length,
      manual: merged.filter(p => p.automationLevel === 'manual').length,
    },
  };

  console.log(`✅ 新增 ${fresh.length} 个：${fresh.map(p => p.name).join('、') || '（无新项目）'}`);

  if (DRY_RUN) {
    console.log('🧪 DRY_RUN：不写文件。预览新增：');
    console.log(JSON.stringify(fresh, null, 2));
    return;
  }

  await writeFile(join(DATA, 'projects.json'), JSON.stringify(merged, null, 2) + '\n');
  await writeFile(join(DATA, 'meta.json'), JSON.stringify(meta, null, 2) + '\n');
  console.log(`💾 已写入 data/projects.json（共 ${merged.length} 个）与 data/meta.json`);
}

main().catch(err => { console.error('❌ 运行出错：', err); process.exit(1); });
