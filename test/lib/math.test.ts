import { describe, expect, it } from "vitest";
import {
  add,
  clamp,
  DEG_TO_RAD,
  length,
  lerp,
  lerpVec3,
  normalize,
  SeededRng,
  scale,
  sub,
  vec3,
} from "../../src/lib/math.js";

describe("vec3", () => {
  it("adds and subtracts vectors", () => {
    const a = vec3(1, 2, 3);
    const b = vec3(4, 5, 6);
    expect(add(a, b)).toEqual(vec3(5, 7, 9));
    expect(sub(a, b)).toEqual(vec3(-3, -3, -3));
  });

  it("scales and normalizes", () => {
    const a = vec3(3, 0, 4);
    expect(scale(a, 2)).toEqual(vec3(6, 0, 8));
    expect(length(a)).toBe(5);
    const n = normalize(a);
    expect(n.x).toBeCloseTo(0.6);
    expect(n.y).toBeCloseTo(0);
    expect(n.z).toBeCloseTo(0.8);
  });

  it("returns zero vector when normalizing zero", () => {
    expect(normalize(vec3(0, 0, 0))).toEqual(vec3(0, 0, 0));
  });

  it("lerps scalars and vectors", () => {
    expect(lerp(0, 10, 0.5)).toBe(5);
    expect(lerp(0, 10, 1.5)).toBe(10);
    expect(lerpVec3(vec3(0, 0, 0), vec3(10, 20, 30), 0.5)).toEqual(vec3(5, 10, 15));
  });

  it("clamps values", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(11, 0, 10)).toBe(10);
  });

  it("converts degrees to radians", () => {
    expect(180 * DEG_TO_RAD).toBeCloseTo(Math.PI);
  });
});

describe("SeededRng", () => {
  it("produces deterministic sequences", () => {
    const a = new SeededRng(42);
    const b = new SeededRng(42);
    expect(a.next()).toBe(b.next());
    expect(a.next()).toBe(b.next());
  });

  it("generates values in [0, 1)", () => {
    const rng = new SeededRng(1);
    for (let i = 0; i < 100; i++) {
      const v = rng.next();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});
