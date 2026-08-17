<div align="center">
  <img src="frontend/public/logo512.png" alt="Ligao National High School seal" width="132" />

  <h1>LnPulse</h1>

  <p><strong>LNHS Student Information System</strong></p>
  <p>A full-stack platform for managing students, academics, users, and school operations at Ligao National High School.</p>

  <p>
    <img src="https://img.shields.io/badge/React-19.1-61DAFB?logo=react&logoColor=101010" alt="React 19.1" />
    <img src="https://img.shields.io/badge/React_Router-7.5-CA4245?logo=reactrouter&logoColor=white" alt="React Router 7.5" />
    <img src="https://img.shields.io/badge/Express-5.1-000000?logo=express&logoColor=white" alt="Express 5.1" />
    <img src="https://img.shields.io/badge/Sequelize-6.37-52B0E7?logo=sequelize&logoColor=white" alt="Sequelize 6.37" />
    <img src="https://img.shields.io/badge/MySQL-Database-4479A1?logo=mysql&logoColor=white" alt="MySQL" />
    <img src="https://img.shields.io/badge/Node.js-20.19-339933?logo=nodedotjs&logoColor=white" alt="Node.js 20.19" />
  </p>

  <h3>Original Developers</h3>

  <table>
    <tr>
      <td align="center" width="33%"><strong>John Ralph P. Bone</strong><br /><sub>Original Developer</sub></td>
      <td align="center" width="33%"><strong>Dan Emmanuel G. Pispis</strong><br /><sub>Original Developer</sub></td>
      <td align="center" width="33%"><strong>John Benedict B. Candelaria</strong><br /><sub>Original Developer</sub></td>
    </tr>
  </table>
</div>

## About LnPulse

LnPulse gives LNHS one place to manage student records, academic information, grades, departments, strands, sections, curricula, users, and reports. The interface adapts to the signed-in administrator, department user, or section adviser.

### Highlights

- Dashboard statistics and active academic-period controls
- Student registration, profiles, status tracking, and academic history
- Grade and academic-performance management
- Department, strand, section, subject, and curriculum management
- Administrator, department-user, and section-adviser workflows
- Section-specific student views and report management
- MySQL-backed persistence with an explicit SQL bootstrap and migration history

## Technology stack

| Area | Technologies in this repository |
| --- | --- |
| Frontend | React `19.1`, React DOM `19.1`, React Router `7.5`, Create React App / React Scripts `5.0` |
| Forms and UI | Formik `2.4`, Yup `1.6`, React Select `5.10`, React Icons `5.5` |
| HTTP client | Axios `1.8` with a shared API client |
| Backend | Node.js `20.19`, Express `5.1`, CORS `2.8`, bcrypt `6.0` |
| Data layer | MySQL, MySQL2 `3.14`, Sequelize `6.37`, Sequelize CLI `6.6` |
| Testing | Node.js test runner, React Testing Library `16.3`, Jest through React Scripts |

## Local setup

### Prerequisites

