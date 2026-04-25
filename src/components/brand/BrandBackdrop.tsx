export default function BrandBackdrop() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <div className="app-orb app-orb-a" />
      <div className="app-orb app-orb-b" />
      <div className="app-grid-mask" />
      <div className="app-noise" />
    </div>
  );
}
