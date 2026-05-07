# OPERATIONS — AI Marketer News

> 日常运维手册。面向负责每日新闻生成管线的运营人员。

---

## 目录

- [1. 手动触发一次生成](#1-手动触发一次生成)
- [2. 修改 Prompt](#2-修改-prompt)
- [3. 查看日志与失败重跑](#3-查看日志与失败重跑)
- [4. API 成本估算](#4-api-成本估算)
- [5. 常见故障排查](#5-常见故障排查)

---

## 1. 手动触发一次生成

### 生产运行（写入 web/content/）

```bash
# 生成今天的新闻
ANTHROPIC_API_KEY=sk-ant-... node scripts/generate-news.mjs

# 生成指定日期
ANTHROPIC_API_KEY=sk-ant-... node scripts/generate-news.mjs 2026-05-07

# 严格模式（剔除 URL 不可达的条目）
ANTHROPIC_API_KEY=sk-ant-... node scripts/generate-news.mjs --strict
```

### 测试运行（dry-run，不写入生产目录）

```bash
# 测试今天的生成
ANTHROPIC_API_KEY=sk-ant-... node scripts/test-generate.mjs

# 测试指定日期
ANTHROPIC_API_KEY=sk-ant-... node scripts/test-generate.mjs 2026-05-07

# 跳过 URL 校验（更快）
ANTHROPIC_API_KEY=sk-ant-... node scripts/test-generate.mjs --no-url-check
```

测试输出保存到 `data/issues/_test_{date}_{timestamp}.json`，不会写入 `web/content/`。

### 通过 GitHub Actions 触发

1. 打开仓库 → Actions → **Generate AI News Daily**
2. 点击 **Run workflow**
3. 可选参数：
   - `date`：指定日期（YYYY-MM-DD），留空则生成当天
   - `strict_url_check`：启用严格 URL 校验

---

## 2. 修改 Prompt

Prompt 文件位置：**`prompt/01_news_generation_prompt.md`**

### 修改流程

1. 编辑该 markdown 文件
2. 修改 ` ```text ... ``` ` 块内的内容（这是实际发给 Claude 的 system prompt）
3. 下次运行 `node scripts/generate-news.mjs` 时自动生效，**无需重启任何服务**

### 常见修改场景

| 场景 | 修改位置 |
|------|----------|
| 调整新闻筛选标准 | PART 3 · Story Selection Rubric |
| 修改写作风格 | PART 4 · Voice & Style Guide |
| 调整输出结构（增减 section） | PART 5 · Structure + PART 6 · Output Format |
| 修改搜索策略 | PART 2 · Search Strategy |
| 添加反例（让 AI 避免某些写法） | PART 4 的 ❌ 示例 |

### 注意事项

- 只修改 ` ```text ... ``` ` 块内的内容，不要修改外面的 markdown 包装
- 修改 JSON schema（PART 6）后，需要同步更新 `scripts/generate-news.mjs` 中的输出写入逻辑
- 修改后建议跑一次 `node scripts/test-generate.mjs` 验证输出质量

---

## 3. 查看日志与失败重跑

### 日志位置

每次运行都会生成日志文件：

```
logs/
├── run_2026-05-07.log          # 成功/失败的运行日志
├── raw_failed_2026-05-07_*.txt # JSON 解析失败时的原始响应
└── cron.log                    # crontab 输出（如果使用本机调度）
```

### 日志内容

`run_{date}.log` 包含：

```
=== AI Marketer News Run Log ===
Date:           2026-05-07
Start:          2026-05-07T07:30:00.000Z
End:            2026-05-07T07:32:15.000Z
Elapsed:        135.0s

--- API Usage ---
Input tokens:   45000
Output tokens:  12000
Web searches:   6

--- URL Validation ---
Total URLs:     12
Reachable:      11
Unreachable:    1
Unreachable URLs:
  - https://example.com/broken-link

--- Issue Notes ---
Only 5 Daily Brief items today — slow news day.

--- Event Log ---
[2026-05-07T07:30:00.000Z] INFO: Starting generation for 2026-05-07...
[2026-05-07T07:30:00.000Z] OK: Prompt loaded (15234 chars)
...
```

### 失败重跑

**场景 A：JSON 解析失败**

1. 检查 `logs/raw_failed_{date}_{timestamp}.txt` 查看 Claude 返回的原始内容
2. 常见原因：Claude 返回了 markdown 而非纯 JSON，或 JSON 格式有误
3. 修复后重新运行：`node scripts/generate-news.mjs {date}`

**场景 B：API 调用失败**

1. 检查日志中的 HTTP 状态码
2. 常见原因：API key 过期、网络问题、速率限制
3. 修复后重新运行：`node scripts/generate-news.mjs {date}`

**场景 C：URL 校验失败（strict 模式）**

1. 检查日志中的 Unreachable URLs 列表
2. 确认 URL 是否真的失效（可能是临时网络问题）
3. 非 strict 模式下，条目会被标记 `url_unreachable: true` 但保留
4. 重新运行时不加 `--strict` 可跳过剔除

---

## 4. API 成本估算

### 单次运行消耗

| 项目 | 估算值 | 说明 |
|------|--------|------|
| Input tokens | ~40,000–50,000 | system prompt (~15K) + web_search 返回内容 |
| Output tokens | ~10,000–15,000 | 完整双语 JSON issue |
| Web search 调用 | 4–8 次 | 每次搜索返回 ~10 条结果 |
| 单次耗时 | 2–3 分钟 | 取决于搜索次数和响应速度 |

### 月度成本

基于 Claude Opus 4-7 定价（$15/M input tokens, $75/M output tokens）：

| 项目 | 每日 | 每月 (30天) |
|------|------|-------------|
| Input tokens | 45,000 | 1,350,000 |
| Output tokens | 12,000 | 360,000 |
| Input 成本 | $0.68 | $20.25 |
| Output 成本 | $0.90 | $27.00 |
| **合计** | **$1.58** | **~$47.25** |

> **注意：** 以上为 Opus 4-7 定价估算。实际成本可能因搜索返回内容量、输出长度、API 定价调整而浮动。建议每月初检查 Anthropic 账单。

### 节省建议

- 如果预算敏感，可将 model 切换为 `claude-sonnet-4-20250514`（约 1/3 价格）
- 设置 `max_tokens: 12000` 可略微降低 output 成本
- 通过环境变量 `CLAUDE_MODEL` 切换模型，无需修改代码

---

## 5. 常见故障排查

### 5.1 API 限流 (429 Too Many Requests)

**症状：** 日志显示 `Claude API error 429`

**原因：** 短时间内请求过多，触发了 Anthropic 的速率限制

**处理：**
- 等待 1 分钟后重试
- 检查是否有其他进程也在调用同一 API key
- 如果频繁触发，考虑升级 API 套餐

### 5.2 JSON 解析失败

**症状：** 日志显示 `JSON parse failed`，`logs/raw_failed_*.txt` 被创建

**原因：** Claude 返回的内容不是有效 JSON

**处理：**
1. 查看 `raw_failed_*.txt` 文件内容
2. 常见情况：Claude 在 JSON 前后加了 markdown 注释或说明文字
3. 如果频繁出现，考虑在 prompt 的 PART 6 中加强 "RETURN ONLY THIS JSON — NO PREAMBLE" 的措辞
4. 手动修复后重新运行

### 5.3 web_search 没触发

**症状：** 日志显示 `Web searches: 0`

**原因：** Claude 可能跳过了搜索步骤，直接凭记忆生成

**处理：**
- 检查 prompt 中 PART 1 的 "Use the web_search tool" 指令是否清晰
- 确认 API 调用时正确传入了 `tools` 参数
- 在 prompt 末尾加一句 "You MUST use web_search before writing any story"

### 5.4 输出内容太少（缺料）

**症状：** `issue_meta.notes` 非空，显示 "Only X items today"

**原因：** 当天新闻确实少，或搜索策略不够广

**处理：**
- 检查日志中的 web_search 次数，如果 <4 次说明搜索不够
- 在 prompt PART 2 中增加搜索 query 模式
- 考虑扩大时间窗口（从 24h 改为 36h）

### 5.5 URL 全部不可达

**症状：** 日志显示 `Reachable: 0, Unreachable: 12`

**原因：** 网络问题（服务器无法访问外网），或 URL 格式有误

**处理：**
- 检查服务器网络：`curl -I https://techcrunch.com`
- 如果使用 GitHub Actions，确认 runner 能访问外网
- 使用 `--no-url-check` 跳过校验临时运行

### 5.6 GitHub Actions 定时任务未触发

**症状：** 到了预定时间没有新 commit

**原因：** 常见于以下情况

**处理：**
- 确认仓库的 Actions 功能已启用（Settings → Actions → General）
- 检查 `.github/workflows/generate-news.yml` 的 cron 表达式
- GitHub Actions 的 scheduled workflow 可能有延迟（通常 5–15 分钟）
- 如果仓库处于 fork 或 archive 状态，定时任务不会运行

### 5.7 环境变量未设置

**症状：** 日志显示 `ANTHROPIC_API_KEY not set`

**处理：**
- 本地运行：确保 `ANTHROPIC_API_KEY` 已 export 或在 `.env` 文件中
- GitHub Actions：在 Settings → Secrets and variables → Actions 中设置 `ANTHROPIC_API_KEY`

---

## 附录：文件结构

```
WeLike-done/
├── prompt/
│   └── 01_news_generation_prompt.md   ← 编辑这里修改 prompt
├── scripts/
│   ├── generate-news.mjs              ← 核心生成脚本
│   ├── test-generate.mjs              ← 测试入口（dry-run）
│   └── crontab.example                ← 本机 crontab 配置
├── .github/workflows/
│   └── generate-news.yml              ← GitHub Actions 定时调度
├── data/issues/                       ← JSON 输出（含 _test_ 文件）
├── web/content/                       ← Markdown 输出（前端读取）
├── logs/                              ← 运行日志
│   ├── run_YYYY-MM-DD.log
│   └── raw_failed_*.txt
└── OPERATIONS.md                      ← 本文件
```
