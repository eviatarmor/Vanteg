# Vanteg

React monorepo for the Vanteg app shell.

## Packages

- `client/` — Vite + React + TypeScript SPA (React Router)
- `packages/ui/` — shadcn primitives and Vanteg theme tokens (`@workspace/ui`)
- `infra/terraform/` — Vanteg-owned OAuth apps, SSM secrets, Microsoft Entra app, and Google APIs

`client` depends on `@workspace/ui`. The UI package never imports from `client`.

## Features

Product code lives under `client/src/features/`. Add a page by creating a feature folder and registering it in `client/src/features/shell/model/catalog.ts` plus `client/src/app/router.tsx`. The sidebar reads the catalog; it does not import page components.

```bash
npm install
npm run dev      # Vite on http://127.0.0.1:5173
npm test
npm run build
```

Add shadcn primitives from the repo root:

```bash
npx shadcn@latest add button -c client
```

```tsx
import { Button } from "@workspace/ui/components/button"
```

## Soft auth gate (DEV)

Mock auth lives in `client/src/features/auth/model/session.ts`:

- Missing storage key in DEV/test → still authenticated (demos keep working)
- Explicit logout writes `logged-out` → AppShell redirects to `/login` (with `?next=` for deep links)
- `/login` and `/sign-up` are public; passwords use `SecretInput` (never `type="password"`)
- Set `VITE_REQUIRE_AUTH=true` for strict mode (missing key requires login even in DEV)
