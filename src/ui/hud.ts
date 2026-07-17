export interface Hud {
  container: HTMLDivElement;
  setHealth(value: number): void;
  setAmmo(current: number, max: number): void;
  setAbilityCooldowns(helix: number, biotic: number): void;
  setUltimate(charge: number): void;
  setState(state: string): void;
  setVisorActive(active: boolean): void;
  showDamageNumber(amount: number): void;
  destroy(): void;
}

export function createHud(): Hud {
  const container = document.createElement("div");
  container.style.cssText = `
    position: absolute; inset: 0; pointer-events: none; overflow: hidden;
    font-family: "Big Noodle Too", "Industry", Impact, system-ui, sans-serif;
    text-transform: uppercase; letter-spacing: 0.05em; color: #fff;
  `;

  // Reticle
  const reticle = document.createElement("div");
  reticle.style.cssText = `
    position: absolute; left: 50%; top: 50%; width: 16px; height: 16px;
    transform: translate(-50%, -50%); border: 2px solid rgba(255,255,255,0.85);
    border-radius: 50%; box-shadow: 0 0 6px rgba(0,0,0,0.6);
  `;
  const reticleDot = document.createElement("div");
  reticleDot.style.cssText = `
    position: absolute; left: 50%; top: 50%; width: 3px; height: 3px;
    transform: translate(-50%, -50%); background: rgba(255,255,255,0.9); border-radius: 50%;
  `;
  reticle.appendChild(reticleDot);
  container.appendChild(reticle);

  // Bottom panel
  const bottom = document.createElement("div");
  bottom.style.cssText = `
    position: absolute; bottom: 24px; left: 50%; transform: translateX(-50%);
    display: flex; align-items: flex-end; gap: 16px;
  `;

  // Health
  const healthBox = createPanel("200", "HP", "#00ff44");
  bottom.appendChild(healthBox.panel);

  // Abilities
  const abilities = document.createElement("div");
  abilities.style.cssText = "display: flex; gap: 8px; align-items: flex-end;";
  const helixIcon = createAbilityIcon("E", "Helix");
  const bioticIcon = createAbilityIcon("F", "Field");
  abilities.appendChild(helixIcon);
  abilities.appendChild(bioticIcon);
  bottom.appendChild(abilities);

  // Ammo
  const ammoBox = createAmmoPanel();
  bottom.appendChild(ammoBox.panel);

  container.appendChild(bottom);

  // Ultimate meter
  const ult = createUltimateMeter();
  ult.panel.style.cssText = `
    position: absolute; bottom: 120px; left: 50%; transform: translateX(-50%);
    width: 280px; height: 12px; background: rgba(0,0,0,0.5); border-radius: 6px;
    border: 1px solid rgba(255,255,255,0.3); overflow: hidden;
  `;
  container.appendChild(ult.panel);

  // State / feedback
  const stateLabel = document.createElement("div");
  stateLabel.style.cssText = `
    position: absolute; top: 24px; right: 24px; font-size: 18px; color: #ffaa00;
    text-shadow: 0 2px 4px rgba(0,0,0,0.8);
  `;
  container.appendChild(stateLabel);

  // Visor indicator
  const visorLabel = document.createElement("div");
  visorLabel.textContent = "TACTICAL VISOR ACTIVE";
  visorLabel.style.cssText = `
    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
    font-size: 22px; font-weight: 800; color: #ff6600; opacity: 0;
    text-shadow: 0 0 12px rgba(255,102,0,0.8); transition: opacity 0.2s ease;
    pointer-events: none;
  `;
  container.appendChild(visorLabel);

  // Damage numbers container
  const damageContainer = document.createElement("div");
  damageContainer.style.cssText = `
    position: absolute; left: 50%; top: 42%; transform: translate(-50%, -50%);
    display: flex; flex-direction: column; align-items: center; gap: 4px;
  `;
  container.appendChild(damageContainer);

  return {
    container,
    setHealth(value) {
      healthBox.value.textContent = String(Math.max(0, Math.round(value)));
    },
    setAmmo(current, max) {
      ammoBox.current.textContent = String(current);
      ammoBox.max.textContent = String(max);
    },
    setAbilityCooldowns(helix, biotic) {
      setCooldown(helixIcon, helix);
      setCooldown(bioticIcon, biotic);
    },
    setUltimate(charge) {
      ult.fill.style.width = `${Math.min(100, charge)}%`;
      ult.fill.style.background =
        charge >= 100
          ? "linear-gradient(90deg, #ff6600, #ffcc00)"
          : "linear-gradient(90deg, #4488ff, #44ccff)";
    },
    setState(state) {
      stateLabel.textContent = state;
    },
    setVisorActive(active) {
      visorLabel.style.opacity = active ? "1" : "0";
    },
    showDamageNumber(amount) {
      const el = document.createElement("div");
      el.textContent = String(Math.round(amount));
      el.style.cssText = `
        font-size: 28px; font-weight: bold; color: #ff4444;
        text-shadow: 0 2px 4px rgba(0,0,0,0.8);
        animation: damageFloat 0.8s ease-out forwards;
      `;
      damageContainer.appendChild(el);
      setTimeout(() => el.remove(), 800);
    },
    destroy: () => container.remove(),
  };
}

