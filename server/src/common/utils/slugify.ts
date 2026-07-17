export const slugify = (value: string): string => {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-")         // Replace spaces with -
    .replace(/-+/g, "-")          // Collapse multiple -
    .replace(/^-|-$/g, "");       // Trim leading/trailing -
};