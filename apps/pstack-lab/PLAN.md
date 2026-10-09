# pstack-lab — Plan

A tiny single-user focus timer built end to end under pstack `/poteto-mode`
(Feature playbook), so the process is visible in the product.

- Approved tech: [pstack](https://github.com/cursor/plugins/blob/main/pstack/README.md)
  (Lauren Tan / @poteto), MIT plugin. Skills used: `/poteto-mode`, `/tdd`,
  `/show-me-your-work`, plus the Feature playbook's `/how` and `/architect` steps.
- Source bookmark: https://x.com/0xCodez/status/2095536167399620798

`AGENTS.md` and `skills/project-planning/` are not in this repo. This file is
the plan those would have produced.

## Scope

- One local user. No accounts, no backend, no sync.
- Focus timer: pick a duration, start, pause, resume, reset, complete.
- A **How this was built** screen that renders `decisions.tsv` and the Feature
  playbook steps as one timeline.
- A `/tdd` trail: a focused session-reducer test that fails first, then passes.
- Commit `decisions.tsv` so a reviewer can read the trail on GitHub.

Out of scope: multi-user, history charts, sound packs, native wrappers.

## Subsystem (`/how`)

Greenfield. The monorepo currently holds one Expo gallery lab under
`apps/rn-screen-transitions-lab/`. Nothing here times, reduces a session, or
logs pstack decisions. The only constraint that matters is the factory rule:
touch `apps/pstack-lab/` and optionally `tracking/seen-bookmarks.json`.

## Design (`/architect`)

Three shapes. Two discarded.

| | Shape | Verdict |
| --- | --- | --- |
| A | Boolean bag (`running`, `paused`, `remainingMs`) | Rejected. `running && paused` compiles. |
| B | Decrement `remainingMs` on each interval tick | Rejected. Tests need fake timers. Interval jitter becomes the domain. |
| C | Discriminated `Session` plus `remainingMs(session, nowMs)` | **Chosen.** Illegal states cannot be built. Tests pass a literal `nowMs`. |

Chosen data shape:

```ts
type Session =
  | { status: 'idle'; durationMs: number }
  | { status: 'running'; durationMs: number; startedAtMs: number; remainingAtStartMs: number }
  | { status: 'paused'; durationMs: number; remainingMs: number }
  | { status: 'completed'; durationMs: number }
```

`reduce(session, command)` is the only writer. The UI holds one `Session` and a
clock interval started from Start and Resume, cleared from Pause, Reset, and
complete. No `useEffect`. Durations are 25, 15, and 5 minutes, plus a 10 second
lab preset so complete is observable without waiting.

## Throughput checkpoint

- **Blocking first steps.** `PLAN.md`, then the failing `/tdd` test, then
  `reduce`, then the UI that reads it.
- **Independent workstreams.** Domain tests and the How-built parser could
  parallelize. The timer view depends on `Session`. One worker, sequential.
- **Shared mutable state.** n/a: one in-memory session. No file writers besides
  append-only `decisions.tsv`.
- **Smallest safe decomposition.** One worker. The app is a reducer, a view,
  and a TSV timeline. Fan-out would cost more than it saves.

## Stack

| Piece | Choice |
| --- | --- |
| Runtime / PM | Bun (`bun install`, `bun run dev`) |
| App | Vite 7 + React 19 + TypeScript (strict) |
| Tests | `bun:test` against the pure reducer |
| Routing | Hash: `#/` timer, `#/how` timeline |
| Persistence | None. Refresh returns to idle at 25:00. |

## Screens

| Route | Screen |
| --- | --- |
| `#/` | Focus timer: ring, remaining time, presets, start/pause/resume/reset |
| `#/how` | Timeline of Feature playbook steps and `decisions.tsv` rows |

## Validation

- `bun install && bun run dev` from `apps/pstack-lab/` serves the app.
- `bun test` is red on the first `/tdd` commit, green after `reduce` lands.
- `bun run typecheck` passes (`tsc --noEmit`).
- Manual pass through start → pause → resume → complete, then the How-built
  timeline, captured as **screenshot + screen recording** on the PR.
