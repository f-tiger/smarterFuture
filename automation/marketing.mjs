#!/usr/bin/env node
/**
 * 营销自动化引擎 — 按项目自动生成整套可直接使用的营销物料
 *
 * 这是"营销侧自动化"的执行层：调研引擎产出营销【分析】，本脚本产出营销【物料】。
 * 给定一个项目 id，调用 Claude 自动生成：
 *   - 落地页文案（hero / 卖点 / FAQ / CTA）
 *   - 10 条社媒帖子（X/LinkedIn 风格）+ 7 天发布排期
 *   - 5 封邮件欢迎序列
 *   - 20 个 SEO 长尾关键词选题
 *   - 5 组广告创意（标题 + 正文）
 * 结果写入 data/marketing-kits/<id>.json，供人工一键取用或接入发布工具。
 *
 * 运行：
 *   ANTHROPIC_API_KEY=sk-... node automation/marketing.mjs <projectId>
 *   ANTHROPIC_API_KEY=sk-... node automation/marketing.mjs --all
 *
 * 人工介入点：
 *   ⚠️ 需配置 ANTHROPIC_API_KEY
 *   ⚠️ 接入真实发布(Buffer/X API/ESP)与投放账户需人工授权与收款
 *   ⚠️ 发布前建议人工抽查文案合规与品牌口径
 */

import Anthropic from '@anthropic-ai/sdk';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DATA = join(ROOT, 'data');
const OUT = join(DATA, 'marketing-kits');

const MODEL = process.env.MARKETING_MODEL || 'claude-sonnet-4-6';
const today = () => new Date().toISOString().slice(0, 10);

async function readJSON(p, fb) { try { return JSON.parse(await readFile(p, 'utf8')); } catch { return fb; } }

function extractJSON(text) {
  const c = text.replace(/```json|```/g, '');
  const s = c.indexOf('{'), e = c.lastIndexOf('}');
  if (s === -1 || e === -1) throw new Error('未找到 JSON 对象');
  return JSON.parse(c.slice(s, e + 1));
}

const SYSTEM = `你是一名增长营销操盘手 + 文案专家。基于给定的创业项目信息，产出可直接投放使用的营销物料。
要求：文案具体、有钩子、符合海外受众口味；不要编造虚假数据或承诺；只输出 JSON 对象，不要解释、不要 markdown 围栏。`;

function prompt(p) {
  const mk = p.marketing || {};
  return `项目：${p.name} — ${p.tagline}
定位：${mk.positioning || ''}
价值主张：${mk.valueProp || ''}
目标客户：${p.businessModel?.targetMarket || ''}
渠道：${(mk.channels || []).map(c => c.channel).join(', ')}

请生成营销物料，严格输出如下结构的 JSON：
{
  "landingCopy": { "hero": "主标题", "subhead": "副标题", "bullets": ["卖点1","卖点2","卖点3"], "cta": "行动按钮文案", "faq": [{"q":"问","a":"答"}] },
  "socialPosts": [ { "platform": "X|LinkedIn", "day": 1, "text": "帖子文案(含hook)", "hashtags": ["#tag"] } ],
  "emailSequence": [ { "step": 1, "subject": "邮件主题", "body": "邮件正文(简洁)" } ],
  "seoKeywords": [ { "keyword": "长尾词", "intent": "informational|commercial", "difficulty": "low|medium|high" } ],
  "adVariations": [ { "headline": "广告标题", "body": "广告正文", "angle": "卖点角度" } ]
}
数量要求：socialPosts 10 条(覆盖7天)、emailSequence 5 封、seoKeywords 20 个、adVariations 5 组、landingCopy.bullets 至少3条、faq 至少3条。只输出 JSON。`;
}

async function generate(client, p) {
  const res = await client.messages.create({
    model: MODEL, max_tokens: 6000, system: SYSTEM,
    messages: [{ role: 'user', content: prompt(p) }],
  });
  const text = res.content.filter(b => b.type === 'text').map(b => b.text).join('\n');
  const kit = extractJSON(text);
  kit.projectId = p.id;
  kit.projectName = p.name;
  kit.generatedDate = today();
  kit.note = '⚠️ 发布前请人工抽查文案合规与品牌口径；接入发布/投放账户需人工授权。';
  return kit;
}

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) { console.error('❌ 缺少 ANTHROPIC_API_KEY（必须的人工介入点）。'); process.exit(1); }

  const arg = process.argv[2];
  if (!arg) { console.error('用法: node automation/marketing.mjs <projectId> | --all'); process.exit(1); }

  const projects = await readJSON(join(DATA, 'projects.json'), []);
  const targets = arg === '--all' ? projects : projects.filter(p => p.id === arg);
  if (!targets.length) { console.error(`❌ 未找到项目: ${arg}`); process.exit(1); }

  await mkdir(OUT, { recursive: true });
  const client = new Anthropic({ apiKey });

  for (const p of targets) {
    console.log(`✍️  生成营销物料：${p.name} ...`);
    try {
      const kit = await generate(client, p);
      await writeFile(join(OUT, `${p.id}.json`), JSON.stringify(kit, null, 2) + '\n');
      console.log(`   💾 已写入 data/marketing-kits/${p.id}.json（${(kit.socialPosts || []).length} 帖 / ${(kit.emailSequence || []).length} 邮件 / ${(kit.seoKeywords || []).length} 关键词）`);
    } catch (e) {
      console.error(`   ❌ ${p.id} 生成失败：${e.message}`);
    }
  }
  console.log('✅ 完成。');
}

main().catch(err => { console.error('❌ 运行出错：', err); process.exit(1); });
