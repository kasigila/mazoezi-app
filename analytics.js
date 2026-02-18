/**
 * MAZOEZI Analytics Dashboard
 * Heatmap, completion %, XP growth - Chart.js
 */

import { getTodayStr } from './protocol.js';

/**
 * Build heatmap data: last 365 days, level 0-4 by completion
 */
export function buildHeatmapData(completionHistory) {
  const today = getTodayStr();
  const grid = [];
  const start = new Date(today);
  start.setDate(start.getDate() - 364);

  for (let i = 0; i < 365; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const str = d.toISOString().slice(0, 10);
    const rec = completionHistory[str];
    let level = 0;
    if (rec) {
      if (rec === 1) level = 4;
      else if (rec >= 0.75) level = 3;
      else if (rec >= 0.5) level = 2;
      else if (rec > 0) level = 1;
    }
    grid.push({ date: str, level });
  }
  return grid;
}

/**
 * Render heatmap DOM
 */
export function renderHeatmap(container, heatmapData) {
  if (!container) return;
  container.innerHTML = '';
  heatmapData.forEach(({ date, level }) => {
    const cell = document.createElement('div');
    cell.className = 'heatmap-cell';
    if (level > 0) cell.setAttribute('data-level', level);
    cell.title = `${date}: ${level > 0 ? (level * 25) + '%' : '0%'}`;
    container.appendChild(cell);
  });
}

/**
 * Build completion chart data (last 7 days)
 */
export function buildCompletionChartData(completionHistory) {
  const labels = [];
  const data = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const str = d.toISOString().slice(0, 10);
    labels.push(str.slice(5));
    data.push(parseFloat(((completionHistory[str] || 0) * 100).toFixed(1)));
  }
  return { labels, data };
}

/**
 * Build XP growth data (cumulative)
 */
export function buildXPGrowthData(xpHistory) {
  const entries = Object.entries(xpHistory || {}).sort((a, b) => a[0].localeCompare(b[0]));
  const labels = [];
  const data = [];
  let cum = 0;
  entries.forEach(([date, xp]) => {
    cum += xp;
    labels.push(date.slice(5));
    data.push(cum);
  });
  return { labels, data };
}

let completionChartInstance = null;
let scoreChartInstance = null;
let xpChartInstance = null;

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: { color: '#E5E7EB' },
      ticks: { color: '#4B5563' }
    },
    x: {
      grid: { display: false },
      ticks: { color: '#4B5563' }
    }
  },
  animation: { duration: 500 }
};

export function initCompletionChart(canvas, labels, data) {
  if (completionChartInstance) completionChartInstance.destroy();
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  completionChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Completion %',
        data,
        borderColor: '#E6007A',
        backgroundColor: 'rgba(230, 0, 122, 0.08)',
        fill: true,
        tension: 0.3
      }]
    },
    options: chartOptions
  });
}

export function initScoreChart(canvas, labels, data) {
  if (scoreChartInstance) scoreChartInstance.destroy();
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  scoreChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Completion %',
        data,
        borderColor: '#E6007A',
        backgroundColor: 'rgba(230, 0, 122, 0.08)',
        fill: true,
        tension: 0.3
      }]
    },
    options: chartOptions
  });
}

export function initXPChart(canvas, labels, data) {
  if (xpChartInstance) xpChartInstance.destroy();
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  xpChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Total XP',
        data,
        borderColor: '#E6007A',
        backgroundColor: 'rgba(230, 0, 122, 0.08)',
        fill: true,
        tension: 0.3
      }]
    },
    options: chartOptions
  });
}
