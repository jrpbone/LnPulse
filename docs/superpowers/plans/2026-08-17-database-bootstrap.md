# LNHS-SIS Database Bootstrap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace JavaScript sample seeding with a complete MySQL bootstrap file, a matching migration baseline, environment-backed database configuration, and backend-only setup documentation.

**Architecture:** `database/lnhs-sis.sql` is the fresh-install artifact and inserts only one administrator. A consolidated Sequelize migration owns the same schema for future migration history, while backend startup only authenticates. Configuration is read from `backend/.env`, and contract tests compare the migration, SQL, package scripts, and model metadata.

**Tech Stack:** Node.js 20.19.0, CommonJS, Node test runner, Express 5, Sequelize 6, Sequelize CLI 6, MySQL/MariaDB, PowerShell development launcher.

## Global Constraints

- Do not edit the project-root `README.md`.
- Do not commit the supplied MySQL root password.
- Keep only one baseline application record: active user `admin` with bcrypt-hashed temporary password `ChangeMe123!` and role `admin`.
- Leave academic settings and every business-data table empty.
- Do not import the destructive bootstrap into the live `lnhs-sis` database during verification.
- Backend startup must not synchronize schema or seed records.

---

### Task 1: Environment-backed database configuration

**Files:**
- Create: `backend/config/database.js`
- Create: `backend/config/config.js`
- Create: `backend/.env.example`
- Create locally, ignored: `backend/.env`
- Create: `backend/test/database-config.test.js`
- Modify: `backend/models/index.js`
- Modify: `run-dev.ps1`
- Delete: `backend/config/config.json`

