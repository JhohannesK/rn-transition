# rn-screen-transitions-lab — Plan

A tiny Expo (Bun) lab that demos `react-native-screen-transitions` v4: a small
gallery of transitions, not a product.

- Approved tech: [react-native-screen-transitions](https://github.com/eds2002/react-native-screen-transitions) (eds2002 / @trpfsu), MIT.
- Source bookmark: https://x.com/0xhansky/status/2031027166708691453

## Scope

- 3-step flow: **Gallery (list) → Color detail → Info sheet**, plus a small
  About screen to show one extra preset.
- One **Bounds shared-element zoom** (gallery card → detail hero swatch).
- A couple of **built-in presets**: `SlideFromBottom` (snap-point sheet) and
  `ZoomIn` (About screen).
- No backend, no state libraries, no tests — this is a transitions lab.

## Stack

| Piece | Choice |
| --- | --- |
| Runtime / PM | Bun (`bun install`, `bun run dev`) |
| Framework | Expo SDK 56 + Expo Router (file-based routes) |
| Navigator | `BlankStack` from `react-native-screen-transitions/expo-router` (full transition control) |
| Motion | `react-native-screen-transitions` 4.0.0 + Reanimated 4 + Gesture Handler 2 + Worklets |
| Language | TypeScript (strict) |

Version pins mirror the library's official `starters/expo-router` template, the
known-good matrix for v4 (RN 0.85, React 19.2, Reanimated 4.3, Worklets 0.8).

## Screens

| Route | Screen | Transition |
| --- | --- | --- |
| `/` | Gallery: two-column grid of color cards | Source of bounds; each card is a `Transition.Boundary` with a per-item `id` |
| `/detail/[id]` | Color detail: hero swatch + copy + actions | **Bounds navigation zoom** (`bounds({id, group}).navigation.zoom()`, `Specs.Zoom`, bidirectional + pinch-in dismiss gesture, dimmed backdrop) |
| `/sheet` | Info sheet: how the zoom works | **`Presets.SlideFromBottom`** with snap points `[0.6, 1]` (drag between detents, drag down to dismiss) |
| `/about` | About the lab + credits | **`Presets.ZoomIn`** |

Data is a hard-coded list of 6 color "specimens" in `src/data/colors.ts` —
no network dependency, so the app runs offline.

## Validation

- `bun install && bun run dev` from `apps/rn-screen-transitions-lab/` starts
  the Expo dev server; web runs via `bun run dev:web`, native via Expo Go /
  dev client.
- `bun run typecheck` passes (`tsc --noEmit`).
- Manual pass through the full flow (gallery → detail zoom → sheet → about),
  captured as **screenshot + screen recording** and attached to the PR.
