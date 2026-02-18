/**
 * MAZOEZI Relapse Intelligence
 * Store reset data. Identify patterns after 30+ days.
 */

export const RELAPSE_REASONS = [
  { id: 'schedule', label: 'Schedule conflict' },
  { id: 'travel', label: 'Travel' },
  { id: 'fatigue', label: 'Fatigue' },
  { id: 'motivation', label: 'Motivation drop' },
  { id: 'illness', label: 'Illness' },
  { id: 'other', label: 'Other' }
];

export function analyzeRelapsePatterns(archivedCycles) {
  if (!archivedCycles || archivedCycles.length < 3) return null;
  const reasons = {};
  const daysOfWeek = {};
  const missedStandards = {};
  archivedCycles.forEach(c => {
    if (c.relapseReason) reasons[c.relapseReason] = (reasons[c.relapseReason] || 0) + 1;
    if (c.relapseDayOfWeek !== undefined) daysOfWeek[c.relapseDayOfWeek] = (daysOfWeek[c.relapseDayOfWeek] || 0) + 1;
    if (c.missedStandard) missedStandards[c.missedStandard] = (missedStandards[c.missedStandard] || 0) + 1;
  });
  const topReason = Object.entries(reasons).sort((a, b) => b[1] - a[1])[0];
  const topDay = Object.entries(daysOfWeek).sort((a, b) => b[1] - a[1])[0];
  const topMissed = Object.entries(missedStandards).sort((a, b) => b[1] - a[1])[0];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return {
    topReason: topReason ? RELAPSE_REASONS.find(r => r.id === topReason[0])?.label : null,
    topDay: topDay ? dayNames[topDay[0]] : null,
    topMissed: topMissed ? topMissed[0] : null,
    totalResets: archivedCycles.length
  };
}
