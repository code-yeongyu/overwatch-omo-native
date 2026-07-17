import type { Aabb, Vec3 } from "../lib/math.js";

export interface Ray {
  origin: Vec3;
  direction: Vec3;
}

export function intersectRayAabb(ray: Ray, aabb: Aabb): number | null {
  let tmin = 0;
  let tmax = Number.POSITIVE_INFINITY;

  for (const axis of ["x", "y", "z"] as const) {
    if (Math.abs(ray.direction[axis]) < 1e-6) {
      if (ray.origin[axis] < aabb.min[axis] || ray.origin[axis] > aabb.max[axis]) {
        return null;
      }
      continue;
    }

    const invD = 1 / ray.direction[axis];
    let t1 = (aabb.min[axis] - ray.origin[axis]) * invD;
    let t2 = (aabb.max[axis] - ray.origin[axis]) * invD;
    if (t1 > t2) {
      [t1, t2] = [t2, t1];
    }
    tmin = Math.max(tmin, t1);
    tmax = Math.min(tmax, t2);
    if (tmin > tmax) {
      return null;
    }
  }

  return tmin >= 0 ? tmin : null;
}

export function pointInAabb(point: Vec3, aabb: Aabb): boolean {
  return (
    point.x >= aabb.min.x &&
    point.x <= aabb.max.x &&
    point.y >= aabb.min.y &&
    point.y <= aabb.max.y &&
    point.z >= aabb.min.z &&
    point.z <= aabb.max.z
  );
}
