export interface Hud {
  container: HTMLDivElement;
  setHealth(value: number): void;
  setAmmo(current: number, max: number): void;
  setState(state: string): void;
  destroy(): void;
}

export function createHud(): Hud {
  const container = document.createElement("div");
  container.style.cssText = `
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    pointer-events: none; display: flex; flex-direction: column;
    justify-content: space-between; padding: 24px; box-sizing: border-box;
    font-family: system-ui, sans-serif; color: #fff; text-shadow: 0 1px 2px #000;
  `;

  const top = document.createElement("div");
  top.style.cssText = "display: flex; justify-content: space-between;";

  const health = document.createElement("div");
  health.style.cssText = "font-size: 24px; font-weight: bold; color: #66ff66;";
  health.textContent = "HP 200";
  top.appendChild(health);

  const stateLabel = document.createElement("div");
  stateLabel.style.cssText = "font-size: 18px; color: #ffaa00;";
  stateLabel.textContent = "idle";
  top.appendChild(stateLabel);

  container.appendChild(top);

  const bottom = document.createElement("div");
  bottom.style.cssText = "display: flex; justify-content: flex-end;";

  const ammo = document.createElement("div");
  ammo.style.cssText = "font-size: 32px; font-weight: bold;";
  ammo.textContent = "30 / 30";
  bottom.appendChild(ammo);

  container.appendChild(bottom);

  const reticle = document.createElement("div");
  reticle.style.cssText = `
    position: absolute; left: 50%; top: 50%; width: 8px; height: 8px;
    transform: translate(-50%, -50%); border: 2px solid rgba(255,255,255,0.8);
    border-radius: 50%;
  `;
  container.appendChild(reticle);

  return {
    container,
    setHealth(value) {
      health.textContent = `HP ${Math.max(0, Math.round(value))}`;
    },
    setAmmo(current, max) {
      ammo.textContent = `${current} / ${max}`;
    },
    setState(state) {
      stateLabel.textContent = state;
    },
    destroy: () => container.remove(),
  };
}
