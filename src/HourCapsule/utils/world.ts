// Light "what's happening in the world right now" string for LLM context.
// Computed offline (no API). Atmospheric, not literal — just nudges the
// curator to pick a vibe that matches the current hour / season / moon.

export function worldNudge(at: Date = new Date()): string {
  const hour = at.getHours();
  const month = at.getMonth();   // 0-11
  const dow = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][at.getDay()];
  const pad = (n: number) => n.toString().padStart(2, '0');
  const date = `${at.getFullYear()}-${pad(at.getMonth() + 1)}-${pad(at.getDate())}`;

  let dayPart: string;
  if (hour < 5)      dayPart = 'deep-night';
  else if (hour < 8) dayPart = 'early-morning';
  else if (hour < 11) dayPart = 'late-morning';
  else if (hour < 14) dayPart = 'midday';
  else if (hour < 17) dayPart = 'afternoon';
  else if (hour < 19) dayPart = 'dusk';
  else if (hour < 22) dayPart = 'evening';
  else dayPart = 'late-night';

  let season: string;
  if (month <= 1 || month === 11) season = 'winter (NH)';
  else if (month <= 4)            season = 'spring (NH)';
  else if (month <= 7)            season = 'summer (NH)';
  else                            season = 'autumn (NH)';

  // Synodic month = 29.5306 days. Reference new moon: 2000-01-06 18:14 UTC.
  const refNewMoon = Date.UTC(2000, 0, 6, 18, 14, 0);
  const days = (at.getTime() - refNewMoon) / 86_400_000;
  const phase = ((days % 29.5306) + 29.5306) % 29.5306;
  let moon: string;
  if (phase < 1.84)       moon = 'new moon';
  else if (phase < 5.53)  moon = 'waxing crescent';
  else if (phase < 9.22)  moon = 'first quarter';
  else if (phase < 12.91) moon = 'waxing gibbous';
  else if (phase < 16.6)  moon = 'full moon';
  else if (phase < 20.29) moon = 'waning gibbous';
  else if (phase < 23.98) moon = 'last quarter';
  else if (phase < 27.67) moon = 'waning crescent';
  else                    moon = 'new moon';

  return `${dayPart} on ${dow} ${date} · ${season} · ${moon}`;
}
