# LNHS-SIS Database Bootstrap Design

## Objective

Replace application-managed sample seeding with a database-first bootstrap workflow. A fresh LNHS-SIS installation will be created from one canonical MySQL file, while normal backend startup will only connect to the database and serve data already stored there.

## Scope

This change covers the database schema, Sequelize migration history, runtime database configuration, removal of the JavaScript seeder, model/schema alignment, backend setup documentation, and verification of the new workflow.

The root `README.md` is explicitly outside this change. Setup instructions will live in `backend/README.md`.

## Chosen Approach

Use a fresh-install bootstrap file at `database/lnhs-sis.sql` and a matching consolidated Sequelize initial migration. The SQL file is the supported way to initialize and minimally populate a new local database. Sequelize migrations remain the mechanism for later schema evolution.

The bootstrap is intentionally a fresh-install artifact. It must state clearly that importing it over an existing LNHS-SIS database replaces existing application tables. The implementation will generate and validate this file but will not automatically import it into the user's live database.

## Database Contract

The consolidated schema will define all tables used by the backend:

- `ADDRESS_T`
- `PARENT_GUARDIAN_T`
- `DEPARTMENT_T`
- `STRAND_T`
- `SECTION_T`
- `CURRICULUM_T`
- `USERS_T`
- `STUDENT_T`
- `ACADEMIC_INFO_T`
- `ACADEMIC_PERFORMANCE_T`
- `GRADES_T`
- `ACADEMIC_SETTINGS_T`
- `DEPARTMENT_USER_T`
- `SECTION_USER_T`
- `REPORTS_T`
- `SequelizeMeta`

Tables will use InnoDB and `utf8mb4`. The schema will include the foreign keys, cascade behavior, indexes, enumerated values, nullability, timestamps, and uniqueness rules required by current application behavior. In particular, usernames are unique, academic performance is unique per academic record, curriculum subjects are unique within a strand/grade/semester, and user assignment tables prevent duplicate assignments.

The existing incomplete migrations will be replaced by one consolidated initial migration that creates the same application schema. The SQL bootstrap will record that migration in `SequelizeMeta`, allowing subsequent Sequelize migrations to run from the correct baseline.

## Baseline Data

The bootstrap will insert exactly one application record: an active administrator account.

- Username: `admin`
- Temporary password: `ChangeMe123!`
- Role: `admin`
- Password storage: bcrypt hash only

Outside design and implementation-plan artifacts, the plaintext temporary password will appear only in `backend/README.md` as first-login documentation, not in executable JavaScript or database configuration.

All business data starts empty, including departments, strands, sections, curricula, students, guardians, addresses, academic records, grades, reports, and user assignments. `ACADEMIC_SETTINGS_T` also starts empty; the administrator selects the active school year and semester from the dashboard after first login.

## Backend Runtime and Configuration

Database configuration will move from committed credentials in JSON to environment-backed configuration. The backend will provide a safe `backend/.env.example`. A local ignored `backend/.env` may contain the supplied MySQL credentials, but the MySQL root password must not be committed or copied into documentation.

The Sequelize CLI, Sequelize model loader, and development launcher will consume the same host, port, database name, username, and password settings. Defaults may document non-secret local values, but authentication secrets come from the environment.

Backend startup will call `sequelize.authenticate()` and then start Express. It will not run `sequelize.sync()`, execute a seeder, insert defaults, or mutate schema state.

The package scripts will expose migration operations such as migrate, migration status, and rollback. Seeder-based `db:setup` and `db:seed` commands will be removed.

## Application Data Flow

The React application will continue to retrieve records through the existing Express API. Feature state begins empty, and API handlers query Sequelize models backed by MySQL. Empty business tables therefore produce empty collections, zero dashboard counts, or a missing optional academic setting rather than sample records.

No frontend demo fallback dataset will be added. Existing create, update, and delete operations continue to persist through API routes into MySQL.

## Model Alignment

Sequelize models will be reconciled with the consolidated schema so that model definitions and migrations agree on:

- column sizes and nullability;
- enum values, including the `admin` role and summer academic term;
- timestamp presence and column names;
- primary and foreign keys;
- association delete/update behavior;
- unique indexes used by route-level validation.

Refactoring will remain limited to database correctness and configuration. Unrelated route or frontend redesign is outside scope.

## Documentation

`backend/README.md` will explain:

- creation/import of `database/lnhs-sis.sql` in MySQL Workbench;
- local `.env` setup from `.env.example`;
- backend installation and startup;
- migration and rollback commands;
- the `admin` / `ChangeMe123!` first-login credentials;
- the requirement to replace the temporary password;
- the fresh-install/destructive nature of the bootstrap file.

The project-root `README.md` will not be edited.

## Error Handling

Configuration validation will fail early with a clear message for invalid numeric ports or missing required production settings. Database authentication failures will prevent server startup and retain the existing top-level error reporting. The bootstrap will use transactional or ordered DDL/data statements where MySQL permits, disable foreign-key checks only around controlled table replacement, and restore them before completion.

API behavior for empty tables remains explicit: list endpoints return empty arrays, dashboard counts return zero, and the current academic-settings endpoint may return `null` until the administrator configures it.

## Verification Strategy

Implementation follows test-first cycles for behavior-bearing code. Automated checks will verify:

- environment-backed configuration and port parsing;
- all required tables appear in both the consolidated migration and SQL bootstrap;
- the SQL bootstrap contains the administrator baseline but none of the former demo departments, users, students, guardians, or curricula;
- package scripts and runtime code contain no seeder or schema-synchronization path;
- Sequelize model metadata matches critical schema constraints;
- the root `README.md` is not part of the implementation diff.

When a local MySQL service is available, the migration will be exercised against an isolated test database and its resulting tables and constraints inspected. Verification will not run the destructive bootstrap against the live `lnhs-sis` database.

## Acceptance Criteria

1. A fresh database can be initialized from `database/lnhs-sis.sql`.
2. The initialized database contains the complete schema and only the single administrator application record.
3. The administrator chooses the initial academic period after logging in.
4. Starting the web application does not create schema or seed records.
5. Frontend data is supplied through API queries backed by MySQL.
6. Sequelize migration state matches the imported bootstrap baseline.
7. Database credentials are environment-backed and the supplied password is not committed.
8. Backend setup and temporary application credentials are documented in `backend/README.md`.
9. The root `README.md` remains unchanged by this work.
