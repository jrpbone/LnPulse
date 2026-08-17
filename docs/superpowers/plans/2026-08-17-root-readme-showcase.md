# Root README Showcase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the stale root README with a GitHub-ready LnPulse showcase that equally credits the three original developers and accurately documents the current stack and SQL-first setup.

**Architecture:** Keep the deliverable self-contained in the root `README.md`, reusing the existing LNHS seal through a repository-relative image path. Derive all technology versions and commands from checked-in manifests, `.nvmrc`, the SQL bootstrap, and the backend setup guide so the public documentation has one accurate path into the deeper operational docs.

**Tech Stack:** GitHub Flavored Markdown and limited GitHub-safe HTML; React 19.1; React Router 7.5; Create React App 5; Axios 1.8; Formik 2.4; Yup 1.6; Express 5.1; Sequelize 6.37; MySQL2 3.14; bcrypt 6; Node.js 20.19.

## Global Constraints

- Present John Ralph P. Bone, Dan Emmanuel G. Pispis, and John Benedict B. Candelaria equally and without unverified profile links or roles.
- Do not document a JavaScript seeder, `db:setup`, or `db:seed` as an available workflow.
- Treat `database/lnhs-sis.sql` as a destructive fresh-install import that creates the schema and only the baseline administrator.
- Document `.env`-based database configuration without exposing a real local password.
- Preserve the intent of the pre-existing uncommitted README cleanup.

---

### Task 1: Refresh and verify the root README

**Files:**
- Modify: `README.md`
- Reference: `backend/package.json`
- Reference: `frontend/package.json`
- Reference: `.nvmrc`
- Reference: `backend/README.md`
- Reference: `database/lnhs-sis.sql`

**Interfaces:**
- Consumes: checked-in package versions, npm scripts, environment variable names, bootstrap behavior, and the existing `frontend/public/logo512.png` asset.
- Produces: a GitHub-renderable root README whose setup commands and links match the repository.

- [x] **Step 1: Replace the README with the approved showcase structure**

  Add a centered seal, title, concise product pitch, version badges, and an equal-width original-developer table. Follow it with overview, features, a versioned technology table, SQL-first quick start, baseline login, scripts, project structure, documentation links, and troubleshooting.

- [x] **Step 2: Verify obsolete setup instructions are absent**

  Run:

  ```powershell
  $content = Get-Content -LiteralPath README.md -Raw
  if ($content -match 'config/config\.json|npm run db:setup|npm run db:seed|seeders/seed\.js') { throw 'Obsolete setup instructions remain.' }
  ```

  Expected: command exits successfully with no output.

- [x] **Step 3: Verify required showcase, stack, and bootstrap content**

  Run:

  ```powershell
  $content = Get-Content -LiteralPath README.md -Raw
  @('John Ralph P. Bone','Dan Emmanuel G. Pispis','John Benedict B. Candelaria','React 19.1','Express 5.1','database/lnhs-sis.sql','npm run db:migrate') | ForEach-Object { if (-not $content.Contains($_)) { throw "Missing README content: $_" } }
  @('frontend/public/logo512.png','backend/README.md','ARCHITECTURE.md','database/lnhs-sis.sql') | ForEach-Object { if (-not (Test-Path -LiteralPath $_)) { throw "Broken repository path: $_" } }
  ```

  Expected: command exits successfully with no output.

- [x] **Step 4: Check Markdown cleanliness and review the final diff**

  Run:

  ```powershell
  git diff --check -- README.md
  git diff -- README.md
  ```

  Expected: no whitespace errors; the diff contains only the intentional root README refresh and retains the earlier cleanup intent.

- [x] **Step 5: Commit the completed documentation**

  ```powershell
  git add README.md docs/superpowers/plans/2026-08-17-root-readme-showcase.md
  git commit -m "docs: refresh project showcase and setup"
  ```
