/**
 * MAZOEZI Local Storage Layer
 * Profile-scoped: each account (email) has separate data. Logout clears session only; data persists.
 */

const KEY = 'mazoezi';
const SESSION_KEY = 'mazoezi_session';
const PROOFS_DB = 'mazoezi_proofs';
const PROOFS_STORE = 'proofs';

function k(name) { return `${KEY}_${name}`; }

function sanitizeId(id) {
  if (!id || id === 'default') return '';
  return id.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 64);
}

/** Get current profileId from session. 'default' for legacy/migrated users. */
export function getProfileId() {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const o = JSON.parse(raw);
    return (o && o.profileId) ? o.profileId : 'default';
  } catch {
    return 'default';
  }
}

function keyFor(profileId, base) {
  const s = sanitizeId(profileId);
  return s ? k(`${base}_${s}`) : k(base);
}

export const storage = {
  getProfile: (pid) => {
    const id = pid ?? getProfileId();
    return JSON.parse(localStorage.getItem(keyFor(id, 'profile')) || '{}');
  },
  setProfile: (data, pid) => {
    const id = pid ?? getProfileId();
    const existing = storage.getProfile(id);
    localStorage.setItem(keyFor(id, 'profile'), JSON.stringify({ ...existing, ...data }));
  },
  getDays: (pid) => {
    const id = pid ?? getProfileId();
    return JSON.parse(localStorage.getItem(keyFor(id, 'days')) || '{}');
  },
  setDay: (dateStr, data, pid) => {
    const id = pid ?? getProfileId();
    const d = storage.getDays(id);
    d[dateStr] = data;
    localStorage.setItem(keyFor(id, 'days'), JSON.stringify(d));
  },
  getCompletion: (pid) => {
    const id = pid ?? getProfileId();
    return JSON.parse(localStorage.getItem(keyFor(id, 'completion')) || '{}');
  },
  setCompletion: (data, pid) => {
    const id = pid ?? getProfileId();
    localStorage.setItem(keyFor(id, 'completion'), JSON.stringify(data));
  },
  getXP: (pid) => {
    const id = pid ?? getProfileId();
    return JSON.parse(localStorage.getItem(keyFor(id, 'xp')) || '{}');
  },
  setXP: (data, pid) => {
    const id = pid ?? getProfileId();
    localStorage.setItem(keyFor(id, 'xp'), JSON.stringify(data));
  },
  getCycles: (pid) => {
    const id = pid ?? getProfileId();
    return JSON.parse(localStorage.getItem(keyFor(id, 'cycles')) || '[]');
  },
  addCycle: (data, pid) => {
    const id = pid ?? getProfileId();
    const c = storage.getCycles(id);
    c.unshift({ ...data, id: Date.now().toString() });
    localStorage.setItem(keyFor(id, 'cycles'), JSON.stringify(c));
  },
  setCycles: (data, pid) => {
    const id = pid ?? getProfileId();
    localStorage.setItem(keyFor(id, 'cycles'), JSON.stringify(data));
  },
  /** Clear only current profile's data (delete account). */
  clearProfile: (pid) => {
    const id = pid ?? getProfileId();
    if (!id) return;
    ['profile', 'days', 'completion', 'xp', 'cycles'].forEach(base => {
      localStorage.removeItem(keyFor(id, base));
    });
    deleteProofsForProfile(id);
  },
  /** Clear all profiles (legacy; use clearProfile for single-account delete). */
  clearAll: () => {
    Object.keys(localStorage).filter(x => x.startsWith(KEY + '_')).forEach(x => localStorage.removeItem(x));
    localStorage.removeItem(SESSION_KEY);
    indexedDB.deleteDatabase(PROOFS_DB);
  }
};

function openDB() {
  return new Promise((res, rej) => {
    const r = indexedDB.open(PROOFS_DB, 2);
    r.onerror = () => rej(r.error);
    r.onsuccess = () => res(r.result);
    r.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(PROOFS_STORE)) {
        db.createObjectStore(PROOFS_STORE, { keyPath: 'id' });
      }
    };
  });
}

export async function saveProof(blob, taskName, dateStr, cycleDay) {
  const profileId = getProfileId() || 'default';
  const db = await openDB();
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => {
      const id = `${dateStr}_${taskName.replace(/\s/g, '_')}_${Date.now()}`;
      const data = { id, dataUrl: reader.result, taskName, date: dateStr, cycleDay, profileId };
      const tx = db.transaction(PROOFS_STORE, 'readwrite');
      tx.objectStore(PROOFS_STORE).put(data);
      tx.oncomplete = () => res({ id, url: reader.result, taskName, date: dateStr, cycleDay });
      tx.onerror = () => rej(tx.error);
    };
    reader.readAsDataURL(blob);
  });
}

export async function getProofs() {
  const profileId = getProfileId() || 'default';
  const db = await openDB();
  return new Promise((res, rej) => {
    const req = db.transaction(PROOFS_STORE, 'readonly').objectStore(PROOFS_STORE).getAll();
    req.onsuccess = () => {
      let items = req.result || [];
      if (items.some(p => p.profileId !== undefined)) {
        items = items.filter(p => (p.profileId || 'default') === profileId);
      }
      items = items.map(p => ({
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

async function deleteProofsForProfile(profileId) {
  const db = await openDB();
  const all = await new Promise((res, rej) => {
    const req = db.transaction(PROOFS_STORE, 'readonly').objectStore(PROOFS_STORE).getAll();
    req.onsuccess = () => res(req.result || []);
    req.onerror = () => rej(req.error);
  });
  const toDelete = all.filter(p => (p.profileId || 'default') === profileId);
  const tx = db.transaction(PROOFS_STORE, 'readwrite');
  const store = tx.objectStore(PROOFS_STORE);
  toDelete.forEach(p => store.delete(p.id));
}