- [Node.js](https://nodejs.org/) `20.19.0` — the version recorded in `.nvmrc`
- npm
- A local MySQL or MariaDB server
- [MySQL Workbench](https://www.mysql.com/products/workbench/) for the supported fresh-database import

Apache is not required: Express serves the API and React runs through its Node.js development server.

### 1. Clone and install

```powershell
git clone https://github.com/jrpbone/LnPulse.git
Set-Location LnPulse

Set-Location backend
npm install

Set-Location ..\frontend
npm install
```

### 2. Configure the backend

Create the local environment file from the checked-in example:

```powershell
Set-Location ..\backend
Copy-Item .env.example .env
```

Edit `backend/.env` to match your MySQL Workbench connection:

```dotenv
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=lnhs-sis
DB_USER=root
DB_PASSWORD=your-local-mysql-password
```

Use the actual port from your MySQL connection; local installations commonly use `3306` or `3307`. The `.env` file is ignored by Git and must not be committed.

### 3. Import the database

> [!WARNING]
> [`database/lnhs-sis.sql`](database/lnhs-sis.sql) is a fresh-install script. It drops and recreates the `lnhs-sis` database, so back up any existing data before executing it.

In MySQL Workbench:

1. Connect to your local MySQL server.
2. Select **File → Open SQL Script**.
3. Open `database/lnhs-sis.sql` from this repository.
4. Review the warning at the top, then execute the complete script.
5. Refresh **Schemas** and confirm that `lnhs-sis` is present.

The import creates the complete schema, records the consolidated initial migration, and inserts only the required baseline administrator. Departments, strands, sections, curriculum entries, students, academic settings, grades, and reports begin empty and are fetched from MySQL as they are created through the application.

Application startup never creates tables or inserts sample data. Use Sequelize migrations only for schema changes added after the baseline:

```powershell
Set-Location backend
npm run db:migrate
```

### 4. Start the application

Start the API from `backend/`:

```powershell
npm start
```

The backend listens on [http://localhost:3001](http://localhost:3001) unless `PORT` is set.

In a second terminal, start the client from `frontend/`:

```powershell
npm start
```

Open [http://localhost:3000](http://localhost:3000). The frontend calls `http://localhost:3001` by default; copy `frontend/.env.example` to `frontend/.env` and set `REACT_APP_API_URL` if the API uses a different origin.

## First application login

After importing the SQL bootstrap, sign in with the temporary application account:

```text
Username: admin
Password: ChangeMe123!
```

Change this password immediately from user management, then configure the active school year and semester on the dashboard. These are application credentials, not MySQL credentials.

## Common scripts

### Backend

Run from `backend/`:

| Command | Purpose |
| --- | --- |
| `npm start` | Start the Express API |
| `npm run dev` | Start the API with Nodemon reloads |
| `npm test` | Run backend unit and MySQL integration tests |
| `npm run db:migrate` | Apply migrations added after the SQL baseline |
| `npm run db:migrate:status` | Show applied and pending migrations |
| `npm run db:migrate:undo` | Roll back the latest migration; back up data first |
| `npm run db:migrate:undo:all` | Roll back all migrations; this can remove the full schema |

### Frontend

Run from `frontend/`:

| Command | Purpose |
| --- | --- |
| `npm start` | Start the React development server |
| `npm test` | Run the React test suite |
| `npm run build` | Create an optimized production build |

## Project structure

```text
LnPulse/
|-- backend/
|   |-- config/       # Environment-driven Sequelize CLI configuration
|   |-- migrations/   # Consolidated baseline and later schema changes
|   |-- models/       # Sequelize entities and relationships
|   |-- src/
|   |   |-- config/   # Runtime configuration
|   |   |-- modules/  # Domain-grouped API routes
|   |   |-- app.js    # Express application composition
|   |   `-- server.js # Database authentication and HTTP startup
|   |-- test/         # Backend and database-contract tests
|   `-- README.md     # Detailed backend and database setup guide
|-- database/
|   `-- lnhs-sis.sql # Destructive fresh-install schema and baseline admin
|-- frontend/
|   |-- public/       # Static public assets
|   `-- src/
|       |-- app/      # Providers, routes, guards, and application shell
|       |-- core/     # Cross-feature state and policies
|       |-- features/ # Screens grouped by business capability
|       |-- shared/   # Reusable API and UI building blocks
|       `-- styles/   # Global and transitional styles
|-- ARCHITECTURE.md   # Module boundaries and extension guidance
`-- README.md
```

## Documentation

- [Backend and database setup](backend/README.md)
- [Application architecture](ARCHITECTURE.md)
- [Fresh-install SQL bootstrap](database/lnhs-sis.sql)

## Troubleshooting

- **The API cannot connect to MySQL:** Confirm the server is running and that `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD` match the Workbench connection.
- **A table is missing:** For a fresh installation, execute the complete SQL bootstrap. For an initialized installation, check `npm run db:migrate:status` for later pending migrations.
- **The frontend reports network errors:** Start the backend first and confirm `REACT_APP_API_URL` points to its origin.
- **Port `3000` or `3001` is occupied:** Stop the conflicting process or set matching backend `PORT` and frontend `REACT_APP_API_URL` values.
