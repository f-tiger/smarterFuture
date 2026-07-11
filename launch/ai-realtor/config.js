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
  emailEndpoint: "https://formspree.io/f/xzdlnanb",  // Formspree「ListingLift signups」

  // 2) 展示广告（有流量后开）
  adsenseClient: "",            // 例: "ca-pub-1234567890123456"，留空=显示占位

  // 3) 联盟链接（上下文相关推荐变现）
  affiliate: {
    aiToolkit: "#",             // 例: "https://partner.example.com/?ref=YOUR_ID"
  },

  // 4) 收款/正式产品页（数字产品《AI Realtor Toolkit》的收款链接）
  //    把 product-assets/ai-realtor-toolkit 打包上传到 Gumroad/Lemon Squeezy，拿到购买链接填这里。
  //    留空 = 购买按钮回退到「加入早鸟名单」。详见 RUNBOOK.md。
  productCheckoutUrl: "https://payhip.com/b/4rDt0",   // AI Realtor Toolkit（Payhip）
  productPrice: "$29",          // 售价展示
  productPriceOld: "$49",       // 划线原价（可留空）

  // 4b) 第二个数字产品《90-Day Real Estate Content Calendar》
  product2CheckoutUrl: "https://payhip.com/b/clwHo",  // 90-Day Content Calendar（Payhip）
  product2Price: "$19",
  product2PriceOld: "$29",

  // 4c) Kindle 电子书《The AI Listing & Lead System for Real Estate Agents》
  //     发布到 KDP 后，把 Amazon 书页链接（如 https://www.amazon.com/dp/XXXXXXXXXX）填到 bookUrl。
  //     留空 = 显示「Coming soon」，不可点。书与站互相导流。
  bookUrl: "https://payhip.com/b/bn7q6",  // Kindle-style ebook, sold via Payhip

  // 4d) 第四个数字产品《The Agent Scripts Vault》（话术库，$12.99）
  //     上架 Payhip 后填购买链接；留空 = 站点卡片显示 Coming soon。
  product3CheckoutUrl: "",
  product3Price: "$12.99",
  bookPrice: "$4.99",

  // 5) 数据测量（强烈建议尽早开，用来看流量与转化）
  gaMeasurementId: ""           // Google Analytics 4，例: "G-XXXXXXXXXX"，留空=不加载
};
