// Best-effort live news context for the LLM picker.
//
// Two public, no-key, CORS-friendly sources fetched in parallel:
//  · Wikipedia featured-feed daily "news" — curated current events
//  · Hacker News top stories — tech-leaning real-time headlines
//
// Each source has a hard timeout and is wrapped in try/catch — if either
// fails (offline, ad-blocker, regional block), the other still flows
// through. If BOTH fail, the picker silently falls back to season/moon
// context only.
//
// Caching: 15 min in-memory module-scope. Each user collects at most
// 1/hr so this won't meaningfully stale the feed.

const CACHE_TTL_MS = 15 * 60 * 1000;
const PER_FETCH_TIMEOUT_MS = 2000;

let cached: { at: number; events: string[] } | null = null;

export async function fetchWorldEvents(at: Date = new Date()): Promise<string[]> {
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return cached.events;
  }
  const [hn, wiki] = await Promise.allSettled([
    fetchHackerNews(5),
    fetchWikipediaNews(at),
  ]);
  const events: string[] = [];
  if (hn.status === 'fulfilled') events.push(...hn.value);
  if (wiki.status === 'fulfilled') events.push(...wiki.value);
  cached = { at: Date.now(), events };
  return events;
}

async function fetchHackerNews(n: number): Promise<string[]> {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), PER_FETCH_TIMEOUT_MS);
  try {
    const idsRes = await fetch(
      'https://hacker-news.firebaseio.com/v0/topstories.json',
      { signal: ctl.signal },
    );
    if (!idsRes.ok) return [];
    const ids = (await idsRes.json()) as number[];
    const top = (ids ?? []).slice(0, n);
    const items = await Promise.all(top.map(async id => {
      try {
        const r = await fetch(
          `https://hacker-news.firebaseio.com/v0/item/${id}.json`,
          { signal: ctl.signal },
        );
        if (!r.ok) return '';
        const j = (await r.json()) as { title?: string };
        return j.title ?? '';
      } catch { return ''; }
    }));
    return items.filter(Boolean).map(s => `HN: ${s}`);
  } catch {
    return [];
  } finally {
    clearTimeout(t);
  }
}

async function fetchWikipediaNews(at: Date): Promise<string[]> {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), PER_FETCH_TIMEOUT_MS);
  const pad = (x: number) => String(x).padStart(2, '0');
  const url =
    `https://en.wikipedia.org/api/rest_v1/feed/featured/` +
    `${at.getFullYear()}/${pad(at.getMonth() + 1)}/${pad(at.getDate())}`;
  try {
    const res = await fetch(url, { signal: ctl.signal });
    if (!res.ok) return [];
    const j = (await res.json()) as {
      news?: Array<{ story?: string }>;
      tfa?: { extract?: string; description?: string };
    };
    const out: string[] = [];
    // Curated current-events block — strip HTML, take first sentence each.
    for (const n of (j.news ?? []).slice(0, 4)) {
      const text = stripHtml(n.story ?? '').split('. ')[0].trim();
      if (text) out.push(`World: ${text}`);
    }
    // Today's featured article (the "what's culturally salient today" signal).
    const tfa = j.tfa?.description || j.tfa?.extract;
    if (tfa) {
      const text = stripHtml(tfa).split('. ')[0].trim();
      if (text) out.push(`Featured: ${text}`);
    }
    return out;
  } catch {
    return [];
  } finally {
    clearTimeout(t);
  }
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}
