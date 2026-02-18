/**
 * MAZOEZI Challenge Operating System
 * Client-side only. Data in localStorage + IndexedDB.
 */

import { storage, saveProof, getProofs } from './storage.js';
import { authRequire, authLogout } from './auth.js';
import { getTodayStr, isWithinGrace, getStreakMultiplier } from './protocol.js';
import { getChallengeById } from './challenges.js';
import { calcDisciplineScore } from './discipline-score.js';
import { getMomentumState, MOMENTUM_STATES } from './momentum.js';
import { RELAPSE_REASONS, analyzeRelapsePatterns } from './relapse.js';
import { buildHeatmapData, renderHeatmap, initScoreChart, initXPChart } from './analytics.js';

const XP_PER_STANDARD = 50;
const XP_FULL_DAY = 200;
const XP_PERFECT_WEEK = 500;
const XP_PER_LEVEL = 1000;
const PRESTIGE_LEVEL = 100;
const PRESTIGE_BOOST = 1.05;

let userProfile = {};
let todayData = {};
let completionHistory = {};
let xpHistory = {};
let scoreHistory = {};
let archivedCycles = [];

function getProfile() { return storage.getProfile(); }
function saveProfile(data) { storage.setProfile(data); }
function getDayData(dateStr) { return storage.getDays()[dateStr] || {}; }
function saveDayData(dateStr, data) { storage.setDay(dateStr, data); }
function getCompletionHistory() { return storage.getCompletion(); }
function saveCompletionHistory(h) { storage.setCompletion(h); }
function getArchivedCycles() { return storage.getCycles(); }

function getStandards() {
  return userProfile.activeChallenge?.standards || [];
}

function getCycleDays() {
  return userProfile.activeChallenge?.duration || 75;
}

function allStandardsComplete() {
  const standards = getStandards();
  if (standards.length === 0) return false;
  return standards.every(s => {
    const val = todayData[s.id];
    if (s.type === 'boolean') return val === true;
    return (val || 0) >= s.target;
  });
}

function getCycleDay() {
  const start = userProfile.cycleStartDate;
  if (!start) return 1;
  const today = getTodayStr();
  const diff = Math.floor((new Date(today) - new Date(start)) / 86400000);
  return Math.min(getCycleDays(), Math.max(1, diff + 1));
}

function calcLevel(totalXP) {
  const base = Math.floor(totalXP / XP_PER_LEVEL);
  const prestige = userProfile.prestigeCount || 0;
  return Math.max(1, Math.min(PRESTIGE_LEVEL, (base % PRESTIGE_LEVEL) + 1));
}

function addXP(amount, dateStr) {
  let mult = getStreakMultiplier(userProfile.currentStreak || 0);
  if (userProfile.prestigeCount) mult *= PRESTIGE_BOOST;
  const xp = Math.round(amount * mult);
  const prev = userProfile.totalXP || 0;
  const next = prev + xp;
  userProfile.totalXP = next;
  const prevLevel = calcLevel(prev);
  const nextLevel = calcLevel(next);
  if (nextLevel > prevLevel && nextLevel < PRESTIGE_LEVEL) showLevelUpModal(nextLevel);
  if (nextLevel >= PRESTIGE_LEVEL) doPrestige();
  xpHistory[dateStr] = (xpHistory[dateStr] || 0) + xp;
  saveProfile({ totalXP: next });
  storage.setXP(xpHistory);
  return xp;
}

async function doPrestige() {
  userProfile.prestigeCount = (userProfile.prestigeCount || 0) + 1;
  userProfile.totalXP = 0;
  await saveProfile({ prestigeCount: userProfile.prestigeCount, totalXP: 0 });
}

async function handleReset(reason) {
  const cycleDay = getCycleDay();
  const dow = new Date().getDay();
  storage.addCycle({
    cycleStartDate: userProfile.cycleStartDate,
    cycleDay,
    relapseReason: reason,
    relapseDayOfWeek: dow,
    archivedAt: new Date().toISOString()
  });
  const today = getTodayStr();
  userProfile.currentStreak = 0;
  userProfile.currentCycleDay = 1;
  userProfile.cycleStartDate = today;
  saveProfile({ currentStreak: 0, currentCycleDay: 1, cycleStartDate: today });
  archivedCycles = getArchivedCycles();
  todayData = {};
  render();
}

