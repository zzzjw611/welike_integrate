# AI Marketer News — 写手操作手册

> 给加入 `welike_integrate` 仓库的内容编辑用。**不需要懂代码、不需要装任何工具**，全程在 GitHub 网页（或 GitHub 移动 App）完成。

---

## 你能做什么

每天北京时间 07:45 左右，系统会自动从 TechCrunch / 量子位 / Product Hunt / Substack 抓数据，让 Claude AI 生成当天的日报草稿，并在 GitHub 上自动开一个 **Draft Pull Request**。你的工作是：

1. 打开 PR → review 草稿
2. 改动哪里不顺眼（错字、tone、数据有误）
3. 改完后把草稿"发布"成正式期刊
4. Merge PR → 网站和 Telegram bot 立刻能看到新一期

整个过程 **5-15 分钟**，看你想改多少。

---

## 第一次：接受邀请

1. 你的邮箱会收到一封邮件，标题类似：
   > **[GitHub] @zzzjw611 has invited you to collaborate on welike_integrate**
2. 点邮件里的 **View invitation**
3. 跳到 GitHub 后点绿色按钮 **Accept invitation**
4. 你会被带到仓库主页 `https://github.com/zzzjw611/welike_integrate`

> ⚠️ 邀请 7 天过期，请尽快接受。如果过期了，找 owner 重发。

接受后，你拥有这个仓库的 **Write 权限**——可以编辑文件、开 PR、review，但**不能直接 push 到 master**（master 被保护了）。

---

## 仓库速览（你只需要看这些）

```
welike_integrate/
├── web/
│   └── content/                        ← ⭐ 你的工作区
│       ├── 2026-04-21.md              ← 已发布的期刊
│       ├── 2026-04-22.md
│       ├── ...
│       ├── 2026-05-07.md
│       └── drafts/                     ← 草稿（待 review）
│           └── 2026-05-08.draft.md     ← 今天的草稿
└── pipeline/
    └── prompts/
        └── draft.md                    ← AI 生成日报的"教学规则"
```

**你 99% 的时间只动 `web/content/`**。其它路径基本别碰，除非你知道自己在做什么。

---

## 场景 A：审今天自动生成的 Draft PR（**最常见**）

### Step 1：打开 PR 列表

每天检查：
> https://github.com/zzzjw611/welike_integrate/pulls

会看到一个标题类似：
```
[Draft] AI Marketer News · 2026-05-08
```

点进去。

### Step 2：阅读草稿内容

进入 PR 后，点顶部的 **Files changed** 标签。会看到一个文件 `web/content/drafts/2026-05-08.draft.md`，右侧显示**渲染好的内容**：

- ✨ Highlight Summary（4 条 bullet）
- 📋 Daily Brief（6 条新闻 + So What）
- 💡 Growth Insight（2 条）
- 🚀 Launch Radar（2 条产品）
- 📊 Daily Case（700-900 字案例）

> 想看 markdown 原码：点文件右上角 `<>` 图标切换 Source diff / Rendered。

### Step 3：检查这些点（基础质量门槛）

逐一对照：

- [ ] **6 条 brief 都写了"So What for Marketer"**（每条最后那句"对营销人意味着什么"）
- [ ] **每条 URL 都点开能正常打开**（重点查 brief / launch / growth_insights 的 URL）
  - 点 markdown 里的链接 → 浏览器新标签打开 → 没 404 / 没 paywall block
  - 全部需要点的链接：约 10-12 条
- [ ] **至少 1 条 brief 来自量子位**（中文 AI 圈，URL 含 `qbitai.com`）
- [ ] **没有"AI 味"或"导师腔"**：
  - ❌ "你应该..." "我建议..." "三个步骤..."
  - ✅ "真正的信号是..." "值得关注的是..." "数据告诉我们..."
- [ ] **Daily Case 长度 700-900 字**（在 frontmatter 之后那段 markdown body）
- [ ] **Highlight 4 条 bullet 各 ≤22 字**（不能太长）

发现问题继续往下看怎么改。

### Step 4：在线编辑

#### 改一两个字（最简单）

1. 在 PR 的 Files changed 里看到那行有问题的代码
2. 点行号旁的 ➕ 图标
3. 输入框里点 **Insert a suggestion** 按钮（Logo 像 ±）
4. 改成你想要的版本
5. 点 **Add a single comment** 或 **Start a review**

提交建议后，发起人（自动机器人 + owner）能一键 apply 你的建议。

#### 改一段 / 大幅重写

1. PR 顶部点蓝色文字 **drafts/2026-05-08**（这是分支名，会跳到分支视图）
2. 浏览到 `web/content/drafts/2026-05-08.draft.md`
3. 点右上角铅笔图标 ✏️
4. 在编辑器里直接改 markdown
5. 滚到页面底部 **Commit changes** 区块：
   - 第一个输入框：写 commit 标题，比如 `edit: tighten daily brief #3`
   - 选 **Commit directly to the `drafts/2026-05-08` branch**（这个选项会自动出现，因为你在分支视图里）
