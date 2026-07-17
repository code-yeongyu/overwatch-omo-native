# overwatch-sp - Work Plan

## TL;DR (For humans)

**What you'll get:** A public GitHub repository containing a browser-based, single-player Overwatch-style Practice Range (연습장) with a fully-playable Soldier: 76 hero. The game runs at 60 FPS in Chrome, is built with TypeScript 7 (tsgo), Biome, Vite, and Bun, and ships with a TDD test suite, structured logging, procedural audio, and visual-QA evidence.

**Why this approach:** A full Overwatch clone is AAA scope and impossible in one session. This plan scopes down to the one self-contained mode the user explicitly named — the Practice Range — with one hero (Soldier: 76) so we can deliver depth (animations, abilities, performance, QA) rather than breadth.

**What it will NOT do:** Multiplayer, matchmaking, other heroes, PvP modes, ranked, cosmetics, or a full 3D art pipeline. No external copyrighted assets.

**Decisions I made for you (UNCLEAR intent → best-practice defaults):**
- Renderer: WebGL2 via Three.js (not Canvas 2D) for real 3D perspective, depth, and performance headroom.
- Simulation: custom data-oriented ECS-like world with numeric entity IDs and typed-array stores (not a heavy ECS library).
- Physics: custom capsule-vs-AABB + sphere hitzones + uniform spatial hash (not a physics engine).
- Audio: native Web Audio API with procedural synthesis (no external audio files).
- Assets: procedural low-poly geometry + generated textures; no glTF hero model (replaced by first-person arms/gun + third-person capsule).
- Tests: Vitest for browser-shaped tests, tsgo --noEmit for type-check, Biome for lint/format.
- Repo: public GitHub repo with README, tags, and MIT license.

**Effort:** One heavy implementation session with parallel subagents for optimization and QA.

**Risk:** Scope creep into other heroes/modes; mitigated by strict Scope OUT list and feature-complete Soldier: 76 acceptance criteria.

## Scope

### Scope IN
1. GitHub public repository with README, description, topics/tags, and MIT license.
2. TypeScript 7 + tsgo + Biome + Vite + Bun project scaffold with strict config.
3. Structured logger with levels (debug/info/warn/error) and runtime log-level control.
4. Game architecture:
   - Fixed 60 Hz simulation loop with accumulator and render interpolation.
   - Custom ECS-like world (numeric IDs, typed-array component stores, explicit system order).
   - Input adapter (KeyboardEvent.code, pointer-lock mouse look, action-state input).
   - WebGL2/Three.js renderer with camera, lighting, instanced meshes, particle effects.
   - Collision: player capsule, static AABBs, target spheres, hitscan raycast, swept projectiles, uniform spatial hash.
5. Lobby UI: title screen, hero selection (Soldier: 76 only), Practice Range launch, settings (sensitivity, volume, log level).
6. Practice Range (연습장):
   - Spawn room and open firing lane.
   - Static target bots at 5 m increments from 5-40 m.
   - Moving target lane (horizontal looping bots).
   - Simple cover/barriers and a raised platform.
   - Reset/score UI, hit feedback, ultimate pickup (recharges Tactical Visor).
7. Soldier: 76 hero kit with tuned values:
   - Heavy Pulse Rifle: hitscan, 30 rounds, 9 RPS, 1.5 s reload, 19 dmg, 30-50 m falloff.
   - Sprint: +50% speed, cancel on fire/ability, 0.3 s fire-recovery.
   - Helix Rockets: projectile 50 m/s, 6 s CD, 120 direct / 80-40 splash, self-damage 50%.
   - Biotic Field: 40 HP/s, 5 s, 5 m radius, 15 s CD.
   - Tactical Visor: 6 s, 45° cone auto-aim, 45 m range, 0.5 s reload.
8. Animations (state-machine driven, first-person + third-person where visible):
   - idle, run, sprint, jump/land, primary fire, reload, helix rockets, biotic field cast, ultimate activation, hit flinch, death/respawn.
