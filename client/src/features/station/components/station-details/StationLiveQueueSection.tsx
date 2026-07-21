import { useState, useEffect } from "react"
import { Clock } from "lucide-react"

export function StationLiveQueueSection() {
  const [countdown, setCountdown] = useState(12)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 15 : prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const queueItems = [
    {
      position: "#12",
      vehicle: "Tesla Model S - Silver",
      package: "Elite Detail Package",
      time: "10m elapsed",
      status: "Washing",
      statusColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    },
    {
      position: "#13",
      vehicle: "BMW M4 - Matte Black",
      package: "Exterior Pro",
      time: "Est. wait 12m",
      status: "Waiting",
      statusColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    },
    {
      position: "#11",
      vehicle: "Porsche 911 - Agate Grey",
      package: "Full Ceramic Wash",
      time: "Completed 12m ago",
      status: "Done",
      statusColor: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header & Live Pulse Timer */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
            Live Queue
          </h2>
          <div className="px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
              Live Monitoring
            </span>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
          <Clock size={13} className="text-slate-500" />
          <span>Refreshing in <strong className="text-blue-400">{countdown}s</strong></span>
        </div>
      </div>

      {/* Queue Card Stack */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 divide-y divide-slate-800/60 overflow-hidden shadow-xl">
        {queueItems.map((item, idx) => (
          <div
            key={idx}
            className={`p-5 flex justify-between items-center transition-colors ${
              item.status === "Done" ? "opacity-60 bg-slate-950/40" : "hover:bg-slate-950/30"
            }`}
          >
            <div className="flex items-center gap-5">
              {/* Token Position Badge */}
              <div className="w-14 h-14 rounded-xl border border-slate-800 bg-slate-950 flex items-center justify-center shrink-0">
                <span className={`text-base font-black ${item.status === "Washing" ? "text-blue-400" : "text-slate-400"}`}>
                  {item.position}
                </span>
              </div>

              {/* Details */}
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-slate-100">{item.vehicle}</h4>
                <p className="text-xs text-slate-400">
                  {item.package} • {item.time}
                </p>
              </div>
            </div>

            {/* Status Tag */}
            <span className={`px-5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border ${item.statusColor}`}>
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
