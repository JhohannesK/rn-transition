import {
	AdditiveBlending,
	BufferAttribute,
	BufferGeometry,
	Color,
	DoubleSide,
	IcosahedronGeometry,
	Mesh,
	PlaneGeometry,
	ShaderMaterial,
	Vector3,
	type ColorRepresentation,
} from "three";
import { fbm2, mulberry32, smoothstep } from "../math/noise";
import { LIGHT_GLSL, SCAN_GLSL, type SharedUniforms } from "./uniforms";

export const ISLAND_RADIUS = 4.35;
export const WATER_LEVEL = 0.38;
export const WATER_RADIUS = 0.95;

	const TOP_MOSS = new Color("#2f6a28");
	const TOP_LIT = new Color("#6fa83a");
	const DIRT = new Color("#6a5340");
const ROCK = new Color("#6d675e");
const ROCK_DARK = new Color("#1f1c19");

export function islandHeight(x: number, z: number): number {
	const r = Math.min(Math.hypot(x, z), ISLAND_RADIUS);
	const n = fbm2(x * 0.32, z * 0.32, 5, 1);
	const ridge = Math.abs(fbm2(x * 0.18 + 8, z * 0.18, 4, 4));
	const mound = fbm2(x * 0.55 + 2.2, z * 0.55, 3, 9) * 0.22;
	const rim = Math.exp(-(((r - ISLAND_RADIUS * 0.78) / 0.42) ** 2)) * 0.28;
	const lip = smoothstep(ISLAND_RADIUS, ISLAND_RADIUS * 0.62, r) ** 0.62;
	let y = (0.52 + n * 0.48 + ridge * 0.2 + mound + rim) * lip;
	if (inPond(x, z)) y = Math.min(y, WATER_LEVEL - 0.02);
	return y;
}

export function islandBottom(x: number, z: number): number {
	const r = Math.hypot(x, z);
	const n = fbm2(x * 0.62 + 21, z * 0.62, 4, 17);
	const tip = Math.max(0, 1 - r / 3.05);
	return -0.28 - n * 0.85 - tip * tip * 2.55;
}

export function inPond(x: number, z: number): boolean {
	const r = Math.hypot(x, z);
	if (r > WATER_RADIUS) return false;
	const basin = fbm2(x * 0.85 + 3.1, z * 0.85, 3, 12);
	return basin < 0.18;
}

export function islandNormal(x: number, z: number): Vector3 {
	const e = 0.045;
	const h = islandHeight(x, z);
	const dx = islandHeight(x + e, z) - h;
	const dz = islandHeight(x, z + e) - h;
	return new Vector3(-dx, e, -dz).normalize();
}

function pushColor(colors: number[], color: Color): void {
	colors.push(color.r, color.g, color.b);
}

function lerpColor(out: Color, a: Color, b: Color, t: number): Color {
	return out.copy(a).lerp(b, t);
}

function topColor(x: number, z: number, y: number, nx: number, target: Color): Color {
	const r = Math.hypot(x, z) / ISLAND_RADIUS;
	const slope = 1 - nx;
	if (r > 0.88 || slope > 0.62) {
		return lerpColor(target, DIRT, ROCK, smoothstep(0.55, 0.85, Math.max(slope, r)));
	}
	if (slope > 0.38) {
		return lerpColor(target, TOP_MOSS, DIRT, smoothstep(0.38, 0.62, slope));
	}
	const lush = smoothstep(0.2, 0.7, y);
	return lerpColor(target, TOP_MOSS, TOP_LIT, lush * 0.55 + (1 - r) * 0.2);
}

