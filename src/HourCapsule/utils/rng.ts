// Weighted random pick utility — used to select silhouette / material /
// damage per press. Optionally exclude recent picks to ensure variety.

interface Weighted {
  key: string;
  weight: number;
}

export function pickWeighted<T extends Weighted>(items: T[], exclude: string[] = []): T {
  const pool = items.filter(i => !exclude.includes(i.key));
  const candidates = pool.length ? pool : items;
  const total = candidates.reduce((sum, i) => sum + i.weight, 0);
  let r = Math.random() * total;
  for (const item of candidates) {
    r -= item.weight;
    if (r <= 0) return item;
  }
  return candidates[candidates.length - 1];
}

/** Cheap UUID-ish for local IDs. */
export function newId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
