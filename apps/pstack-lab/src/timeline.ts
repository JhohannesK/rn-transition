import type { Decision } from "./decisions"
import type { PlaybookStep } from "./playbook"

export type TimelineItem =
	| { kind: "playbook"; at: string; step: PlaybookStep }
	| { kind: "decision"; at: string; decision: Decision }

export function buildTimeline(steps: PlaybookStep[], decisions: Decision[]): TimelineItem[] {
	const items: TimelineItem[] = [
		...steps.map((step) => ({ kind: "playbook" as const, at: step.at, step })),
		...decisions.map((decision) => ({ kind: "decision" as const, at: decision.ts, decision })),
	]
	return items.sort((left, right) => {
		if (left.at === right.at) {
			return left.kind === "playbook" ? -1 : 1
		}
		return left.at.localeCompare(right.at)
	})
}

export function formatClock(iso: string): string {
	const stamp = iso.replace("T", " ").replace("Z", "")
	const time = stamp.split(" ")[1]
	return time?.slice(0, 8) ?? iso
}
