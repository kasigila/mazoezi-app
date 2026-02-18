/**
 * MAZOEZI Momentum System
 * 7-day state: Strong, Stable, Weak, Critical
 */

export const MOMENTUM_STATES = {
  STRONG: 'strong',
  STABLE: 'stable',
  WEAK: 'weak',
  CRITICAL: 'critical'
};

export function getMomentumState(completionHistory) {
  const today = new Date().toISOString().slice(0, 10);
  let completed = 0;
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const str = d.toISOString().slice(0, 10);
    const pct = completionHistory[str];
    if (pct === 1) completed++;
    else if (pct !== undefined && pct > 0) completed += 0.5;
  }
  const rate = completed / 7;
  if (rate >= 1) return MOMENTUM_STATES.STRONG;
  if (rate >= 0.85) return MOMENTUM_STATES.STABLE;
  if (rate >= 0.5) return MOMENTUM_STATES.WEAK;
  return MOMENTUM_STATES.CRITICAL;
}
