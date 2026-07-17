export interface ScoreState {
  kills: number;
  damage: number;
  shotsFired: number;
  shotsHit: number;
  startedAt: number;
}

export function createScoreState(): ScoreState {
  return { kills: 0, damage: 0, shotsFired: 0, shotsHit: 0, startedAt: performance.now() };
}

export function recordShotFired(score: ScoreState): void {
  score.shotsFired++;
}

export function recordHit(score: ScoreState, damage: number): void {
  score.shotsHit++;
  score.damage += damage;
}

export function recordKill(score: ScoreState): void {
  score.kills++;
}

export function accuracyPercent(score: ScoreState): string {
  return score.shotsFired === 0 ? "—" : `${Math.round((score.shotsHit / score.shotsFired) * 100)}%`;
}

export function elapsedTime(score: ScoreState): string {
  const seconds = Math.floor((performance.now() - score.startedAt) / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}
