# myTickets Manager — React + Vite (TS) + Tailwind v4

The React build delivers the authenticated myTickets workspace described in [docs/apps-overview.md](../../docs/apps-overview.md), following the shared engineering playbook in the root [README.md](../../README.md).

## Framework Highlights
- **Stylesheet-first Tailwind v4**: all styling lives in `@packages/styles/app.css` via `@apply`, honoring the tokens defined in [docs/foundation-pack/04-design-system.md](../../docs/foundation-pack/04-design-system.md) and the media usage in [docs/foundation-pack/03-media.md](../../docs/foundation-pack/03-media.md).
- **Shared assets**: fonts, media, and copy JSON ship from `@packages/assets`, reflecting the editorial guidance in [docs/copy.md](../../docs/copy.md) and the copy deck in [docs/foundation-pack/02.1-copy-deck.md](../../docs/foundation-pack/02.1-copy-deck.md).
- **Consistent theming**: colors live in `:root`, spacing/typography in `@theme`, preserving the decisions tracked in [docs/foundation-pack/04-design-system.md](../../docs/foundation-pack/04-design-system.md).

## Intent and Scope
This package powers the SPA journey for myTickets, mirroring the screen plan in [docs/foundation-pack/01-screens-and-routes.md](../../docs/foundation-pack/01-screens-and-routes.md) while keeping parity with the Vue and Twig builds.

## Project Layout
- `src/main.tsx` mounts `<App />`, applies the shared stylesheet, and wires Vite HMR.
- `src/App.tsx` provides the structural frame (skip link, header, footer, toast region) prescribed by [docs/foundation-pack/file-structure.md](../../docs/foundation-pack/file-structure.md).
- `src/routes/` mirrors the experience map (`Landing`, `Dashboard`, `Tickets`, etc.) from [docs/foundation-pack/01-screens-and-routes.md](../../docs/foundation-pack/01-screens-and-routes.md).
- `src/components/` contains UI atoms and organisms documented in [docs/foundation-pack/05.0-components-and-states-mapping.md](../../docs/foundation-pack/05.0-components-and-states-mapping.md).
- `src/hooks/` isolates cross-cutting concerns (auth guard, page meta) so state logic follows [docs/foundation-pack/05.3-state-management.md](../../docs/foundation-pack/05.3-state-management.md).
- `src/types/` codifies the data models outlined in [docs/foundation-pack/05.2-data-models.md](../../docs/foundation-pack/05.2-data-models.md).

## State and Data Flow
- Auth lifecycle flows through `@packages/utils/auth`, applying validation and error UX from [docs/foundation-pack/05.1-validation-and-error-handling.md](../../docs/foundation-pack/05.1-validation-and-error-handling.md).
- Ticket CRUD delegates to `@packages/utils/tickets`, keeping mutations event-driven per [docs/foundation-pack/05.3-state-management.md](../../docs/foundation-pack/05.3-state-management.md).
- Toasts and relative time formatting reuse shared helpers so copy tone and real-time cues stay aligned with [docs/foundation-pack/02.0-copy.md](../../docs/foundation-pack/02.0-copy.md) and [docs/foundation-pack/03-media.md](../../docs/foundation-pack/03-media.md).

## UX and Accessibility
- Copy is sourced from `@packages/assets/copy/*.json`, directly reflecting the tone guardrails in [docs/copy.md](../../docs/copy.md).
- SVG icons (for example `bar-chart.svg`) and media follow the sourcing rules in [docs/foundation-pack/03-media.md](../../docs/foundation-pack/03-media.md).
- Forms rely on shared validation feedback patterns to keep ARIA hints and focus management consistent with [docs/foundation-pack/05.1-validation-and-error-handling.md](../../docs/foundation-pack/05.1-validation-and-error-handling.md).

## Build and Tooling
- Vite handles bundling; TypeScript and ESLint enforce correctness against the shared data models.
- Tailwind v4 operates in stylesheet mode so theming stays consistent with the other frameworks.
- CI/CD relies on repo-level scripts highlighted in the root [README.md](../../README.md), ensuring this app deploys alongside Vue and Twig artifacts.

## Extensibility Guidelines
- Update [docs/foundation-pack/01-screens-and-routes.md](../../docs/foundation-pack/01-screens-and-routes.md) before introducing new routes.
- Capture component variants in [docs/foundation-pack/05.0-components-and-states-mapping.md](../../docs/foundation-pack/05.0-components-and-states-mapping.md) ahead of implementation.
- Extend [docs/foundation-pack/05.2-data-models.md](../../docs/foundation-pack/05.2-data-models.md) and shared utilities when modifying domain data so all frameworks remain compatible.

## Setup & Execution
1. `pnpm install`
2. `pnpm dev` – launches the React SPA on Vite’s dev server.
3. `pnpm build` – outputs the production bundle to `dist/`.

## Switching Between Frameworks
- **React SPA**: `cd apps/react && pnpm dev`
- **Vue SPA**: `cd apps/vue && pnpm dev`
- **Twig SSR**: `cd apps/twig && pnpm build && php -S localhost:3000 router.php`

## UI Components & State
- Structural shell (`App.tsx`) wraps every route with `Header`, `Footer`, and the toast region.
- Screens under `src/routes/` handle page-level concerns; shared UI (e.g. `TicketModal`, `Toast`, `Header`) lives in `src/components/`.
- Auth and ticket state flow through `@packages/utils/auth` and `@packages/utils/tickets`, emitting events to keep dashboards and ticket feeds in sync.
- Ticket modals validate required fields and clamp optional descriptions to 500 characters, echoing the shared domain rules.

## Accessibility & Known Issues
- Skip link, semantic landmarks, focus-visible outlines, and ARIA attributes follow the shared accessibility spec.
- Toasts announce changes politely, and form errors surface inline for screen-reader discoverability.
- Known issues: none currently tracked; report discrepancies via the repository issue tracker.

## Demo Credentials
- Email: `demo@mytickets.app`
- Password: `demo12345`
