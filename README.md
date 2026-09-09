# Vanteg

React monorepo for the Vanteg app shell.

## Packages

- `client/` — Vite + React + TypeScript SPA (React Router)
- `packages/ui/` — shadcn primitives and Vanteg theme tokens (`@workspace/ui`)
- `infra/terraform/` — Vanteg-owned OAuth apps, SSM secrets, Microsoft Entra app, and Google APIs

`client` depends on `@workspace/ui`. The UI package never imports from `client`.

## Features

Product code lives under `client/src/features/`. Add a page by creating a feature folder and registering it in `client/src/features/shell/model/catalog.ts` plus `client/src/app/router.tsx`. The sidebar reads the catalog; it does not import page components.

## Conventions

- UI: see [`docs/ui-conventions.md`](docs/ui-conventions.md) (secret fields must use `SecretInput`, never native password inputs).

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