6. 点绿色按钮 **Commit changes**

回到 PR 页面，你的改动已经体现在 Files changed 里。

### Step 5：发布草稿（**关键步骤**）

草稿改完 OK 了，要把它"提升"成正式期刊。在 GitHub 网页上做以下两步：

#### 5.1 把 draft.md 改名为正式文件

在分支 `drafts/2026-05-08` 视图里：

1. 浏览到 `web/content/drafts/2026-05-08.draft.md`
2. 点右上角铅笔 ✏️ → 进入编辑器
3. 编辑器**最上面**有个文件名输入框，原本是：
   ```
   web/content/drafts/2026-05-08.draft.md
   ```
   把它**改成**：
   ```
   web/content/2026-05-08.md
   ```
   注意：删掉 `drafts/` 这一层目录，删掉 `.draft` 这个后缀。
4. **不要动文件内容**，只改路径
5. 滚到底 → **Commit changes**：
   - Commit message: `publish 2026-05-08`
   - 选 **Commit directly to the `drafts/2026-05-08` branch**
6. Commit

> 这一步本质是用"重命名 + 移动文件夹"代替了原来的命令行 `mv` 操作。GitHub 自动识别为"删了旧路径文件 + 创建了新路径文件"，merge 后效果就是发布。

#### 5.2 回 PR Merge

回到 PR 页面（`Pull requests` → 那个 `[Draft] AI Marketer News · 2026-05-08`）：

1. 滚到 PR 底部
2. 看到绿色按钮 **Merge pull request** —— 如果按钮是灰色的写着"Required review"，先 ping owner 让他/她 approve
3. 点 **Merge pull request** → **Confirm merge**
4. PR 状态变成紫色 ✅ Merged

### Step 6：等 1-2 分钟，验收

打开 https://welike-integrate.vercel.app/tools/news

主页应该显示当天的新一期。点几个 brief 的链接验证还能打开。

→ 同时 Telegram 里发 `/start` → 点 📰 AI News → 点 📋 Daily Brief，bot 应该返回最新的 brief 内容。

**你的工作完成 ✅**

---

## 场景 B：修改已发布的旧期刊（错字、链接坏了）

比如发现 `2026-05-07.md` 里有错字。

### Step 1：找到文件

打开：
> https://github.com/zzzjw611/welike_integrate/blob/master/web/content/2026-05-07.md

### Step 2：编辑

1. 点右上角铅笔 ✏️
2. 直接改 markdown
3. 滚到底 → **Propose changes**：
   - Commit message: `fix: typo in 2026-05-07 brief #4`
   - 选 **Create a new branch for this commit and start a pull request**（**默认就这个**——因为 master 被保护了，不让你直接 commit）
   - 输入新分支名：`fix/2026-05-07-typo`（GitHub 会建议一个）
4. 点 **Propose changes** → 跳到 PR 创建页 → 点 **Create pull request**

### Step 3：等 owner 审

PR 自动指派 owner 做 reviewer（CODEOWNERS 配置好了的话）。Owner approve + merge → 几分钟后线上修复。

---

## Markdown 文件结构

每个 issue 文件长这样：

```markdown
---
date: 2026-05-08
issueNumber: 19
editor: JE Labs
highlight:
  bullets:
    - "Daily Brief · ..."   # 4 条，每条 ≤22 字
    - "Growth Insight · ..."
    - "Launch Radar · ..."
    - "Daily Case · ..."
briefs:
  - title: "标题"
    summary: "60-100 字摘要"
    source: "TechCrunch"        # 或 "量子位" / "Stratechery" 等
    url: "https://techcrunch.com/2026/05/08/..."
    soWhat: "对营销人意味着什么——120-150 字"
  - title: "..."
    # ... 总共 6 条
growth_insights:
  - author: "Lenny Rachitsky"
    handle: "@lennysan"
    platform: "Lenny's Newsletter"
    quote: "原文摘录 80-150 字"
    url: "https://www.lennysnewsletter.com/p/..."
    commentary: "我们的解读 100-150 字"
  - # ... 共 2 条
launches:
  - product: "产品名"
    company: "公司名"
    category: "AI / Marketing / etc"
    tag: "Big AI"               # 或 "Funded" / "Rising"
    summary: "60-100 字"
    url: "https://..."
    funding: "$2B"             # 可选
    metric: "1.2M users"        # 可选
  - # ... 共 2 条
daily_case:
  company: "HeyGen"
  title: "案例标题（约 50 字）"
  deck: "导语，2-3 句话"
  metrics:
    - "$100M ARR"
    - "0 paid marketing spend"
---

## Daily Case 正文（700-900 字）

第一段：背景、为什么这个公司值得拆。

### 第一个洞察

具体数据 + 反直觉观察。避免"第一层"、"第二层"这种结构化表达。

### 第二个洞察

继续。

### 第三个洞察

收尾，可以稍微给营销人的可迁移借鉴。
```

### YAML 编辑要小心的地方

