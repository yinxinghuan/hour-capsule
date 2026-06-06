// AlterU brand strip + hairline divider — every screen has one.
// Replaces the old pink "active" dot with the player's circle avatar
// so they always see "you, doing this now" at the top of the frame.
import { memo } from 'react';

interface Props {
  rightLabel: string;
  avatarUrl?: string;
  userName?: string;
}

export default memo(function TopBar({ rightLabel, avatarUrl, userName }: Props) {
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
          ALTERU · HOUR CAPSULE
        </div>
        <div className="tsp-topbar__r">{rightLabel}</div>
      </div>
      <div className="tsp-toprule" />
    </>
  );
});
