# Overwatch OMO Native

A browser-based, single-player Overwatch-style Practice Range (연습장) featuring a fully playable Soldier: 76 hero.

Built with **TypeScript 7 (tsgo)**, **Three.js**, **Biome**, **Vite**, and **Bun**.

## Screenshots

![Lobby](.omo/evidence/visual-qa/01-lobby.png)
![In-game](.omo/evidence/visual-qa/02-game.png)
![Firing](.omo/evidence/visual-qa/04-fired.png)

## Features

- Lobby with hero selection and Practice Range launch
- First-person WASD + mouse look with pointer lock
- Soldier: 76 hero kit:
  - Heavy Pulse Rifle (hitscan, 30 rounds, reload, falloff)
  - Sprint
  - Helix Rockets
  - Biotic Field
  - Tactical Visor (ultimate)
- Animated first-person weapon and VFX
- Procedural audio SFX and generative background music
- 60 FPS performance target with in-frame instrumentation

## Performance

Measured on Apple M5 Max at 1920x1080 for 60 seconds:

- p50 frame time: 13.8 ms (72.5 FPS)
- p95 frame time: 16.1 ms (62.1 FPS)
- p99 frame time: 17.0 ms (58.8 FPS)
- max spike: 67.2 ms

Run the benchmark yourself with `bun run script/qa/perf-benchmark.mjs`.

## Quick start

```bash
bun install
bun run dev
```

Open http://localhost:5173 in Chrome.

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start Vite dev server |
| `bun run build` | Type-check and build for production |
| `bun run typecheck` | Run tsgo --noEmit |
| `bun run check` | Run Biome lint + format check |
| `bun run test` | Run Vitest |

## Controls

- `W/A/S/D` — Move
- `Shift` — Sprint
- `Space` — Jump
- `Mouse` — Aim
- `LMB` — Fire
- `R` — Reload
- `E` — Helix Rockets
- `Q` — Tactical Visor
- `LShift` or `F` — Biotic Field

## License

MIT