9. Audio:
   - Procedural gunshot, explosion, reload, UI sounds.
   - Generative background music via Web Audio sequencer.
10. Performance:
    - In-frame performance.mark instrumentation.
    - 60 FPS budget; adaptive render resolution if GPU p95 exceeds budget.
    - Deep-agent optimization pass.
11. QA:
    - TDD unit + integration tests for ECS, input, physics, weapon math.
    - Agent-browser / Playwright visual QA for lobby and gameplay screenshots.
    - Manual QA scenarios captured with evidence.

### Scope OUT (Must NOT have)
- Any hero other than Soldier: 76.
- Any game mode other than Practice Range.
- Networking, multiplayer, or authoritative server.
- Real-money transactions, accounts, or persistence beyond localStorage settings.
- glTF/animated character model pipeline (procedural geometry only).
- Advanced post-processing (SSR, SSAO, volumetrics).
- Mobile touch controls (keyboard/mouse only).
- Accessibility beyond configurable sensitivity/volume and contrast HUD.

## Verification strategy

### Automated gates (run on every push)
1. `bun run check` — Biome lint + format validation.
2. `bun run typecheck` — tsgo --noEmit on src + test.
3. `bun run test` — Vitest run.
4. `bun run build` — Vite production build.

### Manual QA gates (per success criterion)
- Lobby navigation via real browser click-through.
- Practice Range spawn + WASD + mouse look + pointer lock.
- Soldier: 76 each ability fired and visually verified.
- 60 FPS sustained on M5 Max Chrome 1080p for 60 s benchmark.
- Visual QA screenshots at 1280x720 and 1920x1080.

## Execution strategy

### Wave 1 — Repo + toolchain
Goal: Public GitHub repo exists, project builds, typecheck/lint/test green.
Parallelism: bootstrap files can be created together.

### Wave 2 — Engine foundation
Goal: Fixed-timestep loop, ECS world, input adapter, logger, math utils.
Parallelism: math/utils/logger independent; input + loop can be built in parallel with ECS core.

### Wave 3 — Rendering + collision
Goal: Three.js renderer, camera, lighting, spatial hash, player capsule movement, static range geometry.
Parallelism: renderer and collision systems independent until integration.

### Wave 4 — Practice Range scene
Goal: Lobby UI, practice range geometry, targets, spawn, UI/HUD.
Parallelism: DOM UI and 3D scene independent.

### Wave 5 — Soldier: 76
Goal: Hero state machine, abilities, animations, audio.
Parallelism: weapon/ability systems can be built in parallel; audio integration at the end.

### Wave 6 — Performance + optimization
Goal: Profiler, budget checks, adaptive resolution, deep-agent optimization pass.
Parallelism: profiling + rendering optimizations + simulation optimizations in parallel.

### Wave 7 — QA + visual evidence + PR
Goal: Tests green, screenshots captured, GitHub public repo with README/tags, final PR/merge.
Parallelism: tests + visual QA + README in parallel.

## Todos

- [ ] 1. Initialize public GitHub repository and project scaffold
  - Acceptance: `git init`, remote points to github.com/code-yeongyu/overwatch-omo-native (or existing user repo), README.md with title/description/install/run instructions, MIT LICENSE, topics/tags in GitHub repo settings, `package.json`, `bun.lock`, `tsconfig.json`, `tsconfig.test.json`, `biome.json`, `vite.config.mjs`, `index.html`, `src/main.ts`.
  - References: .omo/ulw-research/20260717-234218/SYNTHESIS.md (tooling section), omo-programming TypeScript reference.
  - Happy QA: `gh repo view --json name,description,topics` returns public repo with description and topics.
  - Failure QA: Missing file causes `bun run check` to fail with a located Biome error.
  - Commit: `chore(repo): initialize public GitHub repo and TypeScript 7 scaffold`

