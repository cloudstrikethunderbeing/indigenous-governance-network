# Design Brief

## Direction

SOVEREIGN OS — an Apple/iOS-inspired browser operating system for Indigenous Nations, rendered in a warm paper-and-ink "Term Sheet" system with a real light/dark theme pair and seven photographic regional landscape wallpapers. Never a website, never a crypto app.

## Tone

Calm, confident, institutional. Paper ground, deep oxblood ink, bronze seal accent. Minimal UI, maximal UX: generous whitespace, one clear action per surface, no crowded screens.

## Differentiation

The desktop discloses truth: every app icon carries a status marker — a solid moss dot for a working feature, a dashed bronze ring for a preview — so the OS states at a glance what is real versus forthcoming. Icons are matte instrument tiles with hairline borders, never glossy gradients; the dock is a frosted paper shelf; windows wear a paper chrome bar. Governance extends the metaphor: a DAO's Constitution is a signed instrument — wax seal, numbered clauses, a completeness meter — not a config screen.

## Color Palette

| Token      | OKLCH         | Role                                            |
| ---------- | ------------- | ----------------------------------------------- |
| background | 0.97 0.008 60 | warm paper ground (light) / 0.15 0.018 40 dark  |
| foreground | 0.18 0.02 30  | deep ink text (light) / 0.94 0.01 55 dark       |
| card       | 0.99 0.005 60 | lifted paper panel / app window                 |
| primary    | 0.33 0.14 25  | oxblood — CTAs, active nav, focus ring, glyphs  |
| accent     | 0.58 0.11 70  | bronze seal — preview markers, hairlines        |
| muted      | 0.93 0.012 60 | beige wash, dock base, secondary rows           |
| success / warning | 0.48 0.09 150 / 0.64 0.13 85 | moss working-feature dot / ochre simulated-preview state |
| os-* / wallpaper-* / file-* / preview-* / gov-* | see index.css | desktop shell, 7 regional wallpapers + scrims, Files browser (surface/selection/type glyphs/dropzone/progress), Deploy-page live OS preview frame, Governance (constitution paper/seal/clauses, four-section rail, templates, permission matrix, census, execution, appeals, demo, CTA) — light + dark |

## Typography

- Display: Fraunces — OS wordmark, page titles, section headings, hero numerals
- Body: General Sans — paragraphs, labels, buttons, nav items, icon labels, table copy
- Mono: JetBrains Mono — uppercase stamps, nav micro-labels, tabular figures (`.text-tabular`)
- Scale: wordmark `text-xl md:text-2xl font-display`, window title `text-lg font-display font-medium`, icon label `text-sm font-semibold`, body `text-base leading-relaxed`, stamp `.text-stamp`

## Elevation & Depth

Flat paper with hairline borders. `shadow-os-icon` resting tiles, `shadow-os-tile` hovered tiles/dock items, `shadow-os-dock` shelf, `shadow-os-window` windows/drawers, `shadow-wallpaper` wallpaper frame. No glow, no neon; depth from layered paper, blur, and hairline rules.

## Structural Zones

| Zone          | Background                                   | Border                    | Notes                                                    |
| ------------- | -------------------------------------------- | ------------------------- | -------------------------------------------------------- |
| Desktop       | `.os-desktop` + optional wallpaper layer     | —                         | root ground; photographic wallpaper, scrim, dim, blur; responsive 3–6 col `.os-icon-tile` grid with status marker |
| Sidebar       | `.shell-rail` (paper wash)                   | border-r hairline         | desktop w-64 rail; `.nav-item` rows, `.nav-item-active` oxblood |
| Header        | `.shell-header` (translucent + blur)         | border-b hairline         | OS wordmark, search, Nation chip                         |
| Dock          | `.os-dock` (frosted shelf)                   | hairline, 22px radius     | most-used apps + launcher/Home control                   |
| App window    | `.os-window` over `.os-window-scrim`         | hairline, 16px radius     | `.os-window-chrome` bar; `animate-os-window-in`          |
| Mobile bar/drawer | `.os-bottom-bar` / `.os-drawer` (frosted) | border-t / border-r hairline | bottom nav + slide-in app list, ≥44px targets            |
| Files app     | `.file-shell` (paper) + `.file-sidebar`      | hairline, 16px radius     | Finder-inspired: sidebar, `.file-toolbar`, breadcrumbs, grid/list, `.file-dropzone` |
| OS preview    | `.os-preview-frame` + `.os-preview-chrome`   | hairline, 20px radius     | live Sample Nation desktop on Deploy page, `.os-preview-badge` |
| Governance    | `.gov-section-rail` (paper wash) + `.gov-constitution` sheet | hairline, 12px radius | four-section rail, signed-instrument constitution (`.gov-seal`, `.gov-clause`), progress, templates, demo |
| Footer        | bg-muted/50                                  | border-t border-border    | quiet single-line credit                                 |

