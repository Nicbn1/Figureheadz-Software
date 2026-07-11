---
name: Orval + Zod v3 codegen pitfalls
description: Two OpenAPI spec mistakes that break `pnpm --filter @workspace/api-spec run codegen` (its typecheck step) in this monorepo's Orval + Zod setup.
---

## `format: email` breaks typecheck

This workspace's `zod` catalog version is 3.25.x. Orval's Zod generator emits `zod.email(...)` for any string schema with `format: email`, but top-level `zod.email()` is a Zod v4-only API not present on the v3 package — `tsc --build` fails with `Property 'email' does not exist on type typeof zod`.

**Why:** Orval assumes a Zod version whose top-level API includes v4-style format helpers; this repo pins v3.
**How to apply:** Keep email fields as plain `{ type: string }` in `openapi.yaml` (validate format manually in route handlers/frontend) instead of `{ type: string, format: email }`, until the workspace's zod catalog version is bumped to a version where `zod/v4` subpath or top-level v4 API is what Orval targets.

## Schema names shaped like `<OperationIdPascal>Response`/`Body` collide

If a component schema name happens to match the auto-derived name Orval would generate for another operation's inline body/response (e.g. a schema named `AdminLoginResponse` when there's an operation `adminLogin`), the generated `lib/api-zod/src/index.ts` barrel re-export becomes ambiguous — TS2308 "already exported a member".

**Why:** Orval names inline request/response types `<OperationIdPascal>Body` / `<OperationIdPascal>Response` by convention; an explicitly-named component with the same shape collides in the generated barrel.
**How to apply:** Name request/response component schemas after the entity they represent (e.g. `AdminCredentials`, `AdminSession`), never `<OperationName>Input`/`Response`-style names that could coincide with Orval's auto-derived names for a same-named operation.
