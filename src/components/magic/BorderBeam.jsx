// 參考 Magic UI「Border Beam」：沿著邊框跑的光束
export function BorderBeam({ duration = 8, colorFrom = "#8b7cff", colorTo = "#22d3ee", width = 2 }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 rounded-[inherit]"
      style={{
        padding: width,
        background: `conic-gradient(from var(--beam-angle), transparent 0deg, transparent 280deg, ${colorFrom} 320deg, ${colorTo} 350deg, transparent 360deg)`,
        WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
        WebkitMaskComposite: "xor",
        maskComposite: "exclude",
        animation: `beam-rotate ${duration}s linear infinite`,
      }}
    />
  );
}
