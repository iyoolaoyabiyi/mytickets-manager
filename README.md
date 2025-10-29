# Platform Engineering Playbook

## Purpose
This platform stitches together the React, Vue, and Twig builds into a cohesive myTickets ecosystem. Regardless of framework, every feature flows from the foundational decisions captured in `docs/apps-overview.md` and the foundation pack in `docs/foundation-pack/file-structure.md`. The goal is a consistent product story, fast iteration, and predictable quality across delivery surfaces.

## Shared Modules and Tooling
- **Assets and copy** live under `packages/assets`, so all apps consume the same typography, icons, and messaging. This keeps the brand voice aligned with the guidance in `docs/copy.md`.
- **Runtime utilities** in `packages/utils` (auth, tickets, meta, time, toast, and theming) encapsulate data contracts described in `docs/foundation-pack/05.2-data-models.md` and the interaction rules captured in `docs/foundation-pack/05.3-state-management.md`.
- **Global styling** in `packages/styles/app.css` implements the design primitives defined by `docs/foundation-pack/04-design-system.md`, `docs/foundation-pack/03-media.md`, and the screen particulars from `docs/foundation-pack/01-screens-and-routes.md`.
- **Build scripts** inside `scripts/` and the deployment helpers in `deploy/` keep parity between frameworks, so each artifact can be promoted through the same pipeline.

## Engineering Principles in Practice
1. **Design-led implementation**: Wireframes and component inventories in `docs/foundation-pack/05.0-components-and-states-mapping.md` ensure that UI is composed from repeatable atoms, no matter the framework.
2. **Copy as configuration**: The copy deck (`docs/foundation-pack/02.0-copy.md` and `docs/foundation-pack/02.1-copy-deck.md`) feeds JSON assets. React, Vue, and Twig simply read from the shared data rather than hard-coding phrases.
3. **Accessible defaults**: Interaction patterns and validation flows follow `docs/foundation-pack/05.1-validation-and-error-handling.md`, so error feedback, focus management, and ARIA attributes work uniformly.
4. **State is observable and event-driven**: Shared utilities broadcast mutations (for example, ticket list refreshes) instead of coupling components. This honors the reactive guidance in `docs/foundation-pack/05.3-state-management.md`.
5. **Separation of concerns**: File layout mirrors the blueprint in `docs/foundation-pack/file-structure.md`; React and Vue split routes, components, hooks/composables, and types just like the Twig templates separate pages and partials.

## Documentation Map
- `docs/apps-overview.md` — macro view of the product surface area that each framework mirrors.
- `docs/copy.md` — editorial principles that drive the JSON copy files consumed across the apps.
- `docs/foundation-pack/01-screens-and-routes.md` — primary navigation model shared by every implementation.
- `docs/foundation-pack/02.0-copy.md` — tone rules applied to authentication and dashboard experiences.
- `docs/foundation-pack/02.1-copy-deck.md` — canonical phrases that populate the shared copy assets.
- `docs/foundation-pack/03-media.md` — sourcing and usage contracts for iconography, video, and imagery.
- `docs/foundation-pack/04-design-system.md` — tokens and components that inform the Tailwind v4 stylesheet.
- `docs/foundation-pack/05.0-components-and-states-mapping.md` — UI state permutations used to drive Storybook scenarios and Twig partials.
- `docs/foundation-pack/05.1-validation-and-error-handling.md` — validation feedback loops reflected in form helpers.
- `docs/foundation-pack/05.2-data-models.md` — domain shapes referenced by shared TypeScript and PHP types.
- `docs/foundation-pack/05.3-state-management.md` — life cycle guidance for the ticket queue and auth session.
- `docs/foundation-pack/file-structure.md` — blueprint for aligning repository layout and build artifacts.

## Delivery Workflow
Each framework-specific package uses Vite or Webpack for local DX, but the release contract is centralized:
- CI scripts lint, type-check, and bundle each app using a shared configuration to enforce parity.
- Deployment manifests in `deploy/` describe how static assets and PHP templates roll out together.
- Testing and manual QA sessions reference the acceptance criteria from the foundation pack docs, ensuring that regressions are caught before orchestration promotes new builds.

Together, these practices keep the platform maintainable while letting individual teams operate in the framework that suits their needs.
