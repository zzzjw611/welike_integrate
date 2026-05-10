# AI Marketer News — 自动化 Pipeline

每天**北京时间 07:48 自动跑**：抓 4 个源 → Claude Opus 4.7 生成当日期刊草稿 → 在 GitHub 上自动开 PR 等你审核 → 你 merge 就上 prod。

**线上**：[ai-marketer-news.vercel.app](https://ai-marketer-news.vercel.app) · **Repo**：[evie-jelabs/ai-marketer-news](https://github.com/evie-jelabs/ai-marketer-news)

## 架构

```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  TechCrunch  │ │   量子位     │ │ Product Hunt │ │   Substack   │
│   3× RSS     │ │     RSS      │ │  GraphQL API │ │   3× RSS     │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │                │
       └────────────────┴────────────────┴────────────────┘
                                │  raw JSON（4 fields）
                                ▼
                        ┌────────────────┐
                        │    Claude      │  ← prompts/draft.md
                        │ streaming API  │  ← CASE_QUEUE rotation
                        └────────┬────────┘
                                 │  YAML frontmatter + Markdown
                                 ▼
                  content/drafts/YYYY-MM-DD.draft.md
                                 │
                                 │  GH Actions 自动开 PR
                                 ▼
                       human review on GitHub
                                 │
                                 │  改名为 content/YYYY-MM-DD.md
                                 │  + merge PR
                                 ▼
                  Vercel webhook → auto-redeploy → 上线
```

## 数据源（经过 v3 调优后的最终版本）

| 源 | 目的 | 用量 | 备注 |
|---|---|---|---|
| **TechCrunch**（3 个 RSS）| Daily Brief 候选 | 8-12 条/天 | 关键词过滤 |
| **量子位**（1 个 RSS）| Daily Brief 候选（中文圈 / 跨源置信度） | 4-8 条/天 | 关键词过滤 |
| **Product Hunt**（GraphQL）| Launch Radar | 7-20 条/天 | 投票 ≥ 50 |
| **Substack**（3 个 RSS）| Growth Insight | 3-5 条/天 | Lenny / Stratechery / Late Checkout |

> ❌ **不用 X（Apify）**：2025-26 X 反爬升级，Apify free tier 抓不到真推文，付费版 $49/mo 也不稳定。改用 Substack 长文 — 同一批 growth thinker 的深度内容本来就发在 newsletter 上。详见下方 FAQ。

## 一次性设置

如果你 fork 这个项目重新部署一份，按这个流程：

### 1. 安装 Python 依赖（本地测试用）

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r pipeline/requirements.txt
```

### 2. 申请 API keys

| Service | 申请地址 | 价格 |
|---|---|---|
| **Anthropic** | [console.anthropic.com](https://console.anthropic.com) | 按用量 ~$0.30 / 期 |
| **Product Hunt Developer Token** ⚠️ | [producthunt.com/v2/oauth/applications](https://www.producthunt.com/v2/oauth/applications) | 免费 |

> ⚠️ **PH 注意**：要的是『**Developer Token**』（一般 64+ 字符），**不是** Client ID 或 Client Secret。在 application 详情页找 "Developer Token" 入口创建一个，scope 选 `public`。

### 3. 配置本地 `.env`

```bash
cp pipeline/.env.example pipeline/.env
# 编辑 pipeline/.env 填入两个 token
```

### 4. 配置 GitHub Secrets

```bash
gh secret set ANTHROPIC_API_KEY --repo <owner>/<repo>
gh secret set PH_TOKEN --repo <owner>/<repo>
```

### 5. 打开 Actions 创建 PR 的权限（必做，否则 workflow 跑通但开 PR 那一步失败）

```bash
gh api -X PUT repos/<owner>/<repo>/actions/permissions/workflow \
  -f default_workflow_permissions=write \
  -F can_approve_pull_request_reviews=true
```

或者在 GitHub Repo Settings → Actions → General → Workflow permissions 里手动勾 "Read and write" + "Allow GitHub Actions to create and approve pull requests"。

### 6. Vercel 接 git

Vercel → New Project → Import git repository → 选这个 repo → Deploy。**不需要在 Vercel 设置任何环境变量**（pipeline 不在 Vercel 上跑，只跑在 GH Actions）。

## 日常使用

### 自动（推荐 — 你不用做任何事）

每天 **23:45 UTC = 北京 07:45**：

1. GH Actions cron 触发 `pipeline/run.py`
2. 抓 4 源 → Claude 生成 → 写 `content/drafts/YYYY-MM-DD.draft.md`
3. **自动开 PR**：标题 `[Draft] AI Marketer News · YYYY-MM-DD`，body 带 review checklist
4. 你早上 8 点左右打开 GitHub mobile / 邮件通知 → 在 PR 里直接审 / 改

### 把 draft publish 到生产

PR review 完，要把 `content/drafts/YYYY-MM-DD.draft.md` 改名为 `content/YYYY-MM-DD.md` 才会真正显示在 prod 站点。两种方式：

**方式 A：本地操作（最直接）**

```bash
gh pr checkout <pr-number>
python -m pipeline.publish 2026-04-XX
git push
gh pr merge <pr-number> --squash --delete-branch
```

**方式 B：GitHub web UI**

打开 PR 的 Files changed → 在 `content/drafts/2026-04-XX.draft.md` 文件页右上点 ⋯ → "Rename file" → 改成 `content/2026-04-XX.md`（路径里去掉 `drafts/` 和 `.draft`）→ commit → 回 PR → Squash merge。

任一方式 merge 后 Vercel 自动重新部署，**~90 秒后** prod 上就能看到这一期。

### 手动触发一次

```bash
gh workflow run "Daily News Pipeline" \
  --repo <owner>/<repo> \
  -f target_date=2026-04-XX
```

或在 GitHub Actions 页面点 `Daily News Pipeline` → `Run workflow`。

### 本地跑一遍（调试用）

```bash
# Dry-run：只抓数据，不调 Claude
python -m pipeline.run --dry-run

# 真实跑（会扣 Claude 额度，~$0.30）
python -m pipeline.run --date 2026-04-XX
# 产物：content/drafts/2026-04-XX.draft.md

# 审核完发布
python -m pipeline.publish 2026-04-XX
```

## 文件结构

```
pipeline/
├── README.md            # 本文件
├── requirements.txt
├── .env.example
├── config.py            # SUBSTACK_FEEDS / AI_KEYWORDS / CASE_QUEUE
├── fetch/
│   ├── __init__.py      # RawItem dataclass
│   ├── techcrunch.py    # 3 个 TC RSS feed + 关键词过滤
│   ├── qbitai.py        # 量子位 RSS + 中文关键词过滤
│   ├── product_hunt.py  # GraphQL API（投票 ≥ 50）
│   └── substack.py      # Lenny / Stratechery / Late Checkout RSS
├── draft/
│   └── generate.py      # Claude + streaming
├── prompts/
│   └── draft.md         # 主编辑 system prompt（中文 + tone 规则）
├── run.py               # 端到端编排
└── publish.py           # draft → 发布

.github/workflows/
└── daily-news.yml       # GH Actions cron + 自动开 PR
```

## 调优

### 调整数据源

编辑 [`pipeline/config.py`](config.py)：

- `SUBSTACK_FEEDS` — Growth Insight 的 Substack/blog feed 列表（dict 格式：name、author、handle、url）
- `AI_KEYWORDS` — TechCrunch 过滤关键词（OR 匹配）
- `RELEVANCE_KEYWORDS`（在 [qbitai.py](fetch/qbitai.py) 里）— 量子位的中文关键词过滤
- `CASE_QUEUE` — Daily Case 的公司池（按日期 ordinal 取模轮换）

### 调整 Claude 的写作风格

编辑 [`pipeline/prompts/draft.md`](prompts/draft.md)。这是 system prompt，决定了：

- 输出格式（YAML frontmatter 字段、Markdown 结构）
- "So what for marketer" 的写作要求和**禁忌 tone**
- Growth Insight / Launch Radar 的选材优先级
- Daily Case 的小标题命名规则
- 跨源置信度规则（多源覆盖优先）+ 中文事件至少 1 条

改完推到 main，下次 cron 就生效。

### Tone 规则（来自 v3 复盘）

Prompt 里两条硬规则避免"AI 味"和"爹味"：

1. **soWhat 反爹味**
   - ❌ 『本周做三件事：(1)...(2)...(3)...』命令式编号清单
   - ❌ 『盘点 X / 测试 Y / 评估 Z』连续动词开头
   - ❌ 『建议你...』『你应该...』『你需要...』导师口吻
   - ✅ 以观察 / 反直觉点 / 二阶效应起句
   - ✅ 用『真正的信号是...』『一个被忽略的角度...』『可以试试...』
   - ✅ **可以纯分析洞察，不是每条都要给动作**

2. **Daily Case 描述性标题**
   - ❌ 『第一层 / 第二层 / 第三层』『要点 1 / 要点 2』『策略一 / 策略二』
   - ✅ 必须传达内容，例：『把 demo 当广告投，不是当 demo 投』、『定价做五级阶梯，不是二选一』

如果某天产出明显违反，直接打开 [draft.md](prompts/draft.md) 加更多反例 / 正例。

### 模型切换

默认 `claude-sonnet-4-6`（可通过 GitHub Secret / env `AI_NEWS_MODEL` 覆盖）：

- 默认：`claude-sonnet-4-6` — 稳定、成本适中，每期 ~$0.07
- 高质量：`claude-opus-4-7` — 如果账号有权限，可通过 `AI_NEWS_MODEL=claude-opus-4-7` 启用
- 极致省钱：`claude-haiku-4-5` — ~$0.015/期，文案会比较干

## 成本估算

按每天 1 期、每月 30 期：

| 项目 | 月成本 |
|---|---|
| Anthropic（Claude Sonnet，~16K in + 8K out） | **~$2.1** |
| Product Hunt API | $0 |
| TechCrunch / 量子位 / Substack RSS | $0 |
| GitHub Actions（私有仓库 2000 分钟/月免费，本任务 ~3 分钟/次 = 90 分钟/月） | $0 |
| Vercel Hobby | $0 |
| **合计** | **~$2.1/月** |

> 早期版本配 Apify 抓 X 时是 $61/月，现在只剩 Anthropic 一项实际付费。如果切到 Sonnet 4.6，月成本可降到 $2 以内。

## 常见问题（FAQ）

### Q: 某天内容很少，Claude 是不是在编造？

这是最大的风险。Prompt 明确要求『不要编造不存在的链接』，Claude 会尽力只用 raw 数据里的 url。**审核 PR 时重点**：把每条 brief 的 url 点开看看，确认真实存在。若发现编造：

- 扩大 `AI_KEYWORDS` / `RELEVANCE_KEYWORDS` 让 raw 池子更大
- 减少 brief 数量（5 条而不是 6 条）
- 检查是不是某天周末新闻太少导致 raw 太薄

### Q: Substack 数据来源单一怎么办？

**这是当前最大的结构性弱点**。`SUBSTACK_FEEDS` 现在只有 3 个稳定 feed（Lenny / Stratechery / Late Checkout）。如果某天三人都没发文，Growth Insight 会回到老问题（Claude 拿不到原料只能从 TC 中编造观点）。

- 短期可接受：3 人轮替发文频率够日常使用，过去 2 周观察实际命中率 > 90%
- 长期改进：扩 `SUBSTACK_FEEDS` 到 6-8 个稳定输出的 newsletter（Demand Curve / Reforge / How I AI / Every / 等等）。已知坑：很多 Substack publication 迁到 Beehiiv 后 RSS URL 改了，需要逐个验证

测试新 feed URL 的最小脚本：

```python
import feedparser
f = feedparser.parse("https://your-newsletter.com/feed")
print(len(f.entries), [e.get("title") for e in f.entries[:3]])
```

至少返回 5+ 条 entries 且最近 7 天内有更新才加进 `SUBSTACK_FEEDS`。

### Q: 跨源置信度规则真的有用吗？

有用。Prompt 里要求「同一事件被 TC + 量子位同时报道时，优先选」。实际效果：4/25 的 DeepSeek V4、4/26 的 Claude Connectors 都是因为这个规则才被选中（且 source 字段会标记『中外多源同步报道』）。

### Q: 中文 brief 配比是怎么控制的？

Prompt 里硬约束：『6 条至少 1 条来自量子位（中文圈）』。实际跑下来通常是 1-2 条，比例视当天量子位是否有大事件而定。如果某天觉得太美国向了，把约束改成『至少 2 条』即可。

### Q: 为什么不再用 Apify 抓 X？

2025-2026 年 X 持续加强反爬。`apidojo/tweet-scraper` 等主流 actor 在 free tier 上返回的全是 `{"noResults": true}` 占位（且即使没真推文也会被计入 free tier 额度）；付费层 $49/mo 也不可靠。Substack 替代后：(1) 每月省 $49；(2) 长文比 280 字推文 quotable 段落更多，Growth Insight 质量反而提升。详细复盘见 git log 里 2026-04-25 那次 prompt 改动 commit。

### Q: cron 时间为什么是 23:45 UTC？

主目标受众是中文 AI marketer，从北京通勤时段倒推：

- 23:45 UTC（pipeline 启动）
- ~23:48 UTC（draft 生成完，PR 开好）
- 23:48 UTC = **北京 07:48** — 早高峰阅读窗口正好

副作用：欧洲读者拿到的是『前一天午夜 0:45』、美国 PT 是『前一天下午 16:45』。AI marketer 的 EU 用户基数本来就小，US 读者读『昨日』也算合理 — 妥协可接受。

如果未来主受众变成北美，改成 `0 14 * * *`（14:00 UTC = PT 06:00）。

### Q: Daily Case 会重复吗？

`CASE_QUEUE` 目前 10 个公司，按日期 ordinal 取模 = 10 天一循环。重复必然发生。建议：

- 每 2 周人工补 2-3 家新公司到 [config.py](config.py)
- 长期可加一个『最近 14 天用过的公司』黑名单做去重，避免硬循环

### Q: 一次 PR 改不动 Claude 写的内容？

PR 是普通 git PR，所有标准编辑都能用：

- GitHub web UI 直接改 markdown（点文件右上的铅笔图标）
- 本地 `gh pr checkout <number>` 拉下来改 + push
- 改完后 `git push` 到 PR 分支即可，不需要重跑 pipeline

### Q: 突然某天 PR 没出现？

依次查：

1. [Actions tab](https://github.com/evie-jelabs/ai-marketer-news/actions) — workflow 是不是跑了？跑挂在哪一步？
2. 如果 "Run pipeline" 步骤失败：点开看日志，多半是 API key 失效（rotate 了忘记同步 GH secret）或某个数据源 5xx
3. 如果 "Open review PR" 失败：可能是仓库的 Actions PR 权限被 revert 了，重新跑一次 [setup 第 5 步](#5-打开-actions-创建-pr-的权限必做否则-workflow-跑通但开-pr-那一步失败)
4. 如果全跑过了但 PR 没开：检查 `content/drafts/` 是不是已经有 `YYYY-MM-DD.draft.md`，可能是 branch 已存在 + 内容相同所以 peter-evans/create-pull-request 跳过了

## 后续 roadmap

- [ ] 加 1-2 个稳定 Substack source 解 Growth Insight 单源风险（README 上面有 FAQ）
- [ ] Daily Case 模板分类（GTM / 产品 / 增长黑客 / 出海），让连续读者每天有新鲜感
- [ ] 邮件订阅入口（Substack / Buttondown / 自建）
- [ ] 读者反馈机制（每条 brief 下加 👍/👎 按钮，回流到 prompt 调优）
- [ ] 双语切换（中英对照）
