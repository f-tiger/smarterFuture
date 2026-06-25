# 复利发现引擎 (Compound Discovery Engine)

> 一个**自动化创造复利**的网站：持续调研海外创业生态，发现可被「一人 + AI」快速复制的高潜力项目，
> 自动生成竞对分析、ROI、回本周期、一页路演与**分级落地清单**，帮助你在 **2026 年底前跑通一个可盈利的商业闭环**。

驱动整个系统的「母 Prompt」见 [`PROMPT.md`](./PROMPT.md)。

---

## ✨ 核心功能（对应你的三点需求）

1. **自动调研 + 持续更新**
   - `automation/research.mjs` 调用 Claude API（带 Web 搜索）扫描 Indie Hackers / Product Hunt / Hacker News 等海外源（见 `automation/sources.json`）。
   - 产出含 **竞对分析、ROI、回本周期、商业模式、一页路演** 的结构化数据，写入 `data/projects.json`。
   - GitHub Actions 每周自动运行并提交（`.github/workflows/auto-update.yml`），形成**自动闭环**。

2. **轻量化 + Claude 快速复制**
   - 前端零构建：纯静态 `index.html` + `project.html` + Tailwind CDN + 原生 JS 读 JSON。
   - 任意静态托管即可上线（Netlify / Vercel / GitHub Pages）。
   - 每个项目都标注 **🤖 Claude 可自动完成** vs **⚠️ 必须人工介入** 的步骤。

3. **分级落地清单**
   - 🟢 `ai-auto` — Claude/脚本端到端复制，人只配密钥与收款
   - 🟡 `ai-human` — AI 做大部分，人工负责创意/商务/审核
   - 🔴 `manual` — 模式可借鉴，复制主要靠人工
   - 列表页可按分级筛选、按评分/回本/营收/成本排序；详情页给出**逐步落地清单 + 预计天数**。

---

## 🚀 本地预览

纯静态，任意静态服务器即可：

```bash
# 任选其一
python3 -m http.server 8000
# 然后浏览器打开 http://localhost:8000
```

> 注意：直接双击 `index.html`（file://）会因浏览器 CORS 无法 fetch JSON，请用本地服务器。

---

## 🤖 运行自动调研引擎

```bash
cd automation
npm install
export ANTHROPIC_API_KEY=sk-ant-...      # ⚠️ 人工介入点：需自备 API Key
node research.mjs                          # 发现并写入新项目
DRY_RUN=1 node research.mjs                # 仅预览，不写文件
```

可配置环境变量：
- `ANTHROPIC_API_KEY`（必填）
- `RESEARCH_MODEL`（默认 `claude-sonnet-4-6`）
- `TARGET_NEW`（每次新增项目数，默认 3）

---

## 🔁 全自动闭环（GitHub Actions）

1. 仓库 **Settings → Secrets and variables → Actions** 添加 `ANTHROPIC_API_KEY`。
2. `.github/workflows/auto-update.yml` 每周一自动运行调研引擎并提交数据（也可手动触发）。
3. 接 Netlify/Vercel 到本仓库，`data/projects.json` 一变更即自动重新部署。

```
定时 → 调研(Claude+搜索) → 写数据 → 自动部署 → 你挑1个复制 → 现金流再投入 → 复利
```

---

## ⚠️ 必须人工介入的环节（如实标注）

闭环中以下环节**无法完全自动化**，需你介入：

| 环节 | 说明 |
|------|------|
| API Key | 配置 `ANTHROPIC_API_KEY`（本地与 GitHub Secrets） |
| 收款/KYC | Stripe / 广告 / 联盟账号注册、税务与身份验证 |
| 质量抽查 | 定期核查新增项目真实性，避免错误/违规信息 |
| 商务谈判 | 赞助、本地商家、客户沟通等强人际环节 |
| 最终决策 | 选哪个项目真正落地由你拍板 |

---

## 📁 目录结构

```
.
├── PROMPT.md                 # 母 Prompt（角色/调研指令/评分/边界）
├── index.html                # 列表 + 仪表盘 + 飞轮说明
├── project.html              # 项目详情（竞对/ROI/路演/落地清单）
├── assets/
│   ├── app.js                # 列表渲染、筛选、排序
│   └── detail.js             # 详情渲染
├── data/
│   ├── projects.json         # 项目数据（引擎自动更新）
│   ├── meta.json             # 站点统计
│   └── schema.md             # 数据契约
├── automation/
│   ├── research.mjs          # 调研引擎（Claude API + Web 搜索）
│   ├── sources.json          # 信息源配置
│   └── package.json
├── .github/workflows/auto-update.yml   # 每周定时调研
└── netlify.toml              # 静态部署配置
```

---

## 🗺️ 到 2026 年底的建议路线

1. **现在**：浏览列表，挑 1 个 🟢 `ai-auto` 项目（启动成本最低、回本最快）。
2. **第 1 周**：配好密钥与收款，让 Claude 复制出 MVP 并上线。
3. **第 2-8 周**：跑数据、迭代获客，验证现金流。
4. **持续**：定时引擎每周补充新项目；用第一桶现金流再投入第二个项目 → 复利。
