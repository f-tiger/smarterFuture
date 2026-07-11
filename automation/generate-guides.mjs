#!/usr/bin/env node
/**
 * ListingLift 内容扩产引擎 — 每周自动起草新的 SEO guide 页面（草稿，需人工审核后合并）
 *
 * 流程：读取现有 guides 目录 → 让 Claude 基于房产经纪人真实搜索意图，
 *      避开已覆盖选题，产出 N 个新选题的完整正文 → 用站内统一模板拼装成 .html
 *      → 追加进 sitemap.xml 与 index.html 卡片列表。
 * 只生成草稿文件，不直接发布到 main —— 触发本脚本的 workflow 会开一个 PR，
 * 人工抽查文案合规与事实准确性后再合并（诚信优先于产量）。
 *
 * 运行：
 *   ANTHROPIC_API_KEY=sk-... node automation/generate-guides.mjs
 *   DRY_RUN=1 ANTHROPIC_API_KEY=sk-... node automation/generate-guides.mjs   # 不写文件，仅打印
 *
 * 人工介入点：
 *   ⚠️ 需配置 ANTHROPIC_API_KEY（GitHub Secrets）
 *   ⚠️ 生成的 PR 必须人工审核事实准确性、语气与 fair-housing 合规后再合并
 */

import Anthropic from '@anthropic-ai/sdk';
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SITE = join(ROOT, 'launch', 'ai-realtor');
const GUIDES = join(SITE, 'guides');
const BASE_URL = 'https://f-tiger.github.io/smarterFuture/launch/ai-realtor';

const MODEL = process.env.MARKETING_MODEL || 'claude-sonnet-4-6';
const DRY_RUN = process.env.DRY_RUN === '1';
const TARGET_NEW = Number(process.env.TARGET_NEW || 2); // 每周新增选题数，克制产量优先质量

function extractJSON(text) {
  const c = text.replace(/```json|```/g, '');
  const s = c.indexOf('['), e = c.lastIndexOf(']');
  if (s === -1 || e === -1) throw new Error('未找到 JSON 数组');
  return JSON.parse(c.slice(s, e + 1));
}

async function existingSlugsAndTitles() {
  const files = (await readdir(GUIDES)).filter(f => f.endsWith('.html'));
  const items = [];
  for (const f of files) {
    const html = await readFile(join(GUIDES, f), 'utf8');
    const m = html.match(/<title>([^<]+)<\/title>/);
    items.push({ slug: f.replace(/\.html$/, ''), title: m ? m[1] : f });
  }
  return items;
}

const SYSTEM = `你是 ListingLift（面向美国房产经纪人的 AI 写作工具站）的内容策略师 + 文案专家。
要求：
- 只写真实、可验证的操作性内容，不编造统计数据、客户案例、评价或收入数字。
- 语气与现有站点一致：具体、实用、诚实，不夸大。
- 每篇提及 fair housing 合规时不给法律意见，建议核实经纪公司政策。
- 严禁选与"已覆盖选题"语义重复的题目。
- 只输出 JSON 数组，不要解释、不要 markdown 围栏。`;

function prompt(covered, n) {
  const list = covered.map(c => `- ${c.title} (slug: ${c.slug})`).join('\n');
  return `以下是 ListingLift 网站已经覆盖的选题（标题 + slug），不要再写语义重复的内容：
${list}

请基于美国房产经纪人的真实搜索意图，选出 ${n} 个尚未覆盖、有搜索价值的长尾选题，每个产出一篇完整的 guide 正文（不含 <html> 外壳，只要正文 HTML 片段）。

严格输出如下结构的 JSON 数组，每个元素：
{
  "slug": "kebab-case-slug",
  "title": "页面标题（含品牌调性，不要过长）",
  "metaDescription": "150字符以内的meta description",
  "keyword": "目标长尾关键词",
  "bodyHtml": "正文HTML片段：以 <p>开场段</p> 开始，包含2-4个<h2>小节，可用<ul>/<li>、<div class=\\"tip\\"><strong>Tip:</strong> ...</div>，末尾一段自然收尾。不要包含<h1>、面包屑、header/footer、keep-reading区块、广告位——这些由模板自动拼装。",
  "keepReading": [ {"slug": "已有页面的slug", "label": "该页面标题"} ]
}
keepReading 从"已覆盖选题"里选 2-3 个语义相关的真实 slug，不要编造不存在的 slug。`;
}

