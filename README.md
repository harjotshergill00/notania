# Notania Monorepo

This monorepo hosts the Notania gaming platform, including the Next.js front end, an Express/Nest-inspired API, and shared UI packages.

## Structure

- `apps/web`: Next.js front end application for the arcade experience.
- `apps/api`: API application powered by Express with Nest-like modular structure and Prisma ORM.
- `packages/ui`: Shared UI component library and design tokens.
- `docs`: Operational documentation.

## Getting Started

Install dependencies with your preferred package manager (pnpm recommended):

```bash
pnpm install
```

### Run the Front End

```bash
pnpm dev:web
```

### Run the API

```bash
pnpm dev:api
```

## Scripts

- `pnpm lint` - Run linting across packages.
- `pnpm test` - Execute tests.
- `pnpm format` - Format code with Prettier.

## Deployment

CI/CD pipelines are configured via GitHub Actions (see `.github/workflows/ci.yml`).
