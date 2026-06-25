/*
 * ListingLift 运营配置 —— ⚠️ 这是「变现开关」文件。
 * 全部留空时站点处于「演示模式」：表单不真正提交、广告位显示占位、联盟为示例链接。
 * 你只需把下面的占位换成真实 ID/Endpoint，即可「开闸」开始收集名单与变现。
 * 详见同目录 RUNBOOK.md。
 */
window.SITE_CONFIG = {
  brand: "ListingLift",
  productName: "AI Listing Writer",
  tagline: "Write MLS-ready listings in 30 seconds — built for real-estate agents.",

  // 1) 邮件名单 / 等待名单（最关键的变现资产）
  //    填 Formspree/Buttondown/Resend 等的 POST endpoint。留空=演示模式。
  emailEndpoint: "",            // 例: "https://formspree.io/f/xxxxxx"

  // 2) 展示广告（有流量后开）
  adsenseClient: "",            // 例: "ca-pub-1234567890123456"，留空=显示占位

  // 3) 联盟链接（上下文相关推荐变现）
  affiliate: {
    aiToolkit: "#",             // 例: "https://partner.example.com/?ref=YOUR_ID"
  },

  // 4) 收款/正式产品页（若产品已上线收款，填外部 URL，否则走等待名单）
  productCheckoutUrl: "",       // 例: "https://buy.stripe.com/xxxx"

  // 5) 数据测量（强烈建议尽早开，用来看流量与转化）
  gaMeasurementId: ""           // Google Analytics 4，例: "G-XXXXXXXXXX"，留空=不加载
};
