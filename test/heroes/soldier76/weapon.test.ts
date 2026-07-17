import { describe, expect, it } from "vitest";
import {
  canFire,
  createWeaponState,
  fire,
  startReload,
  updateWeapon,
} from "../../../src/heroes/soldier76/weapon.js";

describe("Soldier:76 weapon", () => {
  it("starts with full ammo", () => {
    const state = createWeaponState();
    expect(state.ammo).toBe(30);
    expect(canFire(state)).toBe(true);
  });

  it("decrements ammo on fire", () => {
    const state = createWeaponState();
    expect(fire(state)).toBe(true);
    expect(state.ammo).toBe(29);
    expect(state.fireCooldown).toBeCloseTo(1 / 9);
  });

  it("cannot fire when empty", () => {
    const state = createWeaponState();
    state.ammo = 0;
    expect(canFire(state)).toBe(false);
    expect(fire(state)).toBe(false);
  });

  it("reloads to full clip", () => {
    const state = createWeaponState();
    state.ammo = 5;
    startReload(state);
    expect(state.reloading).toBe(true);
    updateWeapon(state, 1.5);
    expect(state.ammo).toBe(30);
    expect(state.reloading).toBe(false);
  });
});
