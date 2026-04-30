"use client";
import Card from "@/components/kol-pricer/Card";
import { useLang } from "@/lib/use-lang";

export default function HowPage() {
  const lang = useLang();

  return (
    <div>
      <p className="text-base text-surface-400">
        {lang === 'zh'
          ? 'V2 定价模型 — 结合实时 X 数据与 AI 分析、时间衰减加权展示量和稀缺因子，实现透明的 KOL 推文定价。'
          : 'V2 pricing model — combines real X data with AI analysis, time-decay weighted impressions, and a scarcity factor for transparent KOL tweet pricing.'}
      </p>

      {/* Pipeline */}
      <section className="mt-10 space-y-6">
        <h2 className="text-2xl font-semibold text-white">
          {lang === 'zh' ? '分析流程' : 'Analysis Pipeline'}
        </h2>
        <div className="space-y-4">
          <StepCard
            step={1}
            title={lang === 'zh' ? '获取用户资料' : 'Fetch User Profile'}
            desc={lang === 'zh' ? '调用 X API v2 获取 KOL 资料：粉丝数、关注数、列表数、简介和账号年龄。' : "We call the X API v2 to get the KOL's profile: followers, following, listed_count, bio, and account age."}
          />
          <StepCard
            step={2}
            title={lang === 'zh' ? '获取最近 30 条推文' : 'Fetch 30 Recent Tweets'}
            desc={lang === 'zh' ? '拉取最近 30 条原创推文（排除转发和回复），包含完整互动指标：展示量、点赞、回复、转发、引用、书签和实体。' : "We pull the last 30 original tweets (excluding retweets and replies) with full engagement metrics: impressions, likes, replies, retweets, quotes, bookmarks, and entities."}
          />
          <StepCard
            step={3}
            title={lang === 'zh' ? '裁剪最高/最低 3 条' : 'Trim Top/Bottom 3'}
            desc={lang === 'zh' ? '移除展示量最高的 3 条和最低的 3 条推文，消除极端异常值，保留 24 条推文。' : "We remove the 3 tweets with the highest impressions and the 3 with the lowest. This eliminates extreme outliers, leaving 24 tweets."}
          />
          <StepCard
            step={4}
            title={lang === 'zh' ? 'IQR 异常检测' : 'IQR Anomaly Detection'}
            desc={lang === 'zh' ? '对剩余推文应用 IQR 1.5 倍过滤，检测并移除统计异常的展示量（如购买互动）。' : "We apply IQR 1.5x filtering on the remaining tweets to detect and remove statistically anomalous impressions (e.g., bought engagement)."}
          />
          <StepCard
            step={5}
            title={lang === 'zh' ? 'Claude AI 分析' : 'Claude AI Analysis'}
            desc={lang === 'zh' ? 'Claude AI 分析简介和推文，确定：领域 + 子领域（10 个子类）、可信度评分（0-100）、相关性评分（0-100）和身份标签。' : "Claude AI analyzes the bio and tweets to determine: Domain + SubDomain (10 subcategories), Credibility score (0-100), Relevance score (0-100), and Identity tag."}
          />
          <StepCard
            step={6}
            title={lang === 'zh' ? '四维评分' : '4-Dimension Scoring'}
            desc={lang === 'zh' ? '从 4 个加权维度计算综合总分：影响力深度（20%）、粉丝质量（40%）、内容稳定性（25%）和互动质量（15%）。' : "We calculate a composite Overall Score from 4 weighted dimensions: Influence Depth (20%), Follower Quality (40%), Content Stability (25%), and Engagement Quality (15%)."}
          />
          <StepCard
            step={7}
            title={lang === 'zh' ? 'V2 定价' : 'V2 Pricing'}
            desc={lang === 'zh' ? 'CPM = $5 + (评分/100) × $55（范围 $5~$60）。价格 = CPM × (加权展示量/1000) × 领域 × 可信度 × 相关性 × 身份 × 稀缺性。范围 ±20%。' : "CPM = $5 + (Score/100) × $55 (range $5~$60). Price = CPM × (WeightedImp/1000) × Domain × Credibility × Relevance × Identity × Scarcity. Range is ±20%."}
          />
        </div>
      </section>

      {/* Formula */}
      <section className="mt-12 space-y-6">
        <h2 className="text-2xl font-semibold text-white">
          {lang === 'zh' ? 'V2 定价公式' : 'V2 Pricing Formula'}
        </h2>
        <Card>
          <div className="space-y-4 font-mono text-sm">
            <FormulaLine
              label={lang === 'zh' ? '综合评分' : 'Overall Score'}
              formula="ID×20% + FQ×40% + CS×25% + EQ×15%"
            />
            <FormulaLine
              label="CPM"
              formula="$5 + (Overall Score / 100) × $55"
            />
            <FormulaLine
              label={lang === 'zh' ? '加权展示量' : 'Weighted Impressions'}
              formula="Σ(impressions × time_weight) / Σ(time_weight)"
            />
            <FormulaLine
              label={lang === 'zh' ? '修正因子' : 'Modifiers'}
              formula="Domain × Credibility × Relevance × Identity × Scarcity"
            />
            <FormulaLine
              label={lang === 'zh' ? '价格' : 'Price'}
              formula="CPM × (Weighted Imp / 1000) × Modifiers"
            />
            <FormulaLine
              label={lang === 'zh' ? '范围' : 'Range'}
              formula="Price × 0.8  ~  Price × 1.2"
            />
          </div>
        </Card>
      </section>

      {/* Time Decay */}
      <section className="mt-12 space-y-6">
        <h2 className="text-2xl font-semibold text-white">
          {lang === 'zh' ? '时间衰减权重' : 'Time Decay Weights'}
        </h2>
        <p className="text-surface-400">
          {lang === 'zh' ? '近期推文权重更高 — 旧的爆款推文不会抬高今天的触达估算。' : "Recent tweets are weighted more heavily — older viral tweets don't inflate today's reach estimate."}
        </p>
        <DimensionCard
          title={lang === 'zh' ? '展示量时间衰减' : 'Impression Time Decay'}
          rows={[
            [lang === 'zh' ? '≤ 7 天前' : "≤ 7 days ago", "1.0x"],
            [lang === 'zh' ? '8 – 14 天前' : "8 – 14 days ago", "0.8x"],
            [lang === 'zh' ? '15 – 30 天前' : "15 – 30 days ago", "0.6x"],
            [lang === 'zh' ? '> 30 天前' : "> 30 days ago", "0.4x"],
          ]}
        />
      </section>

      {/* Weighted Engagement */}
      <section className="mt-12 space-y-6">
        <h2 className="text-2xl font-semibold text-white">
          {lang === 'zh' ? '加权互动' : 'Weighted Engagement'}
        </h2>
        <p className="text-surface-400">
          {lang === 'zh' ? '不同类型的互动具有不同的传播价值。用于粉丝质量（ER）和互动质量评分。' : 'Different interaction types carry different transmission value. Used for Follower Quality (ER) and Engagement Quality scoring.'}
        </p>
        <DimensionCard
          title={lang === 'zh' ? '互动价值权重' : 'Engagement Value Weights'}
          rows={[
            [lang === 'zh' ? '引用 (×4)' : "Quote (×4)", lang === 'zh' ? '最高 — 带评论，最大传播' : "Highest — carries a comment, max spread"],
            [lang === 'zh' ? '回复 (×3)' : "Reply (×3)", lang === 'zh' ? '真实讨论信号' : "Real discussion signal"],
            [lang === 'zh' ? '转发 (×2)' : "Retweet (×2)", lang === 'zh' ? '二级触达' : "Second-degree reach"],
            [lang === 'zh' ? '书签 (×2)' : "Bookmark (×2)", lang === 'zh' ? '长尾价值' : "Long-tail value"],
            [lang === 'zh' ? '点赞 (×1)' : "Like (×1)", lang === 'zh' ? '基准' : "Baseline"],
          ]}
        />
      </section>

      {/* Scoring Dimensions */}
      <section className="mt-12 space-y-6">
        <h2 className="text-2xl font-semibold text-white">
          {lang === 'zh' ? '四维评分' : '4 Scoring Dimensions'}
        </h2>

        <Card>
          <h3 className="mb-2 font-semibold text-white">
            {lang === 'zh' ? '1. 影响力深度（20%）' : '1. Influence Depth (20%)'}
          </h3>
          <p className="mb-4 text-sm leading-relaxed text-surface-400">
            {lang === 'zh' ? '由 2 个子项组成：' : 'Composite of 2 sub-items:'}{" "}
            <span className="text-surface-300">
              {lang === 'zh' ? '粉丝规模（60%）+ 列表比率（40%）' : 'Follower Scale (60%) + Listed Ratio (40%)'}
            </span>
          </p>
          <div className="space-y-4">
            <SubDimensionTable
              title={lang === 'zh' ? '子项 1 — 粉丝规模（60%）' : 'Sub-item 1 — Follower Scale (60%)'}
              rows={[
                ["> 100K", "100"],
                ["50K – 100K", "80"],
                ["20K – 50K", "60"],
                ["10K – 20K", "40"],
                ["< 10K", "20"],
              ]}
            />
            <SubDimensionTable
              title={lang === 'zh' ? '子项 2 — 列表比率（40%）— listed_count / followers × 1000' : 'Sub-item 2 — Listed Ratio (40%) — listed_count / followers × 1000'}
              rows={[
                ["> 5", "100"],
                ["3 – 5", "75"],
                ["1 – 3", "50"],
                ["0.5 – 1", "25"],
                ["< 0.5", "10"],
              ]}
            />
          </div>
        </Card>

        <DimensionCard
          title={lang === 'zh' ? '2. 粉丝质量 — 加权互动率%（40%）' : '2. Follower Quality — Weighted ER% (40%)'}
          description={lang === 'zh' ? 'ER = 平均加权互动 / 粉丝数 × 100%。加权互动 = 点赞×1 + 回复×3 + 转发×2 + 引用×4 + 书签×2。' : "ER = Average Weighted Engagement / Followers × 100%. Weighted engagement = likes×1 + replies×3 + retweets×2 + quotes×4 + bookmarks×2."}
          rows={[
            ["> 2%", "100"],
            ["1% – 2%", "75"],
            ["0.5% – 1%", "50"],
            ["0.3% – 0.5%", "38"],
            ["0.1% – 0.3%", "28"],
            ["0.05% – 0.1%", "20"],
            ["< 0.05%", "10"],
          ]}
        />

        <DimensionCard
          title={lang === 'zh' ? '3. 内容稳定性 — 综合变异系数（25%）' : '3. Content Stability — Combined CV (25%)'}
          description={lang === 'zh' ? '综合 CV = 0.4 × 发布间隔 CV + 0.6 × 展示量 CV。低 CV = 稳定的输出和可预测的触达。' : "Combined CV = 0.4 × posting interval CV + 0.6 × impression CV. Low CV = consistent output and predictable reach."}
          rows={[
            ["< 0.3", "100"],
            ["0.3 – 0.5", "75"],
            ["0.5 – 0.8", "50"],
            ["0.8 – 1.2", "30"],
            ["> 1.2", "10"],
          ]}
        />

        <DimensionCard
          title={lang === 'zh' ? '4. 互动质量 — 高质量互动比率（15%）' : '4. Engagement Quality — HQ Interaction Ratio (15%)'}
          description={lang === 'zh' ? 'HQ 比率 =（回复 + 转发 + 引用 + 书签）/（所有互动）× 100%。高比率 = 真实讨论，而非被动点赞。' : "HQ ratio = (replies + retweets + quotes + bookmarks) / (all interactions) × 100%. High ratio = real discussion, not just passive likes."}
          rows={[
            ["> 30%", "100"],
            ["20% – 30%", "80"],
            ["10% – 20%", "60"],
            ["5% – 10%", "40"],
            ["< 5%", "20"],
          ]}
        />
      </section>

      {/* Domain Subcategories */}
      <section className="mt-12 space-y-6">
        <h2 className="text-2xl font-semibold text-white">
          {lang === 'zh' ? '领域因子（10 个子类）' : 'Domain Factor (10 Subcategories)'}
        </h2>
        <p className="text-surface-400">
          {lang === 'zh' ? 'Claude AI 识别主类别和子类别，应用相应的 CPM 溢价。' : 'Claude AI identifies both the main category and subcategory to apply the appropriate CPM premium.'}
        </p>
        <DimensionCard
          title={lang === 'zh' ? '领域 × 子领域 → 乘数（最高 1.30x）' : 'Domain × SubDomain → Multiplier (max 1.30x)'}
          rows={[
            [lang === 'zh' ? '加密 — DeFi / Layer1/L2 / 机构' : "Crypto — DeFi / Layer1/L2 / Institutional", "1.30x"],
            [lang === 'zh' ? '加密 — NFT / 游戏 / Memecoin' : "Crypto — NFT / Gaming / Memecoin", "1.20x"],
            [lang === 'zh' ? 'AI — LLM / 基础模型 / AI 基础设施' : "AI — LLM / Base Model / AI Infra", "1.30x"],
            [lang === 'zh' ? 'AI — 应用 / SaaS / 工具' : "AI — Application / SaaS / Tools", "1.20x"],
            [lang === 'zh' ? '金融 — 机构 / TradFi / 宏观' : "Finance — Institutional / TradFi / Macro", "1.30x"],
            [lang === 'zh' ? '金融 — 零售 / 个人理财' : "Finance — Retail / Personal Finance", "1.10x"],
            [lang === 'zh' ? '商业 — 创业 / SaaS / B2B' : "Business — Startup / SaaS / B2B", "1.20x"],
            [lang === 'zh' ? '科技 — 通用 / 开发者' : "Tech — General / Developer", "1.20x"],
            [lang === 'zh' ? '娱乐 — 生活方式 / 文化' : "Entertainment — Lifestyle / Culture", "1.00x"],
            [lang === 'zh' ? '其他' : "Other", "1.00x"],
          ]}
        />
      </section>

      {/* Other Modifiers */}
      <section className="mt-12 space-y-6 pb-12">
        <h2 className="text-2xl font-semibold text-white">
          {lang === 'zh' ? '其他修正因子' : 'Other Modifiers'}
        </h2>

        <DimensionCard
          title={lang === 'zh' ? '可信度（AI 评估，最高 1.10x）' : 'Credibility (AI-evaluated, max 1.10x)'}
          description={lang === 'zh' ? 'Claude AI 评估账号真实性：粉丝互动比、发布模式、内容原创性、操纵迹象。' : "Claude AI evaluates account authenticity: follower-to-engagement ratio, posting patterns, content originality, signs of manipulation."}
          rows={[
            ["85 – 100", "1.10x"],
            ["70 – 84", "1.00x"],
            ["55 – 69", "0.75x"],
            ["40 – 54", "0.50x"],
            ["< 40", "0.25x"],
          ]}
        />

        <DimensionCard
          title={lang === 'zh' ? '相关性（AI 评估，最高 1.10x）' : 'Relevance (AI-evaluated, max 1.10x)'}
          description={lang === 'zh' ? 'Claude AI 判断每条推文与账号领域的相关性。以相关推文 / 总推文衡量。' : "Claude AI judges each tweet's relevance to the account's domain. Measured as relevant tweets / total tweets."}
          rows={[
            ["85 – 100", "1.10x"],
            ["70 – 84", "1.00x"],
            ["55 – 69", "0.75x"],
            ["40 – 54", "0.55x"],
            ["< 40", "0.30x"],
          ]}
        />

        <DimensionCard
          title={lang === 'zh' ? '身份（AI 评估）' : 'Identity (AI-evaluated)'}
          description={lang === 'zh' ? 'Builder 账号具有更高的信任度和转化价值。' : "Builder accounts carry higher trust and conversion value."}
          rows={[
            [lang === 'zh' ? '构建者' : "Builder", "1.30x"],
            ["KOL", "1.10x"],
            [lang === 'zh' ? '内容创作者' : "Content Creator", "1.00x"],
          ]}
        />

        <DimensionCard
          title={lang === 'zh' ? '稀缺因子（广告比率，近 30 天）' : 'Scarcity Factor (Ad Ratio, near 30 days)'}
          description={lang === 'zh' ? '很少接受赞助的账号享有溢价。过度商业化的账号获得折扣。' : "Accounts that rarely accept sponsorships command a premium. Accounts that over-commercialize receive a discount."}
          rows={[
            [lang === 'zh' ? '< 5% 赞助推文' : "< 5% sponsored tweets", lang === 'zh' ? '1.20x（非常稀缺）' : "1.20x (very scarce)"],
            ["5% – 15%", "1.10x"],
            ["15% – 30%", lang === 'zh' ? '1.00x（基准）' : "1.00x (baseline)"],
            ["30% – 50%", "0.85x"],
            [lang === 'zh' ? '> 50%' : "> 50%", lang === 'zh' ? '0.70x（过度商业化）' : "0.70x (over-commercialized)"],
          ]}
        />
      </section>
    </div>
  );
}

