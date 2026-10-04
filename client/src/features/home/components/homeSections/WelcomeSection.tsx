import { useAuthStore } from "@/features/auth/store/auth.store"
import { getGreeting } from "@/shared/utils/greeting"
import { Sparkles } from "lucide-react"

export default function WelcomeSection() {
  const { user } = useAuthStore()

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(new Date())

  const displayName = user?.name?.trim() ? user.name.split(" ")[0] : "Driver"

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 animate-in fade-in slide-in-from-top-4 duration-500 text-left">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground tracking-wider">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{formattedDate}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight leading-none">
          {getGreeting()}, <span className="text-primary">{displayName}</span>
        </h1>
        <p className="text-sm md:text-base text-muted-foreground font-medium flex items-center gap-1.5">
          <span>Ready for a fresh, sparkling wash today?</span>
          <Sparkles className="h-4 w-4 text-amber-400 inline" />
        </p>
      </div>
    </div>
  )
}
