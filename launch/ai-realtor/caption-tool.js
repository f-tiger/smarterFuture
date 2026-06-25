// 纯前端 AI 社媒文案生成器：房源信息 → IG/FB/X 三平台文案 + 标签 + 可粘贴AI精修的提示词。
(function () {
  function val(id) { var e = document.getElementById(id); return e ? e.value.trim() : ''; }
  function track(n, p) { if (window.gtag) { try { gtag('event', n, p || {}); } catch (e) {} } }
  function or(v, d) { return v ? v : d; }

  function feats(d) {
    return (d.features ? d.features.split(/[,;\n]+/).map(function (s) { return s.trim(); }).filter(Boolean) : []);
  }
  function tags(d) {
    var base = ['#realestate', '#justlisted', '#homeforsale'];
    if (d.area) base.push('#' + d.area.replace(/[^A-Za-z0-9]/g, ''));
    base.push('#realtor', '#dreamhome');
    return base.slice(0, 6).join(' ');
  }
  var CTA = {
    'tour': 'DM me to book a private tour. 🔑',
    'openhouse': 'Open house this weekend — come say hi! 👋',
    'link': 'Full details + photos at the link in bio. 📸',
    'call': 'Call or DM for a showing today. ☎️'
  };

  function ig(d) {
    var f = feats(d), lead = f[0] || 'a place you\'ll love to call home';
    var emoji = { Warm: '🏡', Luxury: '✨', Investor: '📈', Concise: '🏠' }[d.tone] || '🏡';
    var s = emoji + ' ' + (d.tone === 'Luxury' ? 'Just listed — ' : 'New on the market! ') + or(d.property, 'This one') + '\n\n';
    s += 'Featuring ' + lead + (f.length > 1 ? ', ' + f.slice(1).join(', ') : '') + '.';
    if (d.area) s += ' Right in ' + d.area + '.';
    s += '\n\n' + (CTA[d.cta] || CTA.tour) + '\n\n' + tags(d);
    return s;
  }
  function fb(d) {
    var f = feats(d);
    var s = (d.tone === 'Investor' ? 'New opportunity in ' : 'Just listed in ') + or(d.area, 'a wonderful neighborhood') + '! ';
    s += or(d.property, 'This home') + ' offers ' + (f.length ? f.join(', ') : 'so much to love') + '. ';
    s += 'Homes like this don\'t last long — message me and I\'ll send you the full details and schedule a time to see it.';
    return s;
  }
  function x(d) {
    var f = feats(d);
    var s = '🏡 Just listed: ' + or(d.property, 'a great home') + (d.area ? ' in ' + d.area : '') + '. ' +
      (f[0] ? f[0] + '. ' : '') + 'DM to tour.';
    if (s.length > 270) s = s.slice(0, 267) + '…';
    return s;
  }
  function prompt(d) {
    return 'Write 3 social captions for a real-estate listing: ' + or(d.property, '[property]') +
      (d.area ? ' in ' + d.area : '') + '. Features: ' + (feats(d).join(', ') || '[features]') + '. ' +
      'Tone: ' + or(d.tone, 'warm') + '. One for Instagram (emojis + 4 hashtags), one for Facebook (community-focused), ' +
      'one for X (under 200 chars). Keep every claim factual; avoid fair-housing-sensitive language; add a tour CTA.';
  }

  function gather() {
    return { property: val('c_property'), area: val('c_area'), features: val('c_features'), tone: val('c_tone') || 'Warm', cta: val('c_cta') || 'tour' };
  }
  function render() {
    var d = gather();
    document.getElementById('outIG').textContent = ig(d);
    document.getElementById('outFB').textContent = fb(d);
    document.getElementById('outX').textContent = x(d);
    document.getElementById('outPrompt').textContent = prompt(d);
    document.getElementById('results').style.display = 'block';
    track('use_tool', { tool: 'captions', tone: d.tone });
    document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function copy(id, btn) {
    var txt = document.getElementById(id).textContent;
    function done() { var t = btn.textContent; btn.textContent = '✓ Copied'; setTimeout(function () { btn.textContent = t; }, 1500); track('copy', { which: id }); }
    if (navigator.clipboard) { navigator.clipboard.writeText(txt).then(done, done); }
    else { var ta = document.createElement('textarea'); ta.value = txt; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e) {} document.body.removeChild(ta); done(); }
  }
  document.addEventListener('DOMContentLoaded', function () {
    var f = document.getElementById('capForm');
    if (f) f.addEventListener('submit', function (e) { e.preventDefault(); render(); });
    document.querySelectorAll('[data-copy]').forEach(function (b) { b.addEventListener('click', function () { copy(b.getAttribute('data-copy'), b); }); });
  });
})();
