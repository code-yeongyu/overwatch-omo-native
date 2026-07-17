import * as THREE from "three";
import type { MutableVec3, Vec3 } from "../../lib/math.js";
import type { SpatialHash } from "../../physics/spatial.js";
import { SOLDIER_76 } from "./constants.js";

export interface HelixRocket {
  position: MutableVec3;
  velocity: MutableVec3;
  life: number;
  mesh: THREE.Mesh;
}

export interface BioticField {
  position: Vec3;
  timer: number;
  mesh: THREE.Mesh;
}

export function launchHelixRocket(scene: THREE.Scene, origin: Vec3, direction: Vec3): HelixRocket {
  const geometry = new THREE.SphereGeometry(0.15, 8, 8);
  const material = new THREE.MeshBasicMaterial({ color: 0xff4400 });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(origin.x, origin.y, origin.z);
  scene.add(mesh);

  const speed = SOLDIER_76.helix.speed;
  const vel = {
    x: direction.x * speed,
    y: direction.y * speed,
    z: direction.z * speed,
  };

  return {
    position: { x: origin.x, y: origin.y, z: origin.z },
    velocity: { x: vel.x, y: vel.y, z: vel.z },
    life: 3,
    mesh,
  };
}

export function updateHelixRockets(
  rockets: HelixRocket[],
  dt: number,
  scene: THREE.Scene,
  _spatial: SpatialHash,
): void {
  for (let i = rockets.length - 1; i >= 0; i--) {
    const r = rockets[i];
    if (!r) continue;
    r.life -= dt;
    r.position.x += r.velocity.x * dt;
    r.position.y += r.velocity.y * dt;
    r.position.z += r.velocity.z * dt;
    r.mesh.position.set(r.position.x, r.position.y, r.position.z);

    if (r.life <= 0) {
      scene.remove(r.mesh);
      r.mesh.geometry.dispose();
      rockets.splice(i, 1);
    }
  }
}

export function deployBioticField(scene: THREE.Scene, position: Vec3): BioticField {
  const geometry = new THREE.CylinderGeometry(
    SOLDIER_76.bioticField.radius,
    SOLDIER_76.bioticField.radius,
    0.1,
    32,
  );
  const material = new THREE.MeshBasicMaterial({
    color: 0x00ff66,
    transparent: true,
    opacity: 0.3,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(position.x, 0.05, position.z);
  scene.add(mesh);

  return {
    position: { x: position.x, y: position.y, z: position.z },
    timer: SOLDIER_76.bioticField.duration,
    mesh,
  };
}

export function updateBioticFields(fields: BioticField[], dt: number, scene: THREE.Scene): void {
  for (let i = fields.length - 1; i >= 0; i--) {
    const f = fields[i];
    if (!f) continue;
    f.timer -= dt;
    const material = f.mesh.material as THREE.MeshBasicMaterial;
    material.opacity = 0.3 * (f.timer / SOLDIER_76.bioticField.duration);
    if (f.timer <= 0) {
      scene.remove(f.mesh);
      material.dispose();
      f.mesh.geometry.dispose();
      fields.splice(i, 1);
    }
  }
}
