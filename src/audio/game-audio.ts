export interface GameAudio {
  enable(): Promise<void>;
  playGunshot(): void;
  playExplosion(): void;
  playReload(): void;
  playUiConfirm(): void;
}

export function createGameAudio(): GameAudio {
  let ctx: AudioContext | null = null;
  let sfxBus: GainNode | null = null;
  let noiseBuffer: AudioBuffer | null = null;

  function ensureContext(): AudioContext {
    if (!ctx) {
      ctx = new AudioContext();
      const master = ctx.createGain();
      master.gain.value = 0.8;
      master.connect(ctx.destination);

      sfxBus = ctx.createGain();
      sfxBus.gain.value = 0.8;
      sfxBus.connect(master);

      const seconds = 2;
      noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    }
    return ctx;
  }

  function oneShotGain(time: number, peak: number, attack: number, release: number): GainNode {
    const c = ensureContext();
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, time);
    g.gain.linearRampToValueAtTime(peak, time + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, time + attack + release);
    g.connect(sfxBus ?? c.destination);
    return g;
  }

  return {
    async enable() {
      const c = ensureContext();
      if (c.state !== "running") {
        await c.resume();
      }
    },
    playGunshot() {
      const c = ensureContext();
      const t = c.currentTime;

      const crack = c.createBufferSource();
      crack.buffer = noiseBuffer;
      const bandPass = c.createBiquadFilter();
      bandPass.type = "bandpass";
      bandPass.frequency.setValueAtTime(2400, t);
      bandPass.frequency.exponentialRampToValueAtTime(700, t + 0.055);
      const crackGain = oneShotGain(t, 0.16, 0.001, 0.07);
      crack.connect(bandPass).connect(crackGain);
      crack.start(t);
      crack.stop(t + 0.08);

      const body = c.createOscillator();
      body.type = "sawtooth";
      body.frequency.setValueAtTime(185, t);
      body.frequency.exponentialRampToValueAtTime(58, t + 0.09);
      const bodyGain = oneShotGain(t, 0.09, 0.001, 0.1);
      body.connect(bodyGain);
      body.start(t);
      body.stop(t + 0.11);
    },
    playExplosion() {
      const c = ensureContext();
      const t = c.currentTime;
      const duration = 0.45;

      const blast = c.createBufferSource();
      blast.buffer = noiseBuffer;
      const lowPass = c.createBiquadFilter();
      lowPass.type = "lowpass";
      lowPass.frequency.setValueAtTime(2400, t);
      lowPass.frequency.exponentialRampToValueAtTime(90, t + duration);
      const blastGain = oneShotGain(t, 0.23, 0.004, duration);
      blast.connect(lowPass).connect(blastGain);
      blast.start(t);
      blast.stop(t + duration + 0.02);

      const thump = c.createOscillator();
      thump.type = "sine";
      thump.frequency.setValueAtTime(100, t);
      thump.frequency.exponentialRampToValueAtTime(28, t + 0.25);
      const thumpGain = oneShotGain(t, 0.18, 0.003, 0.34);
      thump.connect(thumpGain);
      thump.start(t);
      thump.stop(t + 0.38);
    },
    playReload() {
      const c = ensureContext();
      const t = c.currentTime;
      const osc = c.createOscillator();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(600, t);
      osc.frequency.exponentialRampToValueAtTime(300, t + 0.3);
      const gain = oneShotGain(t, 0.06, 0.01, 0.25);
      osc.connect(gain);
      osc.start(t);
      osc.stop(t + 0.3);
    },
    playUiConfirm() {
      const c = ensureContext();
      const t = c.currentTime;
      const osc = c.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, t);
      osc.frequency.setValueAtTime(1100, t + 0.08);
      const gain = oneShotGain(t, 0.05, 0.005, 0.1);
      osc.connect(gain);
      osc.start(t);
      osc.stop(t + 0.12);
    },
  };
}
