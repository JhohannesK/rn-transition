import { Color, Vector3 } from "three";

export type Weather = "clear" | "rain" | "fog";

export function weatherLabel(weather: Weather): string {
	switch (weather) {
		case "clear":
			return "Clear";
		case "rain":
			return "Rain";
		case "fog":
			return "Fog";
		default: {
			const _never: never = weather;
			return _never;
		}
	}
}

export function createSharedUniforms() {
	return {
		uTime: { value: 0 },
		uSunDir: { value: new Vector3(0.35, 0.82, 0.28).normalize() },
		uSunColor: { value: new Color(1.0, 0.93, 0.78) },
		uAmbient: { value: new Color(0.16, 0.2, 0.24) },
		uFogColor: { value: new Color(0.45, 0.58, 0.66) },
		uFogDensity: { value: 0.018 },
		uScanOrigin: { value: new Vector3(-4.2, -0.8, -2.6) },
		uScanRadius: { value: 0 },
		uScanEnabled: { value: 1 },
		uScanLag: { value: 0.62 },
		uWind: { value: 1 },
		uNight: { value: 0 },
		uHorizon: { value: new Color(0.72, 0.84, 0.9) },
		uZenith: { value: new Color(0.22, 0.42, 0.68) },
	};
}

export type SharedUniforms = ReturnType<typeof createSharedUniforms>;

export const SCAN_GLSL = /* glsl */ `
uniform vec3 uScanOrigin;
uniform float uScanRadius;
uniform float uScanEnabled;
uniform float uScanLag;

bool unscanned(vec3 worldPosition) {
  if (uScanEnabled < 0.5) return false;
  float wobble =
      sin(worldPosition.y * 7.4 + worldPosition.x * 4.8) * 0.11
    + sin(worldPosition.z * 9.1 + worldPosition.y * 5.6) * 0.06;
  return distance(worldPosition, uScanOrigin) > uScanRadius - uScanLag + wobble;
}
`;

export const LIGHT_GLSL = /* glsl */ `
uniform vec3 uSunDir;
uniform vec3 uSunColor;
uniform vec3 uAmbient;
uniform vec3 uFogColor;
uniform float uFogDensity;

vec3 shadeLambert(vec3 albedo, vec3 normal) {
  float ndl = max(dot(normal, uSunDir), 0.0);
  float wrap = max(dot(normal, uSunDir) * 0.5 + 0.5, 0.0);
  float lit = mix(wrap, ndl, 0.62);
  return albedo * (uAmbient + uSunColor * lit);
}

vec3 applyFog(vec3 color, float dist) {
  float fog = 1.0 - exp(-uFogDensity * uFogDensity * dist * dist);
  return mix(color, uFogColor, clamp(fog, 0.0, 1.0));
}

vec3 toGamma(vec3 color) {
  return pow(max(color, vec3(0.0)), vec3(0.454545));
}
`;
