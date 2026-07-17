import type { Logger } from "../lib/logger.js";

export const STEP_SECONDS = 1 / 60;
export const MAX_FRAME_SECONDS = 0.1;
export const MAX_STEPS_PER_FRAME = 5;

export interface GameLoop {
  start(): void;
  stop(): void;
}

export interface LoopHooks {
  simulate(inputForStep: number, dt: number): void;
  render(alpha: number): void;
  onFrameMetrics?(metrics: { frameTimeMs: number }): void;
}

export function createGameLoop(hooks: LoopHooks, logger: Logger): GameLoop {
  let previousTimeMs: number | undefined;
  let accumulator = 0;
  let running = false;
  let rafId = 0;

  function frame(nowMs: number): void {
    if (!running) {
      return;
    }

    rafId = requestAnimationFrame(frame);

    if (previousTimeMs === undefined) {
      previousTimeMs = nowMs;
      return;
    }

    const elapsed = Math.min((nowMs - previousTimeMs) / 1000, MAX_FRAME_SECONDS);
    previousTimeMs = nowMs;
    accumulator += elapsed;

    let steps = 0;
    while (accumulator >= STEP_SECONDS && steps < MAX_STEPS_PER_FRAME) {
      hooks.simulate(steps, STEP_SECONDS);
      accumulator -= STEP_SECONDS;
      steps++;
    }

    if (steps === MAX_STEPS_PER_FRAME && accumulator >= STEP_SECONDS) {
      accumulator %= STEP_SECONDS;
      logger.warn("game loop caught up; dropping time", { accumulator });
    }

    const alpha = accumulator / STEP_SECONDS;
    hooks.render(alpha);
  }

  return {
    start() {
      if (running) {
        return;
      }
      running = true;
      previousTimeMs = undefined;
      accumulator = 0;
      rafId = requestAnimationFrame(frame);
      logger.info("game loop started");
    },
    stop() {
      running = false;
      cancelAnimationFrame(rafId);
      logger.info("game loop stopped");
    },
  };
}
