// 纯前端 AI Listing 工具：根据输入生成(1)可直接粘贴进任意AI的提示词 +(2)即时模板草稿。无需后端/密钥。
(function () {
  function val(id) { var e = document.getElementById(id); return e ? e.value.trim() : ''; }
  function track(n, p) { if (window.gtag) { try { gtag('event', n, p || {}); } catch (e) {} } }

  function buildPrompt(d) {
    var feats = d.features ? d.features.split(/[,;\n]+/).map(function (s) { return s.trim(); }).filter(Boolean) : [];
    var featLine = feats.length ? feats.join(', ') : '[key features]';
    return 'You are an expert real-estate copywriter. Write an MLS listing description.\n' +
      'Property: ' + (d.address || '[address]') + '\n' +
      'Type: ' + (d.type || '[type]') + ' | Beds: ' + (d.beds || '[beds]') + ' | Baths: ' + (d.baths || '[baths]') + ' | Size: ' + (d.sqft || '[sqft]') + ' sqft\n' +
      'Standout features: ' + featLine + '\n' +
      'Neighborhood highlights: ' + (d.area || '[neighborhood]') + '\n' +
      'Tone: ' + d.tone + '. Length: ~120 words. Lead with the single most compelling feature.\n' +
      'Be accurate, do not exaggerate, and avoid any fair-housing-sensitive language ' +
      '(no references to race, religion, family status, national origin, disability, etc.). End with a clear call to action.';
  }

  // 即时模板草稿（确定性拼装，给个能用的起点；用户用上面的 prompt 进一步精修）
  function buildDraft(d) {
    var feats = (d.features ? d.features.split(/[,;\n]+/).map(function (s) { return s.trim(); }).filter(Boolean) : []);
    var lead = feats[0] || 'a wonderful place to call home';
    var rest = feats.slice(1);
    var specs = [];
    if (d.beds) specs.push(d.beds + ' bed');
    if (d.baths) specs.push(d.baths + ' bath');
    if (d.sqft) specs.push(d.sqft + ' sqft');
    var specLine = specs.length ? ' (' + specs.join(' · ') + ')' : '';
    var openers = {
      Warm: 'Welcome home to ',
      Luxury: 'Presenting an exceptional residence at ',
      Investor: 'A smart opportunity at ',
      Concise: ''
    };
    var closers = {
      Warm: 'Come see it for yourself — schedule a tour today.',
      Luxury: 'Private showings available by appointment.',
      Investor: 'Run the numbers and reach out to schedule a walkthrough.',
      Concise: 'Book a showing today.'
    };
    var addr = d.address || 'this home';
    var body = openers[d.tone] + addr + specLine + '. ';
    body += 'Highlighted by ' + lead + (rest.length ? ', plus ' + rest.join(', ') : '') + '. ';
    if (d.area) body += 'Ideally located near ' + d.area + '. ';
    body += closers[d.tone];
    return body;
  }

  function render(d) {
    var p = buildPrompt(d), draft = buildDraft(d);
    document.getElementById('outPrompt').textContent = p;
    document.getElementById('outDraft').textContent = draft;
    document.getElementById('results').style.display = 'block';
    track('use_tool', { tone: d.tone });
    document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function copy(id, btn) {
    var txt = document.getElementById(id).textContent;
    function done() { var t = btn.textContent; btn.textContent = '✓ Copied'; setTimeout(function () { btn.textContent = t; }, 1500); track('copy', { which: id }); }
    if (navigator.clipboard) { navigator.clipboard.writeText(txt).then(done, function () { fallback(txt); done(); }); }
    else { fallback(txt); done(); }
  }
  function fallback(txt) { var ta = document.createElement('textarea'); ta.value = txt; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e) {} document.body.removeChild(ta); }

  document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('toolForm');
    if (form) form.addEventListener('submit', function (e) {
      e.preventDefault();
      render({
        address: val('f_address'), type: val('f_type'), beds: val('f_beds'), baths: val('f_baths'),
        sqft: val('f_sqft'), features: val('f_features'), area: val('f_area'), tone: val('f_tone') || 'Warm'
      });
    });
    document.querySelectorAll('[data-copy]').forEach(function (b) {
      b.addEventListener('click', function () { copy(b.getAttribute('data-copy'), b); });
    });
  });
})();
