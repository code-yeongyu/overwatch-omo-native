import * as THREE from "three";
import { clamp } from "../lib/math.js";

export class FirstPersonCamera {
  readonly object: THREE.Object3D;
  private yaw = 0;
  private pitch = 0;
  private fov = 75;
  private targetFov = 75;
  private recoilPitch = 0;

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
    this.updateRotation();
  }

  applyRecoil(kick: number): void {
    this.recoilPitch = kick;
  }

  setTargetFov(fov: number): void {
    this.targetFov = fov;
  }

  update(dt: number): number {
    this.recoilPitch = clamp(this.recoilPitch - dt * 6, 0, 1);
    this.updateRotation();

    const fovSpeed = 6 * dt;
    if (this.fov < this.targetFov) this.fov = Math.min(this.targetFov, this.fov + fovSpeed * 10);
    else if (this.fov > this.targetFov)
      this.fov = Math.max(this.targetFov, this.fov - fovSpeed * 10);
    return this.fov;
  }

  copyTo(camera: THREE.PerspectiveCamera): void {
    camera.position.copy(this.object.position);
    camera.quaternion.copy(this.object.quaternion);
    camera.fov = this.fov;
    camera.updateProjectionMatrix();
  }

  private updateRotation(): void {
    this.object.rotation.set(0, 0, 0);
    this.object.rotateY(this.yaw);
    this.object.rotateX(this.pitch - this.recoilPitch);
  }
}
