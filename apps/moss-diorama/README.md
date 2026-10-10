# Holm — moss diorama

Procedural floating-island WebGL demo. Tens of thousands of instanced moss
blades, a pointer-orbit camera, a photoperiod slider, weather, and a
wireframe scan-reveal on load.

Inspired by [Meng To's Sylva](https://mengto.github.io/sylva)
([source](https://github.com/MengTo/sylva)). Sylva grants **no license** for
reuse of its code, design, or artwork. This scene is original: different
silhouette, HUD, shaders, and assets. Three.js is MIT.

## Run

```bash
cd apps/moss-diorama
bun install && bun run dev
```

Open the printed localhost URL. `bun run typecheck` / `bun run build` available.

## Controls

- Drag to orbit, scroll to dolly
- Photoperiod slider: sun, sky, fill
- Atmosphere: Clear / Rain / Fog
- Replay survey: run the scan-reveal again
- `?reduced=1` or `prefers-reduced-motion`: hold a mid-scan still
