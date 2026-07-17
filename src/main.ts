import * as THREE from "three";
import { createGameAudio } from "./audio/game-audio.js";
import { createMusicSystem, type MusicSystem } from "./audio/music.js";
import { createInputAdapter } from "./engine/input.js";
import { createGameLoop } from "./engine/loop.js";
import {
  type BioticField,
  deployBioticField,
  type HelixRocket,
  launchHelixRocket,
  updateBioticFields,
  updateHelixRockets,
} from "./heroes/soldier76/abilities.js";
import { SOLDIER_76 } from "./heroes/soldier76/constants.js";
import { raycastTargets } from "./heroes/soldier76/shooting.js";
import { createSoldier76State, updateSoldier76 } from "./heroes/soldier76/state.js";
import { findVisorTarget } from "./heroes/soldier76/visor.js";
import { createLogger } from "./lib/logger.js";
import { SpatialHash } from "./physics/spatial.js";
import { buildPracticeRange, updateTargets } from "./range/practice-range.js";
import { FirstPersonCamera } from "./render/camera.js";
import { createCanvas, GameRenderer } from "./render/renderer.js";
import { createVfxSystem } from "./render/vfx.js";
import { createSoldierRifleViewmodel } from "./render/viewmodel.js";
import { createHud } from "./ui/hud.js";
import { createLobby } from "./ui/lobby.js";

const logger = createLogger("info", "main");

function startGame(app: HTMLDivElement): void {
  app.innerHTML = "";
  const canvas = createCanvas(app);
  const renderer = new GameRenderer(canvas);
  const input = createInputAdapter();
  input.bindElement(canvas);

  const audio = createGameAudio();
  const spatial = new SpatialHash(4);
  const range = buildPracticeRange(renderer, spatial);
  const camera = new FirstPersonCamera();
  const soldier = createSoldier76State();
  const qaRenderTimes: number[] = [];
  if (import.meta.env.DEV) {
    const devWindow = window as unknown as {
      __qaGiveUltimate?: () => void;
      __qaRenderTimes?: number[];
    };
    devWindow.__qaGiveUltimate = () => {
      soldier.ultimateCharge = 100;
    };
    devWindow.__qaRenderTimes = qaRenderTimes;
  }
  const hud = createHud();
  const vfx = createVfxSystem(renderer.scene, camera);
  const viewmodel = createSoldierRifleViewmodel(renderer.scene, camera);
  let music: MusicSystem | null = null;
  app.appendChild(hud.container);

  let lastFiredAmmo = soldier.weapon.ammo;
  let lastReloading = soldier.weapon.reloading;
  let sprinting = false;
  const rockets: HelixRocket[] = [];
  const bioticFields: BioticField[] = [];
  const tempDir = new THREE.Vector3();

  const loop = createGameLoop(
    {
      simulate(_step, dt) {
        const command = input.getCommand();
        updateSoldier76(soldier, command, dt);

        sprinting = soldier.state === "sprinting";

        soldier.position.x += soldier.velocity.x * dt;
        soldier.position.z += soldier.velocity.z * dt;
        soldier.position.y += soldier.velocity.y * dt;

        if (soldier.position.y <= 1.75) {
          soldier.position.y = 1.75;
          soldier.velocity.y = 0;
          soldier.onGround = true;
        }

        camera.setPosition(soldier.position.x, soldier.position.y, soldier.position.z);

        if (soldier.weapon.visorActive) {
          const visorTarget = findVisorTarget(camera, range.targets);
          if (visorTarget) {
            const targetYaw = Math.atan2(visorTarget.direction.x, visorTarget.direction.z);
            let diff = targetYaw - soldier.yaw;
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;
            soldier.yaw += diff * 0.25;
          }
        }

        camera.addLookDelta(command.lookDeltaX, command.lookDeltaY, 0.002);
        camera.setTargetFov(sprinting ? 95 : 75);

        if (soldier.weapon.ammo < lastFiredAmmo) {
          audio.playGunshot();
          vfx.muzzleFlash(true);
          viewmodel.fire();
          camera.applyRecoil(0.015);
          vfx.spawnTracer();
          const hit = raycastTargets(camera, spatial, range.targets);
          if (hit) {
            const target = range.targets.find((t) => t.id === hit.targetId);
            if (target) {
              target.health -= hit.damage;
              vfx.spawnHit(target.mesh.position);
              hud.showDamageNumber(hit.damage);
              if (target.health <= 0) {
                target.respawnTimer = 3;
                soldier.ultimateCharge = Math.min(100, soldier.ultimateCharge + 10);
              }
            }
          }
        }
        lastFiredAmmo = soldier.weapon.ammo;

        if (soldier.weapon.reloading && !lastReloading) {
          audio.playReload();
          viewmodel.reload();
        }
        lastReloading = soldier.weapon.reloading;

        if (command.ability1Pressed && soldier.helixCooldown <= 0) {
          soldier.helixCooldown = SOLDIER_76.helix.cooldown;
          tempDir.set(0, 0, -1).applyQuaternion(camera.object.quaternion);
          rockets.push(launchHelixRocket(renderer.scene, camera.object.position, tempDir));
          audio.playExplosion();
        }

        // Tactical visor is activated inside updateSoldier76.

        if (command.bioticFieldPressed && soldier.bioticFieldCooldown <= 0) {
          soldier.bioticFieldCooldown = SOLDIER_76.bioticField.cooldown;
          bioticFields.push(deployBioticField(renderer.scene, soldier.position));
        }

        updateHelixRockets(rockets, dt, renderer.scene, spatial);
        updateBioticFields(bioticFields, dt, renderer.scene);
        updateTargets(range.targets, dt);
        vfx.update(dt);
      },
      render(_alpha) {
        const renderStart = performance.now();
        camera.update(1 / 60);
        viewmodel.update(1 / 60, {
          idle: soldier.state === "idle",
          reloading: soldier.weapon.reloading,
          sprinting,
        });
        camera.copyTo(renderer.camera);
        renderer.render();
        qaRenderTimes.push(performance.now() - renderStart);
        hud.setHealth(soldier.health);
        hud.setAmmo(soldier.weapon.ammo, SOLDIER_76.rifle.clipSize);
        hud.setAbilityCooldowns(soldier.helixCooldown, soldier.bioticFieldCooldown);
        hud.setUltimate(soldier.ultimateCharge);
        hud.setVisorActive(soldier.weapon.visorActive);
        hud.setState(soldier.state);
      },
    },
    logger,
  );

  const startAudio = async () => {
    try {
      const ctx = await audio.enable();
      music = createMusicSystem(ctx);
      music.start();
    } catch {
      // Audio may require gesture; ignore failure.
    }
    canvas.removeEventListener("click", startAudio);
  };
  canvas.addEventListener("click", startAudio);
  loop.start();

  window.addEventListener("beforeunload", () => {
    loop.stop();
    renderer.clear();
    input.unbind();
    hud.destroy();
    music?.stop();
  });
}

function main(): void {
  const app = document.querySelector<HTMLDivElement>("#app");
  if (!app) {
    logger.error("#app not found");
    return;
  }

  const lobby = createLobby(() => {
    lobby.destroy();
    startGame(app);
  });
  app.appendChild(lobby.container);
}

main();
