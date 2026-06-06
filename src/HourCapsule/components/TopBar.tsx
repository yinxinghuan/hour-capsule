// AlterU brand strip + hairline divider — every screen has one.
// Left side: player avatar + (optional) streak flame chip + brand text.
// Right side: live timestamp.
import { memo } from 'react';

interface Props {
  rightLabel: string;
  avatarUrl?: string;
  userName?: string;
  /** Consecutive-hour streak. Only rendered when > 1. */
  streak?: number;
}

export default memo(function TopBar({ rightLabel, avatarUrl, userName, streak = 0 }: Props) {
  const initial = (userName || '?').charAt(0).toUpperCase();
  return (
    <>
      <div className="tsp-topbar">
        <div className="tsp-topbar__l">
          {avatarUrl ? (
            <img className="tsp-topbar__avatar" src={avatarUrl} alt="" draggable={false} />
          ) : (
            <span className="tsp-topbar__avatar tsp-topbar__avatar--initial">{initial}</span>
          )}
          {streak > 1 && (
            <span className="tsp-topbar__streak" aria-label={`${streak} hour streak`}>
              <svg viewBox="0 0 12 14" width="9" height="11" aria-hidden="true">
                <path
                  d="M6 0.6 C 5.2 2, 3 3.4, 2.4 6.2 C 1.8 8.6, 3.2 12.2, 6 13.2 C 8.8 12.2, 10.4 8.8, 9.8 6.4 C 9.3 4.7, 7.9 4.4, 7.4 3 C 6.9 4, 6.4 5, 6 5 C 5.6 4, 5.6 2, 6 0.6 Z"
                  fill="currentColor"
                />
              </svg>
              {streak}
            </span>
          )}
          ALTERU · HOUR CAPSULE
        </div>
        <div className="tsp-topbar__r">{rightLabel}</div>
      </div>
      <div className="tsp-toprule" />
    </>
  );
});
