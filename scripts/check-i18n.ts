/**
 * Static i18n leakage detector for the Social Listening module.
 *
 * Walks `web/components/social-listening/**` plus `web/components/SocialListening.tsx`
 * and flags any line containing CJK characters that:
 *   1. is NOT inside a `lang === "zh" ? ... : ...` ternary (or its negation), AND
 *   2. is NOT inside a `i18n.ts` translation table file (lib of legitimately
 *      paired translations), AND
 *   3. is NOT inside a `// ` comment (Chinese comments are fine).
 *
 * Run:  npx tsx scripts/check-i18n.ts
 * Exit codes: 0 clean, 1 leaks found.
 *
 * Why we don't enforce "no Chinese anywhere": we accept inline lang ternaries
 * because both sides are present, so EN mode stays clean and ZH mode stays
 * clean. This script catches the actual hazard: Chinese with no matching
 * English fallback.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, "..", "web");

const TARGET_PATTERNS = [
  "components/SocialListening.tsx",
  "components/social-listening",
];

const SKIP_FILES = new Set(["i18n.ts"]); // pure translation tables

const CJK_REGEX = /[一-龥]/;

function walk(dir: string, out: string[]) {
  const entries = readdirSync(dir);
  for (const entry of entries) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      walk(full, out);
    } else if (/\.(ts|tsx)$/.test(entry) && !SKIP_FILES.has(entry)) {
      out.push(full);
    }
  }
}

function collectFiles(): string[] {
  const out: string[] = [];
  for (const t of TARGET_PATTERNS) {
    const full = join(ROOT, t);
    let s;
    try {
      s = statSync(full);
    } catch {
      continue;
    }
    if (s.isFile()) out.push(full);
    else walk(full, out);
  }
  return out;
}

interface Leak {
  file: string;
  line: number;
  text: string;
}

/** Look at a small window around the line to find a paired lang branch. */
function nearLangCondition(lines: string[], idx: number, window = 10): boolean {
  const lo = Math.max(0, idx - window);
  const hi = Math.min(lines.length - 1, idx + window);
  for (let j = lo; j <= hi; j++) {
    const l = lines[j];
    if (
      /lang\s*===\s*["']zh["']/.test(l) ||
      /lang\s*===\s*["']en["']/.test(l) ||
      /lang\s*!==\s*["']zh["']/.test(l) ||
      /lang\s*!==\s*["']en["']/.test(l)
    ) {
      return true;
    }
  }
  return false;
}

function scanFile(file: string): Leak[] {
  const src = readFileSync(file, "utf8");
  const lines = src.split("\n");
  const leaks: Leak[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!CJK_REGEX.test(line)) continue;

    // Skip pure-comment lines.
    const trimmed = line.trim();
    if (trimmed.startsWith("//")) continue;
    if (trimmed.startsWith("*") || trimmed.startsWith("/*"))
      continue;

    // Skip lines that look like a {zh: "...", en: "..."} option literal
    // (translation tables inline in component config arrays).
    if (/zh:\s*["']/.test(line) && /en:\s*["']/.test(line)) continue;

    // Skip lines inside (or directly adjacent to) a lang ternary / branch.
    if (nearLangCondition(lines, i)) continue;

    leaks.push({ file: relative(process.cwd(), file), line: i + 1, text: line.trim() });
  }
  return leaks;
}

function main() {
  const files = collectFiles();
  const allLeaks: Leak[] = [];
  for (const f of files) {
    allLeaks.push(...scanFile(f));
  }
  if (allLeaks.length === 0) {
    console.log("✓ no i18n leaks in social-listening components");
    process.exit(0);
  }
  console.error(
    `✗ ${allLeaks.length} potential i18n leak${allLeaks.length === 1 ? "" : "s"} in social-listening components:\n`
  );
  for (const l of allLeaks) {
    console.error(`  ${l.file}:${l.line}  ${l.text}`);
  }
  console.error(
    "\nFix: wrap the Chinese string in a `lang === \"zh\" ? ... : ...` ternary, or move it into web/components/social-listening/i18n.ts and reference via t(key, lang)."
  );
  process.exit(1);
}

main();
