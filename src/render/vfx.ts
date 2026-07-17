import * as THREE from "three";
import type { FirstPersonCamera } from "./camera.js";

export interface VfxSystem {
  muzzleFlash(active: boolean): void;
  spawnTracer(): void;
  spawnHit(position: { x: number; y: number; z: number }): void;
  update(dt: number): void;
}

export function createVfxSystem(scene: THREE.Scene, camera: FirstPersonCamera): VfxSystem {
  const muzzleLight = new THREE.PointLight(0xffaa00, 0, 8);
  scene.add(muzzleLight);

  const tracers: { mesh: THREE.Line; life: number }[] = [];
  const hits: { mesh: THREE.Points; life: number }[] = [];

  const tracerMaterial = new THREE.LineBasicMaterial({
    color: 0xffaa00,
    transparent: true,
    opacity: 0.8,
  });
  const hitGeometry = new THREE.BufferGeometry();
  hitGeometry.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, 0], 3));
  const hitMaterial = new THREE.PointsMaterial({ color: 0xffff00, size: 0.3, transparent: true });

  return {
    muzzleFlash(active) {
      const pos = camera.object.position.clone();
      const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.object.quaternion);
      muzzleLight.position.copy(pos.add(dir.multiplyScalar(0.8)));
      muzzleLight.intensity = active ? 2 : 0;
    },
    spawnTracer() {
      const origin = camera.object.position.clone();
      const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.object.quaternion);
      const end = origin.clone().add(dir.multiplyScalar(40));
      const geometry = new THREE.BufferGeometry().setFromPoints([origin, end]);
      const mesh = new THREE.Line(geometry, tracerMaterial);
      scene.add(mesh);
      tracers.push({ mesh, life: 0.05 });
    },
    spawnHit(position) {
      const mesh = new THREE.Points(hitGeometry, hitMaterial.clone());
      mesh.position.set(position.x, position.y, position.z);
      scene.add(mesh);
      hits.push({ mesh, life: 0.15 });
    },
    update(dt) {
      for (let i = tracers.length - 1; i >= 0; i--) {
        const t = tracers[i];
        if (!t) continue;
        t.life -= dt;
        if (t.life <= 0) {
          scene.remove(t.mesh);
          t.mesh.geometry.dispose();
          tracers.splice(i, 1);
        }
      }
      for (let i = hits.length - 1; i >= 0; i--) {
        const h = hits[i];
        if (!h) continue;
        h.life -= dt;
        const material = h.mesh.material as THREE.PointsMaterial;
        material.opacity = h.life / 0.15;
        if (h.life <= 0) {
          scene.remove(h.mesh);
          material.dispose();
          hits.splice(i, 1);
        }
      }
      if (muzzleLight.intensity > 0) {
        muzzleLight.intensity -= dt * 20;
        if (muzzleLight.intensity < 0) {
          muzzleLight.intensity = 0;
        }
      }
    },
  };
}
