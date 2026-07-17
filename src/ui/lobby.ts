import { asset } from "../lib/assets.js";
import "./styles.css";

export interface Lobby {
  container: HTMLDivElement;
  destroy(): void;
}

export function createLobby(onPlay: () => void): Lobby {
  const container = document.createElement("div");
  container.className = "lobby";

  const abilities = [
    { icon: asset("assets/icon_helix.png"), name: "Helix" },
    { icon: asset("assets/icon_sprint.png"), name: "Sprint" },
    { icon: asset("assets/icon_biotic.png"), name: "Biotic" },
    { icon: asset("assets/icon_visor.png"), name: "Visor" },
  ];

  container.innerHTML = `
    <div class="lobby__bg" style="background-image:url('${asset("assets/menu_bg.png")}')"></div>
    <div class="lobby__shade"></div>
    <img class="lobby__logo" src="${asset("assets/logo.png")}" alt="OMO" />
    <nav class="lobby__menu">
      <div class="lobby__kicker">Single Player // Training Facility</div>
      <h1 class="lobby__title">Practice<br>Range</h1>
      <button class="lobby__btn lobby__btn--primary" data-act="play">
        Enter Range
        <span class="lobby__btn-sub">Full Soldier: 76 Kit — Training Bots Live</span>
      </button>
    </nav>
    <aside class="lobby__hero">
      <img class="lobby__portrait" src="${asset("assets/portrait_soldier.png")}" alt="Soldier: 76" />
      <div class="lobby__hero-row">
        <span class="lobby__hero-name">Soldier: 76</span>
        <span class="lobby__hero-role">Damage</span>
      </div>
      <p class="lobby__hero-desc">
        Veteran vigilante armed with a heavy pulse rifle, helix rockets, a biotic emitter and a tactical targeting visor.
      </p>
      <div class="lobby__abilities">
        ${abilities.map((a) => `<div class="lobby__ability"><img src="${a.icon}" alt="${a.name}" /><span>${a.name}</span></div>`).join("")}
      </div>
    </aside>
    <footer class="lobby__foot">
      <span>Overwatch OMO Native v0.1 — TypeScript 7 · three.js · Web Audio</span>
      <span>Unofficial fan homage. Not affiliated with Blizzard Entertainment.</span>
    </footer>
  `;

  const onClick = (ev: MouseEvent): void => {
    const target = ev.target instanceof Element ? ev.target.closest("[data-act]") : null;
    if (target?.getAttribute("data-act") === "play") {
      onPlay();
    }
  };
  container.addEventListener("click", onClick);

  return {
    container,
    destroy: () => {
      container.removeEventListener("click", onClick);
      container.remove();
    },
  };
}
