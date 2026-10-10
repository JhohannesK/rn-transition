import {
	BufferAttribute,
	BufferGeometry,
	Color,
	InstancedBufferAttribute,
	InstancedMesh,
	Matrix4,
	Points,
	PointsMaterial,
	Quaternion,
	ShaderMaterial,
	Vector3,
} from "three";
import { mulberry32 } from "../math/noise";
import type { SharedUniforms, Weather } from "./uniforms";

function rainMaterial(uniforms: SharedUniforms): ShaderMaterial {
	return new ShaderMaterial({
		uniforms: {
			...uniforms,
			uRainHeight: { value: 10 },
			uRainBase: { value: -2.4 },
			uRainColor: { value: new Color("#b7c8d6") },
		},
		transparent: true,
		depthWrite: false,
		vertexShader: /* glsl */ `
      attribute float aOffset;
      uniform float uTime;
      uniform float uRainHeight;
      uniform float uRainBase;
      varying float vAlpha;
      void main() {
        vec3 local = position;
        vec4 origin = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        float y = uRainBase + mod(origin.y + aOffset - uTime * 11.5, uRainHeight);
        vec4 world = instanceMatrix * vec4(local, 1.0);
        world.y = y + local.y;
        vAlpha = 0.45;
        gl_Position = projectionMatrix * viewMatrix * world;
      }
    `,
		fragmentShader: /* glsl */ `
      uniform vec3 uRainColor;
      varying float vAlpha;
      void main() {
        gl_FragColor = vec4(uRainColor, vAlpha);
      }
    `,
	});
}

export function createRain(uniforms: SharedUniforms, count = 4200) {
	const geo = new BufferGeometry();
	geo.setAttribute(
		"position",
		new BufferAttribute(new Float32Array([-0.006, 0.14, 0, 0.006, 0.14, 0, 0, -0.14, 0]), 3),
	);
	geo.setIndex([0, 1, 2]);
	const material = rainMaterial(uniforms);
	const mesh = new InstancedMesh(geo, material, count);
	mesh.frustumCulled = false;
	mesh.visible = false;

	const rng = mulberry32(0x7261696e);
	const offsets = new Float32Array(count);
	const matrix = new Matrix4();
	const quat = new Quaternion();
	const pos = new Vector3();
	const scale = new Vector3(1, 1, 1);
	for (let i = 0; i < count; i++) {
		pos.set((rng() - 0.5) * 14, rng() * 10, (rng() - 0.5) * 14);
		quat.identity();
		matrix.compose(pos, quat, scale);
		mesh.setMatrixAt(i, matrix);
		offsets[i] = rng() * 10;
	}
	geo.setAttribute("aOffset", new InstancedBufferAttribute(offsets, 1));
	return { mesh, material };
}

export function createFireflies(count = 36) {
	const positions = new Float32Array(count * 3);
	const rng = mulberry32(0x666c79);
	for (let i = 0; i < count; i++) {
		const r = 0.6 + rng() * 3.2;
		const a = rng() * Math.PI * 2;
		positions[i * 3] = Math.cos(a) * r;
		positions[i * 3 + 1] = 0.4 + rng() * 1.6;
		positions[i * 3 + 2] = Math.sin(a) * r;
	}
	const geo = new BufferGeometry();
	geo.setAttribute("position", new BufferAttribute(positions, 3));
	const material = new PointsMaterial({
		color: "#d9e38a",
		size: 0.045,
		transparent: true,
		opacity: 0,
		depthWrite: false,
		sizeAttenuation: true,
	});
	const points = new Points(geo, material);
	points.frustumCulled = false;
	return { points, material, positions };
}

export function updateFireflies(
	positions: Float32Array,
	material: PointsMaterial,
	time: number,
	night: number,
): void {
	material.opacity = night * 0.85;
	material.size = 0.04 + Math.sin(time * 3.2) * 0.006;
	for (let i = 0; i < positions.length; i += 3) {
		positions[i] += Math.sin(time * 0.7 + i) * 0.0012;
		positions[i + 1] += Math.cos(time * 0.9 + i * 0.3) * 0.0009;
		positions[i + 2] += Math.sin(time * 0.55 + i * 0.2) * 0.001;
	}
	material.needsUpdate = true;
}

export function weatherFogDensity(weather: Weather): number {
	switch (weather) {
		case "clear":
			return 0.016;
		case "rain":
			return 0.04;
		case "fog":
			return 0.112;
		default: {
			const _never: never = weather;
			return _never;
		}
	}
}

export function weatherWind(weather: Weather): number {
	switch (weather) {
		case "clear":
			return 1;
		case "rain":
			return 1.55;
		case "fog":
			return 0.45;
		default: {
			const _never: never = weather;
			return _never;
		}
	}
}
