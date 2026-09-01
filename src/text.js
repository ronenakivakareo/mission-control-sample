/**
 * Text utilities.
 */

export function wordCount(text) {
  if (!text) return 0;
  const trimmed = text.trim();
  if (trimmed === "") return 0;
  return trimmed.split(/\s+/).length;
}
