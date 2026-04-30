---
name: welike-design
description: WeLike's design system — brand colors (#06f5b7 fluorescent mint on dark surface palette), Inter font, Tailwind tokens, and component patterns (buttons, inputs, cards, nav items). Apply this whenever generating, editing, or reviewing any UI code for WeLike — the GTM Workspace for AI products. Use it for pages, components, layouts, forms, buttons, cards, sidebars, or any visual styling inside the `web/` directory. Trigger this skill even when the user doesn't explicitly say "design" — any UI work on WeLike should follow these conventions so the product stays visually consistent. Also consult it when adding new tools to the workspace (Social Listening, KOL Pricer, etc.) so they match the existing look and feel.
---

# WeLike Design System

WeLike is a GTM Workspace for AI products. The visual language is **tech-minimal with a fluorescent accent** — the aesthetic family of Linear, Vercel, Raycast, and early Arc Browser, tuned for an AI developer audience.

Read this whole skill before writing UI. The palette and component patterns are narrow on purpose — staying inside them is what keeps the product feeling coherent as we add more tools.

## Core palette

**Brand color: `#06f5b7`** — fluorescent mint. Used sparingly for primary actions, active states, and accents. On dark backgrounds it reads as a confident "signal" color, not decoration. If a whole screen turns green, something is wrong.

### Tailwind tokens (defined in `web/tailwind.config.ts`)

```ts
colors: {
  brand: {
    400: '#0ffac0',  // hover
    500: '#06f5b7',  // primary
    600: '#04c595',  // pressed
  },
  surface: {
    200: '#e5e5e5',  // emphasis text
    300: '#c7c7c7',  // form labels
    400: '#9e9e9e',  // body text
    500: '#737373',  // secondary labels
    700: '#404040',  // borders, input edges
    800: '#262626',  // dividers, hover bg
    900: '#1a1a1a',  // card / input background
    950: '#0a0a0a',  // page background
  },
}
```

Use `brand-*` for accents and `surface-*` for everything else. **Don't reach for Tailwind's default `gray`/`slate`/`zinc` scales** — they're a slightly different hue and break palette consistency. If you need a color not in this list, pick the closest `surface-*` step and move on.

Red for errors is the only non-brand color permitted: `bg-red-500/10 border-red-500/20 text-red-400`.

## Typography

- **Font family**: Inter (loaded from Google Fonts in `globals.css`)
- **Headings**: `font-bold` (700)
- **Buttons / strong**: `font-semibold` (600)
- **Medium accents**: `font-medium` (500)
- **Body**: default 400

### Size scale

| Use | Classes |
|---|---|
| Page titles, hero | `text-2xl font-bold` |
| Section titles | `text-lg font-semibold` |
| Body, forms, buttons | `text-sm` |
| Tags, captions, helper | `text-xs` |
| Sidebar section headers | `text-[11px] uppercase tracking-widest text-surface-500` |

The sidebar header treatment (11px uppercase widest-tracking) is a signature — use it for any grouped navigation, not just the existing sidebar.

## Layout principles

1. **Dark-first.** Page body is `bg-surface-950 text-white`. No light-theme variants — don't write `dark:` prefixes, just use the dark values directly.
2. **Info-dense, not cramped.** Generous padding inside cards (`p-5`/`p-6`), tighter in sidebars (`px-4`). Between stacked sections, `gap-6` or `space-y-6` is the default rhythm.
3. **Rounded, not rounded-full.** `rounded-lg` (8px) for buttons and inputs, `rounded-xl` (12px) for cards and the logo block. Avoid `rounded-full` except for avatars.
4. **Borders over shadows.** Depth comes from `border-surface-800` on cards. Drop shadows don't read well on near-black backgrounds and aren't used anywhere in the product.

## Component patterns

These are reference implementations. Copy them, don't reinvent them.

### Primary button
```tsx
<button className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-black hover:bg-brand-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
  Create workspace
</button>
```

**Black text on brand-500 is intentional** — the green is too luminous for white text. Don't change it to white.

### Secondary button
```tsx
<button className="rounded-lg border border-surface-700 bg-surface-900 px-4 py-2.5 text-sm text-surface-300 hover:bg-surface-800 hover:text-white transition-colors">
  Cancel
</button>
```

### Input
```tsx
<input className="w-full rounded-lg border border-surface-700 bg-surface-900 px-4 py-2.5 text-sm text-white placeholder:text-surface-500 focus-brand transition-colors" />
```

`focus-brand` is a custom utility in `globals.css` — use it instead of Tailwind's `focus:ring-*` so focus states carry the brand color.

