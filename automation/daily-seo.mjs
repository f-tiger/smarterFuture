#!/usr/bin/env node
/**
 * 每日 SEO 优化器 —— 安全、无需 API key、可无人值守运行。
 *
 * 每天做的事（全部是"派生数据维护 + 完整性校验"，不改动正文内容，因此可安全自动提交）：
 *   1. 从磁盘上真实存在的可索引页面重建 launch/ai-realtor/sitemap.xml，
 *      每条带 <lastmod>（取该文件的 git 最后提交日期 —— 诚实反映真实修改，不伪造新鲜度）。
 *      → 新加的页面自动进 sitemap；被删的自动移除。
 *   2. 完整性校验：站内断链、缺 canonical、缺 OG、缺 title —— 有问题则以非零码退出（在 Actions 里显红），
 *      但不自动改正文（正文改动需要判断，不适合无人值守直接改）。
 *
 * 用法：
 *   node automation/daily-seo.mjs            # 重建 sitemap + 校验；有问题退出码=1
 *   node automation/daily-seo.mjs --check    # 只校验，不写文件
 *
 * sitemap 若有变化 → 由 workflow 提交到 main → 触发 deploy-pages → 部署 + IndexNow 自动提交。
 */

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SITE = join(ROOT, 'launch', 'ai-realtor');
const GUIDES = join(SITE, 'guides');
const BASE = 'https://f-tiger.github.io/smarterFuture/launch/ai-realtor';
const CHECK_ONLY = process.argv.includes('--check');

// 该文件的 git 最后提交日期（YYYY-MM-DD）；拿不到就用今天（node 环境 Date 可用）。
function gitLastmod(absPath) {
  try {
    const iso = execFileSync('git', ['log', '-1', '--format=%cI', '--', absPath], { cwd: ROOT })
      .toString().trim();
    if (iso) return iso.slice(0, 10);
  } catch { /* ignore */ }
  return new Date().toISOString().slice(0, 10);
}

function indexable(html) {
  // 排除 noindex 页（如 welcome.html 感谢页）
  return !/name="robots"[^>]*noindex/i.test(html);
}

async function collectPages() {
  const pages = [];
  // 顶层可索引页
  for (const f of (await readdir(SITE)).filter(f => f.endsWith('.html')).sort()) {
    const html = await readFile(join(SITE, f), 'utf8');
    if (!indexable(html)) continue;
    const isHome = f === 'index.html';
    pages.push({
      loc: isHome ? `${BASE}/` : `${BASE}/${f}`,
      lastmod: gitLastmod(join(SITE, f)),
      priority: isHome ? '1.0' : '0.9',
      changefreq: isHome ? 'weekly' : null,
      file: join(SITE, f),
      rel: f,
    });
  }
  // guides
  for (const f of (await readdir(GUIDES)).filter(f => f.endsWith('.html')).sort()) {
    const html = await readFile(join(GUIDES, f), 'utf8');
    if (!indexable(html)) continue;
    pages.push({
      loc: `${BASE}/guides/${f}`,
      lastmod: gitLastmod(join(GUIDES, f)),
      priority: '0.8',
      changefreq: null,
      file: join(GUIDES, f),
      rel: `guides/${f}`,
    });
  }
  return pages;
}

function buildSitemap(pages) {
  const lines = ['<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'];
  for (const p of pages) {
    let u = `  <url><loc>${p.loc}</loc><lastmod>${p.lastmod}</lastmod>`;
    if (p.changefreq) u += `<changefreq>${p.changefreq}</changefreq>`;
    u += `<priority>${p.priority}</priority></url>`;
    lines.push(u);
  }
  lines.push('</urlset>', '');
  return lines.join('\n');
}

// 完整性校验：断链 / 缺 canonical / 缺 OG / 缺 title
async function audit(pages) {
  const issues = [];
  for (const p of pages) {
    const html = await readFile(p.file, 'utf8');
    if (!/<title>[^<]+<\/title>/.test(html)) issues.push(`NO TITLE: ${p.rel}`);
    if (!/rel="canonical"/.test(html)) issues.push(`NO CANONICAL: ${p.rel}`);
    if (!/property="og:title"/.test(html)) issues.push(`NO OG: ${p.rel}`);
    // 站内 .html 链接：相对该页面自身目录解析成绝对路径，再验证目标是否存在
    const pageDir = dirname(p.file);
    for (const m of html.matchAll(/href="([^":]+\.html)(?:#[^"]*)?"/g)) {
      const href = m[1];
      if (href.startsWith('http')) continue;
      const target = resolve(pageDir, href);
      if (!existsSync(target)) issues.push(`BROKEN ${p.rel} -> ${href}`);
    }
  }
  return issues;
}

async function main() {
  const pages = await collectPages();
  const issues = await audit(pages);

  console.log(`📄 可索引页面: ${pages.length}（首页1 + 顶层${pages.filter(p=>p.priority==='0.9').length} + guides${pages.filter(p=>p.priority==='0.8').length}）`);

  if (!CHECK_ONLY) {
    const xml = buildSitemap(pages);
    const path = join(SITE, 'sitemap.xml');
    const old = existsSync(path) ? await readFile(path, 'utf8') : '';
    if (old !== xml) {
      await writeFile(path, xml);
      console.log(`🗺️  sitemap.xml 已更新（${pages.length} 条 URL，带 lastmod）`);
    } else {
      console.log('🗺️  sitemap.xml 无变化');
    }
  }

  if (issues.length) {
    console.error(`\n❌ 完整性问题 ${issues.length} 处：`);
    for (const i of issues) console.error('  - ' + i);
    process.exit(1);
  }
  console.log('✅ 完整性校验通过（无断链 / OG / canonical / title 缺失）。');
}

main().catch(e => { console.error('运行出错：', e); process.exit(1); });