function renderHeader() {
  const day = getCycleDay();
  const total = getCycleDays();
  document.getElementById('headerDay').textContent = `Day ${day} of ${total}`;
  const nameEl = document.getElementById('headerChallenge');
  if (nameEl) nameEl.textContent = userProfile.activeChallenge?.name || 'Challenge';
  document.getElementById('headerStreak').textContent = `Streak: ${userProfile.currentStreak || 0}`;
  const score = calcDisciplineScore(userProfile, completionHistory, archivedCycles.length);
  document.getElementById('headerScore').textContent = `Score: ${score}`;
}

function renderProgress() {
  const total = userProfile.totalXP || 0;
  const level = calcLevel(total);
  const pct = (total % XP_PER_LEVEL) / XP_PER_LEVEL * 100;
  document.getElementById('xpCircle').style.setProperty('--pct', pct + '%');
  document.getElementById('xpLevel').textContent = level;
  document.getElementById('xpCurrent').textContent = total.toLocaleString();
  const today = getTodayStr();
  document.getElementById('xpToday').textContent = xpHistory[today] || 0;
  const standards = getStandards();
  const complete = standards.filter(s => {
    const v = todayData[s.id];
    return s.type === 'boolean' ? v === true : (v || 0) >= s.target;
  }).length;
  document.getElementById('completionPct').textContent = standards.length ? Math.round((complete.length / standards.length) * 100) + '%' : '0%';
}

function renderMomentum() {
  const state = getMomentumState(completionHistory);
  const bar = document.getElementById('momentumBar');
  bar.className = 'momentum-bar momentum-' + state;
  document.getElementById('momentumState').textContent = state.charAt(0).toUpperCase() + state.slice(1);
}

function renderDisciplineScore() {
  const score = calcDisciplineScore(userProfile, completionHistory, archivedCycles.length);
  document.getElementById('disciplineScore').textContent = score;
}

function renderStandards() {
  const list = document.getElementById('standardList');
  list.innerHTML = '';
  const standards = getStandards();
  standards.forEach(s => {
    const li = document.createElement('li');
    const val = todayData[s.id];
    const done = s.type === 'boolean' ? val === true : (val || 0) >= s.target;
    li.className = 'standard-item' + (done ? ' completed' : '');
    if (s.type === 'boolean') {
      li.innerHTML = `
        <i class="fas ${s.icon}"></i>
        <span class="standard-name">${s.name}</span>
        <button type="button" class="standard-check" data-id="${s.id}">${done ? '<i class="fas fa-check"></i>' : ''}</button>
        <button type="button" class="proof-btn" data-id="${s.id}" title="Photo proof"><i class="fas fa-camera"></i></button>
      `;
    } else {
      const pct = s.target > 0 ? Math.min(100, ((val || 0) / s.target) * 100) : 0;
      li.innerHTML = `
        <i class="fas ${s.icon}"></i>
        <span class="standard-name">${s.name}</span>
        <div class="standard-progress">
          <div class="progress-fill" style="width: ${pct}%"></div>
        </div>
        <input type="number" min="0" value="${val || ''}" placeholder="${s.target}" data-id="${s.id}">
        <button type="button" class="standard-check" data-id="${s.id}">${done ? '<i class="fas fa-check"></i>' : ''}</button>
        <button type="button" class="proof-btn" data-id="${s.id}" title="Photo proof"><i class="fas fa-camera"></i></button>
      `;
    }
    list.appendChild(li);
  });

  list.querySelectorAll('.standard-check').forEach(btn => {
    btn.addEventListener('click', () => toggleStandard(btn.dataset.id));
  });
  list.querySelectorAll('input[type="number"]').forEach(inp => {
    inp.addEventListener('change', (e) => updateStandard(e.target.dataset.id, +e.target.value));
  });
  list.querySelectorAll('.proof-btn').forEach(btn => {
    btn.addEventListener('click', () => openProofUpload(btn.dataset.id));
  });
}

async function toggleStandard(id) {
  const s = getStandards().find(x => x.id === id);
  if (!s) return;
  if (s.type === 'boolean') {
    todayData[id] = !todayData[id];
  } else {
    const val = todayData[id] || 0;
    todayData[id] = val >= s.target ? 0 : s.target;
  }
  await saveDayData(getTodayStr(), todayData);
  await processCompletion();
  render();
}

