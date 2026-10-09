export const FOCUS_PRESETS_MS = [
	25 * 60 * 1000,
	15 * 60 * 1000,
	5 * 60 * 1000,
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
	| { type: "reset" }
	| { type: "setDuration"; durationMs: number }

export function idle(durationMs = FOCUS_PRESETS_MS[0]): Session {
	return { status: "idle", durationMs }
}

export function remainingMs(_session: Session, _nowMs: number): number {
	return 0
}

export function reduce(session: Session, _command: Command): Session {
	return session
}
