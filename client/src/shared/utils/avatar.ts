export const getInitials = (name?: string): string => {
  if (!name || !name.trim()) return "U"
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 1) {
    return parts[0][0].toUpperCase()
  }
  return (parts[0][0] + parts[1][0]).toUpperCase()
}
