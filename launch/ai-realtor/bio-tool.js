// 纯前端 AI 经纪人简介生成器：输入 → 短/长两版 bio + 可粘贴AI精修的提示词。
(function () {
  function val(id) { var e = document.getElementById(id); return e ? e.value.trim() : ''; }
  function track(n, p) { if (window.gtag) { try { gtag('event', n, p || {}); } catch (e) {} } }
  function or(v, d) { return v ? v : d; }
  function list(s) { return s ? s.split(/[,;\n]+/).map(function (x) { return x.trim(); }).filter(Boolean) : []; }
  function join(a) { if (!a.length) return ''; if (a.length === 1) return a[0]; return a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }

  function gather() {
    return {
      name: val('b_name'), years: val('b_years'), area: val('b_area'),
      spec: list(val('b_spec')), personal: val('b_personal'), tone: val('b_tone') || 'Warm'
    };
  }

  function shortBio(d) {
    var name = or(d.name, '[Your name]');
    var exp = d.years ? d.years + '+ years ' : '';
    var area = or(d.area, '[your market]');
    var spec = d.spec.length ? ', specializing in ' + join(d.spec) : '';
    return name + ' is a ' + exp + 'real-estate agent serving ' + area + spec + '. ' +
      'Known for clear communication and a client-first approach, ' + name.split(' ')[0] +
      ' helps buyers and sellers make confident moves. ' +
      (d.personal ? d.personal + ' ' : '') +
      'Reach out today to start your next chapter.';
  }
  function longBio(d) {
    var name = or(d.name, '[Your name]'), first = name.split(' ')[0];
    var exp = d.years ? 'With ' + d.years + '+ years in real estate, ' : '';
    var area = or(d.area, '[your market]');
    var s = exp + name + ' has built a reputation in ' + area + ' for honest guidance and results that put clients first.\n\n';
    if (d.spec.length) s += 'Whether you\'re ' + (d.spec.length > 1 ? 'navigating ' : 'focused on ') + join(d.spec) + ', ' + first + ' brings the local knowledge and steady hand to make it smooth.\n\n';
    s += first + '’s approach is simple: listen first, communicate often, and never lose sight of what matters to you. ';
    if (d.personal) s += d.personal + ' ';
    s += '\n\nIf you\'re thinking about buying or selling in ' + area + ', reach out for a no-pressure conversation.';
    return s;
  }
  function prompt(d) {
    return 'Write a real-estate agent bio. Name: ' + or(d.name, '[name]') + '. Experience: ' + or(d.years, '[years]') + ' years. ' +
      'Market: ' + or(d.area, '[area]') + '. Specialties: ' + (d.spec.join(', ') || '[specialties]') + '. ' +
      'Personal note: ' + or(d.personal, '[optional]') + '. Tone: ' + d.tone + '. ' +
      'Produce a 50-word short version and a 120-word long version. Warm, credible, client-first; avoid clichés and any fair-housing-sensitive language.';
  }

  function render() {
    var d = gather();
    document.getElementById('outShort').textContent = shortBio(d);
    document.getElementById('outLong').textContent = longBio(d);
    document.getElementById('outPrompt').textContent = prompt(d);
    document.getElementById('results').style.display = 'block';
    track('use_tool', { tool: 'bio', tone: d.tone });
    document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function copy(id, btn) {
    var txt = document.getElementById(id).textContent;
    function done() { var t = btn.textContent; btn.textContent = '✓ Copied'; setTimeout(function () { btn.textContent = t; }, 1500); track('copy', { which: id }); }
    if (navigator.clipboard) { navigator.clipboard.writeText(txt).then(done, done); }
    else { var ta = document.createElement('textarea'); ta.value = txt; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e) {} document.body.removeChild(ta); done(); }
  }
  document.addEventListener('DOMContentLoaded', function () {
    var f = document.getElementById('bioForm');
    if (f) f.addEventListener('submit', function (e) { e.preventDefault(); render(); });
    document.querySelectorAll('[data-copy]').forEach(function (b) { b.addEventListener('click', function () { copy(b.getAttribute('data-copy'), b); }); });
  });
})();
