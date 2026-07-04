# Valur Admin Console

Standalone export of the Valur Operations & Business Console — the `/admin` portal only, extracted from the main Valur Web Platform repo so it can be handed to another developer or dropped into its own repo.

## Running the code

```
npm i
npm run dev
```

Then open **http://localhost:5173/admin** (the app's routes are all under `/admin`, e.g. `/admin/login`, `/admin/finance/payouts`).

```
npm run build
```

produces a production build in `dist/`.

## What's in here

- `src/admin/` — the entire console: pages, layout, components, mock data, auth, and its own dark theme (`src/admin/styles/admin.css`).
- `src/app/components/ui/` — the three shared UI primitives the console depends on (`dialog.tsx`, `tooltip.tsx`, `utils.ts`), pulled in from the parent design system.
- `src/imports/PublicProfile/…png` — a single hero image used on the login screen.
- `src/styles/` — global font + Tailwind + base theme tokens (shared shadcn/ui variables the dialog/tooltip primitives rely on).

Auth, approvals, bookings, finance, users, config, and access/audit all run on mock data (`src/admin/data/mock.ts`) — there is no backend wired up yet.
