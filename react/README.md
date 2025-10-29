# myTickets Manager — React + Vite (TS) + Tailwind v4

The React build delivers the authenticated myTickets workspace described in `docs/apps-overview.md`, following the shared engineering playbook in the root `README.md`.

## Framework Highlights
- **Stylesheet-first Tailwind v4**: all styling lives in `@packages/styles/app.css` via `@apply`, honoring the tokens defined in `docs/foundation-pack/04-design-system.md` and the media usage in `docs/foundation-pack/03-media.md`.
- **Shared assets**: fonts, media, and copy JSON ship from `@packages/assets`, reflecting the editorial guidance in `docs/copy.md` and the copy deck in `docs/foundation-pack/02.1-copy-deck.md`.
- **Consistent theming**: colors live in `:root`, spacing/typography in `@theme`, preserving the decisions tracked in `docs/foundation-pack/04-design-system.md`.

## Intent and Scope
This package powers the SPA journey for myTickets, mirroring the screen plan in `docs/foundation-pack/01-screens-and-routes.md` while keeping parity with the Vue and Twig builds.

## Project Layout
- `src/main.tsx` mounts `<App />`, applies the shared stylesheet, and wires Vite HMR.
- `src/App.tsx` provides the structural frame (skip link, header, footer, toast region) prescribed by `docs/foundation-pack/file-structure.md`.
- `src/routes/` mirrors the experience map (`Landing`, `Dashboard`, `Tickets`, etc.) from `docs/foundation-pack/01-screens-and-routes.md`.
- `src/components/` contains UI atoms and organisms documented in `docs/foundation-pack/05.0-components-and-states-mapping.md`.
- `src/hooks/` isolates cross-cutting concerns (auth guard, page meta) so state logic follows `docs/foundation-pack/05.3-state-management.md`.
- `src/types/` codifies the data models outlined in `docs/foundation-pack/05.2-data-models.md`.

## State and Data Flow
- Auth lifecycle flows through `@packages/utils/auth`, applying validation and error UX from `docs/foundation-pack/05.1-validation-and-error-handling.md`.
- Ticket CRUD delegates to `@packages/utils/tickets`, keeping mutations event-driven per `docs/foundation-pack/05.3-state-management.md`.
- Toasts and relative time formatting reuse shared helpers so copy tone and real-time cues stay aligned with `docs/foundation-pack/02.0-copy.md` and `docs/foundation-pack/03-media.md`.

## UX and Accessibility
- Copy is sourced from `@packages/assets/copy/*.json`, directly reflecting the tone guardrails in `docs/copy.md`.
- SVG icons (for example `bar-chart.svg`) and media follow the sourcing rules in `docs/foundation-pack/03-media.md`.
- Forms rely on shared validation feedback patterns to keep ARIA hints and focus management consistent with `docs/foundation-pack/05.1-validation-and-error-handling.md`.

## Build and Tooling
- Vite handles bundling; TypeScript and ESLint enforce correctness against the shared data models.
- Tailwind v4 operates in stylesheet mode so theming stays consistent with the other frameworks.
- CI/CD relies on repo-level scripts highlighted in the root `README.md`, ensuring this app deploys alongside Vue and Twig artifacts.

## Extensibility Guidelines
- Update `docs/foundation-pack/01-screens-and-routes.md` before introducing new routes.
- Capture component variants in `docs/foundation-pack/05.0-components-and-states-mapping.md` ahead of implementation.
- Extend `docs/foundation-pack/05.2-data-models.md` and shared utilities when modifying domain data so all frameworks remain compatible.

## Run
```
pnpm install
pnpm dev
```
