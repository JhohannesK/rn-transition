import {
	BufferAttribute,
	BufferGeometry,
	Color,
	DoubleSide,
	DynamicDrawUsage,
	InstancedBufferAttribute,
	InstancedMesh,
	Matrix4,
	Quaternion,
	ShaderMaterial,
	Vector3,
} from "three";
import { mulberry32 } from "../math/noise";
import { LIGHT_GLSL, SCAN_GLSL, type SharedUniforms } from "./uniforms";
import { ISLAND_RADIUS, islandHeight, islandNormal, inPond } from "./island";

function bladeGeometry(): BufferGeometry {
	const w = 0.016;
	const h = 0.17;
	const positions = new Float32Array([
		-w, 0, 0,
		w, 0, 0,
		-w * 0.55, h * 0.48, 0.008,
		w * 0.42, h * 0.52, -0.006,
		0, h, 0.012,
	]);
	const normals = new Float32Array([
		0, 0.15, 1,
		0, 0.15, 1,
		0.1, 0.2, 1,
		-0.1, 0.2, 1,
		0, 0.4, 1,
	]);
	const indices = [0, 1, 2, 1, 3, 2, 2, 3, 4];
	const geo = new BufferGeometry();
	geo.setAttribute("position", new BufferAttribute(positions, 3));
	geo.setAttribute("normal", new BufferAttribute(normals, 3));
	geo.setIndex(indices);
	return geo;
}

function mossMaterial(uniforms: SharedUniforms): ShaderMaterial {
	return new ShaderMaterial({
		uniforms,
		side: DoubleSide,
		vertexShader: /* glsl */ `
      attribute float aPhase;
      attribute vec3 aColor;
      varying vec3 vWorld;
      varying vec3 vNormal;
      varying vec3 vColor;
      varying float vHeight;
      uniform float uTime;
      uniform float uWind;
      void main() {
        vec3 local = position;
        float tip = clamp(position.y / 0.17, 0.0, 1.0);
        float gust = sin(uTime * 1.35 + aPhase) * 0.13 * uWind;
        float cross = cos(uTime * 1.05 + aPhase * 1.37) * 0.08 * uWind;
        local.x += gust * tip * tip;
        local.z += cross * tip * tip;
        vec4 world = instanceMatrix * vec4(local, 1.0);
        vWorld = world.xyz;
        vNormal = normalize(mat3(instanceMatrix) * normal);
        vColor = aColor;
        vHeight = tip;
        gl_Position = projectionMatrix * viewMatrix * world;
      }
    `,
		fragmentShader: /* glsl */ `
      ${SCAN_GLSL}
      ${LIGHT_GLSL}
      varying vec3 vWorld;
      varying vec3 vNormal;
      varying vec3 vColor;
      varying float vHeight;
      void main() {
        if (unscanned(vWorld)) discard;
        vec3 n = normalize(vNormal);
        if (!gl_FrontFacing) n = -n;
        vec3 albedo = mix(vColor * 0.72, vColor, vHeight);
        albedo = mix(albedo, vec3(0.45, 0.42, 0.22), vHeight * 0.18);
        vec3 col = shadeLambert(albedo, n);
        float dist = length(vWorld - cameraPosition);
        col = applyFog(col, dist);
        gl_FragColor = vec4(toGamma(col), 1.0);
      }
    `,
	});
}

export function pickBladeCount(): number {
	const cores = navigator.hardwareConcurrency || 4;
	return Math.min(72_000, Math.max(28_000, cores * 7_000));
}

export function createMoss(uniforms: SharedUniforms, targetCount?: number) {
	const count = targetCount ?? pickBladeCount();
	const rng = mulberry32(0x6272796f);
	const geometry = bladeGeometry();
	const material = mossMaterial(uniforms);
	const mesh = new InstancedMesh(geometry, material, count);
	mesh.frustumCulled = false;
	mesh.instanceMatrix.setUsage(DynamicDrawUsage);

	const phases = new Float32Array(count);
	const colors = new Float32Array(count * 3);
	const matrix = new Matrix4();
	const quat = new Quaternion();
	const yaw = new Quaternion();
	const up = new Vector3(0, 1, 0);
	const pos = new Vector3();
	const scale = new Vector3();
	const aligned = new Vector3();
	const tint = new Color();
	const palettes = [
		new Color("#2f5a24"),
		new Color("#4b7a2e"),
		new Color("#6d8f34"),
		new Color("#3d6a2a"),
		new Color("#7a8f3a"),
		new Color("#2a4a20"),
	];

	let placed = 0;
	let attempts = 0;
	const maxAttempts = count * 6;
	while (placed < count && attempts < maxAttempts) {
		attempts += 1;
		const radius = ISLAND_RADIUS * 0.97 * Math.sqrt(rng());
		const theta = rng() * Math.PI * 2;
		const x = Math.cos(theta) * radius;
		const z = Math.sin(theta) * radius;
		if (inPond(x, z)) continue;
		const y = islandHeight(x, z);
		if (!Number.isFinite(y) || y < 0.16) continue;
		const normal = islandNormal(x, z);
		if (normal.y < 0.48) continue;

		aligned.copy(normal).lerp(up, 0.58).normalize();
		quat.setFromUnitVectors(up, aligned);
		yaw.setFromAxisAngle(up, rng() * Math.PI * 2);
		quat.multiply(yaw);
		const s = 0.72 + rng() * 1.15;
		scale.set(s, s * (0.85 + rng() * 0.55), s);
		pos.set(x, y - 0.008, z);
		matrix.compose(pos, quat, scale);
		mesh.setMatrixAt(placed, matrix);

		phases[placed] = rng() * Math.PI * 2;
		tint.copy(palettes[placed % palettes.length]).offsetHSL((rng() - 0.5) * 0.04, (rng() - 0.5) * 0.08, (rng() - 0.5) * 0.06);
		colors[placed * 3] = tint.r;
		colors[placed * 3 + 1] = tint.g;
		colors[placed * 3 + 2] = tint.b;
		placed += 1;
	}

	mesh.count = placed;
	mesh.instanceMatrix.needsUpdate = true;
	geometry.setAttribute("aPhase", new InstancedBufferAttribute(phases.subarray(0, placed), 1));
	geometry.setAttribute("aColor", new InstancedBufferAttribute(colors.subarray(0, placed * 3), 3));

	return { mesh, count: placed, material };
}
