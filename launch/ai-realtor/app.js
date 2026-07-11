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

  // 转化事件埋点（配置 gaMeasurementId 后自动上报到 GA4）
  function track(name, params) { if (window.gtag) { try { window.gtag('event', name, params || {}); } catch (e) {} } }

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
      slot.style.display = 'none';
    }
  });

  // 价格展示（产品1）
  document.querySelectorAll('[data-price]').forEach(function (e) { e.textContent = C.productPrice || '$29'; });
  document.querySelectorAll('[data-price-old]').forEach(function (e) {
    if (C.productPriceOld) { e.textContent = C.productPriceOld; } else { e.style.display = 'none'; }
  });
  // 价格展示（产品2）
  document.querySelectorAll('[data-price2]').forEach(function (e) { e.textContent = C.product2Price || '$19'; });
  document.querySelectorAll('[data-price2-old]').forEach(function (e) {
    if (C.product2PriceOld) { e.textContent = C.product2PriceOld; } else { e.style.display = 'none'; }
  });

  // 购买按钮通用接线
  function wireBuy(sel, url, name, value) {
    document.querySelectorAll(sel).forEach(function (el) {
      if (url) {
        el.setAttribute('href', url); el.setAttribute('target', '_blank'); el.setAttribute('rel', 'noopener');
      } else {
        el.setAttribute('href', '#waitlist');
        var hint = el.getAttribute('data-buy-hint');
        if (hint) { var h = document.querySelector(hint); if (h) h.textContent = ''; }
      }
      el.addEventListener('click', function () { track('begin_checkout', { item_name: name, value: value, currency: 'USD' }); });
    });
  }
  wireBuy('[data-buy]', C.productCheckoutUrl, 'AI Realtor Toolkit', 29);
  wireBuy('[data-buy2]', C.product2CheckoutUrl, '90-Day Content Calendar', 19);

  // 书价展示
  document.querySelectorAll('[data-book-price]').forEach(function (e) { e.textContent = C.bookPrice || '$4.99'; });
  // Kindle 书链接：有 bookUrl 则可点（新窗口），否则标记 Coming soon 且不可点
  document.querySelectorAll('[data-book]').forEach(function (el) {
    if (C.bookUrl) {
      el.setAttribute('href', C.bookUrl); el.setAttribute('target', '_blank'); el.setAttribute('rel', 'noopener');
      el.addEventListener('click', function () { track('select_content', { item_name: 'Kindle Book', content_type: 'book' }); });
    } else {
      el.removeAttribute('href');
      el.classList.add('soon');
      var badge = el.querySelector('[data-book-badge]');
      if (badge) badge.textContent = 'Coming soon';
    }
  });

  // Scripts Vault（产品4）：有链接则可购，否则 Coming soon
  document.querySelectorAll('[data-price3]').forEach(function (e) { e.textContent = C.product3Price || '$12.99'; });
  document.querySelectorAll('[data-product3]').forEach(function (el) {
    if (C.product3CheckoutUrl) {
      el.setAttribute('href', C.product3CheckoutUrl); el.setAttribute('target', '_blank'); el.setAttribute('rel', 'noopener');
      el.addEventListener('click', function () { track('begin_checkout', { item_name: 'Agent Scripts Vault', value: 12.99, currency: 'USD' }); });
    } else {
      el.removeAttribute('href'); el.classList.add('soon');
      var b = el.querySelector('[data-product3-badge]'); if (b) b.textContent = 'Coming soon';
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
        track('generate_lead', { source: 'listinglift', mode: 'demo' });
        if (msg) { msg.textContent = "✅ You're on the list — we'll email you when it opens!"; msg.style.color = '#16a34a'; }
        form.reset();
        return;
      }
      var btn = form.querySelector('button'); if (btn) { btn.disabled = true; btn.textContent = "Submitting…"; }
      fetch(C.emailEndpoint, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, source: 'listinglift' })
      }).then(function (r) {
        if (msg) {
          if (r.ok) {
            track('generate_lead', { source: 'listinglift' }); form.reset();
            // 感谢页 tripwire：注册成功 → 跳转一次性欢迎 offer（guides 子目录需回上一级）
            var wl = location.pathname.indexOf('/guides/') !== -1 ? '../welcome.html' : 'welcome.html';
            window.location.href = wl; return;
          }
          else { msg.textContent = "Something went wrong — please try again."; msg.style.color = '#e11d48'; }
        }
      }).catch(function () {
        if (msg) { msg.textContent = "Network error — please try again."; msg.style.color = '#e11d48'; }
      }).finally(function () { if (btn) { btn.disabled = false; btn.textContent = "Join the free list"; } });
    });
  });
})();

