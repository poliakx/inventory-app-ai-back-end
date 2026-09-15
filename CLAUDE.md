# Inventory App Backend — AI Context

## Project
Node.js/Express/PostgreSQL REST API for gastronomy inventory management — backend for Kitchen OS SaaS.

- Full product context (features, roadmap, roles): `../product/PRODUCT_SPEC.md`
- Frontend counterpart: `../inventory-app-ai-front-end/CLAUDE.md`
- New ideas / backlog: `../product/IDEAS.md`

Read PRODUCT_SPEC.md when the conversation is about *what* to build, not *how*.

---

## Stack
Node.js (ESM) · Express · PostgreSQL (pg) · Redis · Docker · Jest + Supertest · Zod

## Architecture (non-negotiable)
`routes → controllers → services → repositories → db`

- **Controllers**: req/res handling only. No business logic.
- **Services**: business logic, orchestration, transactions, security checks.
- **Repositories**: parameterized SQL only. No business logic. No transactions started here — they receive a db executor.

## Multi-Tenancy (critical)
- Every query scoped by `organization_id` from `req.user` — never from body/query/params.
- Cross-org access → `404`, not `403` (don't confirm the resource exists).
- Applies to every current and future resource without exception.

## Auth
JWT access + refresh. Refresh tokens hashed in DB, rotation enabled, reuse detection revokes all user tokens.

## Security — non-negotiable
Never: trust client-supplied `organization_id`/ownership · store raw refresh tokens · swallow errors · concatenate raw SQL · return raw DB errors to client.

**Escalation rule:** if you or I find a security issue while working, flag it inline as `[BLOCKER]` in the response and in a code comment. Do not build further features on top of it until it's resolved or I explicitly say to defer it.

## AI Collaboration Mode
Default: senior mentor. Explain, ask leading questions, point to exact file/line, let me write the fix myself.

Exception: write code directly only when I explicitly say "напиши" / "зроби за мене" / "виправ сам" — applies to the *current* request only, does not carry forward to later requests even on the same feature.

After any non-trivial piece of code (mine or yours-with-permission) is done: ask me 1-2 questions checking my understanding of the logic or edge cases before marking it complete.

## Testing Standard
Every resource needs: CRUD happy path · 401/403 · multi-tenant isolation (cross-org → 404) · validation (400). Reset DB between tests via `cleanDB` helper. No resource ships without this coverage — recipes currently violates this, see below.

---

## Known Open Issues
_(update this list as items are resolved — do not let it silently go stale)_

- ~~`[BLOCKER]` recipes: `replaceIngredients` doesn't validate `productId` belongs to the recipe's organization~~ — fixed 2026-07-18 (`d71432b`): `productsRepository.findByIds` + Zod duplicate check + service-level ownership check before the write transaction
- ~~`[BLOCKER]` recipes + products: `categoryId` accepted from client with no organization check~~ — fixed 2026-07-18 (`259dc7c`): `categoryRepository.findById` added, wired into `recipes.service.js` and `products.service.js` before the write
- ~~recipes: update schema marks all fields optional → omitting a field on PUT nulls it~~ — fixed 2026-07-20 (`ff23385`): `qUpdateRecipe` uses `COALESCE($n, column)`, repository sends real `null` for omitted fields (including `yieldUnit`, previously defaulted to "g")
- ~~recipes: `foodCost` calculation ignores unit conversion between recipe and product units~~ — resolved 2026-07-21: not a code bug, it's a doc/convention issue. `computeFoodCost` (`quantity × price`) is correct as long as `products.price` always means "price per `products.unit`" — confirmed this holds structurally (`ingredientSchema` has no unit field of its own, always inherits the product's unit). Fixed the misleading "ціна за кг" wording in `PRODUCT_SPEC.md` instead of touching the calculation. See Decision Log entry 2026-07-21.
- ~~recipes: N+1 queries in `getAll` and `replaceIngredients`~~ — fixed 2026-07-24 (`8f4e2ba`): `getAll` batches ingredient fetch via `qGetIngredientsByRecipeIds` (`= ANY($1::uuid[])`) + `Map` grouping instead of per-recipe queries; `replaceIngredients` uses a dynamically-sized multi-row `INSERT` instead of a per-ingredient loop
- ~~recipes: zero test coverage~~ — fixed 2026-07-25: `tests/integration/recipes/recipes.test.js` covers CRUD happy path, 401/403, cross-org isolation (404), validation (400, including duplicate `productId`). New helpers: `tests/helpers/product.helper.js` (`createProduct`), `authorization()` added to `auth.helper.js`. Full suite: 11 test files, 46 tests, all passing.
- ~~recipes: `createRecipe`/`updateRecipe` responses don't include `foodCost`/`foodCostPercentage`~~ — fixed 2026-07-26: both now call `getIngredients(id, client)` after writing (fresh data with `productPrice` via `JOIN`, since `replaceIngredients`'s own `RETURNING` doesn't have it) and wrap the result with `withFoodCost`. `updateRecipe`'s two branches (ingredients changed vs not) both converge on the same fresh fetch, no more asymmetry. Test coverage added for both.
- ~~category: `qFindById` had a typo (`organization_id = 1$1`) that would have thrown on every lookup~~ — fixed independently on `main` (`87b2d8d`) while `chore/update-readme` was reconciled; kept `main`'s corrected query during the merge.
- `[BLOCKER]`-adjacent (UX, not security): Zod v4 (`^4.3.6`) silently ignores the old `{ required_error, invalid_type_error }` constructor syntax used in **every** validation schema (`auth`, `product`, `recipe`, `category`, `organization`, `stock_movement`) — client sees Zod's generic message ("Invalid input: expected string, received undefined") instead of the intended custom one. `error.middleware.js` forwards `issue.message` straight through to the client (`errors: [{ field, message }]`), so this reaches the UI as-is. Confirmed live on the login page (empty/invalid fields show "Invalid input..."). Per-check messages (`.positive("...")`, `.min(1, "...")`) still work fine — only the constructor-level object is affected. Needs a dedicated pass migrating every schema file to Zod v4's `{ error: (issue) => ... }` syntax. Discovered 2026-08-27 while adding `.coerce` to `product`/`recipe`/`stock_movement` create schemas.
- Full test suite (`npm test`) has cross-file isolation issues — files pass individually but many fail when run together (login, user, organization, category, recipes, products, stock-movements); likely parallel Jest workers hitting the shared test DB concurrently. Discovered 2026-09-14 while adding portionWeight to recipes — unrelated to that change (recipes.test.js passes 10/10 in isolation).
- ~~products: `updateProduct` silently wiped an existing category when `categoryId` was omitted from the request (`category_id: categoryId ?? null` couldn't distinguish "omitted" from "explicit null")~~ — fixed 2026-09-06 (`a3b1ab5`): `categoryId` is now `.nullish()` in `product.schema.js` (allows explicit `null`); `updateProduct` branches on the value's actual state — `undefined` calls a new `qUpdateProductWithoutCategory`/`updateWithoutCategory` that never touches the column, `null`/a real id go through the existing path (ownership check only for a real id). Test added covering omit-preserves-category. Found along the way: shared `tests/helpers/product.helper.js` had a wiring bug (wrong field name + wrong value shape) that meant `createProduct()` never actually attached a category anywhere it was used, including 7 spots in `recipes.test.js` — fixed as part of the same commit. Still open: `avg_weight_grams`/`avg_volume_ml` have the same nullable-column shape and haven't been checked yet; the two branches in `updateProduct` now duplicate the "not found + cache invalidation" block instead of sharing it (correct, but not DRY) — both minor, not blockers.

## Current Priorities
1. Recipes review fully closed, `chore/update-readme` reconciled into `main` — move to Phase 1 backend items (see PRODUCT_SPEC.md roadmap)
2. Move on to Phase 1 backend items (see PRODUCT_SPEC.md roadmap)

## End of Session Checklist

Перед тим як вважати фічу/сесію завершеною, пройди по пунктах і коротко звітуй що саме оновив (або що оновлювати не було потреби):

1. Known Open Issues (цей файл) — чи закрились якісь пункти? Чи з'явились нові проблеми, які варто зафіксувати?
2. PRODUCT_SPEC.md — чи змінився статус модуля (не почато → в процесі → готово)? Онови одним реченням, якщо так.
3. IDEAS.md — чи виникли думки/питання під час роботи, які не стосуються поточної задачі? Запропонуй додати, не додавай сам без підтвердження.
4. Якщо це backend і зʼявився security-момент — переконайся, що він позначений `[BLOCKER]`, а не загублений в тексті.

Не редагуй SPEC/IDEAS без мого explicit "так" — тільки пропонуй конкретну правку одним реченням, я підтверджую.
