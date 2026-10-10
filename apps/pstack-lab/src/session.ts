export const FOCUS_PRESETS_MS = [
	25 * 60 * 1000,
	15 * 60 * 1000,
	5 * 60 * 1000,
	10 * 1000,
] as const

export type Session =
	| { status: "idle"; durationMs: number }
	| {
			status: "running"
			durationMs: number
			startedAtMs: number
			remainingAtStartMs: number
	  }
	| { status: "paused"; durationMs: number; remainingMs: number }
	| { status: "completed"; durationMs: number }

export type Command =
	| { type: "start"; nowMs: number }
	| { type: "pause"; nowMs: number }
	| { type: "resume"; nowMs: number }
	| { type: "tick"; nowMs: number }
	| { type: "reset" }
	| { type: "setDuration"; durationMs: number }

export function idle(durationMs = FOCUS_PRESETS_MS[0]): Session {
	return { status: "idle", durationMs }
}

export function remainingMs(session: Session, nowMs: number): number {
	switch (session.status) {
		case "idle":
			return session.durationMs
		case "running": {
			const elapsed = Math.max(0, nowMs - session.startedAtMs)
			return Math.max(0, session.remainingAtStartMs - elapsed)
		}
		case "paused":
			return session.remainingMs
		case "completed":
			return 0
		default: {
			const _exhaustive: never = session
			return _exhaustive
		}
	}
}

function finishIfDue(session: Session, nowMs: number): Session {
	if (session.status !== "running") {
		return session
	}
	if (remainingMs(session, nowMs) > 0) {
		return session
	}
	return { status: "completed", durationMs: session.durationMs }
}

export function reduce(session: Session, command: Command): Session {
	switch (command.type) {
		case "start":
			if (session.status !== "idle") {
				return session
			}
			return {
				status: "running",
				durationMs: session.durationMs,
				startedAtMs: command.nowMs,
				remainingAtStartMs: session.durationMs,
			}
		case "pause": {
			if (session.status !== "running") {
				return session
			}
			const current = finishIfDue(session, command.nowMs)
			if (current.status !== "running") {
				return current
			}
			return {
				status: "paused",
				durationMs: current.durationMs,
				remainingMs: remainingMs(current, command.nowMs),
			}
		}
		case "resume":
			if (session.status !== "paused") {
				return session
			}
			if (session.remainingMs <= 0) {
				return { status: "completed", durationMs: session.durationMs }
			}
			return {
				status: "running",
				durationMs: session.durationMs,
				startedAtMs: command.nowMs,
				remainingAtStartMs: session.remainingMs,
			}
		case "tick":
			return finishIfDue(session, command.nowMs)
		case "reset":
			return idle(session.durationMs)
		case "setDuration":
			if (session.status !== "idle") {
				return session
			}
			return idle(command.durationMs)
		default: {
			const _exhaustive: never = command
			return _exhaustive
		}
	}
}

export function formatRemaining(ms: number): string {
	const totalSeconds = Math.ceil(ms / 1000)
	const minutes = Math.floor(totalSeconds / 60)
	const seconds = totalSeconds % 60
	return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}
