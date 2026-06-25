// 纯前端 AI 开放日物料生成器：一次生成 邮件邀请/短信/指示牌/跟进邮件 + AI提示词。
(function () {
  function val(id) { var e = document.getElementById(id); return e ? e.value.trim() : ''; }
  function track(n, p) { if (window.gtag) { try { gtag('event', n, p || {}); } catch (e) {} } }
  function or(v, d) { return v ? v : d; }

  function gather() {
    return {
      prop: val('o_prop'), area: val('o_area'), date: val('o_date'),
      h1: val('o_h1'), h2: val('o_h2'), agent: val('o_agent'), broker: val('o_broker')
    };
  }
  function highlights(d) {
    var h = [d.h1, d.h2].filter(Boolean);
    return h.length ? h.join(' and ') : 'a home worth seeing';
  }

  function emailInvite(d) {
    return 'Subject: You\'re invited — open house at ' + or(d.prop, '[address]') + '\n\n' +
      'Hi there,\n\nI\'m hosting an open house at ' + or(d.prop, '[address]') +
      (d.area ? ' in ' + d.area : '') + ' on ' + or(d.date, '[date & time]') + '. ' +
      'It features ' + highlights(d) + ' — I think it\'s worth a look.\n\n' +
      'Swing by anytime, no RSVP needed. I\'ll be there to answer questions and show you around.\n\n' +
      'Hope to see you there,\n' + or(d.agent, '[your name]') + '\n' + or(d.broker, '[brokerage]');
  }
  function textInvite(d) {
    var s = 'Hi! Hosting an open house at ' + or(d.prop, '[address]') + ' on ' + or(d.date, '[date/time]') +
      ' — ' + highlights(d) + '. Stop by! – ' + or(d.agent, '[name]');
    if (s.length > 300) s = s.slice(0, 297) + '…';
    return s;
  }
  function sign(d) {
    return 'OPEN HOUSE\n' + or(d.prop, '[address]') + '\n' + or(d.date, '[date & time]') + '\n→ This way';
  }
  function followup(d) {
    return 'Subject: Thanks for stopping by ' + or(d.prop, '[address]') + '\n\n' +
      'Hi [first name],\n\nThanks for visiting the open house at ' + or(d.prop, '[address]') + ' today! ' +
      'I\'d love your honest take — was it a fit, or not quite right?\n\n' +
      'If it\'s not the one, I have a few similar homes' + (d.area ? ' in ' + d.area : '') +
      ' I can send over. Just reply and I\'ll line them up.\n\n' +
      'Best,\n' + or(d.agent, '[your name]') + '\n' + or(d.broker, '[brokerage]');
  }
  function prompt(d) {
    return 'Create an open house kit for ' + or(d.prop, '[address]') + (d.area ? ' in ' + d.area : '') +
      ' on ' + or(d.date, '[date/time]') + '. Highlights: ' + highlights(d) + '. ' +
      'Agent: ' + or(d.agent, '[name]') + ', ' + or(d.broker, '[brokerage]') + '. ' +
      'Produce: (1) an email invite, (2) a text invite under 300 chars, (3) directional sign text, ' +
      '(4) a post-visit follow-up email. Warm, factual, with clear CTAs; avoid fair-housing-sensitive language.';
  }

  function render() {
    var d = gather();
    document.getElementById('outEmail').textContent = emailInvite(d);
    document.getElementById('outText').textContent = textInvite(d);
    document.getElementById('outSign').textContent = sign(d);
    document.getElementById('outFollow').textContent = followup(d);
    document.getElementById('outPrompt').textContent = prompt(d);
    document.getElementById('results').style.display = 'block';
    track('use_tool', { tool: 'openhouse' });
    document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function copy(id, btn) {
    var txt = document.getElementById(id).textContent;
    function done() { var t = btn.textContent; btn.textContent = '✓ Copied'; setTimeout(function () { btn.textContent = t; }, 1500); track('copy', { which: id }); }
    if (navigator.clipboard) { navigator.clipboard.writeText(txt).then(done, done); }
    else { var ta = document.createElement('textarea'); ta.value = txt; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e) {} document.body.removeChild(ta); done(); }
  }
  document.addEventListener('DOMContentLoaded', function () {
    var f = document.getElementById('ohForm');
    if (f) f.addEventListener('submit', function (e) { e.preventDefault(); render(); });
    document.querySelectorAll('[data-copy]').forEach(function (b) { b.addEventListener('click', function () { copy(b.getAttribute('data-copy'), b); }); });
  });
})();
