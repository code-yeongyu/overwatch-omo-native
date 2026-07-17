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

  const targets: Target[] = [];

  // Floor with Overwatch facility color
  const floorGeometry = new THREE.PlaneGeometry(120, 120);
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0x2a3038,
    roughness: 0.7,
    metalness: 0.3,
  });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // Yellow safety lines
  const lineMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
  for (let i = -2; i <= 2; i++) {
    const line = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 100), lineMat);
    line.rotation.x = -Math.PI / 2;
    line.position.set(i * 6, 0.01, 0);
    scene.add(line);
  }

  // Back wall / facility shell
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x3a4048,
    roughness: 0.6,
    metalness: 0.2,
  });
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(120, 18, 1), wallMat);
  backWall.position.set(0, 9, -55);
  backWall.receiveShadow = true;
  scene.add(backWall);

  // Side walls
  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(1, 18, 110), wallMat);
  leftWall.position.set(-35, 9, 0);
  scene.add(leftWall);
  const rightWall = new THREE.Mesh(new THREE.BoxGeometry(1, 18, 110), wallMat);
  rightWall.position.set(35, 9, 0);
  scene.add(rightWall);

  // Ceiling trusses
  for (let z = -40; z <= 20; z += 15) {
    const truss = new THREE.Mesh(new THREE.BoxGeometry(70, 0.6, 1), wallMat);
    truss.position.set(0, 14, z);
    scene.add(truss);
  }

  // Overwatch logo-ish ring signs
  const signMat = new THREE.MeshStandardMaterial({
    color: 0xffaa00,
    emissive: 0xff8800,
    emissiveIntensity: 0.3,
  });
  const signPositions: Array<[number, number, number]> = [
    [-10, 6, -54.4],
    [10, 6, -54.4],
  ];
  for (const [x, y, z] of signPositions) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.18, 8, 32), signMat);
    ring.position.set(x, y, z);
    scene.add(ring);
  }

  // Training bot targets (red robots)
  const botMat = new THREE.MeshStandardMaterial({
    color: 0xff3333,
    roughness: 0.4,
    metalness: 0.5,
  });
  const eyeMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0x88ccff,
    emissiveIntensity: 0.5,
  });
  const botRingMat = new THREE.MeshStandardMaterial({
    color: 0x888888,
    roughness: 0.5,
    metalness: 0.6,
  });
  for (let i = 0; i < 8; i++) {
    const distance = 8 + i * 5;

    const body = new THREE.Mesh(new THREE.SphereGeometry(0.45, 16, 16), botMat);
    body.position.set(0, 1.6, -distance);
    body.castShadow = true;

    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), eyeMat);
    eye.position.set(0, 0.05, -0.38);
    body.add(eye);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.06, 8, 24), botRingMat);
    ring.rotation.x = Math.PI / 2;
    body.add(ring);

    scene.add(body);

    const id = 100 + i;
    spatial.insert(id, {
      min: { x: -0.5, y: 1, z: -distance - 0.5 },
      max: { x: 0.5, y: 2, z: -distance + 0.5 },
    });

    targets.push({ id, mesh: body, health: 200, maxHealth: 200, respawnTimer: 0 });
  }

  // Moving square targets
  const movingMat = new THREE.MeshStandardMaterial({
    color: 0xffaa00,
    roughness: 0.4,
    metalness: 0.5,
    emissive: 0xff4400,
    emissiveIntensity: 0.2,
  });
  for (let i = 0; i < 3; i++) {
    const z = -25 - i * 8;
    const geometry = new THREE.BoxGeometry(0.9, 1.2, 0.35);
    const mesh = new THREE.Mesh(geometry, movingMat);
    mesh.position.set(-10 + i * 10, 1.8, z);
    mesh.castShadow = true;
    scene.add(mesh);

    const id = 200 + i;
    spatial.insert(id, {
      min: { x: mesh.position.x - 0.45, y: 1, z: z - 0.2 },
      max: { x: mesh.position.x + 0.45, y: 2.5, z: z + 0.2 },
    });

    targets.push({ id, mesh, health: 200, maxHealth: 200, respawnTimer: 0 });
  }

  // Barriers / cover blocks
  const barrierMat = new THREE.MeshStandardMaterial({
    color: 0x556070,
    roughness: 0.5,
    metalness: 0.4,
  });
  const barrierPositions: Array<[number, number, number]> = [
    [-6, 1, -12],
    [6, 1, -22],
    [-9, 1, -38],
  ];
  for (const [bx, by, bz] of barrierPositions) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.2, 0.6), barrierMat);
    mesh.position.set(bx, by, bz);
    mesh.castShadow = true;
    scene.add(mesh);
    spatial.insert(300 + bx + bz, {
      min: { x: bx - 1.1, y: 0, z: bz - 0.3 },
      max: { x: bx + 1.1, y: 2.2, z: bz + 0.3 },
    });
  }

  // Jump pad
  const padBase = new THREE.Mesh(
    new THREE.CylinderGeometry(1.2, 1.4, 0.2, 32),
    new THREE.MeshStandardMaterial({ color: 0x0088ff, emissive: 0x0044aa, emissiveIntensity: 0.4 }),
  );
  padBase.position.set(8, 0.1, -5);
  scene.add(padBase);
  const padRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.2, 0.08, 8, 32),
    new THREE.MeshBasicMaterial({ color: 0x00ffff }),
  );
  padRing.rotation.x = Math.PI / 2;
  padRing.position.set(8, 0.22, -5);
  scene.add(padRing);

  // Lights
  const ambient = new THREE.AmbientLight(0xffffff, 0.35);
  scene.add(ambient);

  const sun = new THREE.DirectionalLight(0xffffff, 1.2);
  sun.position.set(20, 40, 20);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = 120;
  sun.shadow.camera.left = -40;
  sun.shadow.camera.right = 40;
  sun.shadow.camera.top = 40;
  sun.shadow.camera.bottom = -40;
  scene.add(sun);

  const fill = new THREE.DirectionalLight(0x88ccff, 0.35);
  fill.position.set(-20, 20, -10);
  scene.add(fill);

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
