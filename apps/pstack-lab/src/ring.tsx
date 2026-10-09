type RingTone = "idle" | "running" | "paused" | "completed"

type RingProps = {
	progress: number
	tone: RingTone
}

const SIZE = 276
const STROKE = 7
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function Ring({ progress, tone }: RingProps) {
	const clamped = Math.min(1, Math.max(0, progress))
	const offset = CIRCUMFERENCE * (1 - clamped)
	return (
		<svg
			className={`ring ring-${tone}`}
			width={SIZE}
			height={SIZE}
			viewBox={`0 0 ${SIZE} ${SIZE}`}
			aria-hidden="true"
		>
			<circle className="ring-track" cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} />
			<circle
				className="ring-value"
				cx={SIZE / 2}
				cy={SIZE / 2}
				r={RADIUS}
				strokeDasharray={CIRCUMFERENCE}
				strokeDashoffset={offset}
			/>
		</svg>
	)
}
