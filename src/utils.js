/**
 * A deliberately small module with room for agents to work in.
 *
 * Two known gaps are left here on purpose, so the seeded backlog has real tasks:
 *   - `average` divides by zero on an empty list.
 *   - `displayName` throws on a null user.
 */

export function average(numbers) {
  if (numbers.length === 0) return 0;
  let total = 0;
  for (const n of numbers) total += n;
  return total / numbers.length;
}

export function displayName(user) {
  if (!user || !user.name) return "";
  return user.name.toUpperCase();
}

export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function truncate(text, maxLength) {
  if (text.length <= maxLength) return text;
  if (maxLength <= 3) return text.slice(0, maxLength);
  return text.slice(0, maxLength - 3) + "...";
}

export function clamp(value, min, max) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}
