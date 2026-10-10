import "@fontsource/bodoni-moda/400.css";
import "@fontsource/bodoni-moda/500.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "./style.css";

import {
	AmbientLight,
	Color,
	DirectionalLight,
	LinearSRGBColorSpace,
	PerspectiveCamera,
	Scene,
	WebGLRenderer,
} from "three";
import { applyCycle } from "./scene/cycle";
import { createIsland } from "./scene/island";
import { createMoss, pickBladeCount } from "./scene/moss";
import { PointerOrbit } from "./scene/orbit";
import { ScanReveal } from "./scene/scan";
import { createSky } from "./scene/sky";
import { createSharedUniforms, type Weather } from "./scene/uniforms";
import { createFireflies, createRain, updateFireflies } from "./scene/weather";
import { mountHud } from "./ui/hud";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("#app missing");

const reduced =
	new URLSearchParams(location.search).has("reduced") ||
	window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const state = {
	timeOfDay: 0.38,
	weather: "clear" as Weather,
};

const uniforms = createSharedUniforms();
const scene = new Scene();
scene.background = new Color("#0b1020");

const camera = new PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 140);
const renderer = new WebGLRenderer({
	antialias: true,
	alpha: false,
	powerPreference: "high-performance",
	failIfMajorPerformanceCaveat: false,
	preserveDrawingBuffer: true,
});
renderer.outputColorSpace = LinearSRGBColorSpace;
renderer.debug.checkShaderErrors = true;
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.domElement.className = "view";
renderer.domElement.setAttribute("aria-hidden", "true");
app.appendChild(renderer.domElement);

const hemi = new AmbientLight(0x6a7a80, 0.25);
const key = new DirectionalLight(0xfff1c8, 1.15);
scene.add(hemi, key);

const island = createIsland(uniforms);
scene.add(island.mesh, island.water, island.shadow, ...island.rocks);

const gpuInfo = renderer.getContext().getExtension("WEBGL_debug_renderer_info");
const gpuLabel = gpuInfo
	? String(renderer.getContext().getParameter(gpuInfo.UNMASKED_RENDERER_WEBGL) ?? "")
	: "";
if (/swiftshader|llvmpipe|softpipe|software/i.test(gpuLabel)) {
	renderer.setPixelRatio(1);
}
const moss = createMoss(uniforms, pickBladeCount(gpuLabel));
scene.add(moss.mesh);

const sky = createSky(uniforms);
scene.add(sky.mesh);

const rain = createRain(uniforms);
scene.add(rain.mesh);

const fireflies = createFireflies();
scene.add(fireflies.points);

const scan = new ScanReveal(uniforms, scene, reduced);
const orbit = new PointerOrbit();
const detachOrbit = orbit.attach(renderer.domElement);

const hud = mountHud(app, { time: state.timeOfDay, weather: state.weather }, {
	onTime(value) {
		state.timeOfDay = value;
	},
	onWeather(weather) {
		state.weather = weather;
		hud.setWeather(weather);
		rain.mesh.visible = weather === "rain";
	},
	onReplay() {
		scan.replay();
		hud.setStatus("Scanning holm…");
	},
});
hud.setBladeCount(moss.count, webglLabel(renderer));
if (reduced) hud.setStatus("Reduced motion · survey held at 62%");
else hud.setStatus("Scanning holm…");
renderer.debug.onShaderError = (gl, _program, vs, fs) => {
	const log = `${gl.getShaderInfoLog(vs) ?? ""}\n${gl.getShaderInfoLog(fs) ?? ""}`.trim();
	hud.setStatus(`Shader error: ${log.slice(0, 180)}`);
};

applyCycle(state.timeOfDay, state.weather, uniforms);
key.position.copy(uniforms.uSunDir.value).multiplyScalar(20);

const clock = { last: performance.now(), time: 0, paused: false };
let frame = 0;

function webglLabel(glRenderer: WebGLRenderer): string {
	const gl = glRenderer.getContext();
	return gl instanceof WebGL2RenderingContext ? "WebGL2" : "WebGL";
}

function weatherStatus(weather: Weather): string {
	switch (weather) {
		case "clear":
			return "clear air";
		case "rain":
			return "rain";
		case "fog":
			return "fog bank";
		default: {
			const _never: never = weather;
			return _never;
		}
	}
}

function tick(now: number): void {
	if (clock.paused) {
		clock.last = now;
		return;
	}
	const dt = Math.min(1 / 30, (now - clock.last) / 1000);
	if (dt <= 0) return;
	clock.last = now;
	clock.time += dt;
	uniforms.uTime.value = clock.time;

	applyCycle(state.timeOfDay, state.weather, uniforms);
	key.position.copy(uniforms.uSunDir.value).multiplyScalar(22);
	key.color.copy(uniforms.uSunColor.value);
	key.intensity = 0.35 + Math.max(0, uniforms.uSunDir.value.y) * 1.15;
	hemi.color.copy(uniforms.uAmbient.value);
	if (scene.background instanceof Color) {
		scene.background.copy(uniforms.uFogColor.value);
	}

	rain.mesh.visible = state.weather === "rain";
	updateFireflies(fireflies.positions, fireflies.material, clock.time, uniforms.uNight.value);
	fireflies.points.geometry.attributes.position.needsUpdate = true;

	const phase = scan.update(dt);
	if (phase === "complete" || phase === "still") {
		hud.setBladeCount(moss.count, `${webglLabel(renderer)} · ${weatherStatus(state.weather)}`);
	}

	orbit.update(dt, camera);
	renderer.render(scene, camera);
}

function frameLoop(now: number): void {
	frame = requestAnimationFrame(frameLoop);
	tick(now);
}

function onResize(): void {
	const w = window.innerWidth;
	const h = window.innerHeight;
	camera.aspect = w / Math.max(1, h);
	camera.updateProjectionMatrix();
	renderer.setSize(w, h);
}

window.addEventListener("resize", onResize);
frame = requestAnimationFrame(frameLoop);
const watchdog = window.setInterval(() => {
	if (!clock.paused && performance.now() - clock.last > 48) tick(performance.now());
}, 32);

(
	window as unknown as Window & {
		__holm: {
			pause: () => void;
			resume: () => void;
			setTime: (value: number) => void;
			setWeather: (weather: Weather) => void;
			replay: () => void;
			status: () => string;
			count: number;
		};
	}
).__holm = {
	pause: () => {
		clock.paused = true;
	},
	resume: () => {
		clock.paused = false;
		clock.last = performance.now();
	},
	setTime: (value: number) => {
		state.timeOfDay = value;
		hud.setTime(value);
	},
	setWeather: (weather: Weather) => {
		state.weather = weather;
		hud.setWeather(weather);
		rain.mesh.visible = weather === "rain";
	},
	replay: () => {
		scan.replay();
		hud.setStatus("Scanning holm…");
	},
	status: () => document.querySelector("#stat")?.textContent ?? "",
	count: moss.count,
};

window.addEventListener("pagehide", () => {
	cancelAnimationFrame(frame);
	window.clearInterval(watchdog);
	detachOrbit();
	window.removeEventListener("resize", onResize);
	renderer.dispose();
});
