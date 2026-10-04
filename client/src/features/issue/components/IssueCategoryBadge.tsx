interface IssueCategoryBadgeProps {
  category?: string
  className?: string
}

export default function IssueCategoryBadge({
  category = "General",
  className = "",
}: IssueCategoryBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold text-foreground/90 bg-muted/60 border border-border/70 ${className}`}
    >
      {category}
    </span>
  )
}
