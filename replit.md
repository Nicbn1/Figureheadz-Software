# Figureheadz

A pop-art / comic-book themed e-commerce storefront for collectibles — vinyl figures, statues, and trading cards from original in-universe franchises (Starforge Chronicles, Neon Ronin, Iron Vanguard, Skyfall Legends, Crypt Keepers).

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server
- `pnpm --filter @workspace/figureheadz run dev` — run the storefront frontend
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run seed` — (re)seed the demo catalog (categories, products, variations)
- Required env: `DATABASE_URL` — Postgres connection string (managed by Replit)
- `SESSION_SECRET` is used to sign admin session tokens (HMAC)
- `ADMIN_PASSWORD` (optional) — admin panel login password; falls back to a dev default if unset
- `SQUARE_ACCESS_TOKEN` (optional) — once set, sync switches from "demo" to "live" mode (live Catalog/Inventory sync is not yet implemented — see Architecture decisions)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite (`artifacts/figureheadz`), wouter routing, shadcn/Tailwind
- API: Express 5 (`artifacts/api-server`)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec) — generates React Query hooks + Zod schemas
- Build: esbuild (ESM bundle)

## Where things live

- OpenAPI contract: `lib/api-spec/openapi.yaml` — source of truth for all API types/endpoints
- DB schema: `lib/db/src/schema/` — one file per table (categories, products, cart, orders, sync)
- API routes: `artifacts/api-server/src/routes/` (catalog, cart, orders, admin)
- Square sync placeholder + admin token auth: `artifacts/api-server/src/lib/`
- Demo catalog seed data: `artifacts/api-server/src/seed.ts`
- Frontend pages: `artifacts/figureheadz/src/pages/`
- Product images (demo, generated): `artifacts/figureheadz/public/products/`
- Brand logo: `artifacts/figureheadz/src/assets/figureheadz-logo.jpeg`

## Architecture decisions

- Built as a pnpm-monorepo `react-vite` + Express + Postgres app (this workspace's standard stack) rather than literally scaffolding Next.js as the original brief specified — same deploy-ready outcome on Replit, without fighting the platform's OpenAPI-first codegen conventions.
- Square is not connected yet. The catalog runs in a clearly-labeled "demo" mode against seeded Postgres data; `runSquareSync` in `artifacts/api-server/src/lib/square-sync.ts` is the integration point where real Square Catalog/Inventory calls should replace the demo branch once the Square connector is attached and `SQUARE_ACCESS_TOKEN` is present.
- Checkout does not yet process real payments (no payment processor connected). Placing an order creates a real `Order` row and decrements real stock; it does not charge a card. This should be replaced with Square's Web Payments SDK + Orders API once Square is connected, per the original brief ("no other payment processor").
- Admin auth is a simple password + HMAC-signed bearer token (signed with `SESSION_SECRET`), not a full user/session system — matches the brief's "password-protected admin panel" scope.

## Product

- Storefront: home (featured items + category tiles), shop/catalog with filters and sort, product detail with variations, cart, guest checkout, order confirmation, guest order history by email.
- Admin panel: password login, catalog sync status + manual "Sync Now", basic sales snapshot.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Product/variation `imageUrl` values in the DB are relative paths (e.g. `products/nova-reaper.png`) served from the frontend's `public/` folder — build the full URL as `` `${import.meta.env.BASE_URL}${path}` `` on the frontend rather than hardcoding a leading slash.
- Zod codegen: this repo's `zod` catalog version is 3.25.x, which lacks the top-level `zod.email()` (a Zod v4-only API) that Orval emits for `format: email` — keep email fields as plain `type: string` in the OpenAPI spec, or codegen + typecheck fails.
- OpenAPI component names must avoid the `<OperationIdPascal>Response`/`Body` collision pattern (e.g. avoid naming a schema `AdminLoginResponse` for an operation called `adminLogin`) — codegen will throw a TS2308 ambiguous re-export.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
