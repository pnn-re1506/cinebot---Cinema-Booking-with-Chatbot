# CineBot frontend

Vite + React 18 + TypeScript SPA for the cinema booking demo.

## Run

```powershell
cd frontend
pnpm install
pnpm dev
```

The dev server proxies `/api` to `http://localhost:8080`.

### Mocks

Start with MSW instead of the backend:

```powershell
$env:VITE_USE_MOCKS = "true"
pnpm dev
```

On macOS or Linux, use `VITE_USE_MOCKS=true pnpm dev`. Handler files live in `src/mocks/handlers/` and start empty; feature tasks fill them in. The service worker is `public/mockServiceWorker.js`.

## API types

Regenerate `src/lib/api/schema.d.ts` after an integrator updates the contract:

```powershell
pnpm gen:api
```

## Checks

```powershell
pnpm lint
pnpm typecheck
pnpm test --run
pnpm build
pnpm format
```
