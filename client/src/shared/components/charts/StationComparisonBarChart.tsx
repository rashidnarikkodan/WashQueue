import React from "react"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { Building2 } from "lucide-react"

export interface StationComparisonItem {
  stationId: string
  name: string
  revenue?: number
  totalRevenue?: number
  bookingsCount?: number
  totalBookings?: number
  rating?: number
}

interface StationComparisonBarChartProps {
  data: StationComparisonItem[]
  height?: number
  valueType?: "revenue" | "bookings"
  onAddStation?: () => void
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    payload: StationComparisonItem
    value?: number | string
    name?: string
  }>
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const item = payload[0]?.payload
    if (!item) return null
    const rev = item.revenue ?? item.totalRevenue ?? 0
    const bCount = item.bookingsCount ?? item.totalBookings ?? 0
    return (
      <div className="bg-card/95 backdrop-blur-md border border-border p-3 rounded-xl shadow-xl text-xs space-y-1 z-50">
        <p className="font-bold text-foreground">{item.name}</p>
        <p className="text-primary font-semibold">Revenue: ₹{rev.toLocaleString()}</p>
        <p className="text-emerald-500 font-medium">Bookings: {bCount}</p>
        {item.rating !== undefined && (
          <p className="text-amber-500 font-medium">Rating: ★ {item.rating.toFixed(1)}</p>
        )}
      </div>
    )
  }
  return null
}

export const StationComparisonBarChart: React.FC<StationComparisonBarChartProps> = ({
  data,
  height = 280,
  valueType = "revenue",
  onAddStation,
}) => {
  if (!data || data.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center p-6 text-center border border-dashed border-border/80 rounded-2xl bg-card/30"
        style={{ height }}
      >
        <div className="p-3 rounded-2xl bg-primary/10 text-primary mb-2.5">
          <Building2 className="w-6 h-6 opacity-70" />
        </div>
        <p className="text-xs font-bold text-foreground">No Station Metrics Found</p>
        <p className="text-[11px] text-muted-foreground max-w-xs mt-0.5 mb-3">
          Register a wash station or check your active locations to see comparison statistics.
        </p>
        {onAddStation && (
          <button
            onClick={onAddStation}
            className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs transition-all cursor-pointer shadow-xs"
          >
            Add Station
          </button>
        )}
      </div>
    )
  }

  const chartData = data.map((item) => ({
    ...item,
    revenue: item.revenue ?? item.totalRevenue ?? 0,
    bookingsCount: item.bookingsCount ?? item.totalBookings ?? 0,
  }))

  const dataKey = valueType === "revenue" ? "revenue" : "bookingsCount"
  const fillColor = valueType === "revenue" ? "#3B82F6" : "#10B981"

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="rgba(150, 150, 150, 0.15)"
          />
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "currentColor", fontSize: 11, opacity: 0.75 }}
            dy={8}
            interval={0}
            angle={-15}
            textAnchor="end"
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: "currentColor", fontSize: 11, opacity: 0.6 }}
            tickFormatter={(val) =>
              valueType === "revenue"
                ? `₹${Number(val) >= 1000 ? `${(Number(val) / 1000).toFixed(0)}k` : val}`
                : String(val)
            }
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(100, 100, 100, 0.08)" }} />
          <Bar dataKey={dataKey} fill={fillColor} radius={[6, 6, 0, 0]} maxBarSize={45} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default StationComparisonBarChart
