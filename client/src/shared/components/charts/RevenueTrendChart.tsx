import React from "react"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"
import { TrendingUp } from "lucide-react"
import type { TimeSeriesPoint } from "@/shared/apis/analytics.api"

interface RevenueTrendChartProps {
  data: TimeSeriesPoint[]
  metricType?: "revenue" | "net" | "bookings" | "commission" | "all"
  height?: number
  onResetRange?: () => void
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    payload: TimeSeriesPoint & { netRevenue?: number }
    value?: number | string
    name?: string
  }>
  label?: string
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const current = payload[0]?.payload
    if (!current) return null
    const gross = current.revenue || 0
    const comm = current.commission ?? Math.round(gross * 0.15)
    const net = gross - comm
    return (
      <div className="bg-card/95 backdrop-blur-md border border-border p-3.5 rounded-xl shadow-xl text-xs space-y-1.5 z-50 min-w-[170px]">
        <p className="font-bold text-foreground border-b border-border/70 pb-1">{label}</p>
        <div className="flex items-center justify-between gap-3 text-blue-500 font-semibold">
          <span>Gross Revenue:</span>
          <span>₹{gross.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between gap-3 text-emerald-500 font-bold">
          <span>Net Take:</span>
          <span>₹{net.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between gap-3 text-amber-500 font-medium">
          <span>Commission:</span>
          <span>₹{comm.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between gap-3 text-violet-400 font-semibold pt-1 border-t border-border/50">
          <span>Bookings Count:</span>
          <span>{current.bookingsCount || 0}</span>
        </div>
      </div>
    )
  }
  return null
}

export const RevenueTrendChart: React.FC<RevenueTrendChartProps> = ({
  data,
  metricType = "revenue",
  height = 280,
  onResetRange,
}) => {
  if (!data || data.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center p-6 text-center w-full"
        style={{ height }}
      >
        <div className="p-3 rounded-2xl bg-primary/10 text-primary mb-2.5">
          <TrendingUp className="w-6 h-6 opacity-70" />
        </div>
        <p className="text-xs font-bold text-foreground">No Financial Records Found</p>
        <p className="text-[11px] text-muted-foreground max-w-xs mt-0.5 mb-3">
          There are no transaction records for the selected date timeframe.
        </p>
        {onResetRange && (
          <button
            onClick={onResetRange}
            className="px-3 py-1.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-semibold text-xs transition-all cursor-pointer border border-border"
          >
            Switch to All Time
          </button>
        )}
      </div>
    )
  }

  const chartData = data.map((d) => {
    const gross = d.revenue || 0
    const comm = d.commission ?? Math.round(gross * 0.15)
    return {
      ...d,
      netRevenue: gross - comm,
      commission: comm,
    }
  })

  const isAllMode = metricType === "all"

  const dataKey =
    metricType === "bookings"
      ? "bookingsCount"
      : metricType === "commission"
        ? "commission"
        : metricType === "net"
          ? "netRevenue"
          : "revenue"

  const strokeColor =
    metricType === "bookings"
      ? "#8B5CF6"
      : metricType === "commission"
        ? "#F59E0B"
        : metricType === "net"
          ? "#10B981"
          : "#3B82F6"

  const gradientId = `trendGradient_${metricType}`

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: isAllMode ? 20 : 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="gradient_revenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="gradient_commission" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="gradient_bookings" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={strokeColor} stopOpacity={0.4} />
              <stop offset="95%" stopColor={strokeColor} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="rgba(150, 150, 150, 0.15)"
          />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "currentColor", fontSize: 11, opacity: 0.6 }}
            dy={8}
          />
          <YAxis
            yAxisId="left"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "currentColor", fontSize: 11, opacity: 0.6 }}
            tickFormatter={(val) =>
              !isAllMode && metricType === "bookings"
                ? String(val)
                : `₹${Number(val) >= 1000 ? `${(Number(val) / 1000).toFixed(0)}k` : val}`
            }
          />
          {isAllMode && (
            <YAxis
              yAxisId="right"
              orientation="right"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#8B5CF6", fontSize: 11, opacity: 0.8 }}
              tickFormatter={(val) => String(val)}
            />
          )}
          <Tooltip content={<CustomTooltip />} />
          {isAllMode ? (
            <>
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                name="Gross Revenue"
                stroke="#3B82F6"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#gradient_revenue)"
                activeDot={{ r: 5, fill: "#3B82F6" }}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="commission"
                name="Commission"
                stroke="#F59E0B"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#gradient_commission)"
                activeDot={{ r: 5, fill: "#F59E0B" }}
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="bookingsCount"
                name="Bookings Count"
                stroke="#8B5CF6"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#gradient_bookings)"
                activeDot={{ r: 5, fill: "#8B5CF6" }}
              />
            </>
          ) : (
            <Area
              yAxisId="left"
              type="monotone"
              dataKey={dataKey}
              stroke={strokeColor}
              strokeWidth={2.5}
              fillOpacity={1}
              fill={`url(#${gradientId})`}
              activeDot={{ r: 6, fill: strokeColor, stroke: "#ffffff", strokeWidth: 2 }}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default RevenueTrendChart
