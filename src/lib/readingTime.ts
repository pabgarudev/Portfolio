const WORDS_PER_MINUTE = 200;

// Estimated from the raw MDX/markdown body: code fences and component
// imports/invocations aren't prose a reader spends reading time on, so
// they're stripped before the word count rather than inflating the estimate.
export function getReadingTime(body: string): number {
  const withoutCodeFences = body.replace(/```[\s\S]*?```/g, " ");
  const withoutImports = withoutCodeFences.replace(/^import .+$/gm, " ");
  const withoutTags = withoutImports.replace(/<[^>]+>/g, " ");
  const words = withoutTags.trim().split(/\s+/).filter(Boolean);
  return Math.max(1, Math.round(words.length / WORDS_PER_MINUTE));
}
