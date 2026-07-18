import Article from "../components/icons/Article.astro";
import GraduationCap from "../components/icons/GraduationCap.astro";
import Book from "../components/icons/Book.astro";
import Palette from "../components/icons/Palette.astro";

export const CATEGORY_META = {
  paper: { label: "Paper", icon: Article, color: "#5b55b5" },
  workshop: { label: "Workshop", icon: GraduationCap, color: "#dc003e" },
  thesis: { label: "Thesis", icon: Book, color: "#fbbf24" },
  design: { label: "Design", icon: Palette, color: "#a855f7" },
} as const;

export const OTHER_ACCENT = "#00ce53";

// Cool-toned green for the "App" tag badge, kept distinct from each
// project's own category accent.
export const APP_ACCENT = "#10b981";

export function accentFor(category?: string) {
  const meta = category ? CATEGORY_META[category as keyof typeof CATEGORY_META] : undefined;
  return meta?.color ?? OTHER_ACCENT;
}
