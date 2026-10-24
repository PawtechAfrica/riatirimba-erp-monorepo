# Riatirimba Finance Service

Fee microservice for Riatirimba Technical and Vocational College — versioned
fee structures, personal-term resolution, obligations, payments, and
credit carry-forward. Built from `riatirimba_finance_spec_v5.md`.

## Status

**Models only, so far.** 15 Sequelize models (13 active tables + 2 dormant
module-billing tables), fully associated. No migrations/seeders yet, no
routes/controllers/services yet, no validators yet — that's the next step.

## Stack

- Express
- Sequelize (Postgres)
- Zod (env validation now; request validation next)
- Your own `verifyJwt.js` (drop it into `src/middlewares/`)

## Setup

```bash
pnpm install
cp .env.example .env
```

Edit `.env` — at minimum set `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`,
and `JWT_SECRET`. Make sure the Postgres database named in `DB_NAME` already
exists (create it manually — `createdb riatirimba_finance` — the app doesn't
create the database itself, only the tables).

```bash
pnpm dev
```

On boot, `DB_SYNC=true` (default in `.env.example`) makes Sequelize create/
alter tables directly from the models — that's the stand-in for migrations
until we add real ones. Turn `DB_SYNC` off once migrations exist.

Check it's alive:

```bash
curl http://localhost:4000/health
```

## Structure

```
src/
  config/
    env.js         # zod-validated process.env
    database.js    # single Sequelize instance (underscored: true)
  database/
    models/        # one file per table + index.js loader (associations)
  middlewares/      # <- put your verifyJwt.js here
  routes/           # empty — next step
  controllers/      # empty — next step
  services/         # empty — next step (fee resolution, enrollment processing, waterfall)
  utils/
    generateId.js   # prefixed IDs, e.g. OBL-4F9A2C1D, FS-7K2N0QRS
  validators/       # empty — zod request schemas, next step
  app.js
  server.js
```

## Design notes / assumptions carried over from the spec

- IDs are prefixed strings (`VH-...`, `FS-...`, `OBL-...`) generated via
  `utils/generateId.js`, not raw UUIDs and not human-typed — matches the
  spec's `VARCHAR(20)` PKs and readability in logs/receipts.
- `fee_structures.scope_id` and `module_fee_structures.scope_id` are
  intentionally **not** Sequelize associations — per the spec's own DDL
  they're polymorphic (department id OR programme id OR null), not a real
  FK. Scope cascade resolution belongs in the service layer.
- `student_id` (and other Academics-owned identifiers) stay plain string
  columns — Academics is a separate service, so there's no local `students`
  table to foreign-key against.
- `underscored: true` is set globally in `config/database.js`, so every
  model's camelCase attributes map automatically to the spec's snake_case
  columns without needing a `field:` on every single one (still added
  explicitly in a few spots for clarity/safety).
- Module billing tables (`ModuleFeeStructure`, `ModuleFeeLine`) are modeled
  and associated but intentionally unused elsewhere, per spec §3.14/§8 ("no
  code touches them" until the feature flag lands).
