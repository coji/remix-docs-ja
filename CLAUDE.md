# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a monorepo containing Japanese translations of React Router v7 and Remix documentation, along with a translation management admin tool. The project uses pnpm workspaces and Turborepo for build orchestration.

## Architecture

### Applications (`apps/`)

- **admin**: Translation management tool with Kysely/SQLite database and Gemini API integration
- **react-router**: React Router v7 Japanese documentation site (SSG, deployed to Cloudflare)
- **remix**: Remix Japanese documentation site (SSG, deployed to Cloudflare)

### Key Technologies

- React Router v7 (the new version that merged with Remix)
- Vite for bundling
- Tailwind CSS v4
- Kysely ORM with SQLite (admin app)
- Cloudflare Workers/Pages deployment
- Pagefind for search functionality

## Common Development Commands

### Initial Setup

```bash
pnpm install
# Database is auto-created on first run via better-sqlite3
```

### Development

```bash
pnpm dev                    # Start all apps
pnpm --filter admin dev     # Start admin only (port 5170)
pnpm --filter react-router dev  # Start React Router docs (port 5175)
pnpm --filter remix dev     # Start Remix docs (port 5173)
```

### Build & Deploy

```bash
pnpm build                  # Build all apps
pnpm deploy                 # Deploy all apps
pnpm --filter react-router deploy  # Deploy React Router docs to Cloudflare
pnpm --filter remix deploy  # Deploy Remix docs to Cloudflare
```

### Code Quality

```bash
pnpm lint                   # Run Biome linter
pnpm format                 # Format with Prettier
pnpm typecheck              # Type check with TypeScript
pnpm test                   # Run Vitest tests
pnpm validate               # Run all checks (lint, format, typecheck, test)
```

### Admin App Database

```bash
# Database schema is defined in apps/admin/db/schema.sql
# Schema changes can be managed with Atlas (atlas.hcl)
npx atlas schema apply --env local        # Apply schema changes
```

## Environment Variables

### Admin App (`apps/admin/.env`)

```env
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
```

## Project Structure

- `/docs/`: Source markdown files for documentation
  - `/react-router-v7/`: React Router documentation
  - `/remix/`: Remix documentation
- `/packages/scripts/`: Shared build scripts and markdown processing utilities
- Each app has its own `react-router.config.ts` for routing configuration
- Documentation sites use SSG with prerendering, admin uses SSR

## Key Architectural Decisions

1. **Monorepo Structure**: Uses pnpm workspaces with Turborepo for efficient builds
2. **Documentation Sites**: Static generation with Cloudflare deployment for performance
3. **Translation Management**: Separate admin app with database for tracking translation status
4. **Search**: Pagefind integration for full-text search in documentation
5. **Styling**: Tailwind CSS v4 with Vite plugin, shadcn/ui components

## Testing

- Unit tests use Vitest
- Run specific app tests: `pnpm --filter [app-name] test`
- Test files follow `*.test.ts` or `*.spec.ts` pattern

## Deployment Notes

- Documentation sites deploy to Cloudflare Workers/Pages via Wrangler
- Admin app requires Node.js environment with SQLite database
- Build outputs: `dist/`, `build/`, or `prebuild/` directories
