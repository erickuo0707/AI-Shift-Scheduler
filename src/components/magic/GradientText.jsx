import { cn } from "./cn";

// 參考 React Bits「Gradient Text」/ Magic UI「Animated Gradient Text」
export function GradientText({ children, className, colors = ["#a78bfa", "#22d3ee", "#f472b6", "#a78bfa"] }) {
  return (
    <span
      className={cn("animate-gradient bg-clip-text text-transparent", className)}
      style={{ backgroundImage: `linear-gradient(90deg, ${colors.join(",")})`, backgroundSize: "200% auto" }}
    >
      {children}
    </span>
  );
}

// 參考 Magic UI「Animated Shiny Text」
export function ShinyText({ children, className }) {
  return (
    <span
      style={{ "--shiny-width": "120px" }}
      className={cn(
        "animate-shiny bg-clip-text bg-no-repeat [background-position:0_0] [background-size:var(--shiny-width)_100%]",
        "bg-gradient-to-r from-transparent via-white via-50% to-transparent text-white/70",
        className
      )}
    >
      {children}
    </span>
  );
}
