# myTickets Manager — Vue 3 + Vite (TS) + Tailwind v4

The Vue build mirrors the myTickets journey outlined in [docs/apps-overview.md](../docs/apps-overview.md), adhering to the shared practices recorded in the root [README.md](../README.md).

## Framework Highlights
- **Router-driven screens**: `src/router.ts` implements the map from [docs/foundation-pack/01-screens-and-routes.md](../docs/foundation-pack/01-screens-and-routes.md), routing into `src/routes/*.vue`.
- **Shared styling system**: Tailwind v4 runs in stylesheet mode (`@packages/styles/app.css`), applying the tokens from [docs/foundation-pack/04-design-system.md](../docs/foundation-pack/04-design-system.md).
- **Cross-framework assets**: copy, media, and icons come from `@packages/assets`, preserving the voice and brand rules from [docs/copy.md](../docs/copy.md) and [docs/foundation-pack/03-media.md](../docs/foundation-pack/03-media.md).

## Intent and Scope
This package provides a Vue experience that stays in lockstep with the React SPA and Twig SSR builds while honoring the state-management guidance in [docs/foundation-pack/05.3-state-management.md](../docs/foundation-pack/05.3-state-management.md).

## Project Layout
- `src/main.ts` bootstraps the app, registers the router, and imports global styles.
- `src/router.ts` defines all navigation edges described in [docs/foundation-pack/01-screens-and-routes.md](../docs/foundation-pack/01-screens-and-routes.md).
- `src/routes/` delivers the screen components (Landing, Login, Signup, Dashboard, Tickets) documented in [docs/foundation-pack/05.0-components-and-states-mapping.md](../docs/foundation-pack/05.0-components-and-states-mapping.md).
- `src/components/` houses reusable atoms and molecules shared across pages.
- `src/composables/` encapsulates shared logic (auth guard, metadata, toast orchestration) consistent with the lifecycle design in [docs/foundation-pack/05.3-state-management.md](../docs/foundation-pack/05.3-state-management.md).
- `src/types/` describes the data models from [docs/foundation-pack/05.2-data-models.md](../docs/foundation-pack/05.2-data-models.md).

## State and Data Flow
- Session management uses `@packages/utils/auth`, enforcing the validation expectations from [docs/foundation-pack/05.1-validation-and-error-handling.md](../docs/foundation-pack/05.1-validation-and-error-handling.md).
- Ticket CRUD flows through `@packages/utils/tickets`, keeping business logic aligned across frameworks.
- Toast, time, and theme helpers reuse the shared utilities so cues match [docs/foundation-pack/02.0-copy.md](../docs/foundation-pack/02.0-copy.md) and [docs/foundation-pack/03-media.md](../docs/foundation-pack/03-media.md).

## UX and Accessibility
- Copy strings are injected from `@packages/assets/copy/*.json`, reflecting the tone guardrails in [docs/copy.md](../docs/copy.md) and phrasing in [docs/foundation-pack/02.1-copy-deck.md](../docs/foundation-pack/02.1-copy-deck.md).
- Media assets respect the sourcing and alt-text strategy defined in [docs/foundation-pack/03-media.md](../docs/foundation-pack/03-media.md).
- Forms surface validation feedback consistent with [docs/foundation-pack/05.1-validation-and-error-handling.md](../docs/foundation-pack/05.1-validation-and-error-handling.md), including aria attributes and focus control.

## Build and Tooling
- Vite + TypeScript deliver hot-module reloading and type safety.
- Tailwind remains stylesheet-first, keeping this app aligned with React and Twig.
- CI/CD uses the shared scripts described in the root [README.md](../README.md) so deployment stays uniform.

## Extensibility Guidelines
- Update [docs/foundation-pack/01-screens-and-routes.md](../docs/foundation-pack/01-screens-and-routes.md) before adding new routes.
- Document new component variants in [docs/foundation-pack/05.0-components-and-states-mapping.md](../docs/foundation-pack/05.0-components-and-states-mapping.md) before implementation.
- When evolving domain data, adjust [docs/foundation-pack/05.2-data-models.md](../docs/foundation-pack/05.2-data-models.md) and shared utilities to keep all frameworks in sync.

## Run
```
pnpm install
pnpm dev
```
