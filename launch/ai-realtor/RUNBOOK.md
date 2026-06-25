# ListingLift 运营手册（第一个商业化项目）

**项目来源**：`niche-ai-wrapper`（垂直场景 AI 工具）
**形态**：内容获客站 → 邮件早鸟名单 → AI Listing Writer 产品变现
**线上地址**：https://f-tiger.github.io/smarterFuture/launch/ai-realtor/

---

## 一、Claude 已自动完成（M0 上线）
- ✅ 站点搭建：首页 + 5 篇真实 SEO 指南文章（自包含样式，无 CDN 依赖）
- ✅ 变现位埋点：邮件名单表单、广告位、联盟位、产品 CTA（全部 config 驱动）
- ✅ SEO 基建：title/description/canonical/OG、sitemap.xml、robots.txt、schema、内链
- ✅ 营销物料：见 `data/marketing-kits/niche-ai-wrapper.json`（落地页/社媒/邮件序列/SEO词/广告）
- ✅ 自动部署：随主站 GitHub Pages 一起发布

## 二、⚠️ 只有你能做的「变现开关」（M1→M2 必需）
全部集中在一个文件：[`config.js`](./config.js)。填好即「开闸」。

| 开关 | 在哪开 | 填到 config.js |
|---|---|---|
| **邮件名单（最关键）** | 注册 [Formspree](https://formspree.io) 或 Buttondown，建一个表单，拿到 POST endpoint | `emailEndpoint` |
| **展示广告** | 流量起来后申请 Google AdSense，拿 `ca-pub-xxxx` | `adsenseClient` |
| **联盟变现** | 申请相关 AI 工具的联盟计划，拿专属链接 | `affiliate.aiToolkit` |
| **产品收款**（可选） | Stripe/Gumroad/Lemon Squeezy 建收款页 | `productCheckoutUrl` |
| **数据分析**（建议尽早） | 注册 Google Analytics 4，拿 `G-xxxx` | `gaMeasurementId` |
| **搜索收录** | [Google Search Console](https://search.google.com/search-console) 验证域名并提交 `sitemap.xml` | （在 GSC 网页操作，无需改代码） |

> 在你填之前，站点处于**演示模式**：表单可点但不真正写库、广告显示占位、联盟是示例链接——可安全公开演示。

## 二·五、💰 立刻可卖的数字产品《AI Realtor Toolkit》
我已做好一个**真实可售卖的数字产品**（60 prompts + 15 邮件模板 + 8 房型框架 + fair-housing 清单 + 社媒 swipe），约 52KB 单文件。
> ⚠️ 为避免被白嫖，**产品文件不放进公开仓库**（已 gitignore）。我会把它直接发给你（也在容器内 `product-assets/ai-realtor-toolkit/AI-Realtor-Toolkit.html`）。

**开卖只需 ~5 分钟（这是到「第一笔收入」最短路径）：**
1. 注册 [Gumroad](https://gumroad.com)（或 Lemon Squeezy）→ New Product → Digital product。
2. 上传 `AI-Realtor-Toolkit.html`（可先在浏览器打开→打印为 PDF 再上传，体验更好）。
3. 定价 **$29**（划线原价 $49），标题/描述可直接用 `toolkit.html` 销售页的文案。
4. 拿到购买链接，填进 [`config.js`](./config.js) 的 `productCheckoutUrl` → push → 销售页「Buy now」按钮即直达收款。
5. 用 `data/marketing-kits/niche-ai-wrapper.json` 的社媒/邮件物料推广该产品。

> 在你填 `productCheckoutUrl` 之前，销售页已上线（演示模式：购买按钮回退到早鸟名单），可安全公开。

## 三、获客（营销动作，可半自动）
营销物料已生成在 `data/marketing-kits/niche-ai-wrapper.json`，直接取用：
1. **SEO**（自动）：5 篇指南已上线，提交 Google Search Console 收录；后续每周用 `marketing.mjs` 扩充选题。
2. **社媒**（半自动）：10 条帖 + 7 天排期已写好，复制去 X/LinkedIn 发布（或接排期工具）。
3. **邮件**（自动）：5 封欢迎序列已写好，名单接通后导入 ESP 自动发送。
4. **社区**（人工）：在房产经纪 Facebook 群/subreddit 真诚分享指南。

## 四、营收里程碑与现实预期
- **M0 上线** ✅ —— 现在就是这一步。
- **M1 首批名单**：填好 `emailEndpoint` + 发 2-3 篇社媒引流后，通常数日内可见首批订阅。
- **M2 首笔收入**：SEO 自然流量通常需 **数周到数月**积累；联盟/广告随流量线性增长；产品收款待你接通 Stripe/Gumroad 后即可发生。
- **诚实说明**：内容站收入不是即时的，靠流量复利。最快的现金路径是**先用名单 + 直接社媒推广**把 AI Listing Writer 卖出去（需你接收款）。

## 五、每周自动运营循环（接通后）
```
marketing.mjs/research → 产新指南与社媒 → 自动发布 → GSC/分析监测
   → 用数据迭代选题 → 扩充内容 → 名单/收入增长 → 复利
```
> 待办自动化：把 `marketing.mjs --all` 接入每周 GitHub Actions（需先配 ANTHROPIC_API_KEY）。
