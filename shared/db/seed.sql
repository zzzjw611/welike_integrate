-- Seed: PRD-conformant sample articles for local development
-- Section field mapping:
--   daily_brief:    title=headline, content=fact≤80ch, so_what=marketer insight≤60ch
--   growth_insight: title=author+platform, content=quote(blockquote), extra.context=背景, so_what=启发
--   launch_radar:   title=product+desc, content=what, extra.platform_data+positioning, so_what=takeaway
--   daily_case:     title=company+action, content=background, extra.breakdown, so_what=actions

INSERT INTO articles (
  date, section, order_in_section,
  title_en, title_zh,
  content_en, content_zh,
  so_what_en, so_what_zh,
  sources, extra, published_at
) VALUES

-- ── Daily Brief (6 items) ──────────────────────────────────────────────────

(CURRENT_DATE, 'daily_brief', 1,
 '🔵 [01] Anthropic releases Claude 4 Opus with 1M-token context window',
 '🔵 [01] Anthropic 发布 Claude 4 Opus，支持 100 万 token 上下文窗口',
 'Anthropic has released Claude 4 Opus with a 1M token context window and improved reasoning, now available to all API users at $15/MTok.',
 'Anthropic 正式发布 Claude 4 Opus，支持 100 万 token 上下文窗口，推理能力大幅提升，现已向所有 API 用户开放，定价 15 美元/百万 token。',
 'Long-context models unlock full-document analysis in one pass — useful for whitepaper-to-brief and RFP-response pipelines.',
 '长上下文模型支持单次处理完整文档，适用于将白皮书转化为简报或自动回复 RFP 的工作流。',
 '["https://anthropic.com/news"]', '{}', NOW()),

(CURRENT_DATE, 'daily_brief', 2,
 '🔵 [02] Google DeepMind launches Gemini 2.0 Flash Thinking',
 '🔵 [02] Google DeepMind 发布 Gemini 2.0 Flash Thinking 推理模型',
 'Google DeepMind releases Gemini 2.0 Flash Thinking, a reasoning model optimized for speed that outperforms o1-mini on math and coding benchmarks.',
 'Google DeepMind 发布 Gemini 2.0 Flash Thinking 推理模型，速度优化显著，在数学与编程基准测试中超越 o1-mini。',
 NULL, NULL,
 '["https://deepmind.google/technologies/gemini"]', '{}', NOW()),

(CURRENT_DATE, 'daily_brief', 3,
 '🔵 [03] ChatGPT reaches 400M weekly active users',
 '🔵 [03] ChatGPT 每周活跃用户突破 4 亿',
 'OpenAI CEO Sam Altman announced ChatGPT now has 400M weekly active users, doubling from 200M at the start of 2025.',
 'OpenAI CEO Sam Altman 宣布 ChatGPT 每周活跃用户数达 4 亿，较 2025 年初的 2 亿实现翻倍。',
 'At 400M WAU, AI chat is a mainstream consumer channel — treat it like search in your distribution strategy.',
 '4 亿周活意味着 AI 对话已成主流消费渠道，应将其与搜索引擎同等对待，纳入你的流量分发策略。',
 '["https://openai.com/blog"]', '{}', NOW()),

(CURRENT_DATE, 'daily_brief', 4,
 '🔵 [04] Perplexity closes $500M Series D at $9B valuation',
 '🔵 [04] Perplexity 完成 5 亿美元 D 轮融资，估值达 90 亿美元',
 'AI search startup Perplexity has closed a $500M Series D round valuing the company at $9B — a 3x increase from its 2024 valuation.',
 'AI 搜索初创公司 Perplexity 完成 5 亿美元 D 轮融资，估值达 90 亿美元，是其 2024 年估值的 3 倍。',
 NULL, NULL,
 '["https://techcrunch.com"]', '{}', NOW()),

(CURRENT_DATE, 'daily_brief', 5,
 '🔵 [05] Meta AI surpasses 500M monthly active users across its apps',
 '🔵 [05] Meta AI 助手全平台月活突破 5 亿',
 'Meta AI has surpassed 500M monthly active users across Facebook, Instagram, WhatsApp and Messenger, making it the largest AI assistant by reach.',
 'Meta AI 助手在 Facebook、Instagram、WhatsApp 和 Messenger 全平台月活突破 5 亿，成为覆盖范围最广的 AI 助手。',
 'Meta distribution advantage is social graph plus identity — watch how they monetize through ads and subscriptions.',
 'Meta 的分发优势在于社交关系图谱与身份认证，关注其如何通过广告和订阅将流量变现。',
 '["https://about.fb.com"]', '{}', NOW()),

