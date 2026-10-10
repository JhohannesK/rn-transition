import { useSyncExternalStore } from "react"
import decisionsTsv from "../decisions.tsv?raw"
import { parseDecisions } from "./decisions"
import { getFocusSnapshot, subscribeFocus } from "./focus-store"
import { getHash, getServerHash, subscribeHash } from "./hash"
import { HowView } from "./how-view"
import { TimerView } from "./timer-view"

const DECISIONS = parseDecisions(decisionsTsv)

export function App() {
	const hash = useSyncExternalStore(subscribeHash, getHash, getServerHash)
	const { session, nowMs } = useSyncExternalStore(subscribeFocus, getFocusSnapshot, getFocusSnapshot)
	if (hash === "#/how") {
		return <HowView decisions={DECISIONS} />
	}
	return <TimerView session={session} nowMs={nowMs} />
}
