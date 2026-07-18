import Article from "../components/icons/Article.astro";
import GraduationCap from "../components/icons/GraduationCap.astro";
import Book from "../components/icons/Book.astro";
import Palette from "../components/icons/Palette.astro";
import Grid from "../components/icons/Grid.astro";

// Cool-toned green for the "App" type, kept distinct from the other types.
export const APP_ACCENT = "#10b981";

export const CATEGORY_META = {
  paper: { label: "Paper", icon: Article, color: "#5b55b5" },
  workshop: { label: "Workshop", icon: GraduationCap, color: "#dc003e" },
  thesis: { label: "Thesis", icon: Book, color: "#fbbf24" },
  design: { label: "Design", icon: Palette, color: "#a855f7" },
  app: { label: "App", icon: Grid, color: APP_ACCENT },
} as const;

export const OTHER_ACCENT = "#00ce53";

export function accentFor(category?: string) {
  const meta = category ? CATEGORY_META[category as keyof typeof CATEGORY_META] : undefined;
  return meta?.color ?? OTHER_ACCENT;
}

// Weighted presence for each type in a multi-type project: the first
// (main) type takes 75% of the squares, the remaining 25% is split evenly
// across whatever other types follow. Used to color the card's ambient
// scan-grid squares so secondary types show up as a minority of cells.
const MAIN_TYPE_SHARE = 0.75;

export function weightedAccents(types: string[]) {
  const secondaryShare = types.length > 1 ? (1 - MAIN_TYPE_SHARE) / (types.length - 1) : 0;
  return types.map((type, i) => ({
    color: accentFor(type),
    weight: i === 0 ? MAIN_TYPE_SHARE : secondaryShare,
  }));
}