(CURRENT_DATE, 'daily_brief', 6,
 '🔵 [06] Mistral launches Le Chat Enterprise with Microsoft 365 integration',
 '🔵 [06] Mistral 推出 Le Chat Enterprise，集成 Microsoft 365',
 'Mistral AI launches Le Chat Enterprise with custom knowledge bases, private deployments, and native Microsoft 365 integration for teams.',
 'Mistral AI 推出 Le Chat Enterprise 企业版，支持自定义知识库、私有化部署以及原生 Microsoft 365 集成。',
 NULL, NULL,
 '["https://mistral.ai/news"]', '{}', NOW()),

-- ── Growth Insight (1 item) ────────────────────────────────────────────────

(CURRENT_DATE, 'growth_insight', 1,
 '@lennysan on LinkedIn',
 '@lennysan on LinkedIn',
 'The companies that win at PLG are not the ones with the cleverest onboarding flows — they are the ones whose product solves a real problem so well that users become evangelists before the sales team ever calls them.',
 '赢得 PLG 竞争的公司，靠的不是最精妙的引导流程——而是把真实问题解决得足够好，让用户在销售团队打电话之前就已经成为布道者。',
 'Audit your onboarding: does every step reduce friction for the core use case? If a new user cannot describe why they would come back after 5 minutes, your onboarding has a problem. Fix the product before you fix the funnel.',
 '审查你的引导流程：每一步是否都在降低核心用例的摩擦？如果新用户在 5 分钟后无法说出明天再来的理由，你的引导流程就需要重做。先修产品，再优化漏斗。',
 '["https://linkedin.com/in/lennyrachitsky"]',
 '{"context_en": "Lenny Rachitsky published this after interviewing founders of 12 PLG-dominant companies including Figma, Notion, Miro, and Linear. Each company shared that word-of-mouth — not paid acquisition — drove their first 100K users.", "context_zh": "Lenny Rachitsky 在访谈了 Figma、Notion、Miro、Linear 等 12 家 PLG 主导公司的创始人后发表了这一观点。每家公司都表示，口碑传播——而非付费获客——驱动了他们前 10 万用户的增长。"}',
 NOW()),

-- ── Launch Radar (2 products) ─────────────────────────────────────────────

(CURRENT_DATE, 'launch_radar', 1,
 'Cursor 1.0 — AI-native IDE exits beta with multi-file editing and background agents',
 'Cursor 1.0 — AI 原生 IDE 正式发布，支持多文件编辑与后台 Agent',
 'Cursor ships 1.0 with shadow workspace for multi-file edits, background agents that run while you focus elsewhere, and SOC 2 Type II enterprise compliance.',
 'Cursor 发布 1.0 版本，推出支持多文件同步编辑的影子工作区、可在后台独立运行的 Agent，以及企业级 SOC 2 Type II 合规认证。',
 'Steal Cursor''s "inversion" framing: do not say your tool does X faster — say your product changes who does the work. Reframe from tool to collaborator. Test this in your next landing page hero copy.',
 '学习 Cursor 的"角色反转"策略：不要说你的工具做 X 更快——要说你的产品改变了谁在做这件事。将定位从工具升级为协作者。在你的下一个落地页主文案中测试这一框架。',
 '["https://cursor.com/blog/cursor-1-0", "https://producthunt.com"]',
 '{"platform_data": "Product Hunt #1 · 1,243 upvotes", "positioning_en": "Cursor positions itself not as VS Code with AI, but as an AI that happens to look like an editor. Every interaction assumes AI does the heavy lifting and the human reviews. This contrasts sharply with Copilot''s AI-as-autocomplete framing, moving the category from developer tool to developer productivity platform.", "positioning_zh": "Cursor 的定位不是加了 AI 的 VS Code，而是一款碰巧长得像编辑器的 AI。每个交互都建立在 AI 负责生成、人类负责审查的假设上。这与 Copilot 的 AI 即自动补全定位形成对比，将品类从开发者工具重新定义为开发者生产力平台。"}',
 NOW()),

(CURRENT_DATE, 'launch_radar', 2,
 'Perplexity Spaces — Collaborative AI research workspaces for teams',
 'Perplexity Spaces — 面向团队的协作 AI 研究工作台',
 'Perplexity launches Spaces, letting teams create shared AI knowledge bases with custom instructions, file uploads, and persistent conversation threads.',
 'Perplexity 推出 Spaces，允许团队创建带有自定义指令、文件上传和持久对话线程的共享 AI 知识库。',
 'If you have a B2C product with team collaboration potential: add a share-with-team CTA at the user success moment, and price team plans per workspace not per seat to reduce procurement friction.',
 '如果你的 B2C 产品有团队协作潜力：在用户成功时刻添加"分享给团队"的 CTA，并将团队计划定价为按工作台而非按人头，降低采购摩擦。',
 '["https://perplexity.ai", "https://techcrunch.com"]',
 '{"platform_data": "TechCrunch · Direct launch", "positioning_en": "Perplexity frames Spaces as a shared brain for your team — competing less with Notion or Confluence and more with the combination of internal wiki plus Google Drive plus email threads. The key message is speed: stop writing down what you know, start querying it. This enters enterprise B2B without needing to rebuild a document management system.", "positioning_zh": "Perplexity 将 Spaces 定位为团队的共享大脑——竞争对手不是 Notion 或 Confluence，而是内部 wiki 加 Google Drive 加邮件线程的组合信息层。核心信息是速度：不要再记录你知道的东西，开始直接查询它。这使其无需重建文档管理系统即可进入企业 B2B 市场。"}',
 NOW()),

