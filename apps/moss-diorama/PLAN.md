# moss-diorama — Plan

A small WebGL tech demo: a procedural floating island carpeted in tens of
thousands of instanced moss blades, with a pointer-orbit camera, a
photoperiod slider, weather, and a wireframe scan-reveal on load.

## Reference (inspiration only)

- Live: https://mengto.github.io/sylva
- Source: https://github.com/MengTo/sylva
- Technique notes (reusable skills, not Sylva's page):
  - https://github.com/MengTo/Skills (`build-wireframe-scan-reveal`,
    `add-mouse-driven-orbit`)

Sylva's README states **no license is granted** for reuse or redistribution of
its code, design, or artwork. This demo does **not** copy that page, shaders,
layout, root/arch form, copy, or assets. It is an original floating-holm
specimen: different silhouette, different HUD, original shaders, scene-scaled
scan constants. Three.js remains MIT.

## Scope

- Procedural floating island (top turf, cliff rim, rocky underside). No GLB,
  HDRI, or texture downloads.
- Instanced moss/grass blades: target **40k–80k** on a capable GPU, one
  `InstancedMesh` draw, wind in the vertex shader.
- Pointer orbit: damped drag orbit + wheel zoom + a shallow idle pointer arc.
- Photoperiod slider: sun/moon arc, sky + fog colour, key/fill intensity.
- Weather: **Clear** / **Rain** (GPU particles) / **Fog** (exp2 + muted sun).
- Load intro: world-space wireframe scan; cage leads the solid, then the cage
  is disposed. Replay control. `prefers-reduced-motion` skips the advance.
- Renderer: `THREE.WebGLRenderer` (WebGL2, not WebGPU) so headless capture
  works.

## Stack

| Piece | Choice |
| --- | --- |
| Runtime / PM | Bun (`bun install && bun run dev`) |
| Bundler | Vite (vanilla TypeScript, ESM) |
| Renderer | three.js `WebGLRenderer` |
| Language | TypeScript (strict) |
| Assets | All procedural; fonts bundled via `@fontsource` |

## Scene

| Layer | Notes |
| --- | --- |
| Island | Shared height fn for mesh + moss placement; vertex colours by slope |
| Moss | Triangle-strip blades, instance colour/phase, scan discard + wind |
| Rocks | A few noise-warped icosahedra for silhouette |
| Sky | Inside-out dome: zenith/horizon lerp + sun/moon disc |
| Lights | Directional key (sun/moon) + hemi fill; no shadow maps |
| Rain | Instanced streaks, shader-wrapped in a volume over the holm |
| Scan | `LineSegments` cage from island edges; shared `uScanRadius` |

## UI

Field-station specimen overlay (not a Sylva editorial clone):

- Kicker + display title **Holm**
- Photoperiod range input
- Atmosphere segmented control (Clear / Rain / Fog)
- Replay survey button + live blade/renderer status

## Validation

- `bun install && bun run dev` from `apps/moss-diorama/` serves Vite.
- `bun run typecheck` passes (`tsc --noEmit`).
- Manual pass: load scan, orbit, day/night sweep, all three weathers, replay.
  Capture **screenshot + screen recording** and attach them to the PR.
