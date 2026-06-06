// Bottom-corner ALTERU mark. Painted alteru.svg, NO invert filter.
export default function Watermark() {
  return (
    <div className="tsp-watermark" aria-hidden="true">
      <img src="/hour-capsule/alteru.svg" alt="" draggable={false} />
    </div>
  );
}
