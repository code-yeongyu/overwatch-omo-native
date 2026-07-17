import type { ScoreState } from "../game/score.js";
import { asset } from "../lib/assets.js";
import "./styles.css";

export interface Hud {
  container: HTMLDivElement;
  update(params: HudUpdateParams): void;
  showDamageNumber(amount: number): void;
  flashHitmarker(kind: "hit" | "kill"): void;
  pushKillfeed(botId: number): void;
  destroy(): void;
}

export interface HudUpdateParams {
  health: number;
  maxHealth: number;
  ammo: number;
  maxAmmo: number;
  reloading: boolean;
  helixCooldown: number;
  helixMax: number;
  bioticCooldown: number;
  bioticMax: number;
  bioticActive: boolean;
  ultimateCharge: number;
  visorActive: boolean;
  visorRemaining: number;
  visorDuration: number;
  score: ScoreState;
  locked: boolean;
}

const HP_SEGMENTS = 8;
const FEED_TTL_MS = 3600;

export function createHud(): Hud {
  const container = document.createElement("div");
  container.className = "hud";
  container.innerHTML = `
    <div class="hud__scoreboard">
      <div><dt>Elims</dt><dd data-h="elims">0</dd></div>
      <div><dt>Damage</dt><dd data-h="damage">0</dd></div>
      <div><dt>Accuracy</dt><dd data-h="acc">—</dd></div>
      <div><dt>Time</dt><dd data-h="time">0:00</dd></div>
    </div>
    <div class="hud__killfeed" data-h="killfeed"></div>
    <div class="hud__crosshair"><i class="cx-t"></i><i class="cx-b"></i><i class="cx-l"></i><i class="cx-r"></i></div>
    <div class="hud__hitmarker" data-h="hitmarker"><i class="hm-tl"></i><i class="hm-tr"></i><i class="hm-bl"></i><i class="hm-br"></i></div>
    <div class="hud__hp">
      <div class="hud__hp-num" data-h="hp">200</div>
      <div class="hud__hp-bar" data-h="hpbar"></div>
      <div class="hud__hp-state" data-h="healstate">▲ Biotic Field</div>
    </div>
    <div class="hud__ult">
      <div class="hud__ult-ring" data-h="ultring"><span class="hud__ult-val" data-h="ult">0%</span></div>
      <div class="hud__ult-hint">Q — Tactical Visor</div>
    </div>
    <div class="hud__abilities">
      <div class="hud__ability" data-h="ab-sprint"><img src="${asset("assets/icon_sprint.png")}" alt="Sprint" /><span class="hud__ability-key">SHIFT</span></div>
      <div class="hud__ability" data-h="ab-helix"><img src="${asset("assets/icon_helix.png")}" alt="Helix" /><span class="hud__ability-key">E</span><div class="hud__ability-cd" data-h="cd-helix" hidden></div></div>
      <div class="hud__ability" data-h="ab-biotic"><img src="${asset("assets/icon_biotic.png")}" alt="Biotic" /><span class="hud__ability-key">F</span><div class="hud__ability-cd" data-h="cd-biotic" hidden></div></div>
    </div>
    <div class="hud__weapon">
      <div class="hud__weapon-reload" data-h="reload">Reloading</div>
      <div class="hud__weapon-ammo"><span data-h="ammo">30</span><small> / 30</small></div>
      <div class="hud__weapon-name">Heavy Pulse Rifle</div>
    </div>
    <div class="hud__visor" data-h="visor">
      <div class="hud__visor-label">Tactical Visor</div>
      <div class="hud__visor-bar"><div class="hud__visor-fill" data-h="visor-fill"></div></div>
    </div>
    <div class="hud__lock" data-h="lock">
      <div class="hud__lock-box">
        <div class="hud__lock-title">Click to Enter Combat</div>
        <div class="hud__lock-sub">Click to lock aim — press Esc to release</div>
        <div class="hud__controls">
          <span><b>WASD</b>Move</span><span><b>Shift</b>Sprint</span>
          <span><b>Space</b>Jump</span><span><b>LMB</b>Fire</span>
          <span><b>E</b>Helix Rockets</span><span><b>F</b>Biotic Field</span>
          <span><b>Q</b>Tactical Visor</span><span><b>R</b>Reload</span>
        </div>
        <button class="hud__lock-btn" data-act="lobby">Exit to Lobby</button>
      </div>
    </div>
  `;

  const refs = new Map<string, HTMLElement>();
  const textCache = new Map<string, string>();
  const timers = new Set<ReturnType<typeof setTimeout>>();

  function q(name: string): HTMLElement {
    const cached = refs.get(name);
    if (cached) return cached;
    const el = container.querySelector<HTMLElement>(`[data-h="${name}"]`);
    if (!el) throw new Error(`hud element missing: ${name}`);
    refs.set(name, el);
    return el;
  }

  function setText(name: string, value: string): void {
    if (textCache.get(name) === value) return;
    textCache.set(name, value);
    q(name).textContent = value;
  }

  function updateCooldown(
    cdName: string,
    abilityName: string,
    remaining: number,
    total: number,
  ): void {
    const cd = q(cdName) as HTMLDivElement;
    const ability = q(abilityName);
    cd.hidden = remaining <= 0;
    if (remaining > 0) {
      cd.style.setProperty("--cd", `${(remaining / total) * 100}%`);
      cd.textContent = String(Math.ceil(remaining));
    }
    ability.classList.toggle("hud__ability--ready", remaining <= 0);
  }

  function updateHp(health: number, maxHealth: number, bioticActive: boolean): void {
    setText("hp", String(Math.ceil(health)));
    const segs = q("hpbar").children;
    const perSeg = maxHealth / HP_SEGMENTS;
    for (let i = 0; i < segs.length; i++) {
      const seg = segs[i];
      if (seg) {
        const full = health > i * perSeg;
        seg.className = `hud__hp-seg${full ? " hud__hp-seg--full" : ""}`;
      }
    }
    q("healstate").classList.toggle("hud__hp-state--on", bioticActive);
  }

  function updateUlt(charge: number, active: boolean, remaining: number, duration: number): void {
    const pct = active ? 100 : Math.min(100, charge);
    setText("ult", active ? "★" : `${pct}%`);
    q("ultring").style.setProperty("--ult-pct", `${pct}%`);
    q("ultring").classList.toggle("hud__ult--ready", pct >= 100 && !active);
    q("visor").classList.toggle("hud__visor--on", active);
    if (active) {
      (q("visor-fill") as HTMLDivElement).style.transform = `scaleX(${remaining / duration})`;
    }
  }

  function updateScore(score: ScoreState): void {
    setText("elims", String(score.kills));
    setText("damage", String(Math.round(score.damage)));
    setText(
      "acc",
      score.shotsFired === 0 ? "—" : `${Math.round((score.shotsHit / score.shotsFired) * 100)}%`,
    );
    const seconds = Math.floor((performance.now() - score.startedAt) / 1000);
    setText("time", `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`);
  }

  function buildHpSegments(): void {
    const bar = q("hpbar");
    for (let i = 0; i < HP_SEGMENTS; i++) {
      const seg = document.createElement("i");
      seg.className = "hud__hp-seg hud__hp-seg--full";
      bar.appendChild(seg);
    }
  }
  buildHpSegments();

  return {
    container,
    update(params) {
      setText("ammo", String(params.ammo));
      q("reload").classList.toggle("hud__weapon-reload--on", params.reloading);
      updateHp(params.health, params.maxHealth, params.bioticActive);
      updateUlt(
        params.ultimateCharge,
        params.visorActive,
        params.visorRemaining,
        params.visorDuration,
      );
      updateCooldown("cd-helix", "ab-helix", params.helixCooldown, params.helixMax);
      updateCooldown("cd-biotic", "ab-biotic", params.bioticCooldown, params.bioticMax);
      q("ab-sprint").classList.toggle("hud__ability--ready", true);
      q("lock").classList.toggle("hud__lock--hidden", !params.locked);
      updateScore(params.score);
    },
    showDamageNumber(amount) {
      const el = document.createElement("div");
      el.textContent = String(Math.round(amount));
      el.style.cssText = `
        position: absolute; left: 50%; top: 42%; transform: translate(-50%, -50%);
        font-size: 26px; font-weight: 700; color: #ff4444;
        text-shadow: 0 2px 6px rgba(0,0,0,0.8);
        animation: damageFloat 0.7s ease-out forwards; pointer-events: none;
      `;
      container.appendChild(el);
      const t = setTimeout(() => {
        timers.delete(t);
        el.remove();
      }, 700);
      timers.add(t);
    },
    flashHitmarker(kind) {
      const hm = q("hitmarker");
      hm.classList.remove("hud__hitmarker--show", "hud__hitmarker--kill");
      void hm.offsetWidth;
      if (kind === "kill") hm.classList.add("hud__hitmarker--kill");
      hm.classList.add("hud__hitmarker--show");
      const t = setTimeout(() => {
        timers.delete(t);
        hm.classList.remove("hud__hitmarker--show");
      }, 120);
      timers.add(t);
    },
    pushKillfeed(botId) {
      const feed = q("killfeed");
      const item = document.createElement("div");
      item.className = "hud__feed-item";
      item.innerHTML = `<span style="color:#ff9c00">Soldier: 76</span> ▶ <span>Training Bot ${String(botId + 1).padStart(2, "0")}</span>`;
      feed.prepend(item);
      while (feed.children.length > 5) feed.lastElementChild?.remove();
      const t1 = setTimeout(() => {
        timers.delete(t1);
        item.classList.add("hud__feed-item--out");
        const t2 = setTimeout(() => {
          timers.delete(t2);
          item.remove();
        }, 350);
        timers.add(t2);
      }, FEED_TTL_MS);
      timers.add(t1);
    },
    destroy() {
      for (const t of timers) clearTimeout(t);
      timers.clear();
      container.remove();
    },
  };
}