function wrapTemplate({ slug, title, metaDescription, bodyHtml, keepReading }) {
  const url = `${BASE_URL}/guides/${slug}.html`;
  const keepReadingLinks = keepReading.map(k => `<li><a href="${k.slug}.html">${k.label}</a></li>`).join('');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${title}</title>
<meta name="description" content="${metaDescription.replace(/"/g, '&quot;')}"/>
<link rel="stylesheet" href="../styles.css"/>
<link rel="canonical" href="${url}"/>
<meta name="robots" content="index,follow"/>
<script type="application/ld+json">{"@context": "https://schema.org", "@type": "Article", "headline": ${JSON.stringify(title)}, "description": ${JSON.stringify(metaDescription)}, "author": {"@type": "Organization", "name": "ListingLift"}, "publisher": {"@type": "Organization", "name": "ListingLift"}, "mainEntityOfPage": "${url}", "inLanguage": "en"}</script>
<script type="application/ld+json">{"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "ListingLift", "item": "${BASE_URL}/"}, {"@type": "ListItem", "position": 2, "name": "Guides", "item": "${BASE_URL}/#guides"}, {"@type": "ListItem", "position": 3, "name": ${JSON.stringify(title)}, "item": "${url}"}]}</script>
</head>
<body>
<header class="nav"><div class="wrap nav-inner"><a class="brand" href="../index.html">Listing<span>Lift</span></a><nav><a href="../index.html">Home</a><a href="../index.html#guides">Guides</a><a href="../index.html#waitlist">Free tool</a></nav></div></header>
<div class="wrap">
<article>
<a href="../index.html" style="font-size:14px">&larr; All guides</a>
<h1>${title}</h1>
<div class="meta">ListingLift · Practical AI for real-estate agents</div>

${bodyHtml}

<div class="section related"><h2>Keep reading</h2><ul>${keepReadingLinks}</ul></div>
<div class="ad-slot"></div>
<div class="aff">
<h3>Skip the blank page</h3>
<p>Our <strong data-product>AI Listing Writer</strong> handles the first draft. <a href="../index.html#waitlist">Join the free early-access list &rarr;</a></p>
</div>
</article>
</div>
<footer><div class="wrap"><div>© <span data-brand>ListingLift</span> · Practical AI for real-estate agents</div><div><a href="../index.html#waitlist">Early access</a></div></div></footer>
<script src="../config.js"></script>
<script src="../app.js"></script>
</body>
</html>
`;
}

async function addToSitemap(slug) {
  const p = join(SITE, 'sitemap.xml');
  const xml = await readFile(p, 'utf8');
  const entry = `  <url><loc>${BASE_URL}/guides/${slug}.html</loc><priority>0.8</priority></url>\n`;
  if (xml.includes(`guides/${slug}.html`)) return;
  await writeFile(p, xml.replace('</urlset>', `${entry}</urlset>`));
}

async function addToIndexCard(slug, title, metaDescription) {
  const p = join(SITE, 'index.html');
  const html = await readFile(p, 'utf8');
  if (html.includes(`guides/${slug}.html`)) return;
  const shortDesc = metaDescription.length > 90 ? metaDescription.slice(0, 87) + '…' : metaDescription;
  const card = `      <a class="card" href="guides/${slug}.html"><h3>${title.split(':')[0].split('—')[0].trim()}</h3><p>${shortDesc}</p></a>\n`;
  const marker = '<div class="grid">\n';
  const idx = html.indexOf(marker);
  if (idx === -1) return;
  const insertAt = idx + marker.length;
  await writeFile(p, html.slice(0, insertAt) + card + html.slice(insertAt));
}

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) { console.error('❌ 缺少 ANTHROPIC_API_KEY（必须的人工介入点）。'); process.exit(1); }

  const covered = await existingSlugsAndTitles();
  const client = new Anthropic({ apiKey });

  console.log(`📚 已覆盖 ${covered.length} 篇 guide，请求生成 ${TARGET_NEW} 篇新草稿...`);
  const res = await client.messages.create({
    model: MODEL, max_tokens: 8000, system: SYSTEM,
    messages: [{ role: 'user', content: prompt(covered, TARGET_NEW) }],
  });
  const text = res.content.filter(b => b.type === 'text').map(b => b.text).join('\n');
  const items = extractJSON(text);

  const known = new Set(covered.map(c => c.slug));
  let created = 0;
  for (const item of items) {
    if (!item.slug || known.has(item.slug)) { console.log(`⏭️  跳过重复 slug: ${item.slug}`); continue; }
    const html = wrapTemplate(item);
    if (DRY_RUN) {
      console.log(`--- DRY RUN: ${item.slug}.html ---\n${html.slice(0, 300)}...\n`);
      continue;
    }
    await writeFile(join(GUIDES, `${item.slug}.html`), html);
    await addToSitemap(item.slug);
    await addToIndexCard(item.slug, item.title, item.metaDescription);
    known.add(item.slug);
    created++;
    console.log(`   💾 已生成草稿：guides/${item.slug}.html（关键词: ${item.keyword}）`);
  }
  console.log(DRY_RUN ? '✅ Dry run 完成，未写文件。' : `✅ 完成，新增 ${created} 篇草稿，等待 PR 审核。`);
}

main().catch(err => { console.error('❌ 运行出错：', err); process.exit(1); });
