export type PlaybookStep = {
	n: number
	at: string
	skill: string
	title: string
	detail: string
	status: "done" | "na" | "skip"
}

export const FEATURE_STEPS: PlaybookStep[] = [
	{
		n: 1,
		at: "2026-10-09T20:06:10Z",
		skill: "/how",
		title: "Read the affected subsystem",
		detail: "Greenfield. The sticky monorepo only had the Expo transitions lab. No timer, no decision log.",
		status: "done",
	},
	{
		n: 2,
		at: "2026-10-09T20:06:40Z",
		skill: "/architect",
		title: "Explore parallel designs",
		detail: "Boolean bag and tick-decrement lost to a discriminated Session plus remainingMs(session, nowMs).",
		status: "done",
	},
	{
		n: 3,
		at: "2026-10-09T20:07:00Z",
		skill: "throughput",
		title: "Write the throughput checkpoint",
		detail: "Blocking: PLAN, then failing test, then reduce, then UI. One worker. No shared writers.",
		status: "done",
	},
	{
		n: 4,
		at: "2026-10-09T20:07:49Z",
		skill: "/tdd",
		title: "Fail the contract, then make it pass",
		detail: "src/session.test.ts went 4 fail / 2 pass, then 8 pass after reduce landed.",
		status: "done",
	},
	{
		n: 5,
		at: "2026-10-09T20:08:37Z",
		skill: "implement",
		title: "Fill the named data shape",
		detail: "reduce is the only writer. The UI subscribes to a store that ticks while status is running.",
		status: "done",
	},
	{
		n: 6,
		at: "2026-10-09T20:12:00Z",
		skill: "verify",
		title: "Verify on the matching surface",
		detail: "Browser: start, pause, resume, complete, then this timeline.",
		status: "done",
	},
	{
		n: 7,
		at: "2026-10-09T20:06:05Z",
		skill: "/show-me-your-work",
		title: "Keep a committed decision trail",
		detail: "decisions.tsv, one row per fork or gate. GitHub renders it as a table.",
		status: "done",
	},
	{
		n: 8,
		at: "2026-10-09T20:20:00Z",
		skill: "opening-a-pr",
		title: "Open one ready PR",
		detail: "Conventional title, briefing body, screenshot and video attached.",
		status: "done",
	},
]
