/**
 * A deliberately small module with room for agents to work in.
 *
 * Two known gaps are left here on purpose, so the seeded backlog has real tasks:
 *   - `average` divides by zero on an empty list.
 *   - `displayName` throws on a null user.
 */

export function average(numbers) {
  let total = 0;
  for (const n of numbers) total += n;
  return total / numbers.length;
}

export function displayName(user) {
  return user.name.toUpperCase();
}

export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
