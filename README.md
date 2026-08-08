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

For a brand-new, empty database, open `backend/index.js` and temporarily change:

```js
const FORCE_SYNC = false
```

to:

```js
const FORCE_SYNC = true
```

Start the backend once with `npm start`. This creates the tables and loads the project's initial departments, strands, sections, subjects, users, and sample student data. Stop the backend afterward and immediately change `FORCE_SYNC` back to `false`.

> [!WARNING]
> Starting the backend with `FORCE_SYNC = true` deletes all existing data. Use it only when initializing or intentionally resetting the local database.

If the database has already been initialized, leave `FORCE_SYNC` set to `false` and skip this step.

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

Open [http://localhost:3000](http://localhost:3000) in a browser. The frontend currently sends API requests to `http://localhost:3001`, so the backend must be running on that port.

## Seeded development accounts

When the initial data seeder runs, it creates department and adviser accounts with the development password `password123`. Example usernames include `tvl_head`, `feh_head`, `ams_head`, `humss_adviser`, `stem_adviser`, and `abm_adviser`.

These credentials are for local development only. Change the passwords before using the application with real data.

## Available scripts

### Backend

Run these commands from `backend/`:

| Command | Description |
| --- | --- |
| `npm start` | Starts the Express API with Node.js |
| `npm run dev` | Starts the API with Nodemon and reloads after file changes |

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
|   |-- config/       # Database configuration
|   |-- migrations/   # Database migration files
|   |-- models/       # Sequelize models and relationships
|   |-- routes/       # Express API routes
|   |-- scripts/      # Data-loading scripts
|   |-- seeders/      # Initial and sample data
|   `-- index.js      # Backend entry point
|-- frontend/
|   |-- public/       # Static public assets
|   `-- src/
|       |-- components/
|       |-- config/
|       |-- context/
|       |-- images/
|       |-- pages/
|       `-- App.js    # Frontend routes and application shell
`-- README.md
```

## Troubleshooting

- **The backend cannot connect to MySQL:** Confirm that MySQL is running, the `lnhs-sis` database exists, and the credentials and port in `backend/config/config.json` match XAMPP.
- **The frontend shows network errors:** Start the backend first and confirm that it is listening on port `3001`.
- **A table does not exist in a new database:** Complete the one-time database initialization step above.
- **Port `3000` or `3001` is already in use:** Stop the conflicting process. The frontend API URLs are currently fixed to port `3001`, so changing only the backend port will require updating those URLs too.
