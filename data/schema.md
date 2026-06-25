# 项目数据 Schema (`data/projects.json`)

每个项目对象的字段定义。自动调研引擎与前端均以此为契约。

```jsonc
{
  "id": "string，唯一短标识 (kebab-case)",
  "name": "项目名",
  "tagline": "一句话描述",
  "category": "分类，如 AI工具 / 微型SaaS / 内容站 / 自动化服务 ...",
  "sourceUrl": "发现来源链接",
  "discoveredDate": "YYYY-MM-DD",
  "updatedDate": "YYYY-MM-DD",

  "automationLevel": "ai-auto | ai-human | manual",
  "compoundScore": 0,              // 0-100 综合分，用于排序

  "metrics": {
    "estimatedRoi": "如 '5-10x' 或 '300%/年'，标注 estimate",
    "paybackPeriodMonths": 0,      // 预计回本周期（月）
    "startupCostUsd": 0,           // 启动成本（美元）
    "monthlyRevenuePotentialUsd": 0,
    "difficulty": 3,               // 1(易) - 5(难)
    "timeToMvpWeeks": 2
  },

  "businessModel": {
    "revenueModel": "订阅 / 一次性 / 抽成 / 广告 / 服务费 ...",
    "pricing": "定价描述",
    "targetMarket": "目标客户",
    "acquisitionChannels": ["获客渠道1", "渠道2"]
  },

  "competitors": [
    {
      "name": "竞品名",
      "url": "链接",
      "strengths": "优势",
      "weaknesses": "弱点",
      "wedge": "我们的差异化切入点"
    }
  ],

  "analysis": {
    "opportunity": "机会说明",
    "risks": "风险（含法律/合规）",
    "moat": "可能的护城河"
  },

  "roadshow": {
    "problem": "痛点",
    "solution": "解决方案",
    "marketSize": "市场规模",
    "traction": "已有验证 / 信号",
    "businessModel": "商业模式一句话",
    "replicationPath": "复制路径"
  },

  "claudeReplicability": {
    "canClaudeBuild": true,
    "claudeSteps": ["Claude 可自动完成的步骤"],
    "humanInterventionPoints": ["⚠️ 必须人工：注册/收款/KYC/商务/审核 ..."]
  },

  "landingPlan": {
    "type": "ai-auto | ai-human | manual",
    "steps": [
      { "step": "步骤", "owner": "claude | human", "etaDays": 1 }
    ],
    "totalEtaDays": 7
  }
}
```
