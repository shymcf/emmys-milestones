# Workspace

Drew's project workspace. A collection of Next.js apps, a shared infra repo, and a design blog — all oriented around the Velveteen ecosystem.

## Projects

| Directory | What it is |
|---|---|
| `velveteen/` | Main product — analyzes vibe-coded apps, runs security scans, deploys them. Next.js 16 + Drizzle + graphile-worker. |
| `seams/` | Design blog — MDX content site. "The space between designing it and building it." |
| `hello-world/` | Next.js 16 starter / sandbox. |
| `launchpad-prototype/` | UI prototype for Velveteen's landing/onboarding flow. |
| `dispatch/` | Empty Next.js project (placeholder). |
| `infra/` | Shared infrastructure — bootstrap scripts, Docker Compose, Caddy config, SecRel pipeline. Deploys to Hetzner VPS. |

Each project has its own `CLAUDE.md` with project-specific context. Read it before working in that directory.

## Shared Stack

All web projects use:
- **Next.js 16** with App Router (NOT Pages Router)
- **React 19**
- **TypeScript** in strict mode
- **Tailwind CSS v4**

## Coding Standards

### TypeScript
- Strict mode. No `any` types.
- Use `async/await`, never `.then()` chains.
- Prefer named exports over default exports, except for page/layout components.
- Imports: stdlib -> external packages -> internal modules, separated by blank lines.

### React / Next.js
- App Router only. No Pages Router.
- Server components by default. Only add `'use client'` when you need interactivity or hooks.
- Use `NextRequest`/`NextResponse` for API route handlers.
- No separate backend servers (Express, Fastify, etc.).

### Tailwind
- Utility classes directly on elements. No CSS modules, no styled-components.
- Use CSS custom properties (`var(--...)`) for theming tokens.
- Mobile-responsive but desktop-first.

### General
- No over-abstraction. Inline logic until a pattern repeats 3+ times.
- Keep components composable. Avoid deep prop drilling; use React context sparingly.
- Environment variables: access only in server-side code (`src/lib/` or route handlers), never in client components.
- Do not store secrets in client-accessible code.

## Git & GitHub

- GitHub org: `Mountain-Dr3w` (Drew's personal org)
- Projects board: GitHub Projects (#3) for tracking work
- Use `gh` CLI for all GitHub operations
- Infra repo provides shared CI workflows via `uses: Mountain-Dr3w/infra/.github/workflows/...`

## Things to Avoid

- Do not install packages that duplicate existing capabilities (e.g., Redis when graphile-worker handles queuing).
- Do not use Prisma. Velveteen uses Drizzle.
- Do not add icon libraries. Use ASCII/SVG where icons are needed.
- Do not write tests unless explicitly asked.
- Do not create README.md or documentation files unless explicitly asked.
