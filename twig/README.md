# myTickets Manager — Twig package

- Tailwind v4 stylesheet-based (`assets/styles/app.css` with `@apply`).
- Only colors in `:root` (light/dark). Fonts, spacing, radii, breakpoints in `@theme`.
- Brand accent: red.
- Templates in `templates/` mirror the routes from the copy deck.

## Render variables
Provide: `copyGlobal`, `copyLanding`, `copyLogin`, `copySignup`, `copyDashboard`, `copyTickets`, `copyTicketEdit`, `is_auth`, `theme`, `tickets`, `ticket`, `stats`.

## How to use
Point your framework's view engine to `templates/`. Link `/assets/styles/app.css` and serve `/assets` statically.
