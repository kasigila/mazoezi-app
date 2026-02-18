/**
 * MAZOEZI Protocol Helpers
 * Grace period, streak multiplier. Standards come from challenges.js.
 */

export const GRACE_HOURS = 3;
export const FREEZE_TOKEN_INTERVAL = 30;

export function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function isWithinGrace(dateStr) {
  const d = new Date();
  const today = getTodayStr();
  if (dateStr !== today) return false;
  return d.getHours() < GRACE_HOURS;
}

export function getStreakMultiplier(currentStreak) {
  return 1 + (currentStreak || 0) / 30;
}
