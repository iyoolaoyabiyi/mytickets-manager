# myTickets Manager — Twig (SSR) + Tailwind v4

The Twig package delivers a server-rendered myTickets experience aligned with [docs/apps-overview.md](../../docs/apps-overview.md) and the engineering standards documented in the root [README.md](../../README.md).

## Framework Highlights
- **Templates mirror journeys**: `templates/pages/` and `templates/partials/` match the navigation plan in [docs/foundation-pack/01-screens-and-routes.md](../../docs/foundation-pack/01-screens-and-routes.md) and the component inventory in [docs/foundation-pack/05.0-components-and-states-mapping.md](../../docs/foundation-pack/05.0-components-and-states-mapping.md).
- **Stylesheet-first Tailwind**: `packages/styles/app.css` relies on `@apply` and the tokens defined in [docs/foundation-pack/04-design-system.md](../../docs/foundation-pack/04-design-system.md), including the media guidance in [docs/foundation-pack/03-media.md](../../docs/foundation-pack/03-media.md).
- **Shared assets**: Copy, icons, and media flow from `@packages/assets`, preserving the tone in [docs/copy.md](../../docs/copy.md) and [docs/foundation-pack/02.1-copy-deck.md](../../docs/foundation-pack/02.1-copy-deck.md).

## Intent and Scope
This package powers SSR deployments where PHP/Twig renders the initial HTML shell, staying feature-equivalent with the React and Vue builds while following the lifecycle strategy in [docs/foundation-pack/05.3-state-management.md](../../docs/foundation-pack/05.3-state-management.md).

## Project Layout
- `templates/base.twig` wires the page skeleton (skip link, header, footer, toast placeholder) specified in [docs/foundation-pack/file-structure.md](../../docs/foundation-pack/file-structure.md).
- `templates/pages/` contains route-specific templates for Landing, Auth, Dashboard, and Tickets.
- `templates/partials/` stores reusable UI fragments aligned with the component/state matrix.
- `packages/styles/app.css` applies Tailwind tokens and theme rules shared across frameworks.
- `index.php` and `router.php` hydrate Twig with data shaped after [docs/foundation-pack/05.2-data-models.md](../../docs/foundation-pack/05.2-data-models.md).

## Data and Rendering Flow
- Controllers provide copy variables (`copyGlobal`, `copyLanding`, `copyLogin`, `copySignup`, `copyDashboard`, `copyTickets`, `copyTicketEdit`) sourced from the shared JSON assets, reflecting the editorial guardrails in [docs/foundation-pack/02.0-copy.md](../../docs/foundation-pack/02.0-copy.md).
- Auth state (`is_auth`) and ticket data (`tickets`, `ticket`, `stats`) map directly to the domain contracts described in [docs/foundation-pack/05.2-data-models.md](../../docs/foundation-pack/05.2-data-models.md).
- Validation messaging and error panels follow the UX patterns in [docs/foundation-pack/05.1-validation-and-error-handling.md](../../docs/foundation-pack/05.1-validation-and-error-handling.md), keeping parity with the SPA implementations.
- Progressive enhancement scripts manage interactive affordances (modals, forms) without violating the event guidance in [docs/foundation-pack/05.3-state-management.md](../../docs/foundation-pack/05.3-state-management.md).

## Accessibility and UX
- Semantic landmarks, headings, and aria attributes are baked into the templates, echoing the accessibility commitments captured in the root [README.md](../../README.md).
- Media references use the sourcing strategy in [docs/foundation-pack/03-media.md](../../docs/foundation-pack/03-media.md), including alt text guidelines.
- Copy remains configuration-driven: update the JSON assets to propagate changes across Twig, React, and Vue simultaneously.

## Build and Deployment
- Webpack compiles CSS/JS assets with the same Tailwind pipeline used by the SPA builds.
- Composer manages Twig dependencies; pnpm scripts handle asset builds to keep CI/CD aligned with the shared workflow.
- Deploy the generated `/build` files alongside PHP templates, using the automation defined in `deploy/` to release consistently with other frameworks.

## Usage
1. Provide the render variables listed above when invoking Twig.
2. Serve `/packages` statically and include `/packages/styles/app.css` in the base layout.
3. Mount controller routes via `router.php` or your framework of choice, ensuring data shapes conform to the shared models.
