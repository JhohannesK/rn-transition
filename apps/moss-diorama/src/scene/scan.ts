import { LineSegments, type ShaderMaterial } from "three";
import { createCageGeometry, createCageMaterial } from "./island";
import type { SharedUniforms } from "./uniforms";

function easeOut(t: number): number {
	return 1 - (1 - t) ** 1.35;
}

function smoothstep(a: number, b: number, x: number): number {
	const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
	return t * t * (3 - 2 * t);
}

export class ScanReveal {
	readonly duration = 3.55;
	readonly maxRadius = 15.5;
	elapsed = 0;
	complete = false;
	private reduced: boolean;
	private cage: LineSegments | null = null;
	private cageMaterial: ShaderMaterial | null = null;
	private readonly uniforms: SharedUniforms;
	private readonly parent: { add: (obj: LineSegments) => void; remove: (obj: LineSegments) => void };

	constructor(
		uniforms: SharedUniforms,
		parent: { add: (obj: LineSegments) => void; remove: (obj: LineSegments) => void },
		reduced: boolean,
	) {
		this.uniforms = uniforms;
		this.parent = parent;
		this.reduced = reduced;
		if (reduced) {
			this.finish(true);
			return;
		}
		this.mountCage();
	}

	private mountCage(): void {
		this.disposeCage();
		this.cageMaterial = createCageMaterial(this.uniforms);
		this.cage = new LineSegments(createCageGeometry(), this.cageMaterial);
		this.parent.add(this.cage);
	}

	replay(): void {
		if (this.reduced) {
			this.finish(true);
			return;
		}
		this.elapsed = 0;
		this.complete = false;
		this.uniforms.uScanEnabled.value = 1;
		this.uniforms.uScanRadius.value = 0;
		this.mountCage();
	}

	update(dt: number): "scanning" | "complete" | "still" {
		if (this.reduced) return "still";
		if (this.complete) return "complete";
		this.elapsed += dt;
		const e = Math.min(1, this.elapsed / this.duration);
		this.uniforms.uScanRadius.value = easeOut(e) * this.maxRadius;
		this.uniforms.uScanEnabled.value = 1;
		const opacity = Math.min(1, e / 0.06) * (1 - smoothstep(0.72, 1, e));
		if (this.cageMaterial) {
			this.cageMaterial.uniforms.uWireOpacity.value = opacity;
		}
		if (e >= 1) this.finish(false);
		return this.complete ? "complete" : "scanning";
	}

	private finish(still: boolean): void {
		this.complete = true;
		this.uniforms.uScanEnabled.value = 0;
		this.uniforms.uScanRadius.value = this.maxRadius;
		this.disposeCage();
		if (still) {
			this.uniforms.uScanEnabled.value = 1;
			this.uniforms.uScanRadius.value = this.maxRadius * 0.62;
			this.mountCage();
			if (this.cageMaterial) this.cageMaterial.uniforms.uWireOpacity.value = 0.7;
		}
	}

	private disposeCage(): void {
		if (!this.cage) return;
		this.parent.remove(this.cage);
		this.cage.geometry.dispose();
		this.cageMaterial?.dispose();
		this.cage = null;
		this.cageMaterial = null;
	}
}
