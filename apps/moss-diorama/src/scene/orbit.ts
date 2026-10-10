import { PerspectiveCamera, Vector3 } from "three";

function damp(current: number, target: number, lambda: number, dt: number): number {
	return current + (target - current) * (1 - Math.exp(-lambda * dt));
}

export class PointerOrbit {
	readonly look = new Vector3(0, 0.32, 0);
	theta = 0.72;
	phi = 1.12;
	radius = 11.6;
	private goalTheta = 0.72;
	private goalPhi = 1.12;
	private goalRadius = 11.6;
	private pointerX = 0;
	private pointerY = 0;
	private dragging = false;
	private lastX = 0;
	private lastY = 0;
	private idle = 0;

	attach(el: HTMLElement): () => void {
		const onPointerDown = (event: PointerEvent) => {
			if (event.button !== 0) return;
			this.dragging = true;
			this.lastX = event.clientX;
			this.lastY = event.clientY;
			el.setPointerCapture(event.pointerId);
		};
		const onPointerMove = (event: PointerEvent) => {
			const nx = (event.clientX / window.innerWidth) * 2 - 1;
			const ny = (event.clientY / window.innerHeight) * 2 - 1;
			this.pointerX = nx;
			this.pointerY = ny;
			if (!this.dragging) return;
			const dx = event.clientX - this.lastX;
			const dy = event.clientY - this.lastY;
			this.lastX = event.clientX;
			this.lastY = event.clientY;
			this.goalTheta -= dx * 0.0055;
			this.goalPhi = Math.min(1.45, Math.max(0.55, this.goalPhi + dy * 0.0042));
			this.idle = 0;
		};
		const onPointerUp = (event: PointerEvent) => {
			this.dragging = false;
			if (el.hasPointerCapture(event.pointerId)) el.releasePointerCapture(event.pointerId);
		};
		const onWheel = (event: WheelEvent) => {
			event.preventDefault();
			this.goalRadius = Math.min(18, Math.max(6.5, this.goalRadius + event.deltaY * 0.012));
		};
		el.addEventListener("pointerdown", onPointerDown);
		window.addEventListener("pointermove", onPointerMove);
		window.addEventListener("pointerup", onPointerUp);
		el.addEventListener("wheel", onWheel, { passive: false });
		return () => {
			el.removeEventListener("pointerdown", onPointerDown);
			window.removeEventListener("pointermove", onPointerMove);
			window.removeEventListener("pointerup", onPointerUp);
			el.removeEventListener("wheel", onWheel);
		};
	}

	update(dt: number, camera: PerspectiveCamera): void {
		this.idle += dt;
		const lean = this.dragging ? 0 : 1;
		const theta = this.goalTheta + this.pointerX * 0.22 * lean;
		const phi = this.goalPhi + this.pointerY * 0.1 * lean;
		if (!this.dragging && this.idle > 2.4) {
			this.goalTheta += dt * 0.045;
		}
		this.theta = damp(this.theta, theta, 4.2, dt);
		this.phi = damp(this.phi, phi, 4.2, dt);
		this.radius = damp(this.radius, this.goalRadius, 5.2, dt);
		const sinPhi = Math.sin(this.phi);
		camera.position.set(
			this.look.x + this.radius * sinPhi * Math.sin(this.theta),
			this.look.y + this.radius * Math.cos(this.phi),
			this.look.z + this.radius * sinPhi * Math.cos(this.theta),
		);
		camera.lookAt(this.look);
	}
}
