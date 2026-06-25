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
  const m = p.metrics || {}, bm = p.businessModel || {}, an = p.analysis || {}, rs = p.roadshow || {}, cr = p.claudeReplicability || {}, lp = p.landingPlan || {}, mk = p.marketing || {};

  const AUTO = {
    'ai-auto':  { label: '🟢 全自动', cls: 'bg-green-100 text-green-700' },
    'ai-human': { label: '🟡 AI+人工', cls: 'bg-amber-100 text-amber-700' },
    'manual':   { label: '🔴 人工', cls: 'bg-rose-100 text-rose-700' },
    'claude':   { label: '🤖 Claude', cls: 'bg-blue-100 text-brandblue' },
    'human':    { label: '🙋 人工', cls: 'bg-rose-100 text-rose-600' },
  };
  const tag = k => { const a = AUTO[k] || { label: k || '—', cls: 'bg-slate-100 text-slate-600' }; return `<span class="text-xs px-2 py-0.5 rounded-full ${a.cls}">${a.label}</span>`; };

  const personas = (mk.personas || []).map(x => `
    <div class="border border-slate-200 rounded-xl p-3">
      <div class="font-semibold text-sm">${esc(x.name)}</div>
      <div class="text-xs text-slate-500 mt-1">${esc(x.profile)}</div>
      <div class="text-xs mt-1"><span class="text-slate-400">痛点：</span>${esc(x.painPoint)}</div>
      <div class="text-xs mt-1"><span class="text-brandblue">触达：</span>${esc(x.whereToFind)}</div>
    </div>`).join('');

  const channels = (mk.channels || []).map(c => `
    <tr class="border-b border-slate-100">
      <td class="py-2 pr-2 font-medium">${esc(c.channel)}</td>
      <td class="py-2 pr-2 text-slate-500">${esc(c.tactic)}</td>
      <td class="py-2 pr-2 text-center whitespace-nowrap">$${esc(c.estCacUsd)}</td>
      <td class="py-2 pr-2 text-center whitespace-nowrap">${esc(c.estConversion)}</td>
      <td class="py-2 text-center">${tag(c.automation)}</td>
    </tr>`).join('');

  const playbook = (mk.automationPlaybook || []).map(t => `
    <div class="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
      <div class="flex-1 text-sm">${esc(t.task)}</div>
      <span class="text-xs text-slate-400">${esc(t.tool)}</span>
      <span class="text-xs text-slate-400">${esc(t.frequency)}</span>
      ${tag(t.owner)}
    </div>`).join('');

  const fn = mk.funnelAARRR || {};
  const funnel = [
    ['获客 Acquisition', fn.acquisition], ['激活 Activation', fn.activation],
    ['留存 Retention', fn.retention], ['传播 Referral', fn.referral], ['变现 Revenue', fn.revenue],
  ].filter(([, v]) => v).map(([k, v]) => `
    <div class="bg-slate-50 rounded-lg p-3"><div class="text-xs font-semibold text-brandblue">${k}</div><div class="text-sm mt-1">${esc(v)}</div></div>`).join('');

  const ce = mk.contentEngine || {};
  const kpis = (mk.kpis || []).map(k => `<span class="text-xs bg-slate-100 rounded-full px-2 py-1">${esc(k.name)}: <strong>${esc(k.target)}</strong></span>`).join(' ');

  const marketingHtml = mk.positioning || (mk.channels || []).length ? `
    <p class="text-sm mb-3"><span class="text-slate-400">定位：</span>${esc(mk.positioning)} ${mk.valueProp ? `<br><span class="text-slate-400">价值主张：</span>${esc(mk.valueProp)}` : ''}</p>
    <div class="mb-4"><div class="text-sm font-semibold mb-2">🎯 用户画像</div><div class="grid md:grid-cols-3 gap-2">${personas || '<span class="text-slate-400 text-sm">—</span>'}</div></div>
    <div class="mb-4"><div class="text-sm font-semibold mb-2">🔁 AARRR 增长漏斗</div><div class="grid grid-cols-2 md:grid-cols-5 gap-2">${funnel || '<span class="text-slate-400 text-sm">—</span>'}</div></div>
    <div class="mb-4"><div class="text-sm font-semibold mb-2">📣 获客渠道 · CAC · 转化 · 自动化程度</div>
      <table class="w-full text-sm"><thead><tr class="text-xs text-slate-400 text-left"><th class="py-1 pr-2">渠道</th><th class="py-1 pr-2">打法</th><th class="py-1 text-center">CAC</th><th class="py-1 text-center">转化</th><th class="py-1 text-center">自动化</th></tr></thead><tbody>${channels}</tbody></table>
    </div>
    <div class="mb-4 grid md:grid-cols-2 gap-4">
      <div><div class="text-sm font-semibold mb-1">🧱 内容引擎</div><div class="text-sm text-slate-600">主题：${(ce.pillars || []).map(esc).join('、') || '—'}<br>节奏：${esc(ce.cadence)} · 形式：${(ce.formats || []).map(esc).join('、')} ${ce.autoGenerated ? '<span class="text-brandgreen">· 🤖自动生成</span>' : ''}</div></div>
      <div><div class="text-sm font-semibold mb-1">♻️ 增长循环</div><ul class="text-sm text-slate-600 list-disc pl-4">${(mk.growthLoops || []).map(g => `<li>${esc(g)}</li>`).join('') || '<li>—</li>'}</ul></div>
    </div>
    <div class="mb-4"><div class="text-sm font-semibold mb-2">⚙️ 营销自动化 Playbook <span class="text-xs text-slate-400">（谁来执行）</span></div>${playbook || '<span class="text-slate-400 text-sm">—</span>'}</div>
    <div class="flex flex-wrap items-center gap-2 text-sm"><span class="text-slate-400">月度营销预算：</span><strong>$${(mk.monthlyBudgetUsd ?? 0).toLocaleString()}</strong>　<span class="text-slate-400">KPI：</span>${kpis || '—'}</div>
  ` : '<p class="text-slate-400 text-sm">暂无营销分析数据（运行调研引擎可自动补全）</p>';

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
    ${p.liveOperation ? `
    <a href="${esc(p.liveOperation.url)}" class="block mt-4 rounded-2xl border-2 border-brandgreen/50 bg-emerald-50 p-4 hover:shadow-md transition">
      <div class="flex items-center gap-2"><span class="text-xs font-bold bg-brandgreen text-white px-2 py-0.5 rounded-full">🚀 ${esc(p.liveOperation.status)}</span><span class="font-bold">${esc(p.liveOperation.name)}</span><span class="ml-auto text-brandblue text-sm">打开运营站 →</span></div>
      <div class="text-sm text-slate-600 mt-1">${esc(p.liveOperation.note)}</div>
    </a>` : ''}

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

    ${section('📈 用户与营销分析（自动化营销）', marketingHtml)}

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
    loadKit(p.id);
  })
  .catch(err => { document.getElementById('content').innerHTML = `<p class="text-rose-500">加载失败：${err.message}</p>`; });

