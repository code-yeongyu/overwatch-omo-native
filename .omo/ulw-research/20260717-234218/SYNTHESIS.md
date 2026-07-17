# Research Synthesis: Overwatch Browser Shooter

## Game spec (Soldier: 76 + Practice Range)
- Practice Range: spawn room, firing lanes at 5-40m, moving targets, hero-bot plateau, jump pad, ultimate pickup.
- Soldier: 76 kit: Pulse Rifle (hitscan, 30 rounds, 9 RPS, 1.5s reload, 19 dmg, falloff 30-50m), Sprint (+50%, cancel on fire, 0.3s recovery), Helix Rockets (projectile 50m/s, 6s CD, 120 direct/80-40 splash, self-damage 50%), Biotic Field (40 HP/s, 5s, 5m, 15s CD), Tactical Visor (6s, auto-aim 45° cone/45m, 0.5s reload).
- Animations: idle, run, sprint, jump/land, primary fire, reload, helix rockets, biotic field, ultimate, hit/death.

## Recommended architecture
- WebGL2 via Three.js for 3D rendering.
- Custom data-oriented ECS-like world with numeric entity IDs and typed-array stores.
- Fixed 60 Hz simulation step with accumulator and render interpolation.
- Input: KeyboardEvent.code, pointer lock with unadjustedMovement, action-state input layer.
- Collision: player capsule vs static AABBs, sphere/capsule targets, hitscan raycast, swept projectile segments, uniform spatial hash broad phase.
- Audio: native Web Audio API, procedural SFX, look-ahead sequencer for generative music, no external assets.
- Performance: 15 ms p95 frame budget, performance.mark measures, Chrome DevTools, Spector.js.

## Tooling
- Bun + Vite + tsgo 7.0.0-dev for typecheck + Biome 2.x for lint/format + Vitest for tests.
- Strict tsconfig with moduleResolution bundler, isolatedModules, verbatimModuleSyntax, noUncheckedIndexedAccess, exactOptionalPropertyTypes.

## Sources
- Overwatch Wiki - Practice Range: https://overwatch.fandom.com/wiki/Practice_Range
- Overwatch Wiki - Soldier: 76: https://overwatch.fandom.com/wiki/Soldier:_76
- MDN WebGL: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API
- Three.js: https://threejs.org/
- Glenn Fiedler Fix Your Timestep: https://gafferongames.com/post/fix_your_timestep/
- Web Audio API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- TypeScript-go: https://github.com/microsoft/typescript-go
