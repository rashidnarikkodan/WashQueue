/**
 * Generate 1 or 2 letter uppercase initials from a user's name.
 * - Single name (e.g. "Adrian"): Returns first letter "A"
 * - Multi-word name (e.g. "Adrian Thorne" or "John Doe Smith"): Returns first letter of 1st and 2nd names ("AT" / "JD")
 * - Empty / undefined: Returns "U"
 */
export const getInitials = (name?: string): string => {
  if (!name || !name.trim()) return "U"
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 1) {
    return parts[0][0].toUpperCase()
  }
  return (parts[0][0] + parts[1][0]).toUpperCase()
}
