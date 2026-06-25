// 详情页：按 ?id= 渲染单个项目的完整分析
const LEVEL = {
  'ai-auto':  { label: '🟢 AI 全自动', cls: 'bg-green-100 text-green-700', desc: 'Claude/脚本可端到端复制，人只需配置密钥与收款' },
  'ai-human': { label: '🟡 AI + 人工', cls: 'bg-amber-100 text-amber-700', desc: 'AI 做大部分，人工负责创意/商务/审核等关键节点' },
  'manual':   { label: '🔴 主要人工', cls: 'bg-rose-100 text-rose-700', desc: '模式可借鉴，但复制主要靠人工运营' },
};

const esc = s => String(s ?? '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const qs = new URLSearchParams(location.search);
const id = qs.get('id');

function section(title, body) {
  return `<section class="bg-white rounded-2xl border border-slate-200 p-5 mb-4">
    <h2 class="text-lg font-bold mb-3">${title}</h2>${body}</section>`;
}
const row = (k, v) => `<div class="flex justify-between py-1.5 border-b border-slate-100 last:border-0"><span class="text-slate-500">${k}</span><span class="font-medium text-right">${v}</span></div>`;

function render(p) {
  const lv = LEVEL[p.automationLevel] || { label: p.automationLevel, cls: 'bg-slate-100', desc: '' };
  const m = p.metrics || {}, bm = p.businessModel || {}, an = p.analysis || {}, rs = p.roadshow || {}, cr = p.claudeReplicability || {}, lp = p.landingPlan || {};

  const competitors = (p.competitors || []).map(c => `
    <div class="border border-slate-200 rounded-xl p-4 mb-2">
      <div class="font-semibold">${esc(c.name)} ${c.url ? `<a href="${esc(c.url)}" target="_blank" class="text-xs text-brandblue">↗</a>` : ''}</div>
      <div class="text-sm mt-2 grid md:grid-cols-3 gap-2">
        <div><span class="text-slate-400">优势：</span>${esc(c.strengths)}</div>
        <div><span class="text-slate-400">弱点：</span>${esc(c.weaknesses)}</div>
        <div><span class="text-brandgreen">切入点：</span>${esc(c.wedge)}</div>
      </div>
    </div>`).join('') || '<p class="text-slate-400 text-sm">暂无竞对数据</p>';

  const claudeSteps = (cr.claudeSteps || []).map(s => `<li class="flex gap-2"><span>🤖</span><span>${esc(s)}</span></li>`).join('');
  const humanSteps = (cr.humanInterventionPoints || []).map(s => `<li class="flex gap-2 text-rose-600"><span>🙋</span><span>${esc(s)}</span></li>`).join('');

  const planRows = (lp.steps || []).map((s, i) => `
    <div class="flex items-center gap-3 py-2">
      <div class="w-6 h-6 shrink-0 rounded-full bg-slate-100 text-xs flex items-center justify-center font-bold">${i + 1}</div>
      <div class="flex-1">${esc(s.step)}</div>
      <span class="text-xs px-2 py-0.5 rounded-full ${s.owner === 'human' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-brandblue'}">${s.owner === 'human' ? '人工' : 'Claude'}</span>
      <span class="text-xs text-slate-400 w-12 text-right">${s.etaDays ?? '—'}天</span>
    </div>`).join('');

  document.getElementById('content').innerHTML = `
    <div class="flex flex-wrap items-center gap-3">
      <span class="text-xs px-2 py-1 rounded-full ${lv.cls} font-medium">${lv.label}</span>
      <span class="text-xs text-slate-400">${esc(p.category)}</span>
      <span class="ml-auto text-xs text-slate-400">更新于 ${esc(p.updatedDate)} · 来源 <a href="${esc(p.sourceUrl)}" target="_blank" class="text-brandblue">↗</a></span>
    </div>
    <h1 class="text-3xl font-extrabold mt-2">${esc(p.name)}</h1>
    <p class="text-slate-600 mt-2">${esc(p.tagline)}</p>
    <p class="text-sm text-slate-500 mt-1">落地分级说明：${lv.desc}</p>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
      <div class="bg-white rounded-xl border border-slate-200 p-3 text-center"><div class="text-xl font-bold">${esc(m.estimatedRoi)}</div><div class="text-xs text-slate-400">ROI（估算）</div></div>
      <div class="bg-white rounded-xl border border-slate-200 p-3 text-center"><div class="text-xl font-bold">${m.paybackPeriodMonths ?? '—'} 个月</div><div class="text-xs text-slate-400">回本周期</div></div>
      <div class="bg-white rounded-xl border border-slate-200 p-3 text-center"><div class="text-xl font-bold">$${(m.monthlyRevenuePotentialUsd ?? 0).toLocaleString()}</div><div class="text-xs text-slate-400">月营收潜力</div></div>
      <div class="bg-white rounded-xl border border-slate-200 p-3 text-center"><div class="text-xl font-bold">$${(m.startupCostUsd ?? 0).toLocaleString()}</div><div class="text-xs text-slate-400">启动成本</div></div>
    </div>

    ${section('🎤 一页路演 (Roadshow)', `
      ${row('痛点', esc(rs.problem))}
      ${row('解决方案', esc(rs.solution))}
      ${row('市场规模', esc(rs.marketSize))}
      ${row('已有验证', esc(rs.traction))}
      ${row('商业模式', esc(rs.businessModel))}
      ${row('复制路径', esc(rs.replicationPath))}`)}

    ${section('💼 商业模式', `
      ${row('收入模型', esc(bm.revenueModel))}
      ${row('定价', esc(bm.pricing))}
      ${row('目标客户', esc(bm.targetMarket))}
      ${row('获客渠道', (bm.acquisitionChannels || []).map(esc).join('、'))}`)}

    ${section('⚔️ 竞对分析', competitors)}

    ${section('🔍 机会 · 风险 · 护城河', `
      ${row('机会', esc(an.opportunity))}
      ${row('风险', `<span class="text-rose-600">${esc(an.risks)}</span>`)}
      ${row('护城河', esc(an.moat))}`)}

    ${section('🤖 Claude 可复制性 — 自动化边界', `
      <p class="text-sm mb-3">${cr.canClaudeBuild ? '<span class="text-brandgreen font-semibold">✅ Claude 可主导构建</span>' : '<span class="text-rose-600 font-semibold">⚠️ 复制主要依赖人工，Claude 仅辅助</span>'}</p>
      <div class="grid md:grid-cols-2 gap-4">
        <div><div class="text-sm font-semibold mb-2">Claude 可自动完成</div><ul class="text-sm space-y-1">${claudeSteps || '<li class="text-slate-400">—</li>'}</ul></div>
        <div><div class="text-sm font-semibold mb-2 text-rose-600">⚠️ 必须人工介入</div><ul class="text-sm space-y-1">${humanSteps || '<li class="text-slate-400">—</li>'}</ul></div>
      </div>`)}

    ${section(`📋 落地清单 · 预计 ${lp.totalEtaDays ?? '—'} 天`, planRows || '<p class="text-slate-400 text-sm">暂无</p>')}

    <div class="text-center my-6">
      <a href="index.html" class="inline-block px-5 py-2 rounded-full bg-ink text-white text-sm">← 返回挑选其他项目</a>
    </div>`;
  document.title = `${p.name} · 复利发现引擎`;
}

fetch('data/projects.json')
  .then(r => r.json())
  .then(list => {
    const p = list.find(x => x.id === id);
    if (!p) { document.getElementById('content').innerHTML = '<p class="text-rose-500">未找到该项目。</p>'; return; }
    render(p);
  })
  .catch(err => { document.getElementById('content').innerHTML = `<p class="text-rose-500">加载失败：${err.message}</p>`; });
