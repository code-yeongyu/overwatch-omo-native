import * as THREE from "three";
import type { Target } from "../../range/practice-range.js";
import type { FirstPersonCamera } from "../../render/camera.js";
import { SOLDIER_76 } from "./constants.js";

export interface VisorTarget {
  id: number;
  direction: THREE.Vector3;
  distance: number;
}

export function findVisorTarget(camera: FirstPersonCamera, targets: Target[]): VisorTarget | null {
  const coneRad = (SOLDIER_76.visor.cone * Math.PI) / 180;
  const maxCos = Math.cos(coneRad / 2);
  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.object.quaternion);
  const origin = camera.object.position;

  let best: VisorTarget | null = null;
  let bestScore = Number.POSITIVE_INFINITY;

  for (const target of targets) {
    if (target.health <= 0) {
      continue;
    }
    const toTarget = new THREE.Vector3(
      target.mesh.position.x - origin.x,
      target.mesh.position.y - origin.y,
      target.mesh.position.z - origin.z,
    );
    const distance = toTarget.length();
    if (distance > SOLDIER_76.visor.range) {
      continue;
    }
    toTarget.normalize();
    const alignment = forward.dot(toTarget);
    if (alignment < maxCos) {
      continue;
    }
    const score = distance / Math.max(alignment, 0.001);
    if (score < bestScore) {
      bestScore = score;
      best = { id: target.id, direction: toTarget, distance };
    }
  }

  return best;
}
