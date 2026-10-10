export type Decision = {
	ts: string
	phase: string
	decision: string
	why: string
	evidence: string
	result: string
}

export function parseDecisions(tsv: string): Decision[] {
	const lines = tsv
		.replaceAll("\r\n", "\n")
		.split("\n")
		.filter((line) => line.length > 0)
	if (lines.length === 0) {
		return []
	}
	const header = lines[0]?.split("\t") ?? []
	const body = header[0] === "ts" ? lines.slice(1) : lines
	return body.map((line) => {
		const cols = line.split("\t")
		return {
			ts: cols[0] ?? "",
			phase: cols[1] ?? "",
			decision: cols[2] ?? "",
			why: cols[3] ?? "",
			evidence: cols[4] ?? "",
			result: cols[5] ?? "",
		}
	})
}
