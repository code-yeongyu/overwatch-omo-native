export interface MusicSystem {
  start(): void;
  stop(): void;
}

export function createMusicSystem(ctx: AudioContext): MusicSystem {
  const bpm = 100;
  const beatSeconds = 60 / bpm;
  let running = false;
  let nextNoteTime = 0;
  let step = 0;
  let timerId: ReturnType<typeof setTimeout> | null = null;

  const scale = [220, 261.63, 293.66, 329.63, 392, 440, 523.25];
  const bassLine = [0, 0, 4, 4, 3, 3, 0, 0];
  const melody = [4, 2, 0, 2, 4, 5, 4, 2];

  function playTone(freq: number, time: number, duration: number, gain: number): void {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, time);
    g.gain.setValueAtTime(0.0001, time);
    g.gain.linearRampToValueAtTime(gain, time + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(time);
    osc.stop(time + duration);
  }

  function schedule() {
    const horizon = ctx.currentTime + 0.2;
    while (nextNoteTime < horizon) {
      const beat = step % 8;
      const bassIndex = bassLine[beat];
      const melodyIndex = melody[beat];
      if (bassIndex === undefined || melodyIndex === undefined) {
        nextNoteTime += beatSeconds / 2;
        step++;
        continue;
      }
      const bassFreq = scale[bassIndex % scale.length];
      const melodyFreq = scale[melodyIndex % scale.length];
      if (bassFreq === undefined || melodyFreq === undefined) {
        nextNoteTime += beatSeconds / 2;
        step++;
        continue;
      }
      playTone(bassFreq / 2, nextNoteTime, beatSeconds * 0.8, 0.08);
      if (beat % 2 === 0) {
        playTone(melodyFreq, nextNoteTime, beatSeconds * 0.5, 0.05);
      }
      nextNoteTime += beatSeconds / 2;
      step++;
    }
    timerId = setTimeout(schedule, 100);
  }

  return {
    start() {
      if (running) return;
      running = true;
      nextNoteTime = ctx.currentTime + 0.05;
      step = 0;
      schedule();
    },
    stop() {
      running = false;
      if (timerId) {
        clearTimeout(timerId);
        timerId = null;
      }
    },
  };
}
