import * as THREE from "three";
import type { SpatialHash } from "../physics/spatial.js";
import type { GameRenderer } from "../render/renderer.js";

export interface Target {
  id: number;
  mesh: THREE.Mesh;
  health: number;
  maxHealth: number;
  respawnTimer: number;
}

export interface PracticeRange {
  floor: THREE.Mesh;
  targets: Target[];
}

export function buildPracticeRange(renderer: GameRenderer, spatial: SpatialHash): PracticeRange {
  const scene = renderer.scene;

  const floorGeometry = new THREE.PlaneGeometry(120, 120);
  const floorMaterial = new THREE.MeshLambertMaterial({ color: 0x334455 });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  const grid = new THREE.GridHelper(120, 60, 0x556677, 0x445566);
  scene.add(grid);

  const targets: Target[] = [];
  for (let i = 0; i < 8; i++) {
    const distance = 5 + i * 5;
    const geometry = new THREE.SphereGeometry(0.5, 16, 16);
    const material = new THREE.MeshLambertMaterial({ color: 0xff4444 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, 1.5, -distance);
    scene.add(mesh);

    const id = 100 + i;
    spatial.insert(id, {
      min: { x: -0.5, y: 1, z: -distance - 0.5 },
      max: { x: 0.5, y: 2, z: -distance + 0.5 },
    });

    targets.push({ id, mesh, health: 200, maxHealth: 200, respawnTimer: 0 });
  }

  for (let i = 0; i < 3; i++) {
    const z = -25 - i * 8;
    const geometry = new THREE.BoxGeometry(1, 1.5, 0.5);
    const material = new THREE.MeshLambertMaterial({ color: 0xffaa00 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(-10 + i * 10, 1.5, z);
    scene.add(mesh);

    const id = 200 + i;
    spatial.insert(id, {
      min: { x: mesh.position.x - 0.5, y: 1, z: z - 0.25 },
      max: { x: mesh.position.x + 0.5, y: 2.5, z: z + 0.25 },
    });

    targets.push({ id, mesh, health: 200, maxHealth: 200, respawnTimer: 0 });
  }

  const barrierGeo = new THREE.BoxGeometry(2, 2, 0.5);
  const barrierMat = new THREE.MeshLambertMaterial({ color: 0x888888 });
  const barrierPositions: Array<[number, number, number]> = [
    [-5, 1, -10],
    [5, 1, -20],
    [-8, 1, -35],
  ];
  for (const [bx, by, bz] of barrierPositions) {
    const mesh = new THREE.Mesh(barrierGeo, barrierMat);
    mesh.position.set(bx, by, bz);
    scene.add(mesh);
    spatial.insert(300 + bx + bz, {
      min: { x: bx - 1, y: 0, z: bz - 0.25 },
      max: { x: bx + 1, y: 2, z: bz + 0.25 },
    });
  }

  return { floor, targets };
}

export function updateTargets(targets: Target[], dt: number): void {
  for (const target of targets) {
    if (target.health <= 0) {
      target.respawnTimer -= dt;
      target.mesh.visible = false;
      if (target.respawnTimer <= 0) {
        target.health = target.maxHealth;
        target.mesh.visible = true;
      }
    }
  }
}
