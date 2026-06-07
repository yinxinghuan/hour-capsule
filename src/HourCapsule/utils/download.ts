// Save the current capsule image to the user's device.
//
// Strategy: try navigator.share (best mobile UX, surfaces the system
// share sheet so user can Save to Photos / send to friend / etc.);
// fall back to anchor download for desktop; final fallback opens the
// URL in a new tab so the user can long-press to save.
//
// CORS caveat ([[cross-user-avatar]] notes platform R2 has no CORS):
// fetch+blob may fail. Use the URL directly for navigator.share and
// for the anchor href — let the browser handle the bytes.

export async function saveCapsuleImage(imageUrl: string, filename: string): Promise<'shared' | 'downloaded' | 'opened' | 'failed'> {
  // 1. Try native share sheet (mobile — best)
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      // Try sharing a file blob first (lets Save to Photos appear)
      try {
        const res = await fetch(imageUrl);
        if (res.ok) {
          const blob = await res.blob();
          const file = new File([blob], filename, { type: blob.type || 'image/png' });
          if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file] });
            return 'shared';
          }
        }
      } catch {
        /* CORS / fetch fail — fall through to URL share */
      }
      // URL-only share — at minimum lets user copy or open
      await navigator.share({ url: imageUrl });
      return 'shared';
    }
  } catch {
    /* user cancelled or share failed — try next */
  }

  // 2. Anchor download (desktop browsers — works if same-origin or CORS allows)
  try {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = filename;
    a.rel = 'noopener';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return 'downloaded';
  } catch {
    /* fall through */
  }

  // 3. Last resort — open in new tab, user long-presses to save
  try {
    window.open(imageUrl, '_blank', 'noopener');
    return 'opened';
  } catch {
    return 'failed';
  }
}
