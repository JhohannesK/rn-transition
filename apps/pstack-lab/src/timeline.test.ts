import { describe, expect, it } from "bun:test"
import { buildTimeline, formatClock } from "./timeline"

describe("buildTimeline", () => {
	it("should interleave playbook steps and decisions in time order", () => {
		const items = buildTimeline(
			[
				{
					n: 1,
					at: "2026-10-09T20:06:10Z",
					skill: "/how",
					title: "Read the subsystem",
					detail: "greenfield",
					status: "done",
				},
			],
			[
				{
					ts: "2026-10-09T20:07:49Z",
					phase: "tdd",
					decision: "wrote the failing contract",
					why: "cheap local test path",
					evidence: "src/session.test.ts",
					result: "4 fail 2 pass",
				},
			],
		)
		expect(items.map((item) => item.kind)).toEqual(["playbook", "decision"])
		expect(formatClock("2026-10-09T20:07:49Z")).toBe("20:07:49")
	})
})
