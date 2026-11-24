# Design Brief

## Direction

SOVEREIGN OS — an Apple/iOS-inspired browser operating system for Indigenous Nations, rendered in a warm paper-and-ink "Term Sheet" system with a real light/dark theme pair and seven photographic regional landscape wallpapers. Never a website, never a crypto app.

## Tone

Calm, confident, institutional. Paper ground, deep oxblood ink, bronze seal accent. Minimal UI, maximal UX: generous whitespace, one clear action per surface, no crowded screens.

## Differentiation

The desktop discloses truth: every app icon carries a status marker — a solid moss dot for a working feature, a dashed bronze ring for a preview — so the OS states at a glance what is real versus forthcoming. Icons are matte instrument tiles with hairline borders, never glossy gradients; the dock is a frosted paper shelf; windows wear a paper chrome bar.

## Color Palette

| Token      | OKLCH         | Role                                            |
| ---------- | ------------- | ----------------------------------------------- |
| background | 0.97 0.008 60 | warm paper ground (light) / 0.15 0.018 40 dark  |
| foreground | 0.18 0.02 30  | deep ink text (light) / 0.94 0.01 55 dark       |
| card       | 0.99 0.005 60 | lifted paper panel / app window                 |
| primary    | 0.33 0.14 25  | oxblood — CTAs, active nav, focus ring, glyphs  |
| accent     | 0.58 0.11 70  | bronze seal — preview markers, hairlines        |
| muted      | 0.93 0.012 60 | beige wash, dock base, secondary rows           |
| success    | 0.48 0.09 150 | moss — working-feature status dot               |
| warning    | 0.64 0.13 85  | ochre — simulated / preview state               |
| os-*       | see index.css | desktop, wallpaper, icon tile, dock, window, focus, status (light + dark) |
| wallpaper-* | see index.css | 7 regional grounds, legibility scrims, dim, blur, labels |

## Typography

- Display: Fraunces — OS wordmark, page titles, section headings, hero numerals
- Body: General Sans — paragraphs, labels, buttons, nav items, icon labels, table copy
- Mono: JetBrains Mono — uppercase stamps, nav micro-labels, tabular figures (`.text-tabular`)
- Scale: wordmark `text-xl md:text-2xl font-display`, window title `text-lg font-display font-medium`, icon label `text-sm font-semibold`, body `text-base leading-relaxed`, stamp `.text-stamp`

## Elevation & Depth

Flat paper by default with hairline borders. `shadow-os-icon` resting tiles, `shadow-os-tile` hovered tiles/dock items, `shadow-os-dock` dock shelf, `shadow-os-window` windows/drawers, `shadow-wallpaper` full-screen wallpaper frame. No glow, no neon; depth from layered paper, blur, and hairline rules.

## Structural Zones

| Zone          | Background                                   | Border                    | Notes                                                    |
| ------------- | -------------------------------------------- | ------------------------- | -------------------------------------------------------- |
| Desktop       | `.os-desktop` + optional wallpaper layer     | —                         | root ground; photographic wallpaper, scrim, dim, blur    |
| Sidebar       | `.shell-rail` (paper wash)                   | border-r hairline         | desktop w-64 rail; `.nav-item` rows, `.nav-item-active` oxblood |
| Header        | `.shell-header` (translucent + blur)         | border-b hairline         | OS wordmark, search, Nation chip                         |
| Icon grid     | on `.os-desktop`                             | —                         | responsive 3–6 column `.os-icon-tile` grid, label + status marker |
| Dock          | `.os-dock` (frosted shelf)                   | hairline, 22px radius     | most-used apps + launcher/Home control                   |
| App window    | `.os-window` over `.os-window-scrim`         | hairline, 16px radius     | `.os-window-chrome` bar; `animate-os-window-in`          |
| Mobile bar    | `.os-bottom-bar` (frosted)                   | border-t hairline         | bottom nav, ≥44px targets                                |
| Mobile drawer | `.os-drawer`                                 | border-r hairline         | slide-in app/section list, ≥44px rows                    |
| Footer        | bg-muted/50                                  | border-t border-border    | quiet single-line credit                                 |

## Spacing & Rhythm

Desktop grid `gap-4 md:gap-6`, icon tiles `min-height: 92px`, dock `p-2 md:p-3`; mobile gutters `px-4`, desktop shell `px-6 md:px-8`; windows `p-4 md:p-6`. Single readable column on mobile, multi-column grid on desktop. No horizontal scroll at any width.

## Component Patterns

- App icon: `.os-icon-tile` squircle, `.os-icon-glyph` plate, `.os-icon-label`, `.os-status-live` / `.os-status-preview`; hover lifts 2px
- Dock: `.os-dock` frosted shelf of `.os-dock-item` 48px buttons; hover lifts 4px; launcher always present
- Windows: `.os-window` paper card + `.os-window-chrome` bar, title `font-display`, 44px close; opens over `.os-window-scrim`
- Wallpapers: `.wallpaper-tile` thumbnail (16:10), `.wallpaper-tile-selected` focus outline, `.wallpaper-label` readable chip, `.wallpaper-fullscreen` modal preview
- Theme control: `.theme-option` 44px segmented row; `.theme-option-selected` oxblood fill
- Nav items: `.nav-item` 44px rows; `.nav-item-active` solid oxblood
- Focus: `.os-focus-ring` — 3px oxblood outline with offset on every interactive element
- Buttons: 8px radius, oxblood fill + cream text primary; hairline-outline ghost secondary; 200ms hover
- Cards: `.shell-panel` cream panel, hairline border, `shadow-subtle`
- Badges: mono uppercase `.text-stamp`; `.badge-stage-live` oxblood, `.badge-stage-demo` ochre, `.badge-stage-proposed` bronze dashed, `.badge-stage-future` grey outline
- Tables: flat rows, `.ledger-row` hairline dividers, figures `.text-tabular`

## Motion

- Entrance: desktop boots `animate-os-boot`; windows `animate-os-window-in`; wallpaper applies `animate-wallpaper-in`; sections stagger `animate-fade-up`
- Hover: tiles lift 2px, dock items 4px, buttons/nav shift background, 200ms `transition-smooth`
- Decorative: `animate-os-preview-pulse` on the preview marker only; all motion respects `prefers-reduced-motion`

## Constraints

- Light + Dark + System themes are all real; the `.dark` block now defines full `--os-*` and wallpaper tokens
- Wallpapers are geographic landscapes only — no sacred imagery, Nation crests or cultural symbols; region never implies a Nation's identity
- No automatic region-based wallpaper recommendation; every Nation may pick any wallpaper
- Wallpaper preferences stay separate from governance and identity settings
- No gradients beyond the paper wallpaper wash and dock glass; never a full-page rainbow gradient
- No raw hex or arbitrary color classes in components — semantic tokens only
- Mobile-first: tap targets ≥44px, no horizontal scroll, dock/sidebar collapse to bottom bar + drawer
- Protect Indigenous community knowledge: no fabricated activity, all demo data clearly labelled

## Signature Detail

The "paper desktop": a warm-paper (or ink-dark) wallpaper carrying a faint engraved dot-grid, overlaid with an optional photographic regional landscape behind a legibility scrim. App icons read as matte instrument tiles stamped with a status marker — a solid moss dot says working, a dashed bronze ring says preview — so the OS itself, like a signed instrument, tells the user what is real and what is forthcoming.
