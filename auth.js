/**
 * MAZOEZI Auth - Profile-scoped sessions
 * Each email = separate profile. Passwords stored as hashes. Logout clears session only; data stays.
 */

import { storage } from './storage.js';

const SESSION_KEY = 'mazoezi_session';

const DEFAULT_PROFILE = {
  totalXP: 0,
  level: 1,
  currentStreak: 0,
  longestStreak: 0,
  freezeTokens: 1,
  createdAt: new Date().toISOString()
};

async function hashPassword(password) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password || ''));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw);
    return o && typeof o.profileId === 'string' ? o : null;
  } catch {
    return null;
  }
}

function setSession(profileId) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ profileId }));
}

function isLoggedIn() {
  const s = getSession();
  if (s) return true;
  if (localStorage.getItem(SESSION_KEY) === '1') {
    setSession('default');
    return true;
  }
  return false;
}

function getCurrentUser() {
  const s = getSession();
  return s ? { uid: s.profileId } : null;
}

function getProfileIdForAuth(email) {
  const e = (email || '').toLowerCase().trim();
  return e || 'default';
}

async function loginWithEmail(email, password) {
  const profileId = getProfileIdForAuth(email);
  const profile = storage.getProfile(profileId);
  if (profile.passwordHash) {
    const hash = await hashPassword(password);
    if (hash !== profile.passwordHash) return false;
  }
  setSession(profileId);
  let p = storage.getProfile(profileId);
  if (!p.createdAt) {
    p = { ...DEFAULT_PROFILE, createdAt: new Date().toISOString() };
    storage.setProfile(p, profileId);
  }
  return true;
}

async function signupWithEmail(email, password) {
  const profileId = getProfileIdForAuth(email);
  const profile = storage.getProfile(profileId);
  if (!profile.createdAt) {
    const hash = await hashPassword(password);
    const newProfile = { ...DEFAULT_PROFILE, createdAt: new Date().toISOString(), passwordHash: hash };
    storage.setProfile(newProfile, profileId);
  } else if (profile.passwordHash) {
    const hash = await hashPassword(password);
    if (hash !== profile.passwordHash) return false;
  } else {
    const hash = await hashPassword(password);
    storage.setProfile({ ...profile, passwordHash: hash }, profileId);
  }
  setSession(profileId);
  return true;
}

async function loginWithGoogle() {
  const profileId = 'google';
  setSession(profileId);
  let profile = storage.getProfile(profileId);
  if (!profile.createdAt) {
    profile = { ...DEFAULT_PROFILE, createdAt: new Date().toISOString() };
    storage.setProfile(profile, profileId);
  }
  return true;
}

async function loginAsGuest() {
  const profileId = 'guest';
  setSession(profileId);
  let profile = storage.getProfile(profileId);
  if (!profile.createdAt) {
    profile = { ...DEFAULT_PROFILE, createdAt: new Date().toISOString() };
    storage.setProfile(profile, profileId);
  }
  return true;
}

async function logout() {
  localStorage.removeItem(SESSION_KEY);
}

function requireAuth(callback) {
  if (!isLoggedIn()) {
    const path = window.location.pathname || '';
    if (!path.includes('login') && !path.includes('signup') && !path.includes('onboarding') && !path.endsWith('/') && !path.endsWith('index.html') && !path.includes('challenge-selection')) {
      window.location.href = 'login.html';
    }
    return;
  }
  if (callback) callback(getCurrentUser());
}

if (document.getElementById('loginForm')) {
  if (isLoggedIn()) {
    const profile = storage.getProfile();
    window.location.href = profile?.activeChallenge ? 'dashboard.html' : 'challenge-selection.html';
    return;
  }
}

if (document.getElementById('signupForm')) {
  if (isLoggedIn()) {
    const profile = storage.getProfile();
    window.location.href = profile?.activeChallenge ? 'dashboard.html' : 'challenge-selection.html';
    return;
  }
}

window.authLogin = async (email, password) => {
  try {
    const ok = await loginWithEmail(email, password);
    if (!ok) {
      window.dispatchEvent(new CustomEvent('auth:error', { detail: { message: 'Invalid email or password.' } }));
      return false;
    }
    window.dispatchEvent(new CustomEvent('auth:login'));
    return true;
  } catch (e) {
    window.dispatchEvent(new CustomEvent('auth:error', { detail: { message: e.message } }));
    return false;
  }
};

window.authSignup = async (email, password) => {
  try {
    const ok = await signupWithEmail(email, password);
    if (!ok) {
      window.dispatchEvent(new CustomEvent('auth:error', { detail: { message: 'Invalid email or password.' } }));
      return false;
    }
    window.dispatchEvent(new CustomEvent('auth:signup'));
    return true;
  } catch (e) {
    window.dispatchEvent(new CustomEvent('auth:error', { detail: { message: e.message } }));
    return false;
  }
};

const handleGoogleAuth = async () => {
  try {
    await loginWithGoogle();
    const event = window.location.pathname?.includes('signup') ? 'auth:signup' : 'auth:login';
    window.dispatchEvent(new CustomEvent(event));
  } catch (e) {
    window.dispatchEvent(new CustomEvent('auth:error', { detail: { message: e.message } }));
  }
};
window.authLoginWithGoogle = window.authSignupWithGoogle = handleGoogleAuth;

window.authGuest = async () => {
  try {
    await loginAsGuest();
    window.dispatchEvent(new CustomEvent('auth:signup'));
    return true;
  } catch (e) {
    window.dispatchEvent(new CustomEvent('auth:error', { detail: { message: e.message } }));
    return false;
  }
};

window.authLogout = logout;
window.authRequire = requireAuth;
window.authGetCurrentUser = () => getCurrentUser();

export function showError(message) {
  const el = document.getElementById('authError');
  if (el) {
    el.textContent = message;
    el.classList.add('show');
  }
}

export function hideError() {
  const el = document.getElementById('authError');
  if (el) {
    el.textContent = '';
    el.classList.remove('show');
  }
}
