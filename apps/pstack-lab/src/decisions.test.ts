import { describe, expect, it } from "bun:test"
import { parseDecisions } from "./decisions"

describe("parseDecisions", () => {
	it("should map a headered TSV row onto Decision fields", () => {
		const tsv = [
			"ts\tphase\tdecision\twhy\tevidence\tresult",
			"2026-10-09T20:07:49Z\ttdd\twrote the failing reducer contract\tcheap local test path\tsrc/session.test.ts\t4 fail 2 pass",
		].join("\n")
		expect(parseDecisions(tsv)).toEqual([
			{
				ts: "2026-10-09T20:07:49Z",
				phase: "tdd",
				decision: "wrote the failing reducer contract",
				why: "cheap local test path",
				evidence: "src/session.test.ts",
				result: "4 fail 2 pass",
			},
		])
	})

	it("should skip blank lines and keep a row with empty trailing cells", () => {
		const tsv = "ts\tphase\tdecision\twhy\tevidence\tresult\n2026-01-01T00:00:00Z\tframe\tpicked C\t\tPLAN.md\topen\n\n"
		expect(parseDecisions(tsv)).toEqual([
			{
				ts: "2026-01-01T00:00:00Z",
				phase: "frame",
				decision: "picked C",
				why: "",
				evidence: "PLAN.md",
				result: "open",
			},
		])
	})
})
