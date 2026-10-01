# rn-screen-transitions-lab

A tiny Expo Router gallery demoing
[react-native-screen-transitions](https://github.com/eds2002/react-native-screen-transitions)
v4 (MIT, by eds2002 / @trpfsu).

## What's inside

- **Gallery → Detail**: bounds-driven shared-element zoom
  (`Transition.Boundary` + `bounds({ id, group }).navigation.zoom()`), with
  drag/pinch-to-dismiss.
- **Detail → Sheet**: `Presets.SlideFromBottom` snap-point sheet
  (detents at 0.6 and 1.0).
- **Gallery → About**: `Presets.ZoomIn`.

See [PLAN.md](./PLAN.md) for scope and validation notes.

## Run it

```bash
bun install
bun run dev        # Expo dev server (press w / a / i, or scan QR in Expo Go)
bun run dev:web    # straight to web
bun run typecheck  # tsc --noEmit
```

Gestures (drag-to-dismiss, pinch, sheet detents) feel best on a device or
simulator; web is fine for a quick look at the flow.
