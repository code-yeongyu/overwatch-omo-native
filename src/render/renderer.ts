import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

export interface RenderSnapshot {
  cameraPosition: { x: number; y: number; z: number };
  cameraRotation: { x: number; y: number; z: number; w: number };
}

export class GameRenderer {
  readonly canvas: HTMLCanvasElement;
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;
  readonly renderer: THREE.WebGLRenderer;
  private readonly composer: EffectComposer;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    const gl = canvas.getContext("webgl2");
    if (!gl) {
      throw new Error("WebGL2 is required");
    }

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x4a5560);
    this.scene.fog = new THREE.Fog(0x4a5560, 30, 130);

    this.camera = new THREE.PerspectiveCamera(
      75,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      1000,
    );

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      context: gl,
      antialias: false,
      powerPreference: "high-performance",
    });
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    const bloom = new UnrealBloomPass(
      new THREE.Vector2(canvas.clientWidth * 0.4, canvas.clientHeight * 0.4),
      0.3,
      0.3,
      0.9,
    );
    this.composer.addPass(bloom);

    window.addEventListener("resize", () => this.resize());
  }

  resize(): void {
    const { clientWidth, clientHeight } = this.canvas;
    this.camera.aspect = clientWidth / clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(clientWidth, clientHeight);
    this.composer.setSize(clientWidth, clientHeight);
  }

  render(): void {
    this.composer.render();
  }

  clear(): void {
    this.renderer.dispose();
  }
}

export function createCanvas(container: HTMLElement): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  container.appendChild(canvas);
  return canvas;
}
