/**
 * MAZOEZI Challenge System
 * Standardized goal library. No free-form goals. Challenges reference goal IDs.
 */

export const GOAL_LIBRARY = {
  steps8k: { id: 'steps8k', name: '8,000 Steps', target: 8000, unit: 'steps', icon: 'fa-shoe-prints', type: 'number', category: 'movement' },
  steps10k: { id: 'steps10k', name: '10,000 Steps', target: 10000, unit: 'steps', icon: 'fa-shoe-prints', type: 'number', category: 'movement' },
  stepsProgressive: { id: 'stepsProgressive', name: 'Progressive Steps', target: 10000, unit: 'steps', icon: 'fa-shoe-prints', type: 'number', category: 'movement' },
  strengthTraining: { id: 'strengthTraining', name: 'Strength Training', target: 1, unit: 'session', icon: 'fa-dumbbell', type: 'number', category: 'movement' },
  cardio: { id: 'cardio', name: 'Cardio Block', target: 1, unit: 'session', icon: 'fa-heart-pulse', type: 'number', category: 'movement' },
  workout: { id: 'workout', name: 'Structured Workout', target: 1, unit: 'session', icon: 'fa-dumbbell', type: 'number', category: 'movement' },
  plank: { id: 'plank', name: 'Plank', target: 1, unit: 'session', icon: 'fa-stopwatch', type: 'number', category: 'movement' },
  squat: { id: 'squat', name: 'Squat Challenge', target: 1, unit: 'session', icon: 'fa-person-walking', type: 'number', category: 'movement' },
  pushup: { id: 'pushup', name: 'Push-Up Challenge', target: 1, unit: 'session', icon: 'fa-hand-fist', type: 'number', category: 'movement' },
  hiit: { id: 'hiit', name: 'HIIT or Cardio', target: 1, unit: 'session', icon: 'fa-fire-flame-curved', type: 'number', category: 'movement' },
  movement30: { id: 'movement30', name: '30-Minute Movement', target: 30, unit: 'min', icon: 'fa-person-walking', type: 'number', category: 'movement' },
  c25k: { id: 'c25k', name: 'Couch to 5K', target: 1, unit: 'session', icon: 'fa-road', type: 'number', category: 'movement' },
  water2l: { id: 'water2l', name: '2L Water', target: 2, unit: 'L', icon: 'fa-droplet', type: 'number', category: 'hydration' },
  water3l: { id: 'water3l', name: '3L Water', target: 3, unit: 'L', icon: 'fa-droplet', type: 'number', category: 'hydration' },
  hydrationHabit: { id: 'hydrationHabit', name: 'Hydration Habit', target: 2, unit: 'L', icon: 'fa-droplet', type: 'number', category: 'hydration' },
  protein: { id: 'protein', name: 'Protein Target', target: 2, unit: 'servings', icon: 'fa-egg', type: 'number', category: 'nutrition' },
  balancedDiet: { id: 'balancedDiet', name: 'Balanced Diet Block', target: 1, unit: 'day', icon: 'fa-bowl-food', type: 'boolean', category: 'nutrition' },
  highProtein: { id: 'highProtein', name: 'High Protein Meals', target: 2, unit: 'meals', icon: 'fa-egg', type: 'number', category: 'nutrition' },
  keto: { id: 'keto', name: 'Keto Nutrition Standard', target: 1, unit: 'day', icon: 'fa-leaf', type: 'boolean', category: 'nutrition' },
  wholeFoods: { id: 'wholeFoods', name: 'Whole Foods Nutrition', target: 1, unit: 'day', icon: 'fa-apple-whole', type: 'boolean', category: 'nutrition' },
  plantBased: { id: 'plantBased', name: 'Plant-Based Nutrition', target: 1, unit: 'day', icon: 'fa-leaf', type: 'boolean', category: 'nutrition' },
  noFastFood: { id: 'noFastFood', name: 'No Fast Food', target: 1, unit: '', icon: 'fa-utensils', type: 'boolean', category: 'nutrition' },
  intermittentFasting: { id: 'intermittentFasting', name: 'Intermittent Fasting Block', target: 1, unit: 'day', icon: 'fa-clock', type: 'boolean', category: 'nutrition' },
  reading: { id: 'reading', name: 'Daily Reading', target: 10, unit: 'min', icon: 'fa-book', type: 'number', category: 'mind' },
  meditation: { id: 'meditation', name: 'Mindfulness Meditation', target: 10, unit: 'min', icon: 'fa-spa', type: 'number', category: 'mind' },
  sleep: { id: 'sleep', name: 'Sleep Standard', target: 7, unit: 'hrs', icon: 'fa-moon', type: 'number', category: 'mind' },
  mobility: { id: 'mobility', name: 'Mobility & Stretch', target: 1, unit: 'session', icon: 'fa-person-running', type: 'number', category: 'mind' },
  sleepQuality: { id: 'sleepQuality', name: 'Sleep Quality Block', target: 7, unit: 'hrs', icon: 'fa-moon', type: 'number', category: 'mind' }
};