-- ── Daily Case (1 case) ───────────────────────────────────────────────────

(CURRENT_DATE, 'daily_case', 1,
 'Perplexity — From 0 to 10M DAU in 18 months through SEO arbitrage and developer evangelism',
 'Perplexity — 通过 SEO 套利与开发者布道，18 个月从 0 增长至千万日活',
 'Launched January 2023, Perplexity AI hit 10M daily active users by mid-2024 with under 50 employees and zero traditional marketing spend. Key metrics: 500M queries per month, $73M Series B at $520M valuation (April 2024), strong NPS among technical users.',
 'Perplexity AI 于 2023 年 1 月上线，到 2024 年中已达到千万日活，全公司不足 50 人，未投入传统营销预算。核心数据：每月 5 亿次查询，2024 年 4 月以 5.2 亿美元估值完成 7300 万美元 B 轮融资，技术用户 NPS 极高。',
 '1. Audit your programmatic SEO potential: do you have data that could generate 10K+ high-quality, low-competition answer pages? This is an underused channel for AI products.\n2. Launch a developer tier before your sales motion: even a free API with rate limits turns builders into evangelists. Calculate CAC via developer channel versus paid.\n3. Find your answer format moment: what unique way does your product present information that is better than existing tools? Make that your PLG hook.\n4. Map your partnership distribution options: which companies already have your target users? One distribution deal can replace 12 months of paid acquisition.',
 '1. 评估 SEO 程序化生产潜力：你是否拥有可以生成 1 万个以上高质量、低竞争答案页面的数据？这是 AI 产品中利用率偏低的增长渠道。\n2. 在销售驱动之前先推出开发者版：即使是有限速的免费 API 也能将开发者转变为布道者。对比开发者渠道与付费渠道的 CAC。\n3. 找到你的"答案格式"时刻：你的产品有什么独特的信息呈现方式，真正优于现有工具？把它设计成你的产品增长钩子。\n4. 梳理合作分发选项：哪些公司已经拥有你的目标用户？一份分发合作协议可能抵得上 12 个月的付费获客。',
 '["https://perplexity.ai", "https://techcrunch.com", "https://bloomberg.com"]',
 '{"breakdown_en": "1. SEO arbitrage: Perplexity identified that AI-powered answer pages rank well for long-tail queries where traditional search struggles. They generated thousands of answer pages targeting specific question patterns, capturing search traffic without a content team.\n\n2. Developer-first distribution: The free API tier turned developers into distributors. Builders embedded Perplexity into 500+ tools, each bringing a new user segment. API distribution is zero-CAC acquisition at scale.\n\n3. Aggressive answer format iteration: Unlike Google, Perplexity showed citations inline and let users drill down. This built trust with power users — researchers, students, journalists — who became vocal advocates.\n\n4. Partnership as growth: The SoftBank distribution deal brought Perplexity to 100M+ potential users in Japan overnight. One enterprise partnership can 10x your addressable market.\n\n5. Friction-first onboarding: No account required for the first query. Radical simplicity meant viral sharing via screenshot was frictionless.", "breakdown_zh": "1. SEO 套利：Perplexity 发现 AI 驱动的答案页面在长尾查询中排名优异，而传统搜索引擎在此类查询上表现较弱。他们无需内容团队，就生成了数千个针对特定问题模式的答案页面，持续捕获搜索流量。\n\n2. 开发者优先分发：免费 API 将开发者变成分发渠道。超过 500 个工具内嵌了 Perplexity，每个工具带来新的用户群体。API 分发是规模化的零 CAC 获客。\n\n3. 持续迭代答案格式：Perplexity 将引用来源内联展示并支持深入追问，在研究人员、学生和记者等高价值用户中建立了信任，促成口碑传播。\n\n4. 合作即增长：与软银的分发合作协议让 Perplexity 一夜之间覆盖日本逾 1 亿潜在用户。一份企业合作协议可以让目标市场扩大 10 倍。\n\n5. 摩擦优先引导：第一次查询无需注册账号，极简体验使截图分享成为自然而然的病毒传播行为。"}',
 NOW());
