# Totter — Agent Primer

**Read this first.** Every new Claude agent picking up work on this repo should load this file before doing anything else. It is the canonical orientation document.

---

## What is Totter?

Totter is a child developmental milestone tracking app. Parents log words, gestures, motor milestones, and quiz responses for one or more children. The app shows progress dashboards, a chronological timeline, and (eventually) AI-generated tips and predictions.

Repo: `shymcf/emmys-milestones` (default branch `main`).
Live owner: Drew McFarland.

---

## Stack

- **Next.js 16** (App Router only — no Pages Router)
- **React 19**
- **TypeScript** strict mode (no `any`)
- **Tailwind CSS v4** (utility classes; no CSS modules / styled-components)
- **Drizzle ORM** + **node-postgres** (Postgres — connection via `DATABASE_URL`). Note: the repo originally used SQLite (`totter.db`); migrated to Postgres in commit `14d31e5`. The `totter.db` file is a stale artifact and can be ignored.
- **NextAuth v5 beta** with Credentials provider (bcryptjs hashed passwords, JWT sessions)
- **Anthropic SDK** (Claude Haiku) — currently disabled, on the back burner

---

## Repo layout

```
app/
  (app)/                       protected routes; layout redirects unauth users
    children/[childId]/
      language/                Words + Gestures (a.k.a. "Communication")
      motor/[category]/        gross_motor or fine_motor
      quiz/                    interactive milestone quiz
      timeline/                chronological log
      recommendations/         AI tips (back burner)
      predictions/             AI predictions (back burner — shows "Coming Soon")
    children/new/              add child form
    dashboard/                 main dashboard (server component)
    settings/                  manage children, retake quizzes, logout
  api/
    auth/                      signup + NextAuth handler
    children/                  GET/POST/DELETE children
    children/[childId]/        nested resources (milestones, words, quiz, etc.)
  login/, signup/              public auth pages
components/                    shared UI (currently just BottomNav)
lib/
  db/                          Drizzle schema + client
  auth.ts                      NextAuth config
  queries/                     reusable DB query functions
  quiz/                        quiz engine + question bank
  milestones/                  age-bracket checklist
  ai/                          Claude client + prompts (back burner)
  utils.ts                     date helpers, age formatting
```

---

## Coding standards

### TypeScript
- Strict mode. **No `any`**. No `as` casts unless absolutely necessary.
- `async/await`, never `.then()` chains.
- Named exports, except for page/layout components (Next.js requires default exports there).
- Import order: stdlib → external packages → internal modules, separated by blank lines.

### React / Next.js
- App Router only.
- Server components by default. `"use client"` only for interactivity, hooks, or browser APIs.
- API route handlers use `NextRequest`/`NextResponse`.
- No separate backend servers.

### Tailwind
- Utility classes inline. Use CSS custom properties (`var(--...)`) for theming tokens.
- Mobile-first; design fits inside a `max-w-sm` mobile shell.

### General
- No over-abstraction. Inline logic until a pattern repeats 3+ times.
- Server-side env vars only — never reference `process.env` in client components.
- Keep CLAUDE.md (workspace) and `primer.md` (this file) in sync.

---

## Auth pattern

Every protected API route under `/api/children/[childId]/*` must:
1. `await auth()` and check `session?.user?.id` → 401 if missing.
2. Look up the child and verify `child.userId === session.user.id` → 404 if not.

**This pattern is currently duplicated across 8 routes.** A backlog issue (`refactor: extract auth + child-ownership guard`) tracks consolidating it into `lib/auth-guard.ts`.

---

## Database

- Postgres via `node-postgres`; connection string in `DATABASE_URL`.
- Schema in `lib/db/schema.ts` (`pg-core`). Tables: `users`, `children`, `milestones`, `wordLogs`, `quizResponses`, `recommendations`.
- Apply schema changes with `npx drizzle-kit push` (or `generate` then `migrate` for explicit migrations).
- Dates stored as `text` in `YYYY-MM-DD` format (helpers `parseDateOnly` / `formatDateOnly` in `lib/utils.ts`).
- All child-scoped FKs use `onDelete: "cascade"`. Cascade is automatic — DELETE handlers should NOT manually delete children rows.

---

## Backlog policy (READ THIS)

**Every feature, bug, refactor, or future work item discussed in conversation MUST be logged as a GitHub issue in the `shymcf/emmys-milestones` repo before the conversation ends.**

Rules:
1. **Format**: Gherkin-style acceptance criteria in the issue body (`Feature:`, `Scenario:`, `Given/When/Then`).
2. **Labels**: apply at least one of `feature`, `bug`, `refactor`, `tech-debt`, `accessibility`, `performance`, `schema`, `ux`, `dx`, `ai-backburner`.
3. **Priority**: also apply `priority:critical`, `priority:high`, `priority:medium`, or `priority:low`.
4. **AI features**: any AI-related work (recommendations, predictions, prompt changes) is `ai-backburner` and `priority:low` — it is NOT to be worked on right now.
5. **Tool**: use `gh issue create` (or `gh issue list` first to avoid duplicates).
6. **Title prefix**: `feat:`, `fix:`, `refactor:`, `chore:`, `a11y:`, `perf:` — match conventional commit style.
7. **Acknowledge in chat**: when you log an issue, mention `→ logged as #N` so the user sees it.

If the user mentions a future feature in passing — e.g. "we'll add X later" — log it. If they describe a bug they noticed, log it. If a refactor opportunity comes up while reading code, log it. Do NOT silently let backlog items disappear.

---

## Working on a worktree

This project uses Claude worktrees under `.claude/worktrees/<name>/`. The worktree is a full checkout on its own branch (`claude/<name>`). Commits there will be merged back via PR. Always operate from the worktree path the user is in — do not `cd` into the parent repo.

---

## Things to avoid

- Don't install packages that duplicate existing capability.
- No Prisma — use Drizzle.
- No icon libraries — use inline SVG.
- Don't write tests unless explicitly asked.
- Don't create README.md or docs unless explicitly asked.
- Don't work on AI features right now (back burner).
- Drew is non-technical — explain options in plain language with their implications.

---

## Useful commands

```bash
# Apply schema changes
npx drizzle-kit push

# Start dev
npm run dev

# Lint / typecheck
npm run lint
npx tsc --noEmit

# GitHub
gh issue list --label refactor
gh issue create --title "..." --body "..." --label refactor,priority:high
```
