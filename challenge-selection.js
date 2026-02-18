/**
 * MAZOEZI Challenge Selection
 * Renders challenge cards. Saves selection to localStorage.
 */

import { storage } from './storage.js';
import { CHALLENGES, CHALLENGE_CATEGORIES, GOAL_LIBRARY, getChallengeStandards, getGoalsByCategory } from './challenges.js';

if (!localStorage.getItem('mazoezi_session')) {
  window.location.href = 'signup.html';
}

let selectedChallenge = null;

function renderChallenges() {
  const grid = document.getElementById('challengeGrid');
  grid.innerHTML = '';
  const categories = [...new Set(CHALLENGES.map(c => c.category))];
  categories.forEach(cat => {
    const section = document.createElement('div');
    section.className = 'challenge-section';
    section.innerHTML = `<h2 class="challenge-category">${CHALLENGE_CATEGORIES[cat] || cat}</h2>`;
    const cardWrap = document.createElement('div');
    cardWrap.className = 'challenge-cards-wrap';
    CHALLENGES.filter(c => c.category === cat).forEach(c => {
      const standards = getChallengeStandards(c);
      const card = document.createElement('div');
      card.className = 'challenge-card';
      card.innerHTML = `
        <h3><i class="fas fa-list-check"></i> ${c.name}</h3>
        <p class="challenge-duration">${c.duration} days</p>
        <ul class="challenge-standards">${standards.map(s => `<li><i class="fas ${s.icon}"></i> ${s.name}</li>`).join('')}</ul>
        <p class="challenge-terms">${c.terms}</p>
        <button type="button" class="challenge-start" data-id="${c.id}">Start</button>
      `;
      card.querySelector('.challenge-start').addEventListener('click', () => showConfirm(c));
      cardWrap.appendChild(card);
    });
    section.appendChild(cardWrap);
    grid.appendChild(section);
  });
}

function showConfirm(challenge) {
  const standards = getChallengeStandards(challenge);
  selectedChallenge = {
    id: challenge.id,
    name: challenge.name,
    duration: challenge.duration,
    goalIds: challenge.goalIds,
    terms: challenge.terms,
    standards
  };
  document.getElementById('confirmSummary').textContent = `${challenge.name} (${challenge.duration} days). Standards: ${standards.map(s => s.name).join(', ')}.`;
  document.getElementById('confirmTerms').textContent = challenge.terms;
  const modal = document.getElementById('confirmModal');
  modal.classList.add('show');
  modal.onclick = (e) => { if (e.target === modal) modal.classList.remove('show'); };
}

document.getElementById('confirmBack').addEventListener('click', () => {
  document.getElementById('confirmModal').classList.remove('show');
  selectedChallenge = null;
});

document.getElementById('confirmBegin').addEventListener('click', () => {
  if (!selectedChallenge) return;
  const today = new Date().toISOString().slice(0, 10);
  const profile = storage.getProfile();
  storage.setProfile({
    ...profile,
    activeChallenge: selectedChallenge,
    protocolAcceptedAt: new Date().toISOString(),
    currentCycleDay: 1,
    cycleStartDate: today
  });
  document.getElementById('confirmModal').classList.remove('show');
  window.location.href = 'dashboard.html';
});

document.getElementById('customCard')?.querySelector('[data-custom]')?.addEventListener('click', () => {
  const modal = document.getElementById('customModal');
  modal.classList.add('show');
  modal.onclick = (e) => { if (e.target === modal) { modal.classList.remove('show'); } };
  renderGoalPicker();
});

function renderGoalPicker() {
  const picker = document.getElementById('goalPicker');
  picker.innerHTML = '';
  const cats = ['movement', 'hydration', 'nutrition', 'mind'];
  cats.forEach(cat => {
    const goals = getGoalsByCategory(cat);
    goals.forEach(g => {
      const label = document.createElement('label');
      label.className = 'goal-option';
      label.innerHTML = `<input type="checkbox" value="${g.id}"> <i class="fas ${g.icon}"></i> ${g.name}`;
      picker.appendChild(label);
    });
  });
}

document.getElementById('customCancel').addEventListener('click', () => {
  document.getElementById('customModal').classList.remove('show');
});

document.getElementById('customStart').addEventListener('click', async () => {
  const duration = parseInt(document.getElementById('customDuration').value, 10);
  const checked = [...document.querySelectorAll('#goalPicker input:checked')].map(el => el.value);
  if (checked.length === 0) return;
  const standards = checked.map(id => GOAL_LIBRARY[id]).filter(Boolean);
  selectedChallenge = {
    id: 'custom',
    name: `Custom (${duration} days)`,
    duration,
    goalIds: checked,
    terms: 'All standards daily. 3-hour grace. 1 freeze token per 30 days. No editing mid-cycle.',
    standards
  };
  document.getElementById('customModal').classList.remove('show');
  showConfirm(selectedChallenge);
});

renderChallenges();
