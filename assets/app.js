// 首页：加载数据、渲染卡片、筛选、排序
const LEVEL = {
  'ai-auto':  { label: '🟢 AI 全自动', cls: 'bg-green-100 text-green-700' },
  'ai-human': { label: '🟡 AI + 人工', cls: 'bg-amber-100 text-amber-700' },
  'manual':   { label: '🔴 主要人工', cls: 'bg-rose-100 text-rose-700' },
};

let ALL = [];
let state = { filter: 'all', sort: 'score' };

async function load() {
  const [projects, meta] = await Promise.all([
    fetch('data/projects.json').then(r => r.json()),
    fetch('data/meta.json').then(r => r.json()).catch(() => ({})),
  ]);
  ALL = projects;

  document.getElementById('lastUpdated').textContent = meta.lastUpdated || '—';
  document.getElementById('goal').textContent = meta.goal || '—';
  document.getElementById('statTotal').textContent = projects.length;
  document.getElementById('statAuto').textContent = projects.filter(p => p.automationLevel === 'ai-auto').length;
  document.getElementById('statHuman').textContent = projects.filter(p => p.automationLevel === 'ai-human').length;
  document.getElementById('statManual').textContent = projects.filter(p => p.automationLevel === 'manual').length;

  render();
}

function sortFn(a, b) {
  switch (state.sort) {
    case 'roi':  return (a.metrics.paybackPeriodMonths || 99) - (b.metrics.paybackPeriodMonths || 99);
    case 'rev':  return (b.metrics.monthlyRevenuePotentialUsd || 0) - (a.metrics.monthlyRevenuePotentialUsd || 0);
    case 'cost': return (a.metrics.startupCostUsd || 0) - (b.metrics.startupCostUsd || 0);
    default:     return (b.compoundScore || 0) - (a.compoundScore || 0);
  }
}

function card(p) {
  const lv = LEVEL[p.automationLevel] || { label: p.automationLevel, cls: 'bg-slate-100 text-slate-600' };
  const m = p.metrics || {};
  return `
  <a href="project.html?id=${encodeURIComponent(p.id)}" class="card-hover block bg-white rounded-2xl border border-slate-200 p-5">
    <div class="flex items-start justify-between gap-2">
      <span class="text-xs px-2 py-1 rounded-full ${lv.cls} font-medium">${lv.label}</span>
      <span class="text-xs text-slate-400">${p.category || ''}</span>
    </div>
    <h3 class="mt-3 text-lg font-bold leading-snug">${p.name}</h3>
    <p class="mt-1 text-sm text-slate-500 line-clamp-2">${p.tagline || ''}</p>
    <div class="mt-4 grid grid-cols-3 gap-2 text-center">
      <div class="bg-slate-50 rounded-lg py-2"><div class="text-sm font-bold">${m.estimatedRoi || '—'}</div><div class="text-[11px] text-slate-400">ROI(估)</div></div>
      <div class="bg-slate-50 rounded-lg py-2"><div class="text-sm font-bold">${m.paybackPeriodMonths ?? '—'}个月</div><div class="text-[11px] text-slate-400">回本</div></div>
      <div class="bg-slate-50 rounded-lg py-2"><div class="text-sm font-bold">$${(m.startupCostUsd ?? 0).toLocaleString()}</div><div class="text-[11px] text-slate-400">启动成本</div></div>
    </div>
    <div class="mt-4 flex items-center justify-between">
      <div class="text-xs text-slate-400">综合评分</div>
      <div class="flex items-center gap-2 w-2/3">
        <div class="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
          <div class="h-full bg-brandblue" style="width:${p.compoundScore || 0}%"></div>
        </div>
        <span class="text-sm font-bold">${p.compoundScore || 0}</span>
      </div>
    </div>
  </a>`;
}

function render() {
  const grid = document.getElementById('grid');
  const items = ALL
    .filter(p => state.filter === 'all' || p.automationLevel === state.filter)
    .sort(sortFn);
  grid.innerHTML = items.map(card).join('');
  document.getElementById('empty').classList.toggle('hidden', items.length > 0);

  document.querySelectorAll('.filter-btn').forEach(b => {
    const active = b.dataset.filter === state.filter;
    b.classList.toggle('bg-ink', active);
    b.classList.toggle('text-white', active);
    b.classList.toggle('bg-white', !active);
  });
}

document.addEventListener('click', e => {
  const btn = e.target.closest('.filter-btn');
  if (btn) { state.filter = btn.dataset.filter; render(); }
});
document.getElementById('sort').addEventListener('change', e => { state.sort = e.target.value; render(); });

load().catch(err => {
  document.getElementById('grid').innerHTML = `<p class="text-rose-500">数据加载失败：${err.message}</p>`;
});
