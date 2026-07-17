import * as THREE from "three";
import { intersectRayAabb } from "../../physics/collision.js";
import type { SpatialHash } from "../../physics/spatial.js";
import type { Target } from "../../range/practice-range.js";
import type { FirstPersonCamera } from "../../render/camera.js";
import { SOLDIER_76 } from "./constants.js";

export interface HitResult {
  targetId: number;
  damage: number;
}

export function raycastTargets(
  camera: FirstPersonCamera,
  spatial: SpatialHash,
  targets: Target[],
): HitResult | null {
  const origin = camera.object.position;
  const direction = new THREE.Vector3(0, 0, -1);
  direction.applyQuaternion(camera.object.quaternion);
  direction.normalize();

  const candidates = spatial.query({
    min: {
      x: origin.x - 0.5,
      y: origin.y - 0.5,
      z: origin.z - 0.5,
    },
    max: {
      x: origin.x + 0.5,
      y: origin.y + 0.5,
      z: origin.z + 0.5,
    },
  });

  let closest: HitResult | null = null;
  let closestT = Number.POSITIVE_INFINITY;

  for (const target of targets) {
    if (target.health <= 0 || !candidates.includes(target.id)) {
      continue;
    }
    const aabb = {
      min: {
        x: target.mesh.position.x - 0.5,
        y: target.mesh.position.y - 0.5,
        z: target.mesh.position.z - 0.5,
      },
      max: {
        x: target.mesh.position.x + 0.5,
        y: target.mesh.position.y + 0.5,
        z: target.mesh.position.z + 0.5,
      },
    };
    const t = intersectRayAabb({ origin, direction }, aabb);
    if (t !== null && t < closestT) {
      closestT = t;
      closest = { targetId: target.id, damage: SOLDIER_76.rifle.damage };
    }
  }

  return closest;
}
