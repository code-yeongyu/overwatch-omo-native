import * as THREE from "three";
import { clamp } from "../lib/math.js";

export class FirstPersonCamera {
  readonly object: THREE.Object3D;
  private yaw = 0;
  private pitch = 0;

  constructor() {
    this.object = new THREE.Object3D();
  }

  setPosition(x: number, y: number, z: number): void {
    this.object.position.set(x, y, z);
  }

  addLookDelta(dx: number, dy: number, sensitivity: number): void {
    this.yaw -= dx * sensitivity;
    this.pitch -= dy * sensitivity;
    this.pitch = clamp(this.pitch, -Math.PI / 2 + 0.01, Math.PI / 2 - 0.01);
    this.object.rotation.set(0, 0, 0);
    this.object.rotateY(this.yaw);
    this.object.rotateX(this.pitch);
  }

  copyTo(camera: THREE.Camera): void {
    camera.position.copy(this.object.position);
    camera.quaternion.copy(this.object.quaternion);
  }
}
