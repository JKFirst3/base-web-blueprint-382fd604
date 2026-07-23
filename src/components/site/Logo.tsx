import horizontal from "@/assets/lavidro-horizontal.svg.asset.json";
import icon from "@/assets/lavidro-icon.svg.asset.json";

export function LogoHorizontal({ className = "h-10 w-auto" }: { className?: string }) {
  return (
    <img src={horizontal.url} alt="Lavidro — Textile Care Intelligence" className={className} />
  );
}

export function LogoIcon({ className = "h-8 w-8" }: { className?: string }) {
  return <img src={icon.url} alt="Lavidro" className={className} />;
}
