import { BackSide, Color, Mesh, ShaderMaterial, SphereGeometry } from "three";
import type { SharedUniforms } from "./uniforms";

export function createSky(uniforms: SharedUniforms) {
	const material = new ShaderMaterial({
		uniforms: {
			...uniforms,
			uMoonColor: { value: new Color("#c9d4ee") },
		},
		side: BackSide,
		depthWrite: false,
		vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vec4 world = modelMatrix * vec4(position, 1.0);
        vDir = normalize(position);
        gl_Position = projectionMatrix * viewMatrix * world;
      }
    `,
		fragmentShader: /* glsl */ `
      uniform vec3 uHorizon;
      uniform vec3 uZenith;
      uniform vec3 uSunDir;
      uniform vec3 uSunColor;
      uniform vec3 uMoonColor;
      uniform float uNight;
      varying vec3 vDir;
      vec3 toGamma(vec3 color) {
        return pow(max(color, vec3(0.0)), vec3(0.454545));
      }
      void main() {
        vec3 dir = normalize(vDir);
        float h = dir.y;
        vec3 col = mix(uHorizon, uZenith, smoothstep(-0.2, 0.82, h));
        float sun = pow(max(dot(dir, uSunDir), 0.0), 1600.0);
        float glow = pow(max(dot(dir, uSunDir), 0.0), 28.0);
        float above = smoothstep(-0.08, 0.08, uSunDir.y);
        col += uSunColor * sun * 2.4 * above;
        col += uSunColor * glow * 0.28 * above;
        vec3 moonDir = normalize(-uSunDir + vec3(0.08, 0.04, -0.05));
        float moon = pow(max(dot(dir, moonDir), 0.0), 2200.0);
        col += uMoonColor * moon * uNight * 1.6;
        gl_FragColor = vec4(toGamma(col), 1.0);
      }
    `,
	});
	const mesh = new Mesh(new SphereGeometry(80, 32, 20), material);
	mesh.frustumCulled = false;
	return { mesh, material };
}
