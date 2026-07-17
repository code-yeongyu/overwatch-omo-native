import { describe, expect, it } from "vitest";
import { intersectRayAabb, pointInAabb } from "../../src/physics/collision.js";

describe("intersectRayAabb", () => {
  it("hits an axis-aligned box", () => {
    const t = intersectRayAabb(
      { origin: { x: 0, y: 1, z: 0 }, direction: { x: 0, y: 0, z: -1 } },
      { min: { x: -1, y: 0, z: -5 }, max: { x: 1, y: 2, z: -3 } },
    );
    expect(t).toBe(3);
  });

  it("misses when ray points away", () => {
    const t = intersectRayAabb(
      { origin: { x: 0, y: 1, z: 0 }, direction: { x: 0, y: 0, z: 1 } },
      { min: { x: -1, y: 0, z: -5 }, max: { x: 1, y: 2, z: -3 } },
    );
    expect(t).toBeNull();
  });
});

describe("pointInAabb", () => {
  it("detects points inside and outside", () => {
    const box = { min: { x: 0, y: 0, z: 0 }, max: { x: 1, y: 1, z: 1 } };
    expect(pointInAabb({ x: 0.5, y: 0.5, z: 0.5 }, box)).toBe(true);
    expect(pointInAabb({ x: 2, y: 0.5, z: 0.5 }, box)).toBe(false);
  });
});
