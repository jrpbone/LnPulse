# Root README Showcase Design

## Goal

Refresh the repository root README so its opening section works as a polished GitHub showcase, credits the three original developers equally, and accurately documents the technologies and SQL-first setup currently used by LnPulse.

## Showcase

The README will open with the existing LNHS seal from `frontend/public/logo512.png`, a centered LnPulse title and product description, versioned technology badges, and a three-column “Original Developers” table containing:

- John Ralph P. Bone
- Dan Emmanuel G. Pispis
- John Benedict B. Candelaria

Names will be displayed without invented profile links or roles because the repository contains no verified GitHub identities or role assignments for all three developers.

## Content Structure

After the showcase, the README will contain:

1. A concise project overview and feature list.
2. A technology table based on the installed package manifests and `.nvmrc`.
3. Requirements and local installation instructions.
4. The supported MySQL Workbench bootstrap using `database/lnhs-sis.sql`.
5. Backend and frontend launch commands.
6. Temporary baseline administrator credentials and a password-change warning.
7. Current backend/frontend scripts and the feature-first project structure.
8. Links to the backend setup guide and architecture document.
9. Focused troubleshooting notes.

## Accuracy Constraints

- Document React 19.1, React Router 7.5, Create React App 5, Axios 1.8, Formik 2.4, Yup 1.6, Express 5.1, Sequelize 6.37, MySQL2 3.14, bcrypt 6, and Node.js 20.19 where relevant.
- Do not describe a JavaScript seeder, `db:setup`, or `db:seed`; those mechanisms no longer exist.
- Explain that `database/lnhs-sis.sql` is a destructive fresh-install import that creates the schema and only the baseline administrator.
- Explain that later schema changes use Sequelize migrations.
- Use `.env.example` and environment variables for database configuration; never include a real local database password.
- Do not require Apache because the application is served by Node.js and MySQL.

## Verification

- Cross-check version claims against both package manifests and `.nvmrc`.
- Cross-check every documented command against the package scripts.
- Verify all repository-relative links and image paths exist.
- Search the final README for obsolete seeder and `config.json` instructions.
- Review the final diff to ensure the pre-existing README cleanup is retained.
