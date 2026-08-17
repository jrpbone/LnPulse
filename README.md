# LnPulse (LNHS-SIS)

Full Stack Web App - Student Information System for LNHS.

This is my first-ever full-stack application.

## Contributors

- John Ralph P. Bone
- Dan Emmanuel G. Pispis
- John Benedict B. Candelaria
  
## Built using

- React, JavaScript, and CSS for the frontend
- Express.js, Sequelize, and MySQL for the backend

## About the project

LnPulse helps LNHS manage student records, academic information, grades, departments, strands, sections, curricula, users, and reports from one web application. Access to features is based on the signed-in user's role: administrator, department user, or section adviser.

The project has not yet been migrated to a public domain, but it can be run locally using XAMPP.

## Features

- Dashboard with school and student statistics
- Student registration, profiles, status, and academic history
- Grade and academic-performance management
- Department, strand, section, subject, and curriculum management
- User accounts with role-based access
- Section-specific student views for advisers
- Report management

## Requirements

Install the following before running the project:

- [Node.js](https://nodejs.org/) `20.19.0` (the version recorded in `.nvmrc`)
- npm
- [XAMPP](https://www.apachefriends.org/) with MySQL

## How to run

### 1. Prepare the project

Clone or download the repository. Keep its three main items together: the `frontend` folder, the `backend` folder, and this `README.md` file.

Install the backend dependencies:

```bash
cd backend
npm install
```

Install the frontend dependencies in a second terminal:

```bash
cd frontend
npm install
```

### 2. Start XAMPP and configure MySQL

Open XAMPP and start the Apache and MySQL servers.

Create an empty MySQL database named:

```text
lnhs-sis
```

The development database connection is configured in `backend/config/config.json` with these defaults:

| Setting | Default |
| --- | --- |
| Host | `localhost` |
| Port | `3307` |
| Username | `root` |
| Password | empty |
| Database | `lnhs-sis` |

Make sure the configured port matches the MySQL port shown in XAMPP. XAMPP often uses port `3306`; if yours does, update the development `port` in `backend/config/config.json` before starting the backend.

### 3. Initialize a new database

For a brand-new, empty database, run the explicit setup command from `backend/`:

```bash
npm run db:setup
```

This safely creates missing tables and runs the single database seeder. It does not drop existing tables or records.

To apply the seed data to an existing schema, run:

```bash
npm run db:seed
```

The seeder is deterministic, transactional, and idempotent: rerunning it fills in missing seed records without duplicating them, and a failure rolls back that run. Application startup never creates, resets, or seeds tables.

### 4. Start the backend

Run the backend first, as originally recommended:

```bash
cd backend
npm start
```

The API runs at [http://localhost:3001](http://localhost:3001).

For development with automatic server restarts, use:

```bash
npm run dev
```

### 5. Start the frontend

In a separate terminal, run:

```bash
cd frontend
npm start
```

Open [http://localhost:3000](http://localhost:3000) in a browser. The frontend sends API requests to `http://localhost:3001` by default; set `REACT_APP_API_URL` when the backend uses another origin.

## Seeded development accounts

The seeder creates department and adviser accounts with the development password `password123`. Set `SEED_DEFAULT_PASSWORD` before the first seed to choose a different password. Existing account passwords are never overwritten by later seed runs. Example usernames include `tvl_head`, `feh_head`, `ams_head`, `humss_adviser`, `stem_adviser`, and `abm_adviser`.

These credentials are for local development only. Change the passwords before using the application with real data.

## Available scripts

### Backend

Run these commands from `backend/`:

| Command | Description |
| --- | --- |
| `npm start` | Starts the Express API with Node.js |
| `npm run dev` | Starts the API with Nodemon and reloads after file changes |
| `npm run db:setup` | Creates missing tables and runs the safe database seed |
| `npm run db:seed` | Idempotently seeds an existing database schema |

### Frontend

Run these commands from `frontend/`:

| Command | Description |
| --- | --- |
| `npm start` | Starts the React development server |
| `npm test` | Runs the Create React App test runner |
| `npm run build` | Creates an optimized production build |

## Project structure

```text
LnPulse/
|-- backend/
|   |-- config/       # Sequelize/database configuration
|   |-- migrations/   # Database schema history
|   |-- models/       # Sequelize models and relationships
|   |-- seeders/
|   |   `-- seed.js   # Single transactional, idempotent seeder
|   |-- src/
|   |   |-- modules/  # API routes grouped by business domain
|   |   |-- app.js    # Express application composition
|   |   `-- server.js # Database and HTTP startup
|   `-- index.js      # Minimal process entry point
|-- frontend/
|   |-- public/       # Static public assets
|   `-- src/
|       |-- app/      # Providers, routes, guards, and application shell
|       |-- core/     # Cross-feature state and policy
|       |-- features/ # Screens grouped by business capability
|       |-- shared/   # Reusable API and UI building blocks
|       `-- styles/   # Global and transitional styles
|-- ARCHITECTURE.md   # Module boundaries and extension guidance
`-- README.md
```

## Troubleshooting

- **The backend cannot connect to MySQL:** Confirm that MySQL is running, the `lnhs-sis` database exists, and the credentials and port in `backend/config/config.json` match XAMPP.
- **The frontend shows network errors:** Start the backend first and confirm that it is listening on port `3001`.
- **A table does not exist in a new database:** Complete the one-time database initialization step above.
- **Port `3000` or `3001` is already in use:** Stop the conflicting process, or set backend `PORT` and frontend `REACT_APP_API_URL` to matching values. Copy `frontend/.env.example` to `frontend/.env` for a local frontend override.
