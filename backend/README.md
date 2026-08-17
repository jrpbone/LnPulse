# LNHS-SIS Backend Setup

This directory contains the Express, Sequelize, and MySQL backend for LnPulse. Application startup only connects to MySQL; it does not create tables or insert sample data.

## Requirements

- Node.js `20.19.0`
- npm
- MySQL or MariaDB accessible from MySQL Workbench

## 1. Configure the database connection

Copy `.env.example` to `.env` inside `backend/`:

```powershell
Copy-Item .env.example .env
```

Set the values to match the connection configured in MySQL Workbench:

```dotenv
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=lnhs-sis
DB_USER=root
DB_PASSWORD=your-local-mysql-password
```

MySQL commonly uses port `3306`; some XAMPP installations use `3307`. Use the port shown by your actual Workbench connection. The `.env` file is ignored by Git and must not be committed.

## 2. Initialize a fresh database in MySQL Workbench

> **Warning:** [`../database/lnhs-sis.sql`](../database/lnhs-sis.sql) is a fresh-install script. It drops and recreates the `lnhs-sis` database. Back up an existing database before running it.

1. Open MySQL Workbench and connect to the local MySQL server.
2. Select **File > Open SQL Script**.
3. Open `database/lnhs-sis.sql` from the project directory.
4. Review the warning at the top of the script.
5. Execute the complete script.
6. Refresh the **Schemas** panel and confirm that `lnhs-sis` exists.

The import creates the complete schema and only one application user. Departments, strands, sections, curriculum entries, students, academic settings, grades, and reports all start empty.

## 3. Install and start the backend

From `backend/`, run:

```powershell
npm install
npm start
```

For automatic restarts during development:

```powershell
npm run dev
```

The API listens on `http://localhost:3001` unless `PORT` is set in the process environment.

## First application login

Use these temporary application credentials after importing the SQL file:

```text
Username: admin
Password: ChangeMe123!
```

The password is stored in MySQL as a bcrypt hash. Sign in, replace this temporary password immediately from user management, and then configure the active school year and semester on the dashboard. The SQL import deliberately leaves academic settings empty so the administrator controls the initial period.

These are application credentials, not MySQL Workbench credentials.

## Database migrations

The SQL bootstrap records the consolidated initial migration in `SequelizeMeta`. Use Sequelize migrations for schema changes added after that baseline.

```powershell
# Apply pending migrations
npm run db:migrate

# Show applied and pending migrations
npm run db:migrate:status

# Roll back the most recent migration (potentially destructive)
npm run db:migrate:undo

# Roll back all migrations (destructive)
npm run db:migrate:undo:all
```

> **Rollback warning:** Back up the database before either rollback command. If the consolidated initial migration is the most recent applied migration, even `db:migrate:undo` drops every LNHS-SIS application table and its data. `db:migrate:undo:all` does the same as part of rolling back the complete history.

Do not use `db:migrate` as a substitute for the initial SQL import: migrations create schema, while the supported bootstrap also installs the one required administrator account.

## Tests

Start the configured local MySQL service, then run:

```powershell
npm test
```

The integration tests generate unique, guarded database names beginning with `lnhs_sis_test_`, create them without replacing pre-existing databases, and remove only the databases created by that test run. They never import the bootstrap over `lnhs-sis`.

## Runtime data behavior

- The server authenticates with MySQL before accepting requests.
- The server never runs `sequelize.sync()` or a data seeder.
- API list endpoints read persisted MySQL rows and naturally return empty collections for empty tables.
- Dashboard counts come from database queries and begin at zero except for the single active administrator user.
- New departments, users, students, curricula, grades, settings, and reports are created through the application API and persisted in MySQL.