async function updateStandard(id, value) {
  todayData[id] = value;
  await saveDayData(getTodayStr(), todayData);
  await processCompletion();
  render();
}

async function processCompletion() {
  const today = getTodayStr();
  const complete = allStandardsComplete();
  const standards = getStandards();
  const completedCount = standards.filter(s => {
    const v = todayData[s.id];
    return s.type === 'boolean' ? v === true : (v || 0) >= s.target;
  }).length;
  const pct = standards.length ? completedCount / standards.length : 0;

  completionHistory[today] = pct;
  await saveCompletionHistory(completionHistory);

  if (complete) {
    const prev = userProfile.currentStreak || 0;
    userProfile.currentStreak = prev + 1;
    userProfile.longestStreak = Math.max(userProfile.longestStreak || 0, userProfile.currentStreak);
    await saveProfile({ currentStreak: userProfile.currentStreak, longestStreak: userProfile.longestStreak });

    if (!todayData._xpAwarded) {
      let earned = XP_PER_STANDARD * standards.length + XP_FULL_DAY;
      addXP(earned, today);
      todayData._xpAwarded = true;
      await saveDayData(today, todayData);
    }
  } else if (!isWithinGrace(today)) {
    if ((userProfile.freezeTokens || 0) > 0) {
      userProfile.freezeTokens = userProfile.freezeTokens - 1;
      await saveProfile({ freezeTokens: userProfile.freezeTokens });
    } else {
      showRelapseModal();
      return;
    }
  }
}

function renderCycleTimeline() {
  const grid = document.getElementById('cycleTimeline');
  grid.innerHTML = '';
  const start = userProfile.cycleStartDate || getTodayStr();
  const total = getCycleDays();
  for (let i = 0; i < total; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const str = d.toISOString().slice(0, 10);
    const pct = completionHistory[str];
    const cell = document.createElement('div');
    cell.className = 'cycle-cell' + (pct === 1 ? ' done' : pct > 0 ? ' partial' : '');
    cell.title = `${str}: ${pct === 1 ? 'Complete' : pct > 0 ? Math.round(pct * 100) + '%' : 'Incomplete'}`;
    grid.appendChild(cell);
  }
}

function showRelapseModal() {
  const opts = document.getElementById('relapseOptions');
  opts.innerHTML = '';
  RELAPSE_REASONS.forEach(r => {
    const li = document.createElement('li');
    li.innerHTML = `<button type="button" data-reason="${r.id}">${r.label}</button>`;
    li.querySelector('button').addEventListener('click', async () => {
      document.getElementById('relapseModal').classList.remove('show');
      await handleReset(r.id);
      render();
    });
    opts.appendChild(li);
  });
  document.getElementById('relapseSkip').onclick = async () => {
    document.getElementById('relapseModal').classList.remove('show');
    await handleReset('other');
    render();
  };
  document.getElementById('relapseModal').classList.add('show');
}

function showLevelUpModal(level) {
  document.getElementById('levelUpNum').textContent = level;
  document.getElementById('levelUpModal').classList.add('show');
}

async function openProofUpload(standardId) {
  const s = getStandards().find(x => x.id === standardId);
  if (!s) return;
  const uploadBlob = async (blob) => {
    if (!blob) return;
    await saveProof(blob, s.name, getTodayStr(), getCycleDay());
    if (document.getElementById('section-proof')?.classList.contains('active')) renderProofs();
  };
  const { openCameraCapture } = await import('./camera.js');
  const hasGetUserMedia = navigator.mediaDevices?.getUserMedia;
  if (hasGetUserMedia) {
    await openCameraCapture(uploadBlob);
  } else {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => { if (input.files[0]) uploadBlob(input.files[0]); };
    input.click();
  }
}