- [ ] 2. Set up structured logger and core math utilities
  - Acceptance: `src/lib/logger.ts` exports `createLogger(level)` with debug/info/warn/error methods and runtime level toggle; `src/lib/math.ts` has vec3/quat helpers, lerp, clamp, deg/rad, seeded RNG; unit tests in `test/lib/logger.test.ts` and `test/lib/math.test.ts` pass.
  - References: omo-programming logging reference, SYNTHESIS performance section.
  - Happy QA: `bun test test/lib/logger.test.ts` green.
  - Failure QA: Setting invalid log level throws typed error.
  - Commit: `feat(lib): add structured logger and deterministic math utilities`

- [ ] 3. Build fixed-timestep game loop and ECS-like world
  - Acceptance: `src/engine/loop.ts` implements rAF + 60 Hz fixed step + accumulator + max catch-up; `src/engine/world.ts` has numeric entity IDs, dense typed-array component stores, spawn/despawn queues, system order; `test/engine/loop.test.ts` and `test/engine/world.test.ts` pass.
  - References: Glenn Fiedler Fix Your Timestep, SYNTHESIS architecture section.
  - Happy QA: A 1 s simulated wall-clock produces exactly 60 fixed steps.
  - Failure QA: Spawn during iteration does not mutate active query set.
  - Commit: `feat(engine): fixed-timestep loop and data-oriented ECS world`

- [ ] 4. Implement input adapter with keyboard and pointer-lock mouse
  - Acceptance: `src/engine/input.ts` exposes action-state (held/pressed/lookDelta) bound to KeyboardEvent.code; pointer lock request with unadjustedMovement fallback; state cleared on blur/visibilitychange; tests simulate events.
  - References: MDN Pointer Lock API, MDN KeyboardEvent.code.
  - Happy QA: Browser QA clicks canvas and mouse look updates yaw/pitch.
  - Failure QA: Losing pointer lock zeros look delta and held actions.
  - Commit: `feat(input): keyboard + pointer-lock mouse adapter`

- [ ] 5. Create Three.js WebGL2 renderer and camera system
  - Acceptance: `src/render/renderer.ts` creates WebGL2 context, scene, camera, directional + ambient light, instanced mesh helpers, resize handler, interpolation reader; `src/render/camera.ts` first-person camera with yaw/pitch clamp.
  - References: Three.js docs, SYNTHESIS renderer section.
  - Happy QA: Browser renders a colored cube/player placeholder at 60 FPS.
  - Failure QA: WebGL2 unsupported shows a graceful DOM fallback message.
  - Commit: `feat(render): Three.js WebGL2 renderer and first-person camera`

- [ ] 6. Implement collision and spatial hash
  - Acceptance: `src/physics/collision.ts` has capsule-vs-AABB sweep, sphere/AABB hitzones, raycast, swept segment; `src/physics/spatial.ts` uniform spatial hash for static and dynamic objects; tests cover hit/miss/tunneling.
  - References: MDN 3D collision detection, SYNTHESIS collision section.
  - Happy QA: Player cannot walk through a barrier; projectile hits a target.
  - Failure QA: Fast projectile does not tunnel through thin target.
  - Commit: `feat(physics): capsule sweep, raycast, and spatial hash`

- [ ] 7. Build Practice Range geometry and targets
  - Acceptance: `src/range/practice-range.ts` generates floor, lane markings, barriers, target stands at 5-40 m, moving target rail, platform, spawn point; `src/entities/target.ts` target health, hit feedback, reset; `src/entities/player-spawn.ts` spawn/respawn.
  - References: SYNTHESIS practice range section.
  - Happy QA: Browser screenshot shows range with lanes and targets.
  - Failure QA: Target with zero health despawns and respawns after delay.
  - Commit: `feat(range): practice range geometry and target bots`

- [ ] 8. Build lobby UI and game state router
  - Acceptance: `src/ui/lobby.ts` renders title, hero card (Soldier: 76), Practice Range button, settings panel; `src/app/state.ts` manages menu/playing/paused; settings persist to localStorage.
  - References: omo-frontend design reference, SYNTHESIS UI section.
  - Happy QA: Clicking "Enter Practice Range" hides lobby and shows canvas.
  - Failure QA: Invalid sensitivity input is clamped and rejected.
  - Commit: `feat(ui): lobby, settings, and game state router`

