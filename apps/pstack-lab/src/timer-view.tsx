import { FOCUS_PRESETS_MS, formatRemaining, remainingMs, type Session } from "./session"
import { dispatch } from "./focus-store"
import { Ring } from "./ring"

type TimerViewProps = {
	session: Session
	nowMs: number
}

function statusCopy(session: Session): string {
	switch (session.status) {
		case "idle":
			return "Idle. Pick a block, then start."
		case "running":
			return "Focusing. The clock is the only input."
		case "paused":
			return "Paused. The leftover time is held."
		case "completed":
			return "Block complete. The reducer hit zero."
		default: {
			const _exhaustive: never = session
			return _exhaustive
		}
	}
}

function primaryLabel(status: Session["status"]): string {
	switch (status) {
		case "idle":
			return "Start focus"
		case "running":
			return "Pause"
		case "paused":
			return "Resume"
		case "completed":
			return "New block"
		default: {
			const _exhaustive: never = status
			return _exhaustive
		}
	}
}

function onPrimary(session: Session): void {
	const nowMs = Date.now()
	switch (session.status) {
		case "idle":
			dispatch({ type: "start", nowMs })
			return
		case "running":
			dispatch({ type: "pause", nowMs })
			return
		case "paused":
			dispatch({ type: "resume", nowMs })
			return
		case "completed":
			dispatch({ type: "reset" })
			return
		default: {
			const _exhaustive: never = session
			return _exhaustive
		}
	}
}

const PRESETS: { durationMs: (typeof FOCUS_PRESETS_MS)[number]; label: string }[] = [
	{ durationMs: FOCUS_PRESETS_MS[0], label: "25 Focus" },
	{ durationMs: FOCUS_PRESETS_MS[1], label: "15 Cut" },
	{ durationMs: FOCUS_PRESETS_MS[2], label: "5 Spark" },
	{ durationMs: FOCUS_PRESETS_MS[3], label: "10s Lab" },
]

export function TimerView({ session, nowMs }: TimerViewProps) {
	const remaining = remainingMs(session, nowMs)
	const progress = session.durationMs === 0 ? 0 : remaining / session.durationMs
	const canReset = session.status !== "idle"
	return (
		<main className="stage">
			<header className="topbar">
				<p className="brand">pstack-lab</p>
				<a className="how-link" href="#/how">
					How this was built
				</a>
			</header>
			<section className="dial" aria-label="Focus timer">
				<Ring progress={progress} tone={session.status} />
				<div className="dial-face">
					<p className="time" role="timer" aria-live="polite">
						{formatRemaining(remaining)}
					</p>
					<p className="status">{statusCopy(session)}</p>
				</div>
			</section>
			<div className="presets" role="group" aria-label="Duration presets">
				{PRESETS.map((preset) => {
					const selected = session.status === "idle" && session.durationMs === preset.durationMs
					return (
						<button
							key={preset.durationMs}
							type="button"
							className={selected ? "preset is-on" : "preset"}
							disabled={session.status !== "idle"}
							onClick={() => dispatch({ type: "setDuration", durationMs: preset.durationMs })}
						>
							{preset.label}
						</button>
					)
				})}
			</div>
			<div className="actions">
				<button type="button" className="primary" onClick={() => onPrimary(session)}>
					{primaryLabel(session.status)}
				</button>
				{canReset ? (
					<button type="button" className="ghost" onClick={() => dispatch({ type: "reset" })}>
						Reset
					</button>
				) : null}
			</div>
		</main>
	)
}
