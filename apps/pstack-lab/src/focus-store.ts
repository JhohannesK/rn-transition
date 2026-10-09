import { idle, reduce, type Command, type Session } from "./session"

export type FocusSnapshot = {
	session: Session
	nowMs: number
}

let session: Session = idle()
let nowMs = 0
let snapshot: FocusSnapshot = { session, nowMs }
const listeners = new Set<() => void>()
let intervalId: ReturnType<typeof setInterval> | null = null

function emit(): void {
	snapshot = { session, nowMs }
	for (const listener of listeners) {
		listener()
	}
}

function stopClock(): void {
	if (intervalId == null) {
		return
	}
	clearInterval(intervalId)
	intervalId = null
}

function startClock(): void {
	if (intervalId != null) {
		return
	}
	intervalId = setInterval(() => {
		nowMs = Date.now()
		session = reduce(session, { type: "tick", nowMs })
		if (session.status !== "running") {
			stopClock()
		}
		emit()
	}, 200)
}

export function getFocusSnapshot(): FocusSnapshot {
	return snapshot
}

export function subscribeFocus(listener: () => void): () => void {
	listeners.add(listener)
	return () => {
		listeners.delete(listener)
	}
}

export function dispatch(command: Command): void {
	nowMs = "nowMs" in command ? command.nowMs : Date.now()
	session = reduce(session, command)
	if (session.status === "running") {
		startClock()
	} else {
		stopClock()
	}
	emit()
}
