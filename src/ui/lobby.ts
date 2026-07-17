export interface Lobby {
  container: HTMLDivElement;
  startButton: HTMLButtonElement;
  destroy(): void;
}

export function createLobby(onStart: () => void): Lobby {
  const container = document.createElement("div");
  container.style.cssText = `
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    width: 100%; height: 100%; background: #0a0a12; color: #fff; gap: 24px;
  `;

  const title = document.createElement("h1");
  title.textContent = "Overwatch OMO Native";
  title.style.cssText = "font-size: 48px; margin: 0; letter-spacing: 2px;";
  container.appendChild(title);

  const subtitle = document.createElement("p");
  subtitle.textContent = "Practice Range — Soldier: 76";
  subtitle.style.cssText = "font-size: 20px; color: #aaa; margin: 0;";
  container.appendChild(subtitle);

  const heroCard = document.createElement("div");
  heroCard.style.cssText = `
    border: 2px solid #4466ff; border-radius: 12px; padding: 24px 48px;
    background: #111122; text-align: center;
  `;
  const heroName = document.createElement("h2");
  heroName.textContent = "Soldier: 76";
  heroName.style.cssText = "margin: 0 0 8px; color: #66aaff;";
  heroCard.appendChild(heroName);
  const heroDesc = document.createElement("p");
  heroDesc.textContent = "Hitscan rifle | Sprint | Helix Rockets | Biotic Field | Tactical Visor";
  heroDesc.style.cssText = "margin: 0; color: #ccc; font-size: 14px;";
  heroCard.appendChild(heroDesc);
  container.appendChild(heroCard);

  const startButton = document.createElement("button");
  startButton.textContent = "Enter Practice Range";
  startButton.style.cssText = `
    font-size: 18px; padding: 16px 32px; border: none; border-radius: 8px;
    background: #ff6600; color: #fff; cursor: pointer; font-weight: bold;
  `;
  startButton.addEventListener("click", onStart);
  container.appendChild(startButton);

  const controls = document.createElement("div");
  controls.style.cssText = "color: #888; font-size: 14px; text-align: center;";
  controls.innerHTML = `
    <p><strong>WASD</strong> Move · <strong>Shift</strong> Sprint · <strong>Space</strong> Jump</p>
    <p><strong>Mouse</strong> Aim · <strong>LMB</strong> Fire · <strong>R</strong> Reload</p>
    <p><strong>E</strong> Helix Rockets · <strong>Q</strong> Tactical Visor</p>
  `;
  container.appendChild(controls);

  return { container, startButton, destroy: () => container.remove() };
}
