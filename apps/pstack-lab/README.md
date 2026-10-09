# pstack-lab

A tiny single-user focus timer built under [pstack](https://github.com/cursor/plugins/blob/main/pstack/README.md)
`/poteto-mode` (Feature playbook). The second screen is the audit trail.

Source bookmark: https://x.com/0xCodez/status/2095536167399620798

## What's inside

- **Timer.** Discriminated `Session` and a pure `reduce`. Start, pause, resume, reset, complete.
- **How this was built.** Feature playbook steps interleaved with committed `decisions.tsv` from `/show-me-your-work`.
- **`/tdd` trail.** `src/session.test.ts` failed first (`4 fail, 2 pass`), then passed after `reduce` landed.

See [PLAN.md](./PLAN.md) for the data shape and checkpoint.

## Run it

```bash
bun install
bun run dev
bun test
bun run typecheck
```

Open `http://localhost:5173`. `#/` is the timer. `#/how` is the timeline.
