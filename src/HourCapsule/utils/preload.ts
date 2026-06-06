// Preload remote images before phase swap. Same pattern as Daily Arcana.
// Memory rule: never mount <img src=newURL> directly after setState —
// always preload first so the destination view doesn't paint empty.
export function preloadImage(url: string, timeoutMs = 12000): Promise<void> {
  return new Promise((resolve) => {
    if (!url) { resolve(); return; }
    const img = new Image();
    let settled = false;
    const done = () => { if (!settled) { settled = true; resolve(); } };
    const tm = setTimeout(done, timeoutMs);
    const tryDecode = async () => {
      try {
        if ('decode' in img) await (img as HTMLImageElement & { decode: () => Promise<void> }).decode();
      } catch { /* fall through */ }
      clearTimeout(tm);
      done();
    };
    img.onload = tryDecode;
    img.onerror = () => { clearTimeout(tm); done(); };
    img.src = url;
  });
}