### Card
```tsx
<div className="rounded-xl border border-surface-800 bg-surface-900 p-6">
  ...
</div>
```

For a **highlighted / active** card, use a subtle brand gradient with a brand-tinted border:
```tsx
<div className="rounded-xl border border-brand-500/20 bg-gradient-to-br from-brand-500/10 to-brand-500/5 p-6">
  ...
</div>
```

### Nav item
```tsx
<Link
  href={href}
  className={cn(
    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
    isActive
      ? "bg-brand-500/10 text-brand-500"
      : "text-surface-400 hover:text-white hover:bg-surface-800"
  )}
>
  <Icon className="h-4 w-4 flex-shrink-0" />
  <span className="flex-1 truncate">{label}</span>
</Link>
```

Active state is `bg-brand-500/10 text-brand-500` — translucent tint plus full-brand text. Don't use full brand background on nav items; it's too loud.

### Logo block
```tsx
<div className="h-10 w-10 rounded-xl bg-brand-500 flex items-center justify-center">
  <span className="text-black font-bold">W</span>
</div>
```

Smaller variant for avatars: `h-7 w-7 rounded-md` with `text-xs`. Use the user's or product's initial.

### Label / tag
```tsx
<span className="inline-flex items-center rounded-md bg-surface-800 px-2 py-0.5 text-xs text-surface-300">
  B2B
</span>
```

## Iconography

Use **`lucide-react` exclusively**. Sizes:
- `h-4 w-4` — inline with text, nav items
- `h-5 w-5` — card headers, standalone icons
- `h-6 w-6` — hero-level accents

If a lucide icon doesn't exist for the concept you need, pick the closest conceptual match. **Don't pull in heroicons, feather, or any other icon library** — mixing icon sets is immediately visible and breaks the minimal aesthetic.

## Special effects

Defined in `web/app/globals.css`:

- `.glow-brand` — brand-colored box-shadow glow. Use on hero CTAs and key interactive elements, not everywhere.
- `.text-gradient` — gradient text for big brand moments (the landing hero title, not body copy).
- `.bg-grid` — subtle grid background pattern for auth pages and hero sections.
- `.focus-brand` — brand-colored focus ring (replaces Tailwind's default `focus:ring-*`).

These are accents. Overusing them flattens their effect.

## States and feedback

- **Loading**: `<Loader2 className="h-4 w-4 animate-spin" />` from lucide, usually inside a button replacing the label.
- **Success**: brand-500 check icon + text. Brief, often auto-dismissing (~1.5s).
- **Error**: `bg-red-500/10 border border-red-500/20 text-red-400` — the only time non-brand color appears.
- **Disabled**: `disabled:opacity-50 disabled:cursor-not-allowed`

## Design tone

Copy voice and interaction tone are part of the design — the visual minimalism falls apart if the words are flowery.

- **Confident, not decorative.** The palette carries weight. Resist adding more colors, gradients, or ornamental elements.
- **Information-dense.** Trust the user to read. Don't hide core content behind "Learn more" collapses.
- **Subtle animation.** `transition-colors` is the default. No springy easings, no durations > 200ms, no animated gradients.
- **Plainspoken copy.** "Your AI is groundbreaking. Your GTM should be too." beats "Unleash next-generation growth potential."

## Anti-patterns — don't do these

- Don't use Tailwind default `gray`/`slate`/`zinc` — use `surface-*`
- Don't apply `bg-brand-500` to large areas (section backgrounds) — it's for accents only
- Don't use white text on `bg-brand-500` — always black
- Don't add drop shadows on cards — depth comes from `border-surface-800`
- Don't import non-lucide icon libraries
- Don't add third-party UI kits (no MUI, Chakra, full shadcn/ui drops) — compose from Tailwind primitives
- Don't write light-theme variants — dark only
- Don't use emojis in UI copy unless the user explicitly asks
- Don't use `rounded-full` except for avatars
- Don't invent new color tokens ad-hoc; if you think you need one, grep the existing code first to see if a pattern already exists

## Where to look for precedent

Before inventing a new pattern, grep existing WeLike pages:

- `web/tailwind.config.ts` — color tokens and theme extensions
- `web/app/globals.css` — custom utilities and font loading
- `web/app/(dashboard)/layout.tsx` — sidebar pattern, nav items, current-project card
- `web/app/(dashboard)/workspace/page.tsx` — workspace hero card, tool cards
- `web/app/(dashboard)/onboarding/page.tsx` — long form layout, category pickers
- `web/app/(auth)/login/page.tsx` — auth page pattern, social sign-in button
- `web/app/page.tsx` — landing page, hero, feature grid

When in doubt, find the closest existing thing and match it.
