// Client-safe primitives shared between server pages and client components.
// Keep this file free of server-only imports (no fs/path/db) so any
// "use client" component can import from it without dragging Node built-ins
// into the browser bundle.

export type Lang = "en" | "zh";

// Pick the localised value when present, otherwise fall back to the default.
// Used by every renderer that has parallel `_zh` fields available.
export function pickLang<T>(en: T, zh: T | undefined, lang: Lang): T {
  return lang === "zh" && zh !== undefined && zh !== null ? zh : en;
}