async function renderProofs() {
  const proofs = await getProofs();
  const taskFilter = document.getElementById('proofFilterTask')?.value;
  const dateFilter = document.getElementById('proofFilterDate')?.value;
  let filtered = proofs;
  if (taskFilter) filtered = filtered.filter(p => p.taskName === taskFilter);
  if (dateFilter) filtered = filtered.filter(p => p.date === dateFilter);

  const grid = document.getElementById('proofGrid');
  grid.innerHTML = '';
  filtered.forEach(p => {
    const card = document.createElement('div');
    card.className = 'proof-card';
    card.innerHTML = `<img src="${p.url}" alt="${p.taskName}"><div class="proof-card-info">${p.taskName} - ${p.date}</div>`;
    card.onclick = () => selectForCompare(p);
    grid.appendChild(card);
  });

  const select = document.getElementById('proofFilterTask');
  if (select) {
    const current = select.value;
    select.innerHTML = '<option value="">All standards</option>';
    getStandards().forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.name;
      opt.textContent = s.name;
      select.appendChild(opt);
    });
    select.value = current;
  }
}

let compareSelection = [];
function selectForCompare(p) {
  compareSelection.push(p);
  if (compareSelection.length > 2) compareSelection.shift();
  if (compareSelection.length === 2) {
    document.getElementById('comparisonHint').style.display = 'none';
    const wrap = document.getElementById('comparisonWrap');
    wrap.style.display = 'block';
    document.getElementById('compareBefore').src = compareSelection[0].url;
    const after = document.getElementById('compareAfter');
    after.src = compareSelection[1].url;
    after.style.clipPath = 'inset(0 50% 0 0)';
  }
}

