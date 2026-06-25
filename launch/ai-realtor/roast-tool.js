// 纯前端 Listing "Roast & Rewrite"：粘贴现有房源描述 → 即时体检清单(确定性规则) + 重写提示词。无后端。
(function () {
  function track(n, p) { if (window.gtag) { try { gtag('event', n, p || {}); } catch (e) {} } }

  var CLICHES = ['must see', 'must-see', 'charming', 'cozy', 'dream home', "won't last", 'wont last', 'tlc',
    'diamond in the rough', 'motivated seller', 'one of a kind', 'one-of-a-kind', 'breathtaking', 'stunning',
    'nestled', 'boasts', 'unique opportunity', 'priced to sell', 'turnkey', 'immaculate', 'lovely', 'gorgeous'];
  // 公平住房需复核的措辞（提示复核，非法律意见）
  var FH = ['family', 'families', 'perfect for', 'safe', 'safe neighborhood', 'great schools', 'church', 'churches',
    'temple', 'mosque', 'exclusive', 'integrated', 'bachelor', 'empty nester', 'mother-in-law', 'man cave',
    'walking distance to school', 'ideal for couples', 'no kids', 'adults only', 'christian', 'ethnic'];
  var WEAK_OPENERS = ['this ', 'welcome to', 'located', 'come see', 'introducing', 'we are proud', 'you will', 'come and'];
  var CTA = ['call', 'schedule', 'tour', 'contact', 'book', 'reach out', 'message', 'visit', 'don\'t miss', 'see it today', 'request'];

  function analyze(text) {
    var t = text.trim();
    var lower = t.toLowerCase();
    var words = t.split(/\s+/).filter(Boolean);
    var wc = words.length;
    var findings = [];
    var score = 100;

    if (wc < 50) { findings.push({ t: 'bad', m: 'Too short (' + wc + ' words). Aim for ~100–150 to give buyers enough to picture it.' }); score -= 20; }
    else if (wc > 250) { findings.push({ t: 'warn', m: 'Quite long (' + wc + ' words). Tighten to ~120–150; buyers skim.' }); score -= 8; }
    else { findings.push({ t: 'good', m: 'Length is in the sweet spot (' + wc + ' words).' }); }

    var foundCliches = CLICHES.filter(function (c) { return lower.indexOf(c) !== -1; });
    if (foundCliches.length) { findings.push({ t: 'warn', m: 'Clichés that buyers tune out: ' + foundCliches.slice(0, 6).join(', ') + '. Replace with specific, concrete details.' }); score -= Math.min(20, foundCliches.length * 4); }
    else { findings.push({ t: 'good', m: 'No obvious clichés — nice.' }); }

    var foundFH = FH.filter(function (c) { return new RegExp('\\b' + c.replace(/[-\\/\\\\^$*+?.()|[\]{}]/g, '\\$&') + '\\b').test(lower); });
    if (foundFH.length) { findings.push({ t: 'bad', m: '⚠️ Fair-housing review needed — these can imply a preference for/against protected classes: ' + foundFH.slice(0, 6).join(', ') + '. Rephrase to describe the HOME, not the buyer. (Not legal advice — consult your broker/compliance.)' }); score -= Math.min(25, foundFH.length * 6); }
    else { findings.push({ t: 'good', m: 'No obvious fair-housing red-flag wording (still give it a human review).' }); }

    var opener = lower.slice(0, 24);
    if (WEAK_OPENERS.some(function (w) { return opener.indexOf(w) === 0; })) { findings.push({ t: 'warn', m: 'Weak opener. Lead with the single most compelling feature, not "This/Welcome to/Located…".' }); score -= 10; }
    else { findings.push({ t: 'good', m: 'Opener gets to the point.' }); }

    if (!CTA.some(function (c) { return lower.indexOf(c) !== -1; })) { findings.push({ t: 'warn', m: 'No clear call to action. End with "Schedule your private tour today" or similar.' }); score -= 10; }
    else { findings.push({ t: 'good', m: 'Has a call to action.' }); }

    var caps = (t.match(/\b[A-Z]{4,}\b/g) || []).length;
    if (caps >= 3) { findings.push({ t: 'warn', m: 'Lots of ALL-CAPS (' + caps + '). Reads as shouting; use sparingly.' }); score -= 6; }

    var exclam = (t.match(/!/g) || []).length;
    if (exclam >= 4) { findings.push({ t: 'warn', m: 'Too many exclamation points (' + exclam + '). One is plenty.' }); score -= 5; }

    return { score: Math.max(0, score), wc: wc, findings: findings };
  }

  function rewritePrompt(text) {
    return 'You are an expert real-estate copywriter. Rewrite the MLS listing below to be more compelling.\n' +
      'Rules: ~120–150 words; lead with the single strongest feature; replace clichés with concrete specifics; ' +
      'remove any fair-housing-sensitive language (describe the home, not the buyer); end with a clear call to action; ' +
      'keep every factual claim accurate — do not invent features.\n\n--- ORIGINAL ---\n' + text.trim() + '\n--- END ---';
  }

  function render() {
    var text = (document.getElementById('r_text') || {}).value || '';
    if (!text.trim()) return;
    var a = analyze(text);
    var color = a.score >= 80 ? '#16a34a' : a.score >= 60 ? '#d97706' : '#e11d48';
    var items = a.findings.map(function (f) {
      var icon = f.t === 'good' ? '✅' : f.t === 'warn' ? '⚠️' : '❌';
      return '<li style="margin:6px 0">' + icon + ' ' + f.m + '</li>';
    }).join('');
    document.getElementById('scoreNum').textContent = a.score;
    document.getElementById('scoreNum').style.color = color;
    document.getElementById('findings').innerHTML = items;
    document.getElementById('outPrompt').textContent = rewritePrompt(text);
    document.getElementById('results').style.display = 'block';
    track('use_tool', { tool: 'roast', score: a.score });
    document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function copy(id, btn) {
    var txt = document.getElementById(id).textContent;
    function done() { var t = btn.textContent; btn.textContent = '✓ Copied'; setTimeout(function () { btn.textContent = t; }, 1500); }
    if (navigator.clipboard) { navigator.clipboard.writeText(txt).then(done, done); }
    else { var ta = document.createElement('textarea'); ta.value = txt; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e) {} document.body.removeChild(ta); done(); }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var f = document.getElementById('roastForm');
    if (f) f.addEventListener('submit', function (e) { e.preventDefault(); render(); });
    document.querySelectorAll('[data-copy]').forEach(function (b) { b.addEventListener('click', function () { copy(b.getAttribute('data-copy'), b); }); });
  });
})();
