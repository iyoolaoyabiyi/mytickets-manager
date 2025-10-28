## 1. Fonts, images, SVG, and media usage

### Typography (UI-first, fast on slow networks)

- **Primary UI font system-UI stack for zero downloads and consistent metrics:  
    `font-family: Inter ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans", Ubuntu, Cantarell, "Helvetica Neue", Arial, "Apple Color Emoji", "Segoe UI Emoji";`  
    Use for all headings, body, buttons, inputs. This favors performance and avoids FOIT/CLS—important for a tickets app where clarity and speed matter.
- **Enhancement:** add a single **variable** display/text face (e.g., Inter var) only if subtler weight ramps are needed. Load with `font-display: swap`, preconnect, and restrict to needed subsets. Keep headings at 600–700, body 400–500, buttons 600.
- **Mono (code/IDs):** use the platform mono stack (e.g., `ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace`) only for IDs like `#123` or developer-visible text.
- **Tokens (examples):**  
    `--font-size-200: clamp(18px, 1.6vw, 20px)` (body), `--font-size-400: clamp(22px, 2.2vw, 28px)` (H3), `--font-size-600: clamp(28px, 3vw, 36px)` (H2), `--font-size-800: clamp(36px, 4vw, 48px)` (H1).  
    Use tighter line-height for headings (1.15–1.25) and 1.45–1.6 for body.

### SVGs (preferred for brand shapes and icons)

Inline SVGs for easy theming with CSS variables, avoiding extra requests.

- **`wave.svg` (hero background)**
    - **Purpose:** creates the wavy bottom edge in the hero on Landing.
    - **Art direction:** 1440×320 viewBox with a smooth cubic Bézier path. The top is transparent, the bottom filled.
    - **Styling:** set `fill` via CSS var (e.g., `var(--surface-100)`), optionally overlay a subtle linear gradient (`defs > linearGradient`) and apply `opacity: .85` for depth.
    - **Placement:** absolutely positioned at hero bottom; `preserveAspectRatio="none"` so it stretches full width without changing hero height.
    - **Accessibility:** decorative; use empty `alt` when exported as `<img>` or keep inline `<svg aria-hidden="true" focusable="false">`. The copy deck calls for a wave on Landing’s hero.
- **`circle-1.svg` and `circle-2.svg` (decoratives)**
    - **Purpose:** at least two circular elements across the site; place one overlapping the hero.
    - **Art direction:** 140–220 px circles with soft inner gradient and 8–16 px blur via backdrop or filter for depth.
    - **Placement:** top-right and bottom-left of hero; another appear faintly in the footer background to unify pages. Decorative only, empty alt. 
- **`icons/` (inline outline icons, 24 px grid)**
    - **Style:** stroke 1.75–2 px, round caps/joins, no fills.
    - **Core set:**
        - `ticket.svg` (for “Tickets” nav and cards),
        - `funnel.svg` (filters),
        - `check-circle.svg` (success), `x-circle.svg` (error),
        - `bar-chart.svg` (dashboard stats),
        - `login.svg` / `user-plus.svg` (auth links).
    - **Why inline:** allows color via `currentColor`, add `aria-hidden="true"`, and pair with visible text for AA contrast.

### Raster images (use only where needed)

- **Photography:** none  required     
- **Empty states (Tickets):** a tiny vector illustration communicates context better than a photo. The copy declares two empty states: “No tickets yet” and “No tickets match filters.”

### Media placements screen-by-screen

- **Landing**
    - Hero: `wave.svg` at bottom edge; one overlapping `circle-1.svg` in the top-right. CTAs below copy.
    - Features: each card gets a 24 px inline icon (Track = `ticket.svg`, Organize = `grid.svg`, Resolve = `bolt-check.svg`).
    - “How it works” steps: small step icons (`user-plus.svg`, `ticket-plus.svg`, `activity.svg`).
- **Login / Signup**
    - Keep pages minimal—just an auth card and optional subtle corner circle (very low opacity) to maintain the brand motif. Login includes a **demo credentials** hint in the card.
- **Dashboard**
    - Three stat cards can include 24 px icons aligned left of labels (`bar-chart.svg`, `clock.svg`, `check-circle.svg`).
- **Tickets**
    - Ticket cards use small **status tags** with an inline dot icon colored by status (open/green, in_progress/amber, closed/gray).
    - Empty states display a compact illustration left of the text (“inbox with magnifier” for filtered-empty; “folder-plus” for first-time empty). Empty state copy is defined in deck.
- **Toasts**
    - No imagery—icon + text only. Provide live-region + `role="status"` for success, `role="alert"` for errors. Copy is standardized globally.

### File formats and performance rules

- **SVG** for all scalable UI art (wave, circles, icons).
- Restrict raster to optional hero/illustrations; export **WebP** (fallback PNG if needed).
- Include `width` and `height` on `<img>`; add `loading="lazy"` below the fold.
- One **preload** is allowed for the hero image if one is eventually added.
- Keep assets under `/assets/` and shared across frameworks as required.