const slider = document.getElementById('comparisonSlider');
if (slider) {
  slider.addEventListener('mousedown', (e) => {
    e.preventDefault();
    const move = (ev) => {
      const pct = Math.max(5, Math.min(95, (ev.clientX / window.innerWidth) * 100));
      slider.style.left = pct + '%';
      document.getElementById('compareAfter').style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', () => window.removeEventListener('mousemove', move), { once: true });
  });
}

function render() {
  renderHeader();
  renderProgress();
  renderMomentum();
  renderDisciplineScore();
  renderStandards();
  renderCycleTimeline();
  renderProofs?.();
}

authRequire(async (user) => {
  userProfile = getProfile();
  if (!userProfile.activeChallenge) {
    if (userProfile.protocolAcceptedAt) {
      const defaultChallenge = getChallengeById('75hardcore');
      if (defaultChallenge) {
        const { getChallengeStandards } = await import('./challenges.js');
        const stds = getChallengeStandards(defaultChallenge);
        userProfile.activeChallenge = { id: defaultChallenge.id, name: defaultChallenge.name, duration: defaultChallenge.duration, goalIds: defaultChallenge.goalIds, terms: defaultChallenge.terms, standards: stds };
        saveProfile({ activeChallenge: userProfile.activeChallenge });
      }
    }
    if (!userProfile.activeChallenge) {
      window.location.href = 'challenge-selection.html';
      return;
    }
  }

  const today = getTodayStr();
  todayData = getDayData(today);
  completionHistory = getCompletionHistory();
  xpHistory = storage.getXP();
  archivedCycles = getArchivedCycles();

  if (!userProfile.cycleStartDate) {
    saveProfile({ currentCycleDay: 1, cycleStartDate: today });
    userProfile.cycleStartDate = today;
    userProfile.currentCycleDay = 1;
  }

  const confirmModal = document.getElementById('confirmModal');
  if (getCycleDay() === 1 && !sessionStorage.getItem('mazoezi_confirmed')) {
    confirmModal.classList.add('show');
  }
  document.getElementById('confirmBegin')?.addEventListener('click', () => {
    sessionStorage.setItem('mazoezi_confirmed', '1');
    confirmModal.classList.remove('show');
  });

  document.getElementById('levelUpOk')?.addEventListener('click', () => document.getElementById('levelUpModal').classList.remove('show'));

  const notifyToggle = document.getElementById('notifyToggle');
  if (notifyToggle) {
    const prefs = userProfile.preferences || {};
    notifyToggle.classList.toggle('on', !!prefs.notifications);
    notifyToggle.addEventListener('click', () => {
      notifyToggle.classList.toggle('on');
      const isOn = notifyToggle.classList.contains('on');
      saveProfile({ preferences: { ...(userProfile.preferences || {}), notifications: isOn } });
      userProfile = getProfile();
    });
  }

  document.querySelectorAll('.app-nav-btn[data-section]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.app-nav-btn[data-section]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      document.getElementById('section-' + btn.dataset.section).classList.add('active');
      if (btn.dataset.section === 'analytics') {
        renderHeatmap(document.getElementById('heatmapGrid'), buildHeatmapData(completionHistory));
        const scoreData = Object.entries(completionHistory).sort((a,b) => a[0].localeCompare(b[0])).slice(-30);
        initScoreChart(document.getElementById('scoreChart'), scoreData.map(([d]) => d.slice(5)), scoreData.map(([,v]) => Math.round(v * 100)));
        const xpEntries = Object.entries(xpHistory).sort((a,b) => a[0].localeCompare(b[0]));
        let cum = 0;
        initXPChart(document.getElementById('xpChart'), xpEntries.map(([d]) => d.slice(5)), xpEntries.map(([,v]) => { cum += v; return cum; }));
        const risk = analyzeRelapsePatterns(archivedCycles);
        if (risk) {
          document.getElementById('riskPanel').style.display = 'block';
          const ul = document.getElementById('riskInsights');
          ul.innerHTML = '';
          if (risk.topDay) ul.innerHTML += `<li>Most resets on ${risk.topDay}s.</li>`;
          if (risk.topMissed) ul.innerHTML += `<li>${risk.topMissed} most frequently missed.</li>`;
          if (risk.topReason) ul.innerHTML += `<li>Common reason: ${risk.topReason}.</li>`;
        }
      }
      if (btn.dataset.section === 'proof') renderProofs();
    });
  });

  document.getElementById('proofFilterTask')?.addEventListener('change', renderProofs);
  document.getElementById('proofFilterDate')?.addEventListener('change', renderProofs);
  document.getElementById('proofFilterReset')?.addEventListener('click', () => {
    document.getElementById('proofFilterTask').value = '';
    document.getElementById('proofFilterDate').value = '';
    renderProofs();
  });

  document.getElementById('logoutBtn')?.addEventListener('click', async () => {
    await authLogout();
    window.location.href = 'index.html';
  });

  document.getElementById('exportDataBtn')?.addEventListener('click', () => {
    const data = { profile: userProfile, todayData, completionHistory, xpHistory, archivedCycles };
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    a.download = `mazoezi-${getTodayStr()}.json`;
    a.click();
  });

  document.getElementById('importDataBtn')?.addEventListener('click', () => {
    document.getElementById('importFile')?.click();
  });
  document.getElementById('importFile')?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (data.profile) storage.setProfile(data.profile);
        if (data.completionHistory) storage.setCompletion(data.completionHistory);
        if (data.xpHistory) storage.setXP(data.xpHistory);
        if (data.archivedCycles) storage.setCycles(data.archivedCycles);
        if (data.todayData) {
          Object.entries(data.todayData).forEach(([dateStr, dayData]) => storage.setDay(dateStr, dayData));
        }
        userProfile = getProfile();
        todayData = data.todayData?.[getTodayStr()] || {};
        completionHistory = getCompletionHistory();
        xpHistory = storage.getXP();
        archivedCycles = getArchivedCycles();
        e.target.value = '';
        render();
        alert('Backup imported.');
      } catch (err) {
        alert('Invalid backup file.');
      }
    };
    reader.readAsText(file);
  });

  document.getElementById('resetCycleBtn')?.addEventListener('click', () => {
    if (confirm('Reset your cycle? This will archive the current cycle.')) showRelapseModal();
  });

  document.getElementById('deleteAccountBtn')?.addEventListener('click', () => {
    if (confirm('Delete this account? All data for this profile will be removed. This cannot be undone.')) {
      storage.clearProfile();
      localStorage.removeItem('mazoezi_session');
      window.location.href = 'index.html';
    }
  });

  document.getElementById('exportMonthlyBtn')?.addEventListener('click', () => {
    const html = `<html><head><title>MAZOEZI Monthly Review</title><style>body{font-family:system-ui;padding:24px;}</style></head><body>
      <h1>Monthly Review</h1>
      <p>Longest streak: ${userProfile.longestStreak || 0}</p>
      <p>Total XP: ${userProfile.totalXP || 0}</p>
      <p>Discipline score: ${calcDisciplineScore(userProfile, completionHistory, archivedCycles.length)}</p>
      <p>Resets: ${archivedCycles.length}</p>
    </body></html>`;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
    a.download = `mazoezi-review-${getTodayStr()}.html`;
    a.click();
  });

  render();

  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./service-worker.js');
});
