import * as THREE from "three";
import type { FirstPersonCamera } from "./camera.js";

export interface Viewmodel {
  readonly root: THREE.Group;
  update(dt: number, state: ViewmodelState): void;
  fire(): void;
  reload(): void;
  sprint(active: boolean): void;
}

export interface ViewmodelState {
  readonly reloading: boolean;
  readonly sprinting: boolean;
  readonly idle: boolean;
}

export function createSoldierRifleViewmodel(
  scene: THREE.Scene,
  camera: FirstPersonCamera,
): Viewmodel {
  const root = new THREE.Group();

  // Materials
  const blackMetal = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 0.5,
    metalness: 0.7,
  });
  const silver = new THREE.MeshStandardMaterial({
    color: 0xaaaaaa,
    roughness: 0.3,
    metalness: 0.8,
  });
  const blueGlow = new THREE.MeshStandardMaterial({
    color: 0x00aaff,
    emissive: 0x0088ff,
    emissiveIntensity: 1.2,
    toneMapped: false,
  });
  const redAccent = new THREE.MeshStandardMaterial({
    color: 0xcc2222,
    roughness: 0.4,
    metalness: 0.4,
  });
  const darkGrip = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.9 });

  // Main body
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.22, 0.9), blackMetal);
  body.position.set(0, -0.18, -0.35);
  root.add(body);

  // Barrel shroud
  const shroud = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.18, 0.5), silver);
  shroud.position.set(0, -0.16, -0.9);
  root.add(shroud);

  // Barrel tip
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.35, 12), blackMetal);
  barrel.rotation.x = Math.PI / 2;
  barrel.position.set(0, -0.16, -1.2);
  root.add(barrel);

  // Energy core (blue glowing tube)
  const core = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 12), blueGlow);
  core.rotation.x = Math.PI / 2;
  core.position.set(0, -0.08, -0.45);
  root.add(core);

  // Stock
  const stock = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.32, 0.35), blackMetal);
  stock.position.set(0, -0.22, 0.45);
  root.add(stock);

  const stockPad = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.34, 0.08), darkGrip);
  stockPad.position.set(0, -0.2, 0.66);
  root.add(stockPad);

  // Grip
  const grip = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.28, 0.18), darkGrip);
  grip.position.set(0, -0.4, -0.05);
  grip.rotation.x = -0.25;
  root.add(grip);

  // Magazine
  const mag = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.22, 0.28), silver);
  mag.position.set(0, -0.38, -0.22);
  mag.rotation.x = 0.15;
  root.add(mag);

  // Scope
  const scope = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.45, 12), blackMetal);
  scope.rotation.x = Math.PI / 2;
  scope.position.set(0, 0.02, -0.45);
  root.add(scope);

  // Small scope rail
  const rail = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.5), silver);
  rail.position.set(0, 0.06, -0.45);
  root.add(rail);

  // Red accent button
  const button = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.04, 8), redAccent);
  button.rotation.z = Math.PI / 2;
  button.position.set(0.06, -0.14, -0.1);
  root.add(button);

  // Muzzle flash light
  const flashLight = new THREE.PointLight(0xffaa00, 0, 5);
  flashLight.position.set(0, -0.12, -1.35);
  root.add(flashLight);

  root.position.set(0.22, -0.28, -0.35);
  root.rotation.set(0, -0.12, 0);

  const basePos = new THREE.Vector3(0.22, -0.28, -0.35);
  const baseRot = new THREE.Euler(0, -0.12, 0);

  let recoilTimer = 0;
  let reloadTimer = 0;
  let sprintTimer = 0;

  scene.add(root);

  return {
    root,
    update(dt, state) {
      root.position.copy(camera.object.position);
      root.quaternion.copy(camera.object.quaternion);

      const targetY = state.sprinting ? basePos.y - 0.45 : basePos.y;
      const targetZ = state.sprinting ? basePos.z + 0.15 : basePos.z;
      const targetX = state.sprinting ? basePos.x + 0.15 : basePos.x;
      const targetRotX = state.sprinting ? baseRot.x - 0.5 : baseRot.x;
      const targetRotZ = state.sprinting ? baseRot.z + 0.35 : baseRot.z;

      sprintTimer += dt * 8;
      const sprintT = Math.min(1, sprintTimer);
      const ease = (t: number) => t * t * (3 - 2 * t);
      const s = ease(state.sprinting ? sprintT : 1 - sprintT);

      const localPos = new THREE.Vector3(
        THREE.MathUtils.lerp(basePos.x, targetX, s),
        THREE.MathUtils.lerp(basePos.y, targetY, s),
        THREE.MathUtils.lerp(basePos.z, targetZ, s),
      );
      const localRot = new THREE.Euler(
        THREE.MathUtils.lerp(baseRot.x, targetRotX, s),
        baseRot.y,
        THREE.MathUtils.lerp(baseRot.z, targetRotZ, s),
      );

      localPos.applyQuaternion(camera.object.quaternion);
      root.position.add(localPos);

      const q = new THREE.Quaternion().setFromEuler(localRot);
      root.quaternion.multiply(q);

      if (recoilTimer > 0) {
        recoilTimer -= dt;
        const r = Math.max(0, recoilTimer / 0.08);
        const recoilOffset = new THREE.Vector3(0, 0, -r * 0.08).applyQuaternion(root.quaternion);
        root.position.add(recoilOffset);
        root.rotateX(-r * 0.18);
      }

      if (reloadTimer > 0) {
        reloadTimer -= dt;
        const t = Math.max(0, reloadTimer / 1.5);
        root.rotateX(-Math.sin(t * Math.PI) * 0.6);
        root.rotateZ(Math.sin(t * Math.PI * 2) * 0.2);
        root.position.y -= Math.sin(t * Math.PI) * 0.1;
      }

      // Idle sway
      if (state.idle && !state.sprinting && !state.reloading) {
        const time = performance.now() * 0.001;
        root.position.y += Math.sin(time * 1.5) * 0.003;
        root.position.x += Math.cos(time * 0.7) * 0.002;
      }

      flashLight.intensity = Math.max(0, flashLight.intensity - dt * 25);
    },
    fire() {
      recoilTimer = 0.08;
      flashLight.intensity = 3;
    },
    reload() {
      reloadTimer = 1.5;
    },
    sprint(active) {
      if (active) sprintTimer = 0;
      else sprintTimer = 0;
    },
  };
}