- **缩进必须用空格不能用 Tab**——错一个空格整个 frontmatter 就崩
- **字符串里有引号** 用 `"\"已转义\""` 或者直接用单引号 `'里面有"双引号"也行'`
- **冒号后面必须有一个空格**：`title: "Hello"` ✅，`title:"Hello"` ❌
- **YAML 区是 `---` 包裹**——上下两行 `---` 不能动
- **改 URL 之前先点 URL 自己测一下**——别把对的改成错的

如果你不熟 YAML，**先在 [yamllint.com](https://www.yamllint.com/) 粘贴检查一遍**再 commit，能省很多麻烦。

---

## 你能改 vs 不能改

### ✅ 你应该改的

| 路径 | 改什么 |
|---|---|
| `web/content/*.md` | 已发布期刊的错字、链接、措辞 |
| `web/content/drafts/*.md` | 待 review 的草稿 |

### ⚠️ 改之前先和 owner 说一声的

| 路径 | 影响 |
|---|---|
| `pipeline/prompts/draft.md` | 改 AI 写日报的规则，影响**未来所有日报**——重要！ |
| `pipeline/config.py` | 改数据源 / 关键词 / 案例公司轮换队列 |

### ❌ 别动

| 路径 | 原因 |
|---|---|
| `pipeline/draft/generate.py` | Claude 调用代码 |
| `pipeline/fetch/*.py` | 数据抓取代码 |
| `web/app/**` | 网站前端 |
| `bot/` | Telegram bot 代码 |
| `.github/workflows/*.yml` | CI/CD 配置 |
| `package.json` `tsconfig.json` 等 | 工程配置 |
| 任何 `.env*` 文件 | 密钥配置 |

---

## 移动办公

GitHub iOS / Android App 完全够用：

- **App Store / Google Play** 搜 "GitHub" 安装
- 用 GitHub 账号登录
- 通知里能看到 PR 提及、review 请求
- 直接在 App 里编辑 markdown、提建议、approve、merge
- 只有"重命名文件"那步在 App 里有点别扭，建议**那一步等回电脑再做**

> 出差 / 在路上：**review + 评论可以**；**publish (改文件名) 建议留到电脑前完成**。

---

## 常见问题 FAQ

### Q1：我点 Merge 按钮是灰的，写着 "1 review required"

→ 你不能 review 自己的 PR。让另一个 collaborator（通常是 owner）点 PR 上方的 **Files changed** → 右上角 **Review changes** → **Approve** → Submit。然后 Merge 按钮就绿了。

### Q2：我改了之后 Vercel 部署失败

可能性：
- YAML 缩进错了 → 去 yamllint.com 检查
- markdown 格式错（比如忘了空一行）
- 用错了 frontmatter 字段名

owner 会在 Vercel 日志里看到具体错误。Slack/微信告诉 owner 让 ta 帮看。

或者你直接 **Revert** 那个 PR：去 PR 页面点 **Revert** → 一键撤销。

### Q3：草稿 PR 一直没出现

可能原因：
- GitHub Actions 跑挂了——去 https://github.com/zzzjw611/welike_integrate/actions 看红色 ❌ 那条
- 数据源全空（4 个源都返回 0）—— 通常是 PH_TOKEN 过期 / 网络抖动
- ANTHROPIC_API_KEY 用完 / 失效

汇报给 owner，附上 failed run 的链接。

### Q4：URL 全部 404 / 大部分 404

→ 这意味着上游数据源给了过期 URL，或者 Claude 编造了 URL。**不要 publish**，先 ping owner——可能要重生这一期。

### Q5：我手滑 push 了不该 push 的 commit

不可能——master 被保护了，你手滑也 push 不进去。最坏情况是 PR 上多了一个错误 commit，再 commit 一次修正即可。

### Q6：我接受邀请后看不到 web/content 文件夹

刷新一下浏览器，或者直接打开：
> https://github.com/zzzjw611/welike_integrate/tree/master/web/content

---

## 有问题问谁

- **内容判断不准**（这条新闻该不该选 / so what 写得对不对）→ 找 owner
- **GitHub 操作卡住**（找不到按钮、commit 失败）→ 截图发 owner
- **YAML / markdown 报错** → 去 yamllint.com 验证 → 还不行找 owner
- **网站没显示 / 显示老内容** → owner 看 Vercel
- **Telegram bot 不响应** → owner 看 Telegram webhook 状态

---

## 速查卡（把这条钉住）

```
日常审 PR：    /pulls    →  最新的 [Draft] AI Marketer News · 日期
快速看内容：   Files changed 标签
快速改：      点行号 ➕ → suggestion
深度改：      分支视图 → 文件 → 铅笔
发布：        改文件名（drafts/X.draft.md → X.md）→ Commit → Merge PR
看线上：      welike-integrate.vercel.app/tools/news
看 bot：      Telegram → @WeLike_Alerts_bot → /start
```

---

## 最后

每周日如果有时间，扫一眼 https://github.com/zzzjw611/welike_integrate/pulls 看有没有忘 merge 的草稿 PR——避免周一打开发现没新内容。

任何不确定的事**先停手再问**——markdown 里写错总比 commit 错要好修。
