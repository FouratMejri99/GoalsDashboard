// crypto.randomUUID is unavailable in some older/embedded webviews — fall back
// to a short random id so entry creation never throws.
export function makeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}