function createPanel(value: string, label: string, color: string) {
  const panel = document.createElement("div");
  panel.style.cssText = `
    background: rgba(0,0,0,0.55); border: 1px solid rgba(255,255,255,0.25);
    border-radius: 4px; padding: 8px 14px; min-width: 70px; text-align: center;
    box-shadow: 0 4px 12px rgba(0,0,0,0.4);
  `;
  const valueEl = document.createElement("div");
  valueEl.textContent = value;
  valueEl.style.cssText = `font-size: 34px; font-weight: 800; color: ${color}; line-height: 1;`;
  const labelEl = document.createElement("div");
  labelEl.textContent = label;
  labelEl.style.cssText = "font-size: 12px; color: rgba(255,255,255,0.7); margin-top: 2px;";
  panel.appendChild(valueEl);
  panel.appendChild(labelEl);
  return { panel, value: valueEl };
}

function createAmmoPanel() {
  const panel = document.createElement("div");
  panel.style.cssText = `
    background: rgba(0,0,0,0.55); border: 1px solid rgba(255,255,255,0.25);
    border-radius: 4px; padding: 8px 14px; min-width: 80px; text-align: center;
    box-shadow: 0 4px 12px rgba(0,0,0,0.4);
  `;
  const current = document.createElement("div");
  current.textContent = "30";
  current.style.cssText = "font-size: 34px; font-weight: 800; color: #fff; line-height: 1;";
  const max = document.createElement("div");
  max.textContent = "/ 30";
  max.style.cssText = "font-size: 12px; color: rgba(255,255,255,0.7); margin-top: 2px;";
  panel.appendChild(current);
  panel.appendChild(max);
  return { panel, current, max };
}

function createAbilityIcon(key: string, name: string) {
  const panel = document.createElement("div");
  panel.style.cssText = `
    width: 56px; height: 56px; background: rgba(0,0,0,0.55);
    border: 2px solid rgba(255,255,255,0.35); border-radius: 6px;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    position: relative; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.4);
  `;
  const keyEl = document.createElement("div");
  keyEl.textContent = key;
  keyEl.style.cssText = "font-size: 22px; font-weight: 800; color: #fff; line-height: 1;";
  const nameEl = document.createElement("div");
  nameEl.textContent = name;
  nameEl.style.cssText = "font-size: 9px; color: rgba(255,255,255,0.75); letter-spacing: 0.02em;";
  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position: absolute; bottom: 0; left: 0; width: 100%; height: 0%;
    background: rgba(0,0,0,0.75); transition: height 0.1s linear;
  `;
  panel.appendChild(keyEl);
  panel.appendChild(nameEl);
  panel.appendChild(overlay);
  (panel as unknown as { cooldownOverlay: HTMLDivElement }).cooldownOverlay = overlay;
  return panel;
}

function setCooldown(
  icon: HTMLDivElement & { cooldownOverlay?: HTMLDivElement },
  remaining: number,
) {
  const overlay = icon.cooldownOverlay;
  if (!overlay) return;
  const max = icon.querySelector("div:first-child")?.textContent === "E" ? 6 : 15;
  const pct = Math.min(100, Math.max(0, (remaining / max) * 100));
  overlay.style.height = `${pct}%`;
}

function createUltimateMeter() {
  const panel = document.createElement("div");
  const fill = document.createElement("div");
  fill.style.cssText =
    "width: 0%; height: 100%; background: linear-gradient(90deg, #4488ff, #44ccff); transition: width 0.1s linear;";
  panel.appendChild(fill);
  return { panel, fill };
}
