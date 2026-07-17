import * as THREE from "three";
import { describe, expect, it } from "vitest";
import { findVisorTarget } from "../../../src/heroes/soldier76/visor.js";
import { FirstPersonCamera } from "../../../src/render/camera.js";

describe("Tactical Visor auto-aim", () => {
  it("locks a target directly in front within range", () => {
    const camera = new FirstPersonCamera();
    camera.setPosition(0, 1.75, 0);

    const target = {
      id: 1,
      mesh: { position: new THREE.Vector3(0, 1.75, -10) } as unknown as THREE.Mesh,
      health: 200,
      maxHealth: 200,
      respawnTimer: 0,
    };

    const result = findVisorTarget(camera, [target]);
    expect(result).not.toBeNull();
    expect(result?.id).toBe(1);
  });

  it("ignores targets outside the cone", () => {
    const camera = new FirstPersonCamera();
    camera.setPosition(0, 1.75, 0);
    camera.addLookDelta(0, 0, 0.002);

    const target = {
      id: 1,
      mesh: { position: new THREE.Vector3(50, 1.75, 0) } as unknown as THREE.Mesh,
      health: 200,
      maxHealth: 200,
      respawnTimer: 0,
    };

    const result = findVisorTarget(camera, [target]);
    expect(result).toBeNull();
  });
});