## Spacing & Rhythm

Desktop grid `gap-4 md:gap-6`, icon tiles `min-height: 92px`, dock `p-2 md:p-3`; mobile gutters `px-4`, desktop shell `px-6 md:px-8`; windows `p-4 md:p-6`. Single readable column on mobile, multi-column grid on desktop. No horizontal scroll at any width.

## Component Patterns

- App icon & windows: `.os-icon-tile` squircle + `.os-icon-glyph` plate + `.os-icon-label` + `.os-status-live`/`.os-status-preview` (hover lifts 2px); `.os-window` paper card + `.os-window-chrome` bar, title `font-display`, 44px close, opens over `.os-window-scrim`; `.os-dock` frosted shelf of `.os-dock-item` 48px buttons (hover lifts 4px)
- Wallpapers, theme, nav & focus: `.wallpaper-tile` (16:10) + `-selected` + `.wallpaper-label` + `.wallpaper-fullscreen`; `.theme-option`/`-selected` 44px row; `.nav-item`/`-active` 44px rows (solid oxblood); `.os-focus-ring` 3px oxblood outline with offset
- Buttons, cards, badges & tables: 8px radius, oxblood fill + cream text primary, hairline-outline ghost secondary, 200ms hover; `.shell-panel` cream panel + `shadow-subtle`; mono `.text-stamp` + `.badge-stage-live`/`-demo`/`-proposed`/`-future`; flat `.ledger-row` dividers, figures `.text-tabular`
- Files browser: `.file-shell` window, `.file-sidebar-item`/`-active` 44px folder rows, `.file-breadcrumb`, `.file-row` (list) / `.file-card` (grid) with `-selected`, `.file-type-glyph` + `.file-glyph-folder|doc|image|pdf|other`, `.file-dropzone`/`-active`, `.file-progress-track`/`-fill`/`-error`, `.file-sample-chip` for fictional data
- OS preview: `.os-preview-frame` + `.os-preview-chrome` dots, `.os-preview-badge` pill, `.os-preview-hint`; hosts real OS components so it stays interactive, never a screenshot
- Governance: `.gov-section-rail` + `.gov-section-tab`/`-active` 48px rows (exactly four: Our Rules, Decisions, Members, Activity); `.gov-constitution` paper sheet, `.gov-seal` wax roundel (`animate-gov-seal-in`), `.gov-clause`/`.gov-clause-num` numbered rules, `.gov-progress-track`/`-fill`
- Constitution Builder & rules: `.gov-template-card`/`-selected` + `.gov-template-example-chip` (every template an example, never an assumption of authority), `.gov-advanced-panel` hidden-until-asked; `.gov-role-chip`, `.gov-permission-granted`/`-denied`/`-inherited`; Census `.gov-census-track`/`-fill`/`-quorum`; execution `.gov-execution-pending|ready|done|blocked`; appeals `.gov-appeal-open|review|resolved`
- Public demo: `.gov-demo-shell`/`.gov-demo-rail`, `.gov-demo-choice`/`-selected`, `.gov-demo-impact` live-change strip; `.gov-cta-panel` + `.gov-cta-inverse` for YOUR ORGANIZATION. YOUR RULES. BUILD YOUR DAO.

## Motion