// 若存在自动生成的营销物料(data/marketing-kits/<id>.json)，渲染出来
function loadKit(pid) {
  fetch(`data/marketing-kits/${pid}.json`)
    .then(r => (r.ok ? r.json() : null))
    .then(kit => { if (kit) renderKit(kit); })
    .catch(() => {});
}

function renderKit(k) {
  const lc = k.landingCopy || {};
  const social = (k.socialPosts || []).slice(0, 6).map(s => `
    <div class="border border-slate-200 rounded-lg p-3 text-sm">
      <div class="text-xs text-slate-400 mb-1">D${esc(s.day)} · ${esc(s.platform)}</div>${esc(s.text)}
      <div class="text-xs text-brandblue mt-1">${(s.hashtags || []).map(esc).join(' ')}</div>
    </div>`).join('');
  const emails = (k.emailSequence || []).map(e => `
    <div class="flex gap-3 py-2 border-b border-slate-100 last:border-0">
      <div class="w-6 h-6 shrink-0 rounded-full bg-slate-100 text-xs flex items-center justify-center font-bold">${esc(e.step)}</div>
      <div class="text-sm"><div class="font-medium">${esc(e.subject)}</div><div class="text-slate-500 text-xs mt-0.5">${esc(e.body)}</div></div>
    </div>`).join('');
  const kws = (k.seoKeywords || []).map(w => `<span class="text-xs bg-slate-100 rounded px-2 py-1">${esc(w.keyword)} <span class="text-slate-400">·${esc(w.difficulty)}</span></span>`).join(' ');
  const ads = (k.adVariations || []).map(a => `
    <div class="border border-slate-200 rounded-lg p-3">
      <div class="text-sm font-semibold">${esc(a.headline)}</div>
      <div class="text-sm text-slate-600">${esc(a.body)}</div>
      <div class="text-xs text-brandgreen mt-1">角度：${esc(a.angle)}</div>
    </div>`).join('');

  const html = `
    <p class="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2 mb-3">${esc(k.note)}</p>
    <div class="mb-4"><div class="text-sm font-semibold mb-2">🖥️ 落地页文案</div>
      <div class="bg-slate-50 rounded-lg p-3 text-sm">
        <div class="font-bold">${esc(lc.hero)}</div>
        <div class="text-slate-500 mt-1">${esc(lc.subhead)}</div>
        <ul class="list-disc pl-4 mt-2">${(lc.bullets || []).map(x => `<li>${esc(x)}</li>`).join('')}</ul>
        <div class="mt-2"><span class="inline-block bg-ink text-white text-xs px-3 py-1 rounded-full">${esc(lc.cta)}</span></div>
      </div>
    </div>
    <div class="mb-4"><div class="text-sm font-semibold mb-2">📱 社媒帖（节选 6/${(k.socialPosts || []).length}）</div><div class="grid md:grid-cols-2 gap-2">${social}</div></div>
    <div class="mb-4"><div class="text-sm font-semibold mb-2">✉️ 邮件序列（${(k.emailSequence || []).length} 封）</div>${emails}</div>
    <div class="mb-4"><div class="text-sm font-semibold mb-2">🔑 SEO 选题（${(k.seoKeywords || []).length} 个）</div><div class="flex flex-wrap gap-1">${kws}</div></div>
    <div class="mb-2"><div class="text-sm font-semibold mb-2">📣 广告创意变体（${(k.adVariations || []).length} 组）</div><div class="grid md:grid-cols-2 gap-2">${ads}</div></div>`;

  const sec = document.createElement('section');
  sec.className = 'bg-white rounded-2xl border-2 border-brandgreen/40 p-5 mb-4';
  sec.innerHTML = `<h2 class="text-lg font-bold mb-3">🎁 自动生成的营销物料 <span class="text-xs font-normal text-brandgreen">（marketing.mjs 产出）</span></h2>${html}`;
  // 插到落地清单之前；找不到就追加到末尾
  const content = document.getElementById('content');
  const back = content.querySelector('.text-center.my-6');
  if (back) content.insertBefore(sec, back); else content.appendChild(sec);
}
