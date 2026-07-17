export interface PerfMetrics {
  frameTimeMs: number;
  simTimeMs: number;
  renderTimeMs: number;
}

export class PerfMonitor {
  private frameCount = 0;
  private simTotal = 0;
  private renderTotal = 0;

  beginFrame(): void {
    performance.mark("frame-start");
  }

  endSim(): void {
    performance.mark("sim-end");
    performance.measure("sim", "frame-start", "sim-end");
    const entries = performance.getEntriesByName("sim");
    const last = entries[entries.length - 1];
    if (last) {
      this.simTotal += last.duration;
    }
  }

  beginRender(): void {
    performance.mark("render-start");
  }

  endFrame(): PerfMetrics {
    performance.mark("frame-end");
    performance.measure("render", "render-start", "frame-end");
    performance.measure("frame", "frame-start", "frame-end");

    const frameEntries = performance.getEntriesByName("frame");
    const lastFrame = frameEntries[frameEntries.length - 1];
    const frameTime = lastFrame?.duration ?? 0;
    this.frameCount++;

    const renderEntries = performance.getEntriesByName("render");
    const lastRender = renderEntries[renderEntries.length - 1];
    if (lastRender) {
      this.renderTotal += lastRender.duration;
    }

    performance.clearMarks();
    performance.clearMeasures();

    return {
      frameTimeMs: frameTime,
      simTimeMs: this.simTotal / Math.max(1, this.frameCount),
      renderTimeMs: this.renderTotal / Math.max(1, this.frameCount),
    };
  }

  reset(): void {
    this.frameCount = 0;
    this.simTotal = 0;
    this.renderTotal = 0;
  }
}