- Entrance: desktop boots `animate-os-boot`; windows `animate-os-window-in`; wallpaper applies `animate-wallpaper-in`; sections stagger `animate-fade-up`
- Hover & decorative: tiles lift 2px, dock items 4px, buttons/nav shift background, 200ms `transition-smooth`; `animate-os-preview-pulse` on the preview marker, `file-drop-pulse` while a drag hovers the dropzone, `gov-seal-in` when a constitution is confirmed; all motion respects `prefers-reduced-motion`

## Cosmos Layer — /dao-preview

- Scope: dark-only token family `--cosmos-*` in `:root`, consumed only inside `.cosmos-root`; never on OS, landing or paper surfaces
- Palette: ground `0.13 0.022 265`, surface `0.17 0.026 264`, foreground `0.95 0.012 250`, muted `0.68 0.025 255`; accents cyan `0.82 0.14 195`, violet `0.68 0.17 295`, gold `0.82 0.13 88`
- Atmosphere: `.cosmos-aurora` drifting cyan/violet/gold blur, `.cosmos-grid` masked dot field, `.cosmos-earth` glowing limb, `.cosmos-veil` bottom gradient
- Ecosystem: `.cosmos-core` pulsing DAO symbol + `.cosmos-core-ring` orbit, `.cosmos-link-line` dashed SVG connectors, `.cosmos-node` frosted module pills with `.cosmos-node-glyph[-violet|-gold]`
- Status: `.cosmos-chip-live` (solid cyan = implemented) vs `.cosmos-chip-future` (dashed gold = future phase); `.cosmos-panel` glass detail sheet
- CTAs: `.cosmos-cta` solid near-white pill → cyan on hover; `.cosmos-cta-ghost` hairline outline; both ≥48px
- Type: display Fraunces for the reveal headline, body General Sans, mono JetBrains Mono for `.cosmos-chip` eyebrow stamps
- Motion tokens: `--cosmos-dur-fast 320ms` / `--cosmos-dur-base 640ms` / `--cosmos-dur-slow 1100ms`, `--cosmos-stagger 120ms`, `--cosmos-ease-reveal cubic-bezier(0.16,1,0.3,1)`; utilities `.cosmos-reveal` (node entrance) and `.cosmos-rise` (headline); all animation, hover lift and orbit disabled under `prefers-reduced-motion` — the reveal renders as a static, fully legible composition
- Isolation: no authentication, no deployment, no governance records; a clearly-labelled demonstration that creates nothing

## Constraints

- Light + Dark + System themes are all real; `.dark` defines full `--os-*`, wallpaper and `--gov-*` tokens
- Wallpapers are geographic landscapes only — no sacred imagery, Nation crests or cultural symbols; region never implies identity; every Nation may pick any wallpaper; preferences stay separate from governance and identity
- No gradients beyond the paper wallpaper wash and dock glass; never a full-page rainbow gradient
- No raw hex or arbitrary color classes in components — semantic tokens only
- Mobile-first: tap targets ≥44px, no horizontal scroll, dock/sidebar collapse to bottom bar + drawer
- Protect Indigenous community knowledge: no fabricated activity, all demo data clearly labelled
- Files reuses existing hues only and sample files carry `.file-sample-chip`, read-only for anonymous visitors; the Deploy-page OS preview embeds real OS components, never a static mockup
- Governance reuses existing hues only (oxblood/bronze/moss/ochre/blue) — no new colors; the Constitution reads as a signed instrument, not a settings form
- Governance shows exactly four sections; the eight governance views live inside them, never new top-level navigation
- Templates are examples, never assumptions about legal or traditional authority; advanced rules stay hidden until asked; a preview + explicit confirmation precede activation
- Interactive demo uses fictional data only and ends at Deploy Your Own DAO; the landing CTA is one concise block, never a settings dump

## Signature Detail

The "paper desktop": a warm-paper (or ink-dark) wallpaper carrying a faint engraved dot-grid, overlaid with an optional photographic regional landscape behind a legibility scrim. App icons read as matte instrument tiles stamped with a status marker — a solid moss dot says working, a dashed bronze ring says preview — so the OS itself, like a signed instrument, tells the user what is real and what is forthcoming.
