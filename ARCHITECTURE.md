# LnPulse architecture

LnPulse uses feature-first modules at the application edges and keeps framework-wide infrastructure separate. New functionality should be added to the owning feature instead of reintroducing flat `pages` or `routes` folders.

## Frontend boundaries

```text
frontend/src/
|-- app/              # Providers, route table, route guards, and application shell
|-- core/             # Application-wide state and policies (for example, authentication)
|-- features/         # Business capabilities with public index.js entry points
|   |-- auth/
|   |-- curriculum/
|   |-- dashboard/
|   |-- organization/
|   |-- reports/
|   |-- students/
|   `-- users/
|-- shared/           # Reusable API and UI building blocks with no business ownership
`-- styles/           # Global and legacy cross-feature styles
```

Dependency direction:

```text
app -> features
app -> core/shared
features -> core/shared
```

- Import a feature through its `index.js` from outside that feature.
- Keep feature-specific screens, hooks, components, and services inside that feature.
- Put code in `shared` only when at least two business features use it and it has no feature-specific policy.
- Put global state and cross-feature policy in `core`.
- Use `shared/api/client.js` for HTTP calls. Configure its origin with `REACT_APP_API_URL`; feature files should use relative API paths.

The styles under `styles/legacy-*` remain global because the original selectors are shared by several screens. As screens are decomposed, move their selectors into the owning feature and prefer locally scoped class names.

## Backend boundaries

```text
backend/
|-- config/           # Sequelize CLI/database configuration
|-- migrations/       # Database schema history
|-- models/           # Sequelize entities and associations
|-- seeders/
|   `-- seed.js       # Single explicit database seeder
|-- src/
|   |-- config/       # Runtime application configuration
|   |-- middleware/   # Express-wide request/error behavior
|   |-- modules/      # HTTP capabilities grouped by business domain
|   |-- services/     # Cross-route workflows
|   |-- app.js        # Express construction; does not start a listener
|   |-- routes.js     # Single route registry
|   `-- server.js     # Database preparation and HTTP startup
`-- index.js          # Minimal process entry point
```

- Register a module once in `src/routes.js`; keep its handlers in the owning domain folder.
- Extract reusable business workflows from route handlers into a nearby service as they grow.
- Keep `app.js` free of startup side effects so it can be imported by integration tests.
- Keep Sequelize models at the backend root until migrations and Sequelize CLI configuration are migrated together.
- Keep application startup read-only with respect to schema and seed data. Use `npm run db:setup` for a new local database and `npm run db:seed` for an existing schema.
- Keep the single seeder deterministic, transactional, and keyed by stable business identifiers so repeat runs are safe.

## Scaling the next increment

The student-profile and grades screens demonstrate the intended feature shape: page-level coordination in `pages`, UI sections in `components`, stateful workflows in `hooks`, HTTP calls in `services`, and pure business rules in `utils`. Apply that pattern incrementally to the remaining large screens and route files when changing their features. Current frontend candidates include Subjects and SectionStudents.
