import type { InputCommand } from "../../engine/input.js";
import type { MutableVec3 } from "../../lib/math.js";
import { SOLDIER_76 } from "./constants.js";
import {
  activateVisor,
  createWeaponState,
  fire,
  startReload,
  updateWeapon,
  type WeaponState,
} from "./weapon.js";

export type HeroState = "idle" | "running" | "sprinting" | "jumping" | "firing" | "reloading";

export interface Soldier76State {
  position: MutableVec3;
  velocity: MutableVec3;
  yaw: number;
  health: number;
  state: HeroState;
  onGround: boolean;
  sprintRecovery: number;
  weapon: WeaponState;
  helixCooldown: number;
  bioticFieldCooldown: number;
  ultimateCharge: number;
}

export function createSoldier76State(): Soldier76State {
  return {
    position: { x: 0, y: 1.75, z: 0 },
    velocity: { x: 0, y: 0, z: 0 },
    yaw: 0,
    health: SOLDIER_76.maxHealth,
    state: "idle",
    onGround: true,
    sprintRecovery: 0,
    weapon: createWeaponState(),
    helixCooldown: 0,
    bioticFieldCooldown: 0,
    ultimateCharge: 0,
  };
}

export function updateSoldier76(state: Soldier76State, input: InputCommand, dt: number): void {
  updateWeapon(state.weapon, dt);

  if (state.sprintRecovery > 0) {
    state.sprintRecovery -= dt;
  }
  if (state.helixCooldown > 0) {
    state.helixCooldown -= dt;
  }
  if (state.bioticFieldCooldown > 0) {
    state.bioticFieldCooldown -= dt;
  }

  let speed: number = SOLDIER_76.baseSpeed;
  let sprinting = false;

  if (input.sprint && input.moveForward && state.onGround) {
    speed = SOLDIER_76.sprintSpeed;
    sprinting = true;
    state.state = "sprinting";
  }

  const forward = { x: Math.sin(state.yaw), y: 0, z: Math.cos(state.yaw) };
  const right = { x: Math.cos(state.yaw), y: 0, z: -Math.sin(state.yaw) };

  let moveX = 0;
  let moveZ = 0;
  if (input.moveForward) {
    moveX += forward.x;
    moveZ += forward.z;
  }
  if (input.moveBack) {
    moveX -= forward.x;
    moveZ -= forward.z;
  }
  if (input.moveRight) {
    moveX += right.x;
    moveZ += right.z;
  }
  if (input.moveLeft) {
    moveX -= right.x;
    moveZ -= right.z;
  }

  const len = Math.hypot(moveX, moveZ);
  if (len > 0) {
    moveX /= len;
    moveZ /= len;
    if (!sprinting) {
      state.state = "running";
    }
  } else if (!sprinting) {
    state.state = "idle";
  }

  if (input.jumpPressed && state.onGround) {
    state.velocity.y = 6;
    state.onGround = false;
    state.state = "jumping";
  }

  state.velocity.x = moveX * speed;
  state.velocity.z = moveZ * speed;
  state.velocity.y -= 18 * dt;

  if (!sprinting && input.fire && state.sprintRecovery <= 0) {
    if (fire(state.weapon)) {
      state.state = "firing";
    }
  }

  if (input.reloadPressed) {
    startReload(state.weapon);
  }

  if (state.weapon.reloading) {
    state.state = "reloading";
  }

  if (input.ability1Pressed && state.helixCooldown <= 0) {
    state.helixCooldown = SOLDIER_76.helix.cooldown;
  }

  if (input.ultimatePressed && state.ultimateCharge >= 100) {
    activateVisor(state.weapon);
    state.ultimateCharge = 0;
  }

  state.yaw -= input.lookDeltaX * 0.002;

  if (!state.onGround && state.velocity.y < 0) {
    state.state = "jumping";
  }
}
