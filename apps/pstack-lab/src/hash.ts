function readHash(): string {
	const hash = window.location.hash
	if (hash === "" || hash === "#") {
		return "#/"
	}
	return hash
}

export function subscribeHash(listener: () => void): () => void {
	window.addEventListener("hashchange", listener)
	return () => {
		window.removeEventListener("hashchange", listener)
	}
}

export function getHash(): string {
	return readHash()
}

export function getServerHash(): string {
	return "#/"
}
