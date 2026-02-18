/**
 * MAZOEZI Local Storage Layer
 * Replaces Firestore. All data in localStorage + IndexedDB for photos.
 */

const KEY = 'mazoezi';
const PROOFS_DB = 'mazoezi_proofs';
const PROOFS_STORE = 'proofs';

function k(name) { return `${KEY}_${name}`; }

export const storage = {
  getProfile: () => JSON.parse(localStorage.getItem(k('profile')) || '{}'),
  setProfile: (data) => { localStorage.setItem(k('profile'), JSON.stringify({ ...storage.getProfile(), ...data })); },
  getDays: () => JSON.parse(localStorage.getItem(k('days')) || '{}'),
  setDay: (dateStr, data) => { const d = storage.getDays(); d[dateStr] = data; localStorage.setItem(k('days'), JSON.stringify(d)); },
  getCompletion: () => JSON.parse(localStorage.getItem(k('completion')) || '{}'),
  setCompletion: (data) => { localStorage.setItem(k('completion'), JSON.stringify(data)); },
  getXP: () => JSON.parse(localStorage.getItem(k('xp')) || '{}'),
  setXP: (data) => { localStorage.setItem(k('xp'), JSON.stringify(data)); },
  getCycles: () => JSON.parse(localStorage.getItem(k('cycles')) || '[]'),
  addCycle: (data) => { const c = storage.getCycles(); c.unshift({ ...data, id: Date.now().toString() }); localStorage.setItem(k('cycles'), JSON.stringify(c)); },
  setCycles: (data) => { localStorage.setItem(k('cycles'), JSON.stringify(data)); },
  clearAll: () => {
    ['profile', 'days', 'completion', 'xp', 'cycles', 'session'].forEach(n => localStorage.removeItem(k(n)));
    indexedDB.deleteDatabase(PROOFS_DB);
  }
};

function openDB() {
  return new Promise((res, rej) => {
    const r = indexedDB.open(PROOFS_DB, 1);
    r.onerror = () => rej(r.error);
    r.onsuccess = () => res(r.result);
    r.onupgradeneeded = (e) => { e.target.result.createObjectStore(PROOFS_STORE, { keyPath: 'id' }); };
  });
}

export async function saveProof(blob, taskName, dateStr, cycleDay) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => {
      const id = `${dateStr}_${taskName.replace(/\s/g, '_')}_${Date.now()}`;
      const data = { id, dataUrl: reader.result, taskName, date: dateStr, cycleDay };
      const tx = db.transaction(PROOFS_STORE, 'readwrite');
      tx.objectStore(PROOFS_STORE).put(data);
      tx.oncomplete = () => res({ id, url: reader.result, taskName, date: dateStr, cycleDay });
      tx.onerror = () => rej(tx.error);
    };
    reader.readAsDataURL(blob);
  });
}

export async function getProofs() {
  const db = await openDB();
  return new Promise((res, rej) => {
    const req = db.transaction(PROOFS_STORE, 'readonly').objectStore(PROOFS_STORE).getAll();
    req.onsuccess = () => {
      const items = (req.result || []).map(p => ({
        id: p.id,
        url: p.dataUrl || p.blob || '',
        taskName: p.taskName,
        date: p.date,
        cycleDay: p.cycleDay
      })).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      res(items);
    };
    req.onerror = () => rej(req.error);
  });
}
