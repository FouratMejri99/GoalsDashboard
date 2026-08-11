// Thin localStorage wrapper. Everything in this app persists client-side —
// there is no backend, so this file is the entire "database".

const NAMESPACE = "goals-dashboard:";

export function loadJSON(key, fallback) {
  try {
    const raw = window.localStorage.getItem(NAMESPACE + key);
    if (raw == null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function saveJSON(key, value) {
  try {
    window.localStorage.setItem(NAMESPACE + key, JSON.stringify(value));
  } catch {
    // localStorage can throw in private-browsing/quota-exceeded cases;
    // losing persistence silently is preferable to crashing the app.
  }
}

export function removeKey(key) {
  window.localStorage.removeItem(NAMESPACE + key);
}
