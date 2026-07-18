export const PILL =
  "inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-mono text-white/60 whitespace-nowrap";

export const ACCENT_PILL =
  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-mono font-medium whitespace-nowrap";

export function accentPillStyle(accent: string) {
  return `border-color: color-mix(in srgb, ${accent} 35%, transparent); background: color-mix(in srgb, ${accent} 12%, transparent); color: color-mix(in srgb, ${accent} 65%, white);`;
}