export const CHALLENGE_CATEGORIES = {
  longForm: 'Long-Form Structural',
  fitness: 'Standard Fitness',
  nutrition: 'Nutrition & Hydration',
  mind: 'Mind & Recovery',
  custom: 'Custom'
};

export const CHALLENGES = [
  { id: '75hardcore', name: '75-Day Hardcore Protocol', duration: 75, category: 'longForm', goalIds: ['steps10k', 'water3l', 'workout', 'protein', 'reading', 'noFastFood', 'sleep'], terms: 'All standards daily. 3-hour grace. 1 freeze token per 30 days.' },
  { id: '75balanced', name: '75-Day Balanced Protocol', duration: 75, category: 'longForm', goalIds: ['steps10k', 'water3l', 'workout', 'balancedDiet', 'reading', 'sleep'], terms: 'All standards daily. 3-hour grace. 1 freeze token per 30 days.' },
  { id: '66habit', name: '66-Day Habit Reset Protocol', duration: 66, category: 'longForm', goalIds: ['steps10k', 'water3l', 'workout', 'protein', 'reading', 'sleep'], terms: 'All standards daily. 3-hour grace. 1 freeze token per 30 days.' },
  { id: 'steps10k', name: '10,000 Steps Daily', duration: 30, category: 'fitness', goalIds: ['steps10k'], terms: 'Complete daily. 3-hour grace.' },
  { id: 'plank', name: 'Plank Challenge', duration: 30, category: 'fitness', goalIds: ['plank'], terms: 'Complete daily. 3-hour grace.' },
  { id: 'squat', name: 'Squat Challenge', duration: 30, category: 'fitness', goalIds: ['squat'], terms: 'Complete daily. 3-hour grace.' },
  { id: 'pushup', name: 'Push-Up Challenge', duration: 30, category: 'fitness', goalIds: ['pushup'], terms: 'Complete daily. 3-hour grace.' },
  { id: 'hiit', name: 'HIIT or Cardio Challenge', duration: 30, category: 'fitness', goalIds: ['hiit'], terms: 'Complete daily. 3-hour grace.' },
  { id: 'movement30', name: '30-Minute Daily Movement', duration: 30, category: 'fitness', goalIds: ['movement30'], terms: 'Complete daily. 3-hour grace.' },
  { id: 'c25k', name: 'Couch to 5K', duration: 42, category: 'fitness', goalIds: ['c25k'], terms: 'Follow program sessions. 3-hour grace.' },
  { id: 'water', name: 'Daily Water Intake Target', duration: 30, category: 'nutrition', goalIds: ['water3l'], terms: 'Meet target daily. 3-hour grace.' },
  { id: 'wholeFoods', name: 'Whole Foods Nutrition Block', duration: 30, category: 'nutrition', goalIds: ['wholeFoods'], terms: 'Comply daily. 3-hour grace.' },
  { id: 'plantBased', name: 'Plant-Based Nutrition Block', duration: 30, category: 'nutrition', goalIds: ['plantBased'], terms: 'Comply daily. 3-hour grace.' },
  { id: 'keto', name: 'Keto Style Nutrition Block', duration: 30, category: 'nutrition', goalIds: ['keto'], terms: 'Comply daily. 3-hour grace.' },
  { id: 'intermittentFasting', name: 'Intermittent Fasting Block', duration: 30, category: 'nutrition', goalIds: ['intermittentFasting'], terms: 'Complete fasting window daily. 3-hour grace.' },
  { id: 'meditation', name: 'Daily Mindfulness Meditation', duration: 30, category: 'mind', goalIds: ['meditation'], terms: 'Complete daily. 3-hour grace.' },
  { id: 'mobility', name: 'Mobility & Stretch Routine', duration: 30, category: 'mind', goalIds: ['mobility'], terms: 'Complete daily. 3-hour grace.' },
  { id: 'sleepQuality', name: 'Sleep Quality Block', duration: 30, category: 'mind', goalIds: ['sleepQuality'], terms: 'Meet sleep target daily. 3-hour grace.' }
];

export function getChallengeById(id) {
  return CHALLENGES.find(c => c.id === id);
}

export function getChallengeStandards(challenge) {
  return (challenge?.goalIds || []).map(gid => GOAL_LIBRARY[gid]).filter(Boolean);
}

export function getGoalsByCategory(category) {
  return Object.values(GOAL_LIBRARY).filter(g => g.category === category);
}

export function getGoalById(id) {
  return GOAL_LIBRARY[id];
}
