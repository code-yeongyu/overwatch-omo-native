import type { Aabb } from "../lib/math.js";

export class SpatialHash {
  private readonly cellSize: number;
  private readonly cells = new Map<string, Set<number>>();
  private readonly objects = new Map<number, Aabb>();

  constructor(cellSize = 4) {
    this.cellSize = cellSize;
  }

  private key(x: number, y: number, z: number): string {
    return `${x},${y},${z}`;
  }

  insert(id: number, aabb: Aabb): void {
    this.remove(id);
    this.objects.set(id, aabb);

    const minX = Math.floor(aabb.min.x / this.cellSize);
    const maxX = Math.floor(aabb.max.x / this.cellSize);
    const minY = Math.floor(aabb.min.y / this.cellSize);
    const maxY = Math.floor(aabb.max.y / this.cellSize);
    const minZ = Math.floor(aabb.min.z / this.cellSize);
    const maxZ = Math.floor(aabb.max.z / this.cellSize);

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        for (let z = minZ; z <= maxZ; z++) {
          const k = this.key(x, y, z);
          let set = this.cells.get(k);
          if (!set) {
            set = new Set();
            this.cells.set(k, set);
          }
          set.add(id);
        }
      }
    }
  }

  remove(id: number): void {
    const aabb = this.objects.get(id);
    if (!aabb) {
      return;
    }
    this.objects.delete(id);

    const minX = Math.floor(aabb.min.x / this.cellSize);
    const maxX = Math.floor(aabb.max.x / this.cellSize);
    const minY = Math.floor(aabb.min.y / this.cellSize);
    const maxY = Math.floor(aabb.max.y / this.cellSize);
    const minZ = Math.floor(aabb.min.z / this.cellSize);
    const maxZ = Math.floor(aabb.max.z / this.cellSize);

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        for (let z = minZ; z <= maxZ; z++) {
          const k = this.key(x, y, z);
          const set = this.cells.get(k);
          if (set) {
            set.delete(id);
            if (set.size === 0) {
              this.cells.delete(k);
            }
          }
        }
      }
    }
  }

  query(aabb: Aabb): number[] {
    const result = new Set<number>();
    const minX = Math.floor(aabb.min.x / this.cellSize);
    const maxX = Math.floor(aabb.max.x / this.cellSize);
    const minY = Math.floor(aabb.min.y / this.cellSize);
    const maxY = Math.floor(aabb.max.y / this.cellSize);
    const minZ = Math.floor(aabb.min.z / this.cellSize);
    const maxZ = Math.floor(aabb.max.z / this.cellSize);

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        for (let z = minZ; z <= maxZ; z++) {
          const set = this.cells.get(this.key(x, y, z));
          if (set) {
            for (const id of set) {
              result.add(id);
            }
          }
        }
      }
    }

    return Array.from(result);
  }

  clear(): void {
    this.cells.clear();
    this.objects.clear();
  }
}