export function buildIslandGeometry(radial: number, rings: number): BufferGeometry {
	const positions: number[] = [];
	const colors: number[] = [];
	const indices: number[] = [];
	const tmp = new Color();

	positions.push(0, islandHeight(0, 0), 0);
	pushColor(colors, topColor(0, 0, islandHeight(0, 0), 1, tmp));

	for (let ring = 1; ring <= rings; ring++) {
		const radius = (ring / rings) * ISLAND_RADIUS;
		for (let spoke = 0; spoke < radial; spoke++) {
			const theta = (spoke / radial) * Math.PI * 2;
			const x = Math.cos(theta) * radius;
			const z = Math.sin(theta) * radius;
			const y = islandHeight(x, z);
			const n = islandNormal(x, z);
			positions.push(x, y, z);
			pushColor(colors, topColor(x, z, y, n.y, tmp));
		}
	}

	const topCount = 1 + rings * radial;

	positions.push(0, islandBottom(0, 0), 0);
	pushColor(colors, ROCK_DARK);
	for (let ring = 1; ring <= rings; ring++) {
		const radius = (ring / rings) * ISLAND_RADIUS;
		for (let spoke = 0; spoke < radial; spoke++) {
			const theta = (spoke / radial) * Math.PI * 2;
			const x = Math.cos(theta) * radius;
			const z = Math.sin(theta) * radius;
			const y = islandBottom(x, z);
			positions.push(x, y, z);
			const shade = smoothstep(-3.2, -0.4, y);
			pushColor(colors, lerpColor(tmp, ROCK_DARK, ROCK, shade));
		}
	}

	for (let spoke = 0; spoke < radial; spoke++) {
		indices.push(0, 1 + spoke, 1 + ((spoke + 1) % radial));
	}
	for (let ring = 1; ring < rings; ring++) {
		const a0 = 1 + (ring - 1) * radial;
		const b0 = 1 + ring * radial;
		for (let spoke = 0; spoke < radial; spoke++) {
			const a = a0 + spoke;
			const b = a0 + ((spoke + 1) % radial);
			const c = b0 + spoke;
			const d = b0 + ((spoke + 1) % radial);
			indices.push(a, c, b, b, c, d);
		}
	}

	const botOrigin = topCount;
	for (let spoke = 0; spoke < radial; spoke++) {
		indices.push(botOrigin, botOrigin + 1 + ((spoke + 1) % radial), botOrigin + 1 + spoke);
	}
	for (let ring = 1; ring < rings; ring++) {
		const a0 = botOrigin + 1 + (ring - 1) * radial;
		const b0 = botOrigin + 1 + ring * radial;
		for (let spoke = 0; spoke < radial; spoke++) {
			const a = a0 + spoke;
			const b = a0 + ((spoke + 1) % radial);
			const c = b0 + spoke;
			const d = b0 + ((spoke + 1) % radial);
			indices.push(a, b, c, b, d, c);
		}
	}

	const topOuter = 1 + (rings - 1) * radial;
	const botOuter = botOrigin + 1 + (rings - 1) * radial;
	for (let spoke = 0; spoke < radial; spoke++) {
		const a = topOuter + spoke;
		const b = topOuter + ((spoke + 1) % radial);
		const c = botOuter + spoke;
		const d = botOuter + ((spoke + 1) % radial);
		indices.push(a, c, b, b, c, d);
	}

	const geometry = new BufferGeometry();
	geometry.setAttribute("position", new BufferAttribute(new Float32Array(positions), 3));
	geometry.setAttribute("color", new BufferAttribute(new Float32Array(colors), 3));
	geometry.setIndex(indices);
	geometry.computeVertexNormals();
	return geometry;
}

function islandMaterial(uniforms: SharedUniforms): ShaderMaterial {
	return new ShaderMaterial({
		uniforms,
		vertexColors: true,
		vertexShader: /* glsl */ `
      varying vec3 vWorld;
      varying vec3 vNormal;
      varying vec3 vColor;
      void main() {
        vec4 world = modelMatrix * vec4(position, 1.0);
        vWorld = world.xyz;
        vNormal = normalize(mat3(modelMatrix) * normal);
        vColor = color;
        gl_Position = projectionMatrix * viewMatrix * world;
      }
    `,
		fragmentShader: /* glsl */ `
      ${SCAN_GLSL}
      ${LIGHT_GLSL}
      varying vec3 vWorld;
      varying vec3 vNormal;
      varying vec3 vColor;
      void main() {
        if (unscanned(vWorld)) discard;
        vec3 n = normalize(vNormal);
        vec3 albedo = vColor + vec3(0.04, 0.07, 0.02);
        vec3 col = shadeLambert(albedo, n);
        float dist = length(vWorld - cameraPosition);
        col = applyFog(col, dist);
        gl_FragColor = vec4(toGamma(col), 1.0);
      }
    `,
	});
}

