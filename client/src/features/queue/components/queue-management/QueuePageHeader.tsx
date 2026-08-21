import { Building2, Calendar as CalendarIcon } from "lucide-react"

interface QueuePageHeaderProps {
  stationName: string
  currentDateFormatted: string
}

export function QueuePageHeader({ stationName, currentDateFormatted }: QueuePageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Building2 className="h-8 w-8 text-primary" />
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            {stationName}
          </h1>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 uppercase tracking-widest">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          ACTIVE STATION
        </span>
      </div>

      <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium bg-muted/60 px-4 py-2 rounded-xl border border-border">
        <CalendarIcon className="h-4 w-4 text-primary" />
        <span>{currentDateFormatted}</span>
      </div>
    </div>
  )
}
