import { describe, expect, it } from "bun:test"
import { formatRemaining, idle, reduce, remainingMs } from "./session"

const TWENTY_FIVE = 25 * 60 * 1000
const FIFTEEN = 15 * 60 * 1000

describe("reduce", () => {
	it("should start an idle session and count remaining from the clock", () => {
		const started = reduce(idle(TWENTY_FIVE), { type: "start", nowMs: 1_000 })
		expect(started.status).toBe("running")
		expect(remainingMs(started, 1_000)).toBe(1_500_000)
		expect(remainingMs(started, 1_000 + 5_000)).toBe(1_495_000)
	})

	it("should pause at the remaining time and resume from there", () => {
		const started = reduce(idle(TWENTY_FIVE), { type: "start", nowMs: 0 })
		const paused = reduce(started, { type: "pause", nowMs: 10_000 })
		expect(paused).toEqual({
			status: "paused",
			durationMs: TWENTY_FIVE,
			remainingMs: 1_490_000,
		})
		const resumed = reduce(paused, { type: "resume", nowMs: 50_000 })
		expect(remainingMs(resumed, 50_000)).toBe(1_490_000)
		expect(remainingMs(resumed, 51_000)).toBe(1_489_000)
	})

	it("should complete when remaining hits zero", () => {
		const started = reduce(idle(TWENTY_FIVE), { type: "start", nowMs: 0 })
		const done = reduce(started, { type: "pause", nowMs: TWENTY_FIVE })
		expect(done).toEqual({ status: "completed", durationMs: TWENTY_FIVE })
		expect(remainingMs(done, TWENTY_FIVE + 1)).toBe(0)
	})

	it("should reset any session back to idle at the same duration", () => {
		const started = reduce(idle(FIFTEEN), { type: "start", nowMs: 0 })
		expect(reduce(started, { type: "reset" })).toEqual({
			status: "idle",
			durationMs: FIFTEEN,
		})
	})

	it("should change duration only while idle", () => {
		expect(reduce(idle(TWENTY_FIVE), { type: "setDuration", durationMs: FIFTEEN })).toEqual({
			status: "idle",
			durationMs: FIFTEEN,
		})
		const started = reduce(idle(TWENTY_FIVE), { type: "start", nowMs: 0 })
		expect(reduce(started, { type: "setDuration", durationMs: FIFTEEN })).toEqual(started)
	})

	it("should complete a running session on tick when the clock reaches zero", () => {
		const started = reduce(idle(TWENTY_FIVE), { type: "start", nowMs: 0 })
		expect(reduce(started, { type: "tick", nowMs: TWENTY_FIVE - 1 }).status).toBe("running")
		expect(reduce(started, { type: "tick", nowMs: TWENTY_FIVE })).toEqual({
			status: "completed",
			durationMs: TWENTY_FIVE,
		})
	})

	it("should ignore commands that do not apply to the current status", () => {
		const idleSession = idle(TWENTY_FIVE)
		expect(reduce(idleSession, { type: "pause", nowMs: 0 })).toEqual(idleSession)
		expect(reduce(idleSession, { type: "resume", nowMs: 0 })).toEqual(idleSession)
		const completed = { status: "completed" as const, durationMs: TWENTY_FIVE }
		expect(reduce(completed, { type: "start", nowMs: 1 })).toEqual(completed)
	})
})

describe("formatRemaining", () => {
	it("should render whole minutes as mm:ss", () => {
		expect(formatRemaining(1_500_000)).toBe("25:00")
		expect(formatRemaining(0)).toBe("00:00")
		expect(formatRemaining(999)).toBe("00:01")
	})
})
