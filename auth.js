/**
 * MAZOEZI Auth - Local session only
 * No backend. Session stored in localStorage. One user per device.
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

function isLoggedIn() {
  return !!localStorage.getItem(SESSION_KEY);
}

function getCurrentUser() {
  return isLoggedIn() ? { uid: 'local' } : null;
}

async function loginWithEmail(email, password) {
  localStorage.setItem(SESSION_KEY, '1');
  let profile = storage.getProfile();
  if (!profile.createdAt) {
    profile = { ...DEFAULT_PROFILE, createdAt: new Date().toISOString() };
    storage.setProfile(profile);
  }
  return true;
}

async function signupWithEmail(email, password) {
  return loginWithEmail(email, password);
}

async function loginWithGoogle() {
  return loginWithEmail('', '');
}

async function logout() {
  localStorage.removeItem(SESSION_KEY);
}

function requireAuth(callback) {
  if (!isLoggedIn()) {
    const path = window.location.pathname || '';
    if (!path.includes('login') && !path.includes('signup') && !path.endsWith('/') && !path.endsWith('index.html') && !path.includes('challenge-selection')) {
      window.location.href = 'login.html';
    }
    return;
  }
  if (callback) callback(getCurrentUser());
}

if (document.getElementById('loginForm')) {
  if (isLoggedIn()) window.location.href = 'dashboard.html';
}

window.authLogin = async (email, password) => {
  try {
    await loginWithEmail(email || 'user', password || 'local');
    window.dispatchEvent(new CustomEvent('auth:login'));
    return true;
  } catch (e) {
    window.dispatchEvent(new CustomEvent('auth:error', { detail: { message: e.message } }));
    return false;
  }
};

window.authSignup = async (email, password) => {
  try {
    await signupWithEmail(email || 'user', password || 'local');
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
