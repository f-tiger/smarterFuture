// 纯前端 AI 跟进邮件生成器：选场景+填字段 → 生成可直接发送的邮件 + 可粘贴进任意AI精修的提示词。
(function () {
  function val(id) { var e = document.getElementById(id); return e ? e.value.trim() : ''; }
  function track(n, p) { if (window.gtag) { try { gtag('event', n, p || {}); } catch (e) {} } }
  function or(v, d) { return v ? v : d; }

  var SCEN = {
    'new-lead': {
      label: 'New lead — first touch',
      subject: function (d) { return 'Quick question about ' + or(d.area, '[area]'); },
      body: function (d) {
        return 'Hi ' + or(d.first, '[first name]') + ',\n\n' +
          'Thanks for reaching out about ' + or(d.property, 'homes in ' + or(d.area, '[area]')) + '. ' +
          'I\'d love to help you find the right fit.\n\n' +
          'To point you in the best direction — are you hoping to make a move in the next few weeks, or still in the early research stage?\n\n' +
          'Either way, no pressure. Happy to send a few options or just answer questions.\n\n' +
          'Best,\n' + or(d.agent, '[your name]') + '\n' + or(d.broker, '[brokerage]');
      }
    },
    'post-showing': {
      label: 'After a showing',
      subject: function (d) { return 'Thanks for touring ' + or(d.property, '[property]') + ' today'; },
      body: function (d) {
        return 'Hi ' + or(d.first, '[first name]') + ',\n\n' +
          'Great to see you at ' + or(d.property, '[property]') + ' today! I\'d love your honest take — what stood out, and what gave you pause?\n\n' +
          'If it\'s not quite the one, I have a couple of similar homes I think are worth a look. Want me to send them over?\n\n' +
          'Talk soon,\n' + or(d.agent, '[your name]') + '\n' + or(d.broker, '[brokerage]');
      }
    },
    'price-drop': {
      label: 'Price improvement',
      subject: function (d) { return 'Price improvement on ' + or(d.property, '[property]'); },
      body: function (d) {
        return 'Hi ' + or(d.first, '[first name]') + ',\n\n' +
          'Quick heads-up: the price on ' + or(d.property, '[property]') + ' just improved. ' +
          'You mentioned it was on your radar, so I wanted you to hear it from me first.\n\n' +
          'These tend to move faster after a price change — want to grab a showing this week before it does?\n\n' +
          'Best,\n' + or(d.agent, '[your name]') + '\n' + or(d.broker, '[brokerage]');
      }
    },
    'past-client': {
      label: 'Past-client check-in',
      subject: function (d) { return 'Thinking of you, ' + or(d.first, '[first name]'); },
      body: function (d) {
        return 'Hi ' + or(d.first, '[first name]') + ',\n\n' +
          'It\'s been a little while — I hope you\'re loving the home! No agenda here, just checking in.\n\n' +
          'If it\'s ever useful, I\'m happy to send a free, no-obligation update on what your home might be worth in today\'s ' +
          or(d.area, '[area]') + ' market. Just reply and I\'ll put it together.\n\n' +
          'Warmly,\n' + or(d.agent, '[your name]') + '\n' + or(d.broker, '[brokerage]');
      }
    },
    'open-house': {
      label: 'Open house invite',
      subject: function (d) { return 'You\'re invited: open house at ' + or(d.property, '[property]'); },
      body: function (d) {
        return 'Hi ' + or(d.first, '[first name]') + ',\n\n' +
          'I\'m hosting an open house at ' + or(d.property, '[property]') + ' on ' + or(d.date, '[date & time]') + '. ' +
          'I thought of you — it\'s a great fit for what you\'ve been looking for in ' + or(d.area, '[area]') + '.\n\n' +
          'Swing by anytime, no RSVP needed. I\'ll be there to answer questions.\n\n' +
          'See you there,\n' + or(d.agent, '[your name]') + '\n' + or(d.broker, '[brokerage]');
      }
    }
  };

  function buildPrompt(d, s) {
    return 'Write a real-estate follow-up email. Scenario: ' + SCEN[s].label + '.\n' +
      'Recipient: ' + or(d.first, '[first name]') + '. Property/area: ' + or(d.property, or(d.area, '[area]')) + '.\n' +
      'Agent: ' + or(d.agent, '[your name]') + ', ' + or(d.broker, '[brokerage]') + '. Tone: ' + or(d.tone, 'warm') + '.\n' +
      'Keep it under 110 words, friendly, one clear next step, no pressure. Avoid fair-housing-sensitive language.';
  }

  function gather() {
    return {
      first: val('e_first'), property: val('e_property'), area: val('e_area'),
      agent: val('e_agent'), broker: val('e_broker'), date: val('e_date'), tone: val('e_tone')
    };
  }

  function render() {
    var s = val('e_scenario') || 'new-lead', d = gather();
    document.getElementById('outSubject').textContent = SCEN[s].subject(d);
    document.getElementById('outEmail').textContent = SCEN[s].body(d);
    document.getElementById('outPrompt').textContent = buildPrompt(d, s);
    document.getElementById('results').style.display = 'block';
    track('use_tool', { tool: 'email', scenario: s });
    document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function copy(id, btn) {
    var txt = document.getElementById(id).textContent;
    function done() { var t = btn.textContent; btn.textContent = '✓ Copied'; setTimeout(function () { btn.textContent = t; }, 1500); track('copy', { which: id }); }
    if (navigator.clipboard) { navigator.clipboard.writeText(txt).then(done, done); }
    else { var ta = document.createElement('textarea'); ta.value = txt; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e) {} document.body.removeChild(ta); done(); }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var f = document.getElementById('emailForm');
    if (f) f.addEventListener('submit', function (e) { e.preventDefault(); render(); });
    // 切换场景时显示/隐藏 open-house 日期字段
    var sc = document.getElementById('e_scenario');
    function toggleDate() { var w = document.getElementById('dateWrap'); if (w) w.style.display = (sc && sc.value === 'open-house') ? '' : 'none'; }
    if (sc) sc.addEventListener('change', toggleDate); toggleDate();
    document.querySelectorAll('[data-copy]').forEach(function (b) { b.addEventListener('click', function () { copy(b.getAttribute('data-copy'), b); }); });
  });
})();
