/** Deterministic 2D value-noise FBM. Seeded so the holm is the same every load. */

export function mulberry32(seed: number): () => number {
	let t = seed >>> 0;
	return () => {
		t += 0x6d2b79f5;
		let r = Math.imul(t ^ (t >>> 15), 1 | t);
		r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
		return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
	};
}

function fade(t: number): number {
	return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(a: number, b: number, t: number): number {
	return a + (b - a) * t;
}

function hash2(ix: number, iy: number, salt: number): number {
	const n = Math.sin(ix * 127.1 + iy * 311.7 + salt * 74.7) * 43758.5453123;
	return n - Math.floor(n);
}

export function valueNoise2(x: number, y: number, salt = 0): number {
	const x0 = Math.floor(x);
	const y0 = Math.floor(y);
	const fx = fade(x - x0);
	const fy = fade(y - y0);
	const v00 = hash2(x0, y0, salt);
	const v10 = hash2(x0 + 1, y0, salt);
	const v01 = hash2(x0, y0 + 1, salt);
	const v11 = hash2(x0 + 1, y0 + 1, salt);
	return lerp(lerp(v00, v10, fx), lerp(v01, v11, fx), fy);
}

export function fbm2(x: number, y: number, octaves = 5, salt = 0): number {
	let sum = 0;
	let amp = 0.5;
	let freq = 1;
	let norm = 0;
	for (let i = 0; i < octaves; i++) {
		sum += (valueNoise2(x * freq, y * freq, salt + i * 19) * 2 - 1) * amp;
		norm += amp;
		amp *= 0.5;
		freq *= 2.02;
	}
	return sum / norm;
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
	const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
	return t * t * (3 - 2 * t);
}
