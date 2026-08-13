export const PILL =
  "inline-flex items-center gap-1.5 rounded-full border border-neutral-950/10 dark:border-white/10 bg-neutral-950/5 dark:bg-white/5 px-3 py-1 text-xs font-mono text-neutral-950/60 dark:text-white/60 whitespace-nowrap";

export const ACCENT_PILL =
  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-mono font-medium whitespace-nowrap";

export function accentPillStyle(accent: string) {
  return `border-color: color-mix(in srgb, ${accent} 35%, transparent); background: color-mix(in srgb, ${accent} 12%, transparent); color: color-mix(in srgb, ${accent} 65%, var(--ink));`;
}