// ===== 营收加速（业界方法论，诚信实现）=====
(function () {
  var C = window.SITE_CONFIG || {};
  var BOOK = C.bookUrl || 'https://payhip.com/b/bn7q6';
  function track(name, params) { if (window.gtag) { try { window.gtag('event', name, params || {}); } catch (e) {} } }

  // 1) 价值交付时刻 upsell：免费工具出结果后，就地展示完整版 offer（每页一次）
  var res = document.getElementById('results');
  if (res) {
    var injected = false;
    var inject = function () {
      if (injected || res.style.display === 'none') return;
      injected = true;
      var d = document.createElement('div');
      d.className = 'aff';
      d.innerHTML = '<h3>✨ Like this? It\'s 1 of 130+.</h3>' +
        '<p>The full guide has 130+ prompts, 8 before/after rewrites and a fair-housing word list — ' +
        '<strong>$5.99</strong> with code <strong>LAUNCH40</strong> (reg. $9.99). ' +
        '<a href="' + BOOK + '" target="_blank" rel="noopener"><strong>Get the full guide &rarr;</strong></a></p>';
      res.appendChild(d);
      track('view_promotion', { placement: 'post_result' });
    };
    new MutationObserver(inject).observe(res, { attributes: true, attributeFilter: ['style'] });
    inject();
  }

  // 2) 退出挽留：桌面端鼠标移出视口顶部，一次会话仅一次，welcome 页不打扰
  if (location.pathname.indexOf('welcome.html') !== -1) return;
  try { if (sessionStorage.getItem('ll_exit_shown')) return; } catch (e) {}
  var shown = false;
  document.addEventListener('mouseout', function (ev) {
    if (shown || ev.clientY > 8 || ev.relatedTarget) return;
    shown = true;
    try { sessionStorage.setItem('ll_exit_shown', '1'); } catch (e) {}
    var o = document.createElement('div');
    o.setAttribute('style', 'position:fixed;inset:0;background:rgba(15,23,42,.55);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px');
    o.innerHTML = '<div style="background:#fff;border-radius:14px;max-width:420px;width:100%;padding:28px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.3)">' +
      '<div style="font-size:34px">🎁</div>' +
      '<h3 style="margin:8px 0 6px;font-size:20px">Your 40% off is still active</h3>' +
      '<p style="margin:0 0 16px;color:#475569;font-size:15px">The full 130+ prompt guide is <strong>$5.99</strong> with code <strong>LAUNCH40</strong> (reg. $9.99). Instant download, 30-day refund.</p>' +
      '<a href="' + BOOK + '" target="_blank" rel="noopener" class="btn blue" style="display:block;margin-bottom:10px">Get it for $5.99 &rarr;</a>' +
      '<a href="#" data-close style="font-size:13px;color:#94a3b8">No thanks</a></div>';
    o.addEventListener('click', function (ev2) {
      if (ev2.target === o || ev2.target.hasAttribute('data-close')) { ev2.preventDefault(); o.remove(); }
    });
    document.body.appendChild(o);
    track('view_promotion', { placement: 'exit_intent' });
  });
})();