function StepCard({
  step,
  title,
  desc,
}: {
  step: number;
  title: string;
  desc: string;
}) {
  return (
    <Card className="flex gap-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 font-mono text-sm font-bold text-brand-500">
        {step}
      </div>
      <div>
        <h3 className="font-semibold text-white">{title}</h3>
        <p className="mt-1 text-sm text-surface-400">{desc}</p>
      </div>
    </Card>
  );
}

function DimensionCard({
  title,
  description,
  rows,
}: {
  title: string;
  description?: string;
  rows: string[][];
}) {
  return (
    <Card>
      <h3 className="mb-2 font-semibold text-white">{title}</h3>
      {description && (
        <p className="mb-4 text-sm leading-relaxed text-surface-400">
          {description}
        </p>
      )}
      <div className="space-y-1">
        {rows.map(([range, score]) => (
          <div
            key={range}
            className="flex items-center justify-between rounded-lg px-3 py-1.5 font-mono text-sm odd:bg-surface-800/30"
          >
            <span className="text-surface-400">{range}</span>
            <span className="text-white">{score}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function SubDimensionTable({
  title,
  rows,
}: {
  title: string;
  rows: string[][];
}) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium text-surface-500">{title}</p>
      <div className="space-y-1">
        {rows.map(([range, score]) => (
          <div
            key={range}
            className="flex items-center justify-between rounded-md px-3 py-1 font-mono text-xs odd:bg-surface-800/20"
          >
            <span className="text-surface-500">{range}</span>
            <span className="text-surface-300">{score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FormulaLine({
  label,
  formula,
}: {
  label: string;
  formula: string;
}) {
  return (
    <div className="rounded-lg bg-surface-800/30 px-4 py-3">
      <span className="text-brand-500">{label}</span>
      <span className="text-surface-500"> = </span>
      <span className="text-surface-300">{formula}</span>
    </div>
  );
}
