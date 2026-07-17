import { SOLDIER_76 } from "./constants.js";

export interface WeaponState {
  ammo: number;
  reloading: boolean;
  reloadTimer: number;
  fireCooldown: number;
  visorActive: boolean;
  visorTimer: number;
}

export function createWeaponState(): WeaponState {
  return {
    ammo: SOLDIER_76.rifle.clipSize,
    reloading: false,
    reloadTimer: 0,
    fireCooldown: 0,
    visorActive: false,
    visorTimer: 0,
  };
}

export function canFire(state: WeaponState): boolean {
  return state.ammo > 0 && !state.reloading && state.fireCooldown <= 0;
}

export function startReload(state: WeaponState): void {
  if (state.reloading || state.ammo === SOLDIER_76.rifle.clipSize) {
    return;
  }
  state.reloading = true;
  state.reloadTimer = SOLDIER_76.rifle.reloadTime;
}

export function updateWeapon(state: WeaponState, dt: number): void {
  if (state.fireCooldown > 0) {
    state.fireCooldown -= dt;
  }

  if (state.reloading) {
    state.reloadTimer -= dt;
    const ammoTime = SOLDIER_76.rifle.reloadTime - SOLDIER_76.rifle.reloadAmmoTime;
    if (state.reloadTimer <= ammoTime && state.ammo !== SOLDIER_76.rifle.clipSize) {
      state.ammo = SOLDIER_76.rifle.clipSize;
    }
    if (state.reloadTimer <= 0) {
      state.reloading = false;
      state.ammo = SOLDIER_76.rifle.clipSize;
    }
  }

  if (state.visorActive) {
    state.visorTimer -= dt;
    if (state.visorTimer <= 0) {
      state.visorActive = false;
    }
  }
}

export function fire(state: WeaponState): boolean {
  if (!canFire(state)) {
    return false;
  }
  state.ammo--;
  state.fireCooldown = 1 / SOLDIER_76.rifle.fireRate;
  return true;
}

export function activateVisor(state: WeaponState): void {
  state.visorActive = true;
  state.visorTimer = SOLDIER_76.visor.duration;
  state.ammo = SOLDIER_76.rifle.clipSize;
}