**Interfaces:**
- Produces: `parsePort(value, fallback) -> number`, `createDatabaseConfig(environment, nodeEnv) -> SequelizeOptions`, and `loadLocalEnvironment(filePath) -> void`.
- Produces: Sequelize CLI configuration keyed by `development`, `test`, and `production` from `backend/config/config.js`.
- Consumes: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD`.

- [ ] **Step 1: Write failing configuration tests**

Use `node:test` and `node:assert/strict` to assert that valid ports are parsed, invalid ports fall back to `3307`, environment overrides populate every Sequelize connection field, and production rejects missing `DB_NAME`, `DB_USER`, or `DB_PASSWORD`.

- [ ] **Step 2: Run the test and verify RED**

Run: `cd backend; node --test test/database-config.test.js`

Expected: failure because `config/database.js` does not exist.

- [ ] **Step 3: Implement shared configuration**

Implement strict numeric port parsing, optional native Node `.env` loading with `process.loadEnvFile`, secret-free local defaults for development, an isolated `lnhs_sis_test` default in test, and required production values. Export the CLI object from `config/config.js` and load it from `models/index.js`.

Create `.env.example` with:

```dotenv
DB_HOST=127.0.0.1
DB_PORT=3307
DB_NAME=lnhs-sis
DB_USER=root
DB_PASSWORD=
```

Create the ignored local `.env` with the user-supplied password. Change `run-dev.ps1` to obtain the port from `backend/config/config.js` instead of parsing deleted JSON.

- [ ] **Step 4: Run the test and verify GREEN**

Run: `cd backend; node --test test/database-config.test.js`

Expected: all configuration tests pass.

- [ ] **Step 5: Commit configuration changes**

```bash
git add backend/config backend/.env.example backend/models/index.js backend/test/database-config.test.js run-dev.ps1
git commit -m "refactor: load database settings from environment"
```

### Task 2: Consolidated schema migration

**Files:**
- Create: `backend/test/support/mysql-test-database.js`
- Create: `backend/test/schema-migration.test.js`
- Create: `backend/migrations/20260817000000-initialize-lnhs-sis.js`
- Delete: `backend/migrations/20240321000000-create-tables.js`
- Delete: `backend/migrations/20240321_drop_subject_t.js`
- Delete: `backend/migrations/20240322000000-add-academic-performance.js`

**Interfaces:**
- Produces: Sequelize migration `up(queryInterface, Sequelize)` creating all 15 application tables in dependency order.
- Produces: Sequelize migration `down(queryInterface)` dropping all 15 application tables in reverse dependency order.
- Consumes: the table and constraint contract in the approved design spec.

- [ ] **Step 1: Write a failing migration integration test**

Create a guarded MySQL test helper that accepts only database names beginning with `lnhs_sis_test_`, creates an isolated database through `mysql2`, and always drops that exact database during cleanup. Run the real migration through a Sequelize `QueryInterface`, then query `information_schema` to assert all required tables, foreign keys, and critical unique constraints exist. Run `down` and assert the application tables are removed.

- [ ] **Step 2: Run the test and verify RED**

Run: `cd backend; node --test test/schema-migration.test.js`

Expected: failure because the consolidated migration is missing.

- [ ] **Step 3: Implement the consolidated migration**

Create all tables with InnoDB-compatible definitions and model-compatible names. Use explicit foreign keys and delete/update behavior. Add these critical uniqueness rules:

- `USERS_T.username`
- `CURRICULUM_T(strand_id, grade_level, semester, subject_name)`
- `ACADEMIC_PERFORMANCE_T.acads_id`
- `GRADES_T(acads_id, curriculum_id)`
- assignment-table `user_id` primary keys

Use `admin`, `department_user`, and `section_user` in the user-role enum, and include `Summer Class` in academic settings.

- [ ] **Step 4: Run the test and verify GREEN**

Run: `cd backend; node --test test/schema-migration.test.js`

Expected: the real migration passes against isolated MySQL and reverses cleanly.

- [ ] **Step 5: Commit migration changes**

```bash
git add backend/migrations backend/test/schema-migration.test.js
git commit -m "feat: consolidate the LNHS-SIS schema migration"
```

### Task 3: Canonical SQL bootstrap and admin baseline

**Files:**
- Create: `database/lnhs-sis.sql`
- Create: `backend/test/sql-bootstrap.test.js`

**Interfaces:**
- Produces: a MySQL Workbench-compatible fresh-install script for database `lnhs-sis`.
- Produces: migration baseline row `20260817000000-initialize-lnhs-sis.js` in `SequelizeMeta`.
- Produces: exactly one `USERS_T` row with username `admin`, type `admin`, status `1`, and a bcrypt hash for `ChangeMe123!`.

- [ ] **Step 1: Write a failing SQL bootstrap integration test**

Load the SQL into the test harness, substitute only the literal bootstrap database identifier with a guarded `lnhs_sis_test_...` name, and execute the result through `mysql2`. Query the created database to assert all required tables exist, foreign-key checks were restored for the session, `SequelizeMeta` contains the consolidated migration, `USERS_T` contains exactly one active admin, `bcrypt.compare('ChangeMe123!', hash)` succeeds, and every other application table is empty.

- [ ] **Step 2: Run the test and verify RED**

Run: `cd backend; node --test test/sql-bootstrap.test.js`

Expected: failure because `database/lnhs-sis.sql` does not exist.

- [ ] **Step 3: Generate the bcrypt hash and write the SQL**

Generate the password hash with the installed `bcrypt` package. Write ordered drops, complete table definitions matching the migration, the `SequelizeMeta` row, and the sole administrator insert. Wrap controlled table replacement with saved/restored `FOREIGN_KEY_CHECKS` and use `utf8mb4`.

- [ ] **Step 4: Run the test and verify GREEN**

Run: `cd backend; node --test test/sql-bootstrap.test.js`

Expected: the imported isolated database has the complete schema and baseline admin only.

- [ ] **Step 5: Commit SQL changes**

```bash
git add database/lnhs-sis.sql backend/test/sql-bootstrap.test.js
git commit -m "feat: add baseline-only MySQL bootstrap"
```

### Task 4: Align Sequelize models and remove runtime seeding

**Files:**
- Create: `backend/test/model-contract.test.js`
- Create: `backend/test/no-runtime-seeding.test.js`
- Modify: applicable files in `backend/models/*.js`
- Modify: `backend/package.json`
- Modify: `backend/package-lock.json`
- Delete: `backend/seeders/seed.js`

**Interfaces:**
- Produces: model metadata matching migration column types, enum values, nullability, timestamps, keys, and unique indexes.
- Produces package scripts: `db:migrate`, `db:migrate:status`, and `db:migrate:undo`.
- Removes package scripts: `db:setup` and `db:seed`.

- [ ] **Step 1: Write failing model and startup tests**

Load real Sequelize model metadata without authenticating. Assert the admin role and academic summer term exist, assignment models have no timestamps and primary-key `user_id`, and curriculum and grades expose their composite unique indexes. Against an isolated migrated database, call the real `prepareDatabase()`, then assert all application-table row counts remain unchanged at zero. Exercise package migration commands through their observable CLI behavior during the isolated migration check.

- [ ] **Step 2: Run the tests and verify RED**

Run: `cd backend; node --test test/model-contract.test.js test/no-runtime-seeding.test.js`

Expected: failures for current schema drift and obsolete package commands.

- [ ] **Step 3: Reconcile models and scripts**

Update model attributes and indexes to match the consolidated schema. Remove the JavaScript seeder. Replace setup/seed scripts with Sequelize CLI migration/status/undo scripts. Do not add any runtime default-record creation.

- [ ] **Step 4: Run the tests and verify GREEN**

Run: `cd backend; node --test test/model-contract.test.js test/no-runtime-seeding.test.js`

Expected: all model and no-seeding contracts pass.

- [ ] **Step 5: Commit model and runtime changes**

```bash
git add backend/models backend/package.json backend/package-lock.json backend/test backend/seeders/seed.js
git commit -m "refactor: remove application-managed seed data"
```

### Task 5: Backend setup documentation

**Files:**
- Create: `backend/README.md`

**Interfaces:**
- Produces: backend-specific installation, Workbench import, migration, startup, and first-login documentation.

- [ ] **Step 1: Write backend documentation**

Document MySQL Workbench import steps, environment setup, installation/start commands, migration lifecycle, empty initial business data, admin configuration of the academic period, temporary credentials, and bootstrap replacement behavior. Do not modify the root README.

- [ ] **Step 2: Review the documentation against the approved spec**

Manually follow the documented setup sequence against the isolated test database. Confirm every command is valid, the warning appears before import instructions, the application credentials are correct, the MySQL root password is absent, and the project-root README diff is unchanged from its pre-existing state.

- [ ] **Step 3: Commit documentation**

```bash
git add backend/README.md
git commit -m "docs: add backend database setup guide"
```

### Task 6: Full verification and isolated MySQL check

**Files:**
- Modify only if verification exposes a defect in files already in scope.

**Interfaces:**
- Consumes: all test commands and migration CLI configuration from earlier tasks.
- Produces: fresh verification evidence without modifying the live `lnhs-sis` database.

- [ ] **Step 1: Run the complete backend contract suite**

Run: `cd backend; node --test test/*.test.js`

Expected: zero failures.

- [ ] **Step 2: Run frontend regression tests and production build**

Run: `cd frontend; npm test -- --watchAll=false`

Run: `cd frontend; npm run build`

Expected: tests and build exit successfully.

- [ ] **Step 3: Run syntax and migration-status checks**

Run `node --check` across changed JavaScript files. With local MySQL available, set `NODE_ENV=test`, point configuration at a uniquely named isolated test database, run `sequelize-cli db:migrate`, inspect required tables/constraints, run `db:migrate:undo:all`, and remove only that verified test database. Do not target `lnhs-sis`.

- [ ] **Step 4: Audit the final diff**

Confirm `git diff` excludes the user's pre-existing root README edits, contains no MySQL root password, contains no seed script references, and includes only planned files.

- [ ] **Step 5: Commit verification-only fixes if required**

```bash
git add backend database run-dev.ps1
git commit -m "fix: resolve database bootstrap verification findings"
```
