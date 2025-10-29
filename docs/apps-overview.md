# Application Guide

This repo ships three identical front-end experiences (Vue, React, Twig) backed by the shared utilities in `packages/`. Use this guide to run, build, and deploy each stack.

---

## Shared Prerequisites

- **Node.js ≥ 18** (required by the shared tooling). The CLI in this workspace uses pnpm; npm/yarn also work.
- **pnpm** (recommended) – `corepack enable` or `npm i -g pnpm`.
- **PHP ≥ 8.1** for serving the Twig demo (uses the built-in server).

Install once at the repo root:

```bash
pnpm install
```

This installs dependencies for `packages/`, `react/`, `vue/`, and `twig/`.

The shared modules are consumed directly by all three front-ends:

- `packages/utils/auth.ts` – localStorage-based auth/session helpers
- `packages/utils/tickets.ts` – ticket CRUD + filters + stats
- `packages/utils/theme.ts` – theme persistence & toggling
- `packages/utils/toast.ts` – toast event bus
- `packages/utils/time.ts` – relative time formatting

---

## Vue App (`/vue`)

### Develop

```bash
cd vue
pnpm dev
```

- Vite serves the app on http://localhost:5173 by default.
- The bundle consumes the shared utilities directly; no additional configuration is needed.

### Build

```bash
pnpm build
```

Outputs to `vue/dist/`. Serve that folder with any static host.

### Notes

- Toasts, auth flows, dashboard stats, and the ticket modal mirror the shared design system.
- Theme preference is synced via `packages/utils/theme` and stored in `localStorage`.

---

## React App (`/react`)

### Develop

```bash
cd react
pnpm dev
```

- Vite serves the React SPA on http://localhost:5173.

### Build

```bash
pnpm build
```

Generates production assets in `react/dist/`.

### Notes

- React hooks (`useAuthGuard`, `usePageMeta`) keep auth redirects and SEO metadata aligned with Vue.
- The shared toast/state/ticket helpers are used verbatim from `packages/`.

---

## Twig Demo (`/twig`)

The Twig app renders the same UI server-side and layers the shared utilities on top with a lightweight ES module bundle.

### Install

```bash
cd twig
npm install
```

This pulls in Tailwind (for CSS builds), esbuild (for JS bundling), and npm-run-all.

### Build assets

```bash
npm run build    # builds CSS + JS into assets/styles/style.css and assets/scripts/app.js
```

For live development:

```bash
npm run dev
```

- Runs Tailwind in watch mode and esbuild in watch mode.

### Serve

Use PHP’s built-in server or any web server pointing at `/twig`:

```bash
php -S 0.0.0.0:8080 index.php -t twig
```

Navigate to http://localhost:8080 to view the app.

### Functionality parity

- Header theme toggle, mobile nav, and logout leverage the same shared utilities.
- Login/Signup forms validate client-side, call the shared auth mock, and redirect with toasts.
- Dashboard pulls live ticket stats via `packages/utils/tickets` and shows the empty state when needed.
- Tickets page reuses the shared filters, CRUD helpers, modal flow, and toast feedback – fully functional without a SPA framework.
- Toasts render via the shared event bus to match React/Vue styling.
- SEO tags (title, description, canonical, theme color) are emitted per route from `twig/index.php` and kept in sync.

### Hosting

Everything compiles to static assets under `twig/assets/`; only PHP is required to render the Twig templates. You can:

1. Build CSS/JS (`npm run build`).
2. Deploy the `twig/` directory to any PHP host.
3. Optionally pre-render pages or integrate the Twig templates into another PHP framework.

---

## Troubleshooting

- **Node version errors** – upgrade to Node 18+ (required by esbuild and Tailwind v4). If you’re constrained to an older runtime, run the builds in a compatible environment and deploy the generated assets.
- **LocalStorage/session issues** – all demos assume a single-browser mock backend. Clear `localStorage` (`localStorage.clear()`) to reset sessions/tickets.
- **CSS/JS out of date in Twig** – rerun `npm run build` after editing shared utilities. Esbuild bundles the shared modules directly, so any changes in `packages/utils` flow through.

---

## Directory Summary

| Path | Role |
| --- | --- |
| `packages/` | Shared assets, utilities, and styles used by all stacks |
| `react/` | React SPA powered by Vite + shared utils |
| `vue/` | Vue SPA powered by Vite + shared utils |
| `twig/` | Twig/PHP demo consuming the same utilities via esbuild |
| `docs/` | Design & implementation docs, plus this platform guide |

---

With this setup, you can choose whichever stack suits your environment while keeping copy, styling, and behaviour perfectly in sync.
