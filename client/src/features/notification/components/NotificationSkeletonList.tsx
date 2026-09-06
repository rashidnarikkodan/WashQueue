export function NotificationSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-2.5 py-1">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex items-start gap-3.5 p-4 rounded-2xl bg-muted/20 border border-border/40 animate-pulse"
        >
          <div className="w-10 h-10 rounded-2xl bg-muted shrink-0" />
          <div className="flex-1 space-y-2 min-w-0">
            <div className="flex items-center justify-between gap-4">
              <div className="h-3.5 w-1/3 bg-muted rounded-md" />
              <div className="h-2.5 w-12 bg-muted rounded-md shrink-0" />
            </div>
            <div className="h-3 w-5/6 bg-muted/80 rounded-md" />
            <div className="h-2.5 w-2/3 bg-muted/60 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  )
}
