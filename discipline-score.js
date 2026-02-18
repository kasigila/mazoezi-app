/**
 * MAZOEZI Discipline Score (0-100)
 * Completion 40%, Streak 30%, On-time 20%, Reset penalty 10%
 */

export function calcDisciplineScore(profile, completionHistory, resetCount) {
  const completion = calcCompletionFactor(completionHistory);
  const streak = calcStreakFactor(profile.currentStreak, profile.longestStreak);
  const onTime = profile.onTimeRate ?? 0.8;
  const resetPenalty = Math.max(0, 1 - (resetCount || 0) * 0.1);

  const score = (
    completion * 0.4 +
    streak * 0.3 +
    onTime * 0.2 +
    resetPenalty * 0.1
  ) * 100;

  return Math.round(Math.min(100, Math.max(0, score)));
}

function calcCompletionFactor(history) {
  const entries = Object.values(history || {}).filter(v => typeof v === 'number');
  if (entries.length === 0) return 0.5;
  return entries.reduce((a, b) => a + b, 0) / entries.length;
}

function calcStreakFactor(current, longest) {
  if (!longest || longest === 0) return 0.2;
  const stability = Math.min(1, (current || 0) / 7);
  const length = Math.min(1, longest / 30);
  return (stability * 0.5 + length * 0.5);
}
