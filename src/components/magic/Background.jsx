import { useEffect, useRef } from "react";

// 參考 React Bits「Aurora」+ Magic UI「Particles」+「Grid Pattern」
export function Background() {
  return (
    <div aria-hidden className="no-print pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -left-[10%] -top-[20%] h-[60vw] w-[60vw] animate-aurora rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.35),transparent_60%)] blur-3xl" />
      <div className="absolute -right-[15%] top-[10%] h-[50vw] w-[50vw] animate-aurora rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.22),transparent_60%)] blur-3xl [animation-delay:-6s]" />
      <div className="absolute bottom-[-20%] left-[30%] h-[45vw] w-[45vw] animate-aurora rounded-full bg-[radial-gradient(circle,rgba(244,114,182,0.16),transparent_60%)] blur-3xl [animation-delay:-12s]" />
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse at 50% 0%, #000 20%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 0%, #000 20%, transparent 75%)",
        }}
      />
      <Particles />
    </div>
  );
}

function Particles({ quantity = 70 }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, raf = 0;
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + "px"; canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const dots = Array.from({ length: quantity }, () => ({
      x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.6 + 0.3,
      dx: (Math.random() - 0.5) * 0.15, dy: (Math.random() - 0.5) * 0.15,
      a: Math.random() * 0.5 + 0.15, m: Math.random() * 30 + 6,
    }));
    const onMove = (e) => { mouse.tx = (e.clientX - w / 2) / w; mouse.ty = (e.clientY - h / 2) / h; };
    const draw = () => {
      mouse.x += (mouse.tx - mouse.x) * 0.05; mouse.y += (mouse.ty - mouse.y) * 0.05;
      ctx.clearRect(0, 0, w, h);
      for (const d of dots) {
        d.x += d.dx; d.y += d.dy;
        if (d.x < -10) d.x = w + 10; if (d.x > w + 10) d.x = -10;
        if (d.y < -10) d.y = h + 10; if (d.y > h + 10) d.y = -10;
        ctx.beginPath();
        ctx.arc(d.x + mouse.x * d.m, d.y + mouse.y * d.m, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,200,255,${d.a})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);
    if (reduce) { draw(); cancelAnimationFrame(raf); } else draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); window.removeEventListener("mousemove", onMove); };
  }, [quantity]);
  return <canvas ref={ref} className="absolute inset-0" />;
}