- [ ] 9. Implement Soldier: 76 hero state machine and movement
  - Acceptance: `src/heroes/soldier76.ts` state machine (idle/run/sprint/jump/land/fire/reload/ability/ultimate), movement speeds (5.5 m/s base, 8.25 m/s sprint), jump gravity, ground check, animation-state output.
  - References: SYNTHESIS Soldier: 76 kit section.
  - Happy QA: WASD moves player; Sprint key increases speed; jump has takeoff/air/land states.
  - Failure QA: Sprint cancels on fire and imposes 0.3 s fire-recovery.
  - Commit: `feat(hero): Soldier: 76 state machine and locomotion`

- [ ] 10. Implement Soldier: 76 Heavy Pulse Rifle
  - Acceptance: `src/heroes/soldier76/weapon.ts` hitscan raycast per 1/9 s, 30 round clip, 1.5 s reload (ammo restored at 0.736 s), 19 dmg, 30-50 m falloff, recoil impulse; tests for DPS and reload timing.
  - References: SYNTHESIS Soldier: 76 kit section.
  - Happy QA: Firing reduces ammo; hitting target shows damage number.
  - Failure QA: Empty clip cannot fire; reload prevents firing until complete.
  - Commit: `feat(hero): Soldier: 76 Heavy Pulse Rifle`

- [ ] 11. Implement Soldier: 76 abilities (Sprint, Helix Rockets, Biotic Field, Tactical Visor)
  - Acceptance: Separate modules for each ability with exact cooldowns/durations/damages/healing; Helix Rockets as swept projectile with splash; Tactical Visor auto-aims nearest target in 45° cone/45 m for 6 s.
  - References: SYNTHESIS Soldier: 76 kit section.
  - Happy QA: Each ability key triggers visual + gameplay effect.
  - Failure QA: Cooldown prevents immediate re-use; out-of-range target not locked.
  - Commit: `feat(hero): Soldier: 76 abilities`

- [ ] 12. Implement animations and VFX
  - Acceptance: State-driven first-person gun/arms animation (idle sway, recoil, reload, sprint lower), muzzle flash, tracer, explosion particles, hit markers, Biotic Field visual, ultimate overlay.
  - References: SYNTHESIS animation section.
  - Happy QA: Firing shows muzzle flash and tracer; ultimate shows visor overlay.
  - Failure QA: Animation state transitions do not snap unexpectedly.
  - Commit: `feat(vfx): Soldier: 76 animations, particles, and HUD overlays`

- [ ] 13. Implement procedural audio system
  - Acceptance: `src/audio/game-audio.ts` creates AudioContext from gesture, mix buses, cached noise buffer, gunshot/explosion/reload/UI synthesis functions; `src/audio/music.ts` look-ahead sequencer with generative motif.
  - References: SYNTHESIS audio section.
  - Happy QA: First click enables audio; gunshot audible.
  - Failure QA: AudioContext suspended before user gesture.
  - Commit: `feat(audio): procedural SFX and generative music`

- [ ] 14. Wire game systems into playable Practice Range
  - Acceptance: `src/main.ts` initializes renderer, world, input, audio, lobby, and enters practice range; all systems run in fixed step; HUD shows HP/ammo/cooldowns/ultimate charge.
  - References: SYNTHESIS architecture section.
  - Happy QA: Playable from lobby to shooting targets end-to-end.
  - Failure QA: Missing system causes a thrown error with logger context.
  - Commit: `feat(game): integrate engine, hero, range, audio, and HUD`

- [ ] 15. Add performance instrumentation and optimization pass
  - Acceptance: `src/lib/perf.ts` performance.mark measures per system and frame; benchmark scene script; adaptive DPR/resolution scaling; deep-agent optimization review produces findings and fixes.
  - References: SYNTHESIS performance section.
  - Happy QA: 60 FPS sustained for 60 s on M5 Max Chrome 1080p.
  - Failure QA: Frame time p95 > 15 ms triggers resolution downscale.
  - Commit: `perf(core): instrumentation, benchmark, and adaptive resolution`

