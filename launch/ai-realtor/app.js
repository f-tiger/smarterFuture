// ListingLift 运营脚本：根据 config.js 渲染变现位、接管邮件名单表单。
(function () {
  var C = window.SITE_CONFIG || {};

  // Google Analytics 4（配置 gaMeasurementId 后自动加载）
  if (C.gaMeasurementId) {
    var ga = document.createElement('script');
    ga.async = true;
    ga.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(C.gaMeasurementId);
    document.head.appendChild(ga);
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', C.gaMeasurementId);
  }

  // 品牌占位填充
  document.querySelectorAll('[data-brand]').forEach(function (e) { e.textContent = C.brand || 'ListingLift'; });
  document.querySelectorAll('[data-product]').forEach(function (e) { e.textContent = C.productName || 'AI Listing Writer'; });
  document.querySelectorAll('[data-tagline]').forEach(function (e) { e.textContent = C.tagline || ''; });

  // 联盟链接
  document.querySelectorAll('[data-aff]').forEach(function (e) {
    var k = e.getAttribute('data-aff');
    var url = (C.affiliate && C.affiliate[k]) || '#';
    e.setAttribute('href', url);
    if (url === '#' || !url) e.setAttribute('data-demo', '1');
  });

  // 广告位：有 adsenseClient 则注入，否则占位
  document.querySelectorAll('.ad-slot').forEach(function (slot) {
    if (C.adsenseClient) {
      var ins = document.createElement('ins');
      ins.className = 'adsbygoogle';
      ins.style.display = 'block';
      ins.setAttribute('data-ad-client', C.adsenseClient);
      ins.setAttribute('data-ad-format', 'auto');
      ins.setAttribute('data-full-width-responsive', 'true');
      slot.innerHTML = '';
      slot.appendChild(ins);
      try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
    } else {
      slot.textContent = '广告位（配置 adsenseClient 后自动启用）';
    }
  });

  // 价格展示
  document.querySelectorAll('[data-price]').forEach(function (e) { e.textContent = C.productPrice || '$29'; });
  document.querySelectorAll('[data-price-old]').forEach(function (e) {
    if (C.productPriceOld) { e.textContent = C.productPriceOld; } else { e.style.display = 'none'; }
  });

  // 购买按钮：有 checkout 链接则跳转，否则回退到等待名单
  document.querySelectorAll('[data-buy]').forEach(function (el) {
    if (C.productCheckoutUrl) {
      el.setAttribute('href', C.productCheckoutUrl);
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener');
    } else {
      el.setAttribute('href', '#waitlist');
      var hint = el.getAttribute('data-buy-hint');
      if (hint) { var h = document.querySelector(hint); if (h) h.textContent = '（演示：配置 productCheckoutUrl 后此按钮直达收款页）'; }
    }
  });

  // 邮件名单表单
  document.querySelectorAll('form[data-capture]').forEach(function (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var email = (form.querySelector('input[type=email]') || {}).value || '';
      var msg = form.querySelector('[data-msg]');
      if (!msg && form.nextElementSibling && form.nextElementSibling.matches && form.nextElementSibling.matches('[data-msg]')) msg = form.nextElementSibling;
      if (!email) { return; }
      if (!C.emailEndpoint) {
        if (msg) { msg.textContent = '✅ 演示模式：已记录「' + email + '」（配置 emailEndpoint 后将真正写入名单）。'; msg.style.color = '#16a34a'; }
        form.reset();
        return;
      }
      var btn = form.querySelector('button'); if (btn) { btn.disabled = true; btn.textContent = '提交中…'; }
      fetch(C.emailEndpoint, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, source: 'listinglift' })
      }).then(function (r) {
        if (msg) {
          if (r.ok) { msg.textContent = '✅ 已加入早鸟名单，留意你的邮箱！'; msg.style.color = '#16a34a'; form.reset(); }
          else { msg.textContent = '提交失败，请稍后再试。'; msg.style.color = '#e11d48'; }
        }
      }).catch(function () {
        if (msg) { msg.textContent = '网络错误，请稍后再试。'; msg.style.color = '#e11d48'; }
      }).finally(function () { if (btn) { btn.disabled = false; btn.textContent = '加入早鸟名单'; } });
    });
  });
})();
