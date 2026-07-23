# Module generator — team guide

Scaffolds a complete CRUD feature module (types, zod schema, API client, service,
React Query hooks, table columns, form modal, list/view pages, tests) and wires it into
the app automatically — routes (permission-gated via `RoutePermissionGuard`), endpoints,
feature barrel. Sidebar nav is
*not* part of that wiring: `Sidebar.tsx` renders a menu tree fetched from the `menus`
API (`useMenusTreeQuery`), not a hardcoded list, so there's no file for the generator to
touch — see "After generating" below.

## Create a module

**Interactive** (recommended):
```
npm run scaffold module new
```
Prompts for the module name, then a **form mode** (see below), then loops "add a field?" —
asking name, type, required, min/max/pattern/enum-options — until you say no.

**Non-interactive** (scripting, or when you already know the fields):
```
npx hygen module new --name Product --form-mode static --fields "name:string:required,min=2,max=80;sku:string:required,pattern=^[A-Z]{3}-\d{4}$;price:number:required,min=0;category:enum:required,options=electronics|clothing|food;in_stock:boolean;status:enum:required,options=active|inactive|draft"
```
`--form-mode` defaults to `static` when omitted. `--fields` is required for static mode but
optional for dynamic mode (which doesn't use it — see below):
```
npx hygen module new --name SkuManagement --form-mode dynamic --display-field sku_name
```
`--display-field` is optional too — it defaults to `<module>_name` (e.g. `sku_management_name`
here) when omitted, so pass it whenever the real backend field doesn't follow that convention.
Interactive mode asks for this instead of defaulting it silently, with the same convention
pre-filled — press Enter to accept it or type the real field name.

## Standard module APIs

Every generated module assumes the same 9-endpoint backend contract, regardless of form
mode:

```
GET    /<module>                              list (paginated/filtered/sorted)
POST   /<module>                               create
GET    /<module>/{id}                          getById
PUT    /<module>/{id}                          update
DELETE /<module>/{id}                          remove
GET    /<module>/active/list                   activeList
GET    /<module>/export/excel                  exportExcel
POST   /<module>/approvals/{requestId}/approve  approve
POST   /<module>/approvals/{requestId}/reject   reject
```

- **`activeList`**: a flat, active-only list — generated as an API method
  (`<Plural>Api.activeList()`) and a ready-to-use `use<Plural>ActiveListQuery` hook, but
  **not wired into any UI automatically** (infrastructure only, matching
  `roles/active/list` today). Wire it up by hand when another module needs this one as a
  dropdown/reference-data source.
- **`exportExcel`**: generated as a `useExport<Plural>Excel` mutation on the list page's
  "Export" button — triggers the request with the current filters, downloads the response
  as a blob (same pattern as `role-permissions`' Excel export).
- **`approve`/`reject`**: **per-module**, not the shared `@/features/approvals` feature —
  each module gets its own `approve(requestId)`/`reject(requestId, comment)` API methods
  and `useApprove<Module>Mutation`/`useReject<Module>Mutation` hooks, invalidating only
  this module's own list query. The list page wires these into the shared
  `ApprovalReviewModal`/`ApprovalStatusCell` components (`@/components/shared/`, `@/lib/approval`)
  — those stay shared/reusable; only the mutations and endpoints are module-scoped. The
  domain type extends `WithRecordApproval` (`approval`, `record_approval_status`), and
  `<Plural>ListParams`/`<Plural>ListResult` carry `include_approval`/`pendingCreates` to
  match the real list endpoint's shape — `pendingCreates` (new-record creation requests
  awaiting approval) is captured in the type but has no generated UI yet; there's no
  existing pattern in the app to mirror for it.
- Gated behind a fourth permission action, `'approval'` (`useRoutePermissionGuard(ROUTES.<module>, 'approval')`),
  alongside the existing `add`/`edit`/`delete`.

## Form mode: static vs. dynamic

- **static** (default) — today's behavior: prompts you for the module's fields, then
  generates a hand-coded `zod` schema (`schemas/<module>Schema.ts`) and hand-coded
  `<FormField>`/`<Input>`/`<Select>` JSX in `<Module>FormModal.tsx`, plus table columns
  (`components/columns.tsx`), the domain type, and list/view pages — all derived from
  those fields.
- **dynamic** — **doesn't ask for fields at all.** The backend owns this module's fields
  end to end, so Hygen has nothing to prompt for:
  - **Add/Edit form**: `<Module>FormModal.tsx` wraps the existing server-driven form
    engine (`@/forms/DynamicFormContainer`), which fetches a `DynamicFormSchema` JSON from
    the API at runtime (`formId="<module>-form"`, via `@/services/formService`) and
    renders/validates whatever fields that JSON currently defines. No local schema file is
    generated (`schemas/` is omitted entirely). `Create<Module>Input`/`Update<Module>Input`
    are the loose `Record<string, unknown>` rather than a field-by-field interface — Hygen
    has no visibility into the real payload shape.
  - **List page columns**: also **not** generated (`components/columns.tsx` is omitted
    entirely). `<Module>ListPage.tsx` calls `useDynamicColumns` (`@/forms`) instead, which
    fetches the *same* schema the form uses (same `formId`, shared React Query cache) and
    turns its fields into table columns — so the listing always matches whatever fields the
    backend actually defines, with nothing to keep in sync by hand. A field can opt out of
    the listing with `showInList: false` (e.g. a `password` field) or opt in in the rare
    case that isn't the right default — see `DynamicFieldConfig.showInList` in
    `forms/dynamicFormTypes.ts`.
  - **Everything else** (domain type, view page, search/sort/status-filter UI, and the list
    page's default sort) still comes from a small `<display-field>` + `status` field pair.
    `status` is assumed unprompted (every module in this codebase has one); the display
    field's *name* is asked for (see `--display-field` above) rather than hardcoded, because
    getting it wrong is a real, silent-until-you-hit-it bug: the wrong name means `sort_by`
    doesn't match a real backend column (a 400 the first time anyone sorts) and delete
    dialogs/the view page render blank text. Extend the generated type by hand once the rest
    of the real fields are known, the same way `features/branches` was after being
    scaffolded this way. (Only the form and the list columns are actually schema-driven
    today; the view page hasn't been converted yet.)

  Choose dynamic when the module's fields are expected to be backend-configurable; choose
  static when it's a fixed, small set of fields you're happy to own on the frontend.

**Field syntax**: `name:type:rule,rule` — fields separated by `;`.

| | |
|---|---|
| `type` | `string`, `email`, `phone`, `number`, `boolean`, `enum`, `date` |
| rules | `required` (default) / `optional`, `min=N`, `max=N`, `pattern=REGEX`, `options=a\|b\|c` (enum only) |

Give a field the exact name `status` **and** type `enum` to get a generated `StatusBadge`
component with automatic tone coloring (success/warning/danger) — any other type or name
just renders as a plain field.

**Field names are kept exactly as typed** — use snake_case matching the real API's wire
field names (e.g. `unit_price`, not `unitPrice`), since the generated type/schema/API
layer has no camelCase\<->snake_case translation step; the field key you type becomes the
JSON key sent to and received from the backend.

## Generated tests

A **static**-mode module gets three Vitest files; **dynamic**-mode gets two (no schema
file means no schema test) and a simpler `FormModal.test.tsx`. Run with `npm test` (or
`npm run test:watch`):

| File | Static mode | Dynamic mode |
|---|---|---|
| `schemas/<module>Schema.test.ts` | Each field's zod rules, checked independently via `.shape.<field>.safeParse(...)` — required/min/max/pattern/enum/etc. | Not generated — there's no local schema. |
| `components/<Module>FormModal.test.tsx` | Renders every field; fills valid input and asserts the create mutation fires; asserts a validation error blocks submit when required fields are empty. | Mocks `@/services/formService`'s `fetchFormSchema` and just confirms the modal opens and the dynamic form loads — it can't assert individual fields, since their shape isn't known at generation time. |
| `pages/<Module>ListPage.test.tsx` | Renders the seeded record; opens the create modal. | Same mock feeds `useDynamicColumns` too (it shares the schema fetch), so the seeded record's assertion is `await screen.findByText(...)` — the column it appears in doesn't exist until that fetch resolves. |

Component tests mock `@/features/<module>/hooks` entirely (React Query/mutations
aren't exercised for real) and `@/auth/hooks`'s `useRoutePermissionGuard` — these are smoke
tests confirming the generated wiring wires up cleanly, not integration tests.

Two caveats below apply to **static mode only** (dynamic mode has no generated schema/form
fields for these rules to apply to):

**Fields with a custom `pattern=`** have no auto-generated value that's guaranteed to
match an arbitrary regex, so the generator leaves a `// TODO` in the schema test's
positive case and skips the FormModal submit-flow test entirely (with a comment
explaining why) rather than guessing a value that might not satisfy the pattern. Fill
those in by hand if you want that coverage.

**A module with no required string/email/phone/number field** (all enum/boolean, which
are always valid by default) skips the "shows a validation error" test — there'd be
nothing to assert since submitting the untouched form would actually succeed.

## After generating

Refresh the page (or log out/in) — permissions are re-fetched on every load. Whether the
new module's routes/actions are visible depends on what the real `/permissions/me` (and
each listing endpoint's embedded `permissions` block) grant the current role for
`/admin/<module>` — a super-admin sees everything immediately; anyone else needs the
backend's RBAC data updated for the new route first. The module itself is live at
`/admin/<module>`, routable directly, as soon as it's generated.

**To add it to the sidebar**, create a `Menu` record for it (via the Menus admin page at
`/admin/menus`, or however menu data gets seeded in your environment) with `route` pointing
at `/admin/<module>` — the sidebar tree is entirely data-driven, so there's no code to
generate or edit for this step.

## Regenerating an existing module

Generation prompts "overwrite?" per file that already exists. To skip those prompts (e.g.
after tweaking a template and re-running for the same module):
```powershell
$env:HYGEN_OVERWRITE=1; npx hygen module new --name Product --fields "..."; Remove-Item Env:\HYGEN_OVERWRITE
```
The 4 shared-file updates are idempotent regardless — re-running for a module that's
already wired in is a no-op for those files.

## Reverting a module (created by mistake, or no longer needed)

```
npm run unscaffold -- --name Product
```
Deletes `src/features/<module>/` and removes that module's entries from the 4 shared files
(`apiEndpoints.ts`, `routes.ts`, `features/index.ts`, `app/routes.tsx`).

Asks for confirmation before deleting — pass `--yes` to skip the prompt (e.g. in a script).
If a shared file was hand-edited since generation and no longer matches exactly, the script
warns which file to check by hand rather than guessing. It doesn't touch any `Menu` record
you created for the module's sidebar entry — remove that separately if needed.

Always run `npx tsc -b --noEmit` after reverting to confirm nothing else in the app still
references the removed module.

## What gets touched

| File | New module | Reverted |
|---|---|---|
| `src/features/<module>/` | created | deleted |
| `src/constants/apiEndpoints.ts` | 2 lines added | removed |
| `src/constants/routes.ts` | 2 lines added | removed |
| `src/features/index.ts` | 1 line added | removed |
| `src/app/routes.tsx` | 2 lazy imports + 1 route block added | removed |

The 3 test files live inside `src/features/<module>/` alongside the code they test, so
reverting a module deletes them automatically — no separate cleanup step.

Each shared file has a `// hygen:*` marker comment — don't remove those, they're the
anchor the generator (and the revert script) use to find where to inject/strip content.