- [ ] 16. Expand TDD test suite for critical systems
  - Acceptance: Tests cover ECS, input, math, collision, weapon math, ability cooldowns, health/damage, audio scheduler; >80% line coverage on `src/lib`, `src/engine`, `src/physics`, `src/heroes`.
  - References: omo-programming TDD discipline.
  - Happy QA: `bun run test` green; mutation tests pass.
  - Failure QA: Broken ability cooldown test fails before fix.
  - Commit: `test(core): TDD coverage for engine, physics, hero, and audio`

- [ ] 17. Visual QA and screenshot evidence
  - Acceptance: Agent-browser/Playwright captures lobby, settings, in-game (idle, firing, ultimate), 1280x720 and 1920x1080; dual-oracle visual QA passes; evidence saved to `.omo/evidence/visual-qa/`.
  - References: omo-visual-qa skill.
  - Happy QA: Screenshots match DESIGN.md tokens.
  - Failure QA: CJK-free UI; no layout overflow.
  - Commit: `docs(qa): add visual QA evidence`

- [ ] 18. Finalize README, GitHub metadata, and CI
  - Acceptance: README has title, description, gameplay GIF/screenshot, install/run/test commands, tech stack, controls, license; GitHub topics set; optional GitHub Actions CI runs check/typecheck/test/build.
  - References: omo-programming, work-with-pr.
  - Happy QA: `gh repo view` shows description and topics; CI green.
  - Failure QA: Missing topic or broken CI badge.
  - Commit: `docs(repo): README, topics, and CI workflow`

- [ ] 19. Final verification and PR merge
  - Acceptance: All automated gates green, all manual QA scenarios pass with evidence, no runtime artifacts left, repo is public and mergeable.
  - References: work-with-pr skill.
  - Happy QA: `bun run ci && bun run test && bun run build` green.
  - Failure QA: Any failing gate blocks merge.
  - Commit: `chore(release): final verification and merge`

## Final verification wave

- [ ] F1. Plan compliance audit: read .omo/plans/overwatch-sp.md and confirm every Scope IN item has a matching todo and acceptance criteria.
- [ ] F2. Code quality review: run Biome check, tsgo --noEmit, review file sizes (<250 LOC pure), no `any`/`as`/`!`, exhaustive variant matching.
- [ ] F3. Real manual QA: replay lobby → practice range → fire all abilities → 60 s benchmark → capture screenshot and performance JSON.
- [ ] F4. Scope fidelity: confirm no Scope OUT item was introduced.

## Commit strategy

- Conventional Commits: `<type>(<scope>): <imperative>`.
- One logical change per commit; each commit builds + tests green on its own.
- Atomic scope per wave; do not mix unrelated refactors.
- Final PR targets `main` (this is a new repo, no dev branch yet).
- Plan footer in final commit: `Plan: .omo/plans/overwatch-sp.md`.

## Success criteria

1. **Lobby loads and navigates to Practice Range** via rendered UI — evidence: agent-browser screenshot of lobby and transition.
2. **Practice Range spawns player** at origin with WASD + mouse look — evidence: in-game screenshot + input QA log.
3. **Soldier: 76 has idle/run/sprint animations and primary fire hitscan** — evidence: screenshot sequence + unit tests for weapon math.
4. **All Soldier: 76 abilities work** (Sprint, Helix Rockets, Biotic Field, Tactical Visor) — evidence: gameplay recording or screenshot per ability + unit tests.
5. **Targets take damage and show feedback** — evidence: damage-number screenshot + target health test.
6. **60 FPS maintained** on M5 Max Chrome at 1080p for 60 s — evidence: performance JSON artifact.
7. **No TypeScript/Biome warnings**; tests green — evidence: CI log.
8. **Public GitHub repo** with README, tags, description — evidence: `gh repo view` output.
