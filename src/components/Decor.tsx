import React from "react";

const ACCENT = "#5d7488";

/**
 * Орнамент-веточка — изящный разделитель в духе свадебных приглашений.
 * Используется под эйбрау/заголовками вместо простой полоски.
 */
export function Ornament({ className = "", color = ACCENT }: { className?: string; color?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`} aria-hidden>
      <span className="h-px w-12" style={{ background: `linear-gradient(to right, transparent, ${color}66)` }} />
      <Sprig color={color} />
      <span className="h-px w-12" style={{ background: `linear-gradient(to left, transparent, ${color}66)` }} />
    </div>
  );
}

/** Маленькая веточка с листочками (центр орнамента). */
export function Sprig({ color = ACCENT, size = 22 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 4 L12 20" stroke={color} strokeWidth="0.9" strokeLinecap="round" />
      <path d="M12 8 C9 7 7.5 8.5 7 11 C9.5 11 11.2 10 12 8 Z" fill={color} opacity="0.55" />
      <path d="M12 8 C15 7 16.5 8.5 17 11 C14.5 11 12.8 10 12 8 Z" fill={color} opacity="0.55" />
      <path d="M12 12 C9.5 11.2 8.2 12.5 7.8 14.6 C10 14.6 11.4 13.7 12 12 Z" fill={color} opacity="0.4" />
      <path d="M12 12 C14.5 11.2 15.8 12.5 16.2 14.6 C14 14.6 12.6 13.7 12 12 Z" fill={color} opacity="0.4" />
      <circle cx="12" cy="4.4" r="1.1" fill={color} opacity="0.7" />
    </svg>
  );
}

/**
 * Декоративная акварельная веточка в углу секции.
 * Если в public/ лежит соответствующий PNG (leaf-*.png) — показываем его,
 * иначе ничего (грациозная деградация, пока ассеты не присланы).
 *
 * pos: расположение в углу; src: путь к PNG в public.
 */
export function CornerLeaf({
  src,
  pos,
  className = "",
  width = 150,
  flip = false,
  delay = 0,
}: {
  src: string;
  pos: "tl" | "tr" | "bl" | "br";
  className?: string;
  width?: number;
  flip?: boolean;
  delay?: number;
}) {
  const corner: Record<string, React.CSSProperties> = {
    tl: { top: 0, left: 0 },
    tr: { top: 0, right: 0 },
    bl: { bottom: 0, left: 0 },
    br: { bottom: 0, right: 0 },
  };
  return (
    <img
      src={src}
      alt=""
      aria-hidden
      onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
      className={`pointer-events-none absolute select-none float-soft opacity-90 ${className}`}
      style={{
        ...corner[pos],
        width,
        transform: flip ? "scaleX(-1)" : undefined,
        animationDelay: `${delay}s`,
        zIndex: 1,
      }}
    />
  );
}
