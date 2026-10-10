import { Color, Vector3 } from "three";
import type { SharedUniforms, Weather } from "./uniforms";
import { weatherFogDensity, weatherWind } from "./weather";

type Key = {
	t: number;
	zenith: string;
	horizon: string;
	sun: string;
	ambient: string;
	fog: string;
};

const KEYS: Key[] = [
	{ t: 0.0, zenith: "#05070f", horizon: "#0b1020", sun: "#6f7d99", ambient: "#070910", fog: "#07080d" },
	{ t: 0.2, zenith: "#1a2748", horizon: "#e28a52", sun: "#ffb27a", ambient: "#2a1c18", fog: "#6a3d32" },
	{ t: 0.35, zenith: "#3a7ab0", horizon: "#c8e6f4", sun: "#fff1c8", ambient: "#2a3a48", fog: "#8fb4c6" },
	{ t: 0.5, zenith: "#4a90c8", horizon: "#d2eefc", sun: "#fff6d8", ambient: "#3a4c58", fog: "#a8c8d6" },
	{ t: 0.68, zenith: "#2a4a78", horizon: "#f0b07a", sun: "#ffc48a", ambient: "#3a2820", fog: "#b07a58" },
	{ t: 0.8, zenith: "#14182e", horizon: "#c45a3c", sun: "#ff8a5a", ambient: "#1a1214", fog: "#4a2830" },
	{ t: 1.0, zenith: "#05070f", horizon: "#0b1020", sun: "#6f7d99", ambient: "#070910", fog: "#07080d" },
];

const tmpA = new Color();
const tmpB = new Color();

function sampleKey(t: number, pick: (key: Key) => string, target: Color): Color {
	const wrapped = ((t % 1) + 1) % 1;
	let i = 0;
	while (i < KEYS.length - 1 && KEYS[i + 1].t < wrapped) i += 1;
	const a = KEYS[i];
	const b = KEYS[i + 1];
	const span = b.t - a.t || 1;
	const u = (wrapped - a.t) / span;
	return target.copy(tmpA.set(pick(a))).lerp(tmpB.set(pick(b)), u);
}

export function sunDirection(t: number, out: Vector3): Vector3 {
	const tau = t * Math.PI * 2;
	return out.set(Math.sin(tau), -Math.cos(tau), Math.cos(tau) * 0.32).normalize();
}

export function applyCycle(t: number, weather: Weather, uniforms: SharedUniforms): void {
	sunDirection(t, uniforms.uSunDir.value);
	sampleKey(t, (k) => k.sun, uniforms.uSunColor.value);
	sampleKey(t, (k) => k.ambient, uniforms.uAmbient.value);
	sampleKey(t, (k) => k.horizon, uniforms.uHorizon.value);
	sampleKey(t, (k) => k.zenith, uniforms.uZenith.value);
	sampleKey(t, (k) => k.fog, uniforms.uFogColor.value);

	const elev = uniforms.uSunDir.value.y;
	uniforms.uNight.value = elev < 0 ? Math.min(1, -elev * 1.15) : 0;

	tintWeather(weather, uniforms);

	uniforms.uFogDensity.value = weatherFogDensity(weather);
	uniforms.uWind.value = weatherWind(weather);
}

const FOG_HORIZON = new Color("#8a9484");
const FOG_ZENITH = new Color("#6a7468");
const FOG_WASH = new Color("#8c9588");
const RAIN_HORIZON = new Color("#4a5560");
const RAIN_ZENITH = new Color("#2a3340");
const RAIN_FOG = new Color("#4a5560");

function tintWeather(weather: Weather, uniforms: SharedUniforms): void {
	switch (weather) {
		case "clear":
			return;
		case "fog":
			uniforms.uHorizon.value.lerp(FOG_HORIZON, 0.55);
			uniforms.uZenith.value.lerp(FOG_ZENITH, 0.62);
			uniforms.uSunColor.value.multiplyScalar(0.45);
			uniforms.uFogColor.value.lerp(FOG_WASH, 0.7);
			return;
		case "rain":
			uniforms.uHorizon.value.lerp(RAIN_HORIZON, 0.4);
			uniforms.uZenith.value.lerp(RAIN_ZENITH, 0.45);
			uniforms.uSunColor.value.multiplyScalar(0.55);
			uniforms.uFogColor.value.lerp(RAIN_FOG, 0.45);
			return;
		default: {
			const _never: never = weather;
			return _never;
		}
	}
}
