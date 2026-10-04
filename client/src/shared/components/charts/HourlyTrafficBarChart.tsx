import React from "react"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts"
import type { HourlyTrafficPoint } from "@/shared/apis/analytics.api"

interface HourlyTrafficBarChartProps {
  data: HourlyTrafficPoint[]
  height?: number
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    payload: HourlyTrafficPoint
    value?: number | string
    name?: string
  }>
  label?: string
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const item = payload[0]?.payload
    if (!item) return null
    return (
      <div className="bg-card/95 backdrop-blur-md border border-border p-3 rounded-xl shadow-xl text-xs space-y-1 z-50">
        <p className="font-bold text-foreground">Time: {label}</p>
        <p className="text-primary font-semibold">Bookings: {item.bookingsCount}</p>
      </div>
    )
  }
  return null
}

export const HourlyTrafficBarChart: React.FC<HourlyTrafficBarChartProps> = ({
  data,
  height = 240,
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[200px] text-muted-foreground text-xs">
        No hourly activity logged for today yet.
      </div>
    )
  }

  const maxVolume = Math.max(...data.map((d) => d.bookingsCount), 0)

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="rgba(150, 150, 150, 0.15)"
          />
          <XAxis
            dataKey="hour"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "currentColor", fontSize: 10, opacity: 0.6 }}
            dy={5}
          />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "currentColor", fontSize: 10, opacity: 0.6 }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(100, 100, 100, 0.08)" }} />
          <Bar dataKey="bookingsCount" radius={[4, 4, 0, 0]} maxBarSize={28}>
            {data.map((entry, index) => {
              const isPeak = entry.bookingsCount > 0 && entry.bookingsCount === maxVolume
              return (
                <Cell key={`bar-${index}`} fill={isPeak ? "#3B82F6" : "rgba(59, 130, 246, 0.45)"} />
              )
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default HourlyTrafficBarChart
