export type EntityId = number;
export const NO_ENTITY = 0;

export interface ComponentStore<T> {
  set(id: EntityId, value: T): void;
  get(id: EntityId): T | undefined;
  has(id: EntityId): boolean;
  delete(id: EntityId): void;
  clear(): void;
}

export class DenseComponentStore<T> implements ComponentStore<T> {
  private readonly data: (T | undefined)[] = [];

  set(id: EntityId, value: T): void {
    this.data[id] = value;
  }

  get(id: EntityId): T | undefined {
    return this.data[id];
  }

  has(id: EntityId): boolean {
    return this.data[id] !== undefined;
  }

  delete(id: EntityId): void {
    this.data[id] = undefined;
  }

  clear(): void {
    this.data.length = 0;
  }

  all(): IterableIterator<[EntityId, T]> {
    const entries: [EntityId, T][] = [];
    for (let i = 0; i < this.data.length; i++) {
      const value = this.data[i];
      if (value !== undefined) {
        entries.push([i, value]);
      }
    }
    return entries.values();
  }
}

export class World {
  private nextId: EntityId = 1;
  private readonly alive = new Set<EntityId>();
  private readonly toSpawn: EntityId[] = [];
  private readonly toDestroy: EntityId[] = [];

  create(): EntityId {
    const id = this.nextId++;
    this.toSpawn.push(id);
    return id;
  }

  destroy(id: EntityId): void {
    if (this.alive.has(id)) {
      this.toDestroy.push(id);
    }
  }

  isAlive(id: EntityId): boolean {
    return this.alive.has(id);
  }

  flush(): void {
    for (const id of this.toSpawn) {
      this.alive.add(id);
    }
    this.toSpawn.length = 0;

    for (const id of this.toDestroy) {
      this.alive.delete(id);
    }
    this.toDestroy.length = 0;
  }

  entities(): IterableIterator<EntityId> {
    return this.alive.values();
  }

  entityCount(): number {
    return this.alive.size;
  }

  clear(): void {
    this.alive.clear();
    this.toSpawn.length = 0;
    this.toDestroy.length = 0;
    this.nextId = 1;
  }
}
