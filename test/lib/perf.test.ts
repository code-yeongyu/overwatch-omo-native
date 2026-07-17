import { describe, expect, it } from "vitest";
import { PerfMonitor } from "../../src/lib/perf.js";

describe("PerfMonitor", () => {
  it("measures a frame", () => {
    const perf = new PerfMonitor();
    perf.beginFrame();
    perf.endSim();
    perf.beginRender();
    const metrics = perf.endFrame();
    expect(metrics.frameTimeMs).toBeGreaterThanOrEqual(0);
    expect(metrics.simTimeMs).toBeGreaterThanOrEqual(0);
    expect(metrics.renderTimeMs).toBeGreaterThanOrEqual(0);
  });
});