function waterMaterial(uniforms: SharedUniforms): ShaderMaterial {
	return new ShaderMaterial({
		uniforms,
		transparent: true,
		side: DoubleSide,
		depthWrite: false,
		vertexShader: /* glsl */ `
      varying vec3 vWorld;
      varying vec2 vUv;
      void main() {
        vec4 world = modelMatrix * vec4(position, 1.0);
        vWorld = world.xyz;
        vUv = uv;
        gl_Position = projectionMatrix * viewMatrix * world;
      }
    `,
		fragmentShader: /* glsl */ `
      ${SCAN_GLSL}
      ${LIGHT_GLSL}
      uniform float uTime;
      varying vec3 vWorld;
      varying vec2 vUv;
      void main() {
        if (unscanned(vWorld)) discard;
        vec2 p = vUv * 2.0 - 1.0;
        float rip =
            sin(p.x * 18.0 + uTime * 1.6) * 0.35
          + sin(p.y * 14.0 - uTime * 1.2) * 0.35;
        vec3 n = normalize(vec3(-dFdx(rip) * 4.0, 1.0, -dFdy(rip) * 4.0));
        vec3 albedo = mix(vec3(0.12, 0.28, 0.3), vec3(0.22, 0.46, 0.48), 0.5 + rip * 0.2);
        vec3 col = shadeLambert(albedo, n);
        vec3 view = normalize(cameraPosition - vWorld);
        float spec = pow(max(dot(reflect(-uSunDir, n), view), 0.0), 48.0);
        col += uSunColor * spec * 0.55;
        float edge = smoothstep(1.0, 0.55, length(p));
        float dist = length(vWorld - cameraPosition);
        col = applyFog(col, dist);
        gl_FragColor = vec4(toGamma(col), 0.78 * edge);
      }
    `,
	});
}

function placeRocks(uniforms: SharedUniforms, rng: () => number): Mesh[] {
	const rocks: Mesh[] = [];
	const material = islandMaterial(uniforms);
	const attempts = 40;
	for (let i = 0; i < attempts && rocks.length < 7; i++) {
		const radius = 1.3 + rng() * 2.4;
		const theta = rng() * Math.PI * 2;
		const x = Math.cos(theta) * radius;
		const z = Math.sin(theta) * radius;
		if (inPond(x, z)) continue;
		const y = islandHeight(x, z);
		if (!Number.isFinite(y) || y < 0.2) continue;
		const geo = new IcosahedronGeometry(0.18 + rng() * 0.28, 2);
		const pos = geo.attributes.position;
		const color = new Float32Array(pos.count * 3);
		const tint = new Color().setHSL(0.08, 0.08, 0.28 + rng() * 0.1);
		for (let v = 0; v < pos.count; v++) {
			const vx = pos.getX(v);
			const vy = pos.getY(v);
			const vz = pos.getZ(v);
			const d = 1 + fbm2(vx * 3.2 + i, vz * 3.2, 3, 30 + i) * 0.28;
			pos.setXYZ(v, vx * d, vy * d * (0.7 + rng() * 0.2), vz * d);
			color[v * 3] = tint.r;
			color[v * 3 + 1] = tint.g;
			color[v * 3 + 2] = tint.b;
		}
		geo.setAttribute("color", new BufferAttribute(color, 3));
		geo.computeVertexNormals();
		const mesh = new Mesh(geo, material);
		mesh.position.set(x, y + 0.06, z);
		mesh.rotation.set(rng() * 0.8, rng() * 6, rng() * 0.6);
		rocks.push(mesh);
	}
	return rocks;
}

