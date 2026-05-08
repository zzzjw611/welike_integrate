/**
 * Anthropic SDK singleton + structured-output helper for Social Listening.
 *
 * The Python source uses `client.messages.parse(... output_format=Pydantic)`.
 * In TypeScript we get the same guarantee via the SDK's tool_use mechanism:
 * we declare a single tool with a JSON Schema `input_schema`, force the model
 * to call it via tool_choice, and parse `input` off the resulting tool_use
 * block. This works on every SDK version and matches the safety properties of
 * the Python `messages.parse` (the model can't return malformed JSON because
 * the API itself validates against the schema).
 */
import Anthropic from "@anthropic-ai/sdk";

let _client: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (_client) return _client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY not configured");
  }
  _client = new Anthropic({ apiKey });
  return _client;
}

// Model IDs match welike-social-listening-main/CLAUDE.md.
// Haiku for high-volume / cheap / fast (classification, milestones).
// Sonnet for reasoning-heavy (topics, narratives, report, chat, reply).
export const MODEL_HAIKU = "claude-haiku-4-5";
export const MODEL_SONNET = "claude-sonnet-4-6";

function toWellFormedString(input: string): string {
  const native = (input as unknown as { toWellFormed?: () => string })
    .toWellFormed;
  if (typeof native === "function") return native.call(input);

  let output = "";
  for (let i = 0; i < input.length; i += 1) {
    const code = input.charCodeAt(i);
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = input.charCodeAt(i + 1);
      if (next >= 0xdc00 && next <= 0xdfff) {
        output += input[i] + input[i + 1];
        i += 1;
      } else {
        output += "\ufffd";
      }
    } else if (code >= 0xdc00 && code <= 0xdfff) {
      output += "\ufffd";
    } else {
      output += input[i];
    }
  }
  return output;
}

function sanitizeForAnthropic<T>(value: T): T {
  if (typeof value === "string") {
    return toWellFormedString(value) as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeForAnthropic(item)) as T;
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        sanitizeForAnthropic(item),
      ])
    ) as T;
  }
  return value;
}

// ────────────────────────────────────────────────────────────────────────────
// Structured-output helper
// ────────────────────────────────────────────────────────────────────────────

export interface JsonSchema {
  type: "object";
  properties: Record<string, unknown>;
  required?: string[];
  additionalProperties?: boolean;
}

export interface StructuredOutputOptions<TInput> {
  model: string;
  system: string;
  user: string;
  /** JSON schema describing the expected output. */
  schema: JsonSchema;
  /** Tool name the model is forced to call. Defaults to "submit". */
  toolName?: string;
  maxTokens?: number;
  /** Optional runtime guard. If omitted, the parsed input is returned as-is. */
  validate?: (input: unknown) => TInput;
}

/**
 * Run a single-shot structured generation. The model is forced to call a
 * synthetic tool with `input_schema = schema`; we extract `tool_use.input`.
 *
 * Returns null if the model ignored the tool (extremely rare with
 * tool_choice forced).
 */
export async function generateStructured<TInput = unknown>(
  opts: StructuredOutputOptions<TInput>
): Promise<TInput | null> {
  const client = getAnthropic();
  const toolName = opts.toolName || "submit";
  const res = await client.messages.create({
    model: opts.model,
    max_tokens: opts.maxTokens ?? 4000,
    system: sanitizeForAnthropic(opts.system),
    messages: [
      { role: "user", content: sanitizeForAnthropic(opts.user) },
    ],
    tools: [
      {
        name: toolName,
        description: "Submit the structured analysis result.",
        input_schema: sanitizeForAnthropic(
          opts.schema
        ) as unknown as Anthropic.Tool.InputSchema,
      },
    ],
    tool_choice: { type: "tool", name: toolName },
  });

  const block = res.content.find(
    (c): c is Anthropic.Messages.ToolUseBlock => c.type === "tool_use"
  );
  if (!block) return null;
  const input = block.input;
  return opts.validate ? opts.validate(input) : (input as TInput);
}

/**
 * Plain text completion — used for report generation, chat answers, reply
 * drafts. Optional content blocks (e.g. cache_control evidence) supported via
 * `messages` override.
 */
export async function generateText(opts: {
  model: string;
  system: string;
  /** Either a single user string OR a fully-formed messages array (e.g. with
   *  cache_control on a content block, multi-turn history, etc.). */
  user?: string;
  messages?: Anthropic.Messages.MessageParam[];
  maxTokens?: number;
  systemBlocks?: Anthropic.Messages.TextBlockParam[]; // for cache_control on system
}): Promise<string> {
  const client = getAnthropic();
  const messages =
    opts.messages ??
    (opts.user
      ? [{ role: "user" as const, content: opts.user }]
      : ([] as Anthropic.Messages.MessageParam[]));
  const res = await client.messages.create({
    model: opts.model,
    max_tokens: opts.maxTokens ?? 4000,
    system: sanitizeForAnthropic(opts.systemBlocks ?? opts.system),
    messages: sanitizeForAnthropic(messages),
  });
  const text = res.content
    .filter(
      (c): c is Anthropic.Messages.TextBlock => c.type === "text"
    )
    .map((c) => c.text)
    .join("\n")
    .trim();
  return text;
}
