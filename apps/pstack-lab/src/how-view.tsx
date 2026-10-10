import type { Decision } from "./decisions"
import { FEATURE_STEPS } from "./playbook"
import { buildTimeline, formatClock, type TimelineItem } from "./timeline"

type HowViewProps = {
	decisions: Decision[]
}

function TimelineEntry({ item }: { item: TimelineItem }) {
	switch (item.kind) {
		case "playbook":
			return (
				<li className="entry entry-playbook">
					<span className="when">{formatClock(item.at)}</span>
					<div className="entry-body">
						<p className="kicker">
							Step {item.step.n} · {item.step.skill}
						</p>
						<h2>{item.step.title}</h2>
						<p>{item.step.detail}</p>
					</div>
				</li>
			)
		case "decision":
			return (
				<li className="entry entry-decision">
					<span className="when">{formatClock(item.at)}</span>
					<div className="entry-body">
						<p className="kicker">
							{item.decision.phase} · {item.decision.result}
						</p>
						<h2>{item.decision.decision}</h2>
						<p>{item.decision.why}</p>
						<p className="evidence">{item.decision.evidence}</p>
					</div>
				</li>
			)
		default: {
			const _exhaustive: never = item
			return _exhaustive
		}
	}
}

export function HowView({ decisions }: HowViewProps) {
	const items = buildTimeline(FEATURE_STEPS, decisions)
	return (
		<main className="stage how-stage">
			<header className="topbar">
				<a className="how-link" href="#/">
					← Timer
				</a>
				<p className="brand">pstack-lab</p>
			</header>
			<section className="how-intro">
				<p className="eyebrow">/poteto-mode · Feature</p>
				<h1>How this was built</h1>
				<p>
					Lauren Tan's pstack routes work through playbooks. This lab is a focus timer whose
					second screen is the audit trail: Feature steps mixed with the committed{" "}
					<code>decisions.tsv</code> from /show-me-your-work, including the /tdd red-then-green
					gate.
				</p>
			</section>
			<ol className="timeline">{items.map((item, index) => <TimelineEntry key={`${item.kind}-${item.at}-${index}`} item={item} />)}</ol>
		</main>
	)
}