export function createCageGeometry(): BufferGeometry {
	const geo = buildIslandGeometry(28, 12);
	const pos = geo.getAttribute("position");
	const idx = geo.getIndex();
	if (!idx) return geo;
	const seen = new Set<string>();
	const lines: number[] = [];
	const key = (a: number, b: number) => (a < b ? `${a}:${b}` : `${b}:${a}`);
	for (let i = 0; i < idx.count; i += 3) {
		const a = idx.getX(i);
		const b = idx.getX(i + 1);
		const c = idx.getX(i + 2);
		const edges: Array<[number, number]> = [
			[a, b],
			[b, c],
			[c, a],
		];
		for (const [u, v] of edges) {
			const k = key(u, v);
			if (seen.has(k)) continue;
			seen.add(k);
			lines.push(
				pos.getX(u),
				pos.getY(u),
				pos.getZ(u),
				pos.getX(v),
				pos.getY(v),
				pos.getZ(v),
			);
		}
	}
	geo.dispose();
	const cage = new BufferGeometry();
	cage.setAttribute("position", new BufferAttribute(new Float32Array(lines), 3));
	return cage;
}

export function createCageMaterial(
	uniforms: SharedUniforms,
	accent: ColorRepresentation = "#d7e8b4",
): ShaderMaterial {
	return new ShaderMaterial({
		uniforms: {
			...uniforms,
			uWireColor: { value: new Color(accent) },
			uWireOpacity: { value: 1 },
		},
		transparent: true,
		depthWrite: false,
		blending: AdditiveBlending,
		vertexShader: /* glsl */ `
      varying vec3 vWorld;
      void main() {
        vec4 world = modelMatrix * vec4(position, 1.0);
        vWorld = world.xyz;
        gl_Position = projectionMatrix * viewMatrix * world;
      }
    `,
		fragmentShader: /* glsl */ `
      uniform vec3 uScanOrigin;
      uniform float uScanRadius;
      uniform float uWireOpacity;
      uniform vec3 uWireColor;
      varying vec3 vWorld;
      void main() {
        float d = distance(vWorld, uScanOrigin);
        float rim = exp(-pow((d - uScanRadius) / 0.22, 2.0));
        float trail = smoothstep(uScanRadius, uScanRadius - 1.45, d);
        float alpha = (rim * 1.55 + trail * 0.32) * uWireOpacity;
        if (alpha < 0.02) discard;
        gl_FragColor = vec4(uWireColor, alpha);
      }
    `,
	});
}

export function createIsland(uniforms: SharedUniforms) {
	const rng = mulberry32(0x6d6f7373);
	const geometry = buildIslandGeometry(56, 28);
	const material = islandMaterial(uniforms);
	const mesh = new Mesh(geometry, material);

	const water = new Mesh(new PlaneGeometry(WATER_RADIUS * 2.05, WATER_RADIUS * 2.05, 24, 24), waterMaterial(uniforms));
	water.rotation.x = -Math.PI / 2;
	water.position.y = WATER_LEVEL;
	water.renderOrder = 2;

	const rocks = placeRocks(uniforms, rng);

	const shadow = new Mesh(
		new PlaneGeometry(7.4, 5.6),
		new ShaderMaterial({
			uniforms,
			transparent: true,
			depthWrite: false,
			vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
			fragmentShader: /* glsl */ `
        ${SCAN_GLSL}
        varying vec2 vUv;
        void main() {
          vec3 world = vec3((vUv.x - 0.5) * 7.4, -2.6, (vUv.y - 0.5) * 5.6);
          if (unscanned(world)) discard;
          float d = length((vUv - 0.5) * vec2(1.0, 1.25));
          float a = smoothstep(0.5, 0.12, d) * 0.42;
          gl_FragColor = vec4(0.0, 0.0, 0.0, a);
        }
      `,
		}),
	);
	shadow.rotation.x = -Math.PI / 2;
	shadow.position.y = -2.55;

	return { mesh, water, rocks, shadow, material };
}
