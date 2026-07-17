import { describe, expect, it } from "vitest";
import { DenseComponentStore, NO_ENTITY, World } from "../../src/engine/world.js";

describe("World", () => {
  it("creates unique entity ids", () => {
    const world = new World();
    const a = world.create();
    const b = world.create();
    expect(a).not.toBe(b);
    expect(a).not.toBe(NO_ENTITY);
  });

  it("does not activate entities until flush", () => {
    const world = new World();
    const id = world.create();
    expect(world.isAlive(id)).toBe(false);
    world.flush();
    expect(world.isAlive(id)).toBe(true);
  });

  it("defers destruction until flush", () => {
    const world = new World();
    const id = world.create();
    world.flush();
    expect(world.isAlive(id)).toBe(true);
    world.destroy(id);
    expect(world.isAlive(id)).toBe(true);
    world.flush();
    expect(world.isAlive(id)).toBe(false);
  });
});

describe("DenseComponentStore", () => {
  it("stores and retrieves components", () => {
    const store = new DenseComponentStore<number>();
    store.set(1, 42);
    expect(store.get(1)).toBe(42);
    expect(store.has(1)).toBe(true);
    expect(store.has(2)).toBe(false);
  });

  it("deletes components", () => {
    const store = new DenseComponentStore<string>();
    store.set(1, "hello");
    store.delete(1);
    expect(store.has(1)).toBe(false);
  });
});
