import React from "react"
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts"
import { Sparkles } from "lucide-react"

interface DonutItem {
  name?: string
  status?: string
  count: number
  percentage?: number
  revenue?: number
}

interface DistributionDonutChartProps {
  data: DonutItem[]
  height?: number
  centerLabel?: string
  centerValue?: string | number
}

const COLORS = [
  "#3B82F6", // Primary Blue
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#8B5CF6", // Purple
  "#EF4444", // Rose
  "#06B6D4", // Cyan
  "#EC4899", // Pink
]

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    payload: DonutItem
    value?: number | string
    name?: string
  }>
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const item = payload[0]?.payload
    if (!item) return null
    const label = item.name || item.status || "Item"
    return (
      <div className="bg-card/95 backdrop-blur-md border border-border p-3 rounded-xl shadow-xl text-xs space-y-1 z-50">
        <p className="font-bold text-foreground">{label}</p>
        <p className="text-primary font-semibold">Count: {item.count}</p>
        {item.percentage !== undefined && (
          <p className="text-muted-foreground">Share: {item.percentage}%</p>
        )}
        {item.revenue !== undefined && (
          <p className="text-emerald-500 font-medium">Revenue: ₹{item.revenue.toLocaleString()}</p>
        )}
      </div>
    )
  }
  return null
}

export const DistributionDonutChart: React.FC<DistributionDonutChartProps> = ({
  data,
  height = 260,
  centerLabel,
  centerValue,
}) => {
  if (!data || data.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center p-6 text-center border border-dashed border-border/80 rounded-2xl bg-card/30"
        style={{ height }}
      >
        <div className="p-3 rounded-2xl bg-primary/10 text-primary mb-2.5">
          <Sparkles className="w-6 h-6 opacity-70" />
        </div>
        <p className="text-xs font-bold text-foreground">No Wash Mix Data</p>
        <p className="text-[11px] text-muted-foreground max-w-xs mt-0.5">
          Package and service type breakdowns will display once customer wash orders are received.
        </p>
      </div>
    )
  }

  const chartData = data.map((d) => ({
    ...d,
    displayName: d.name || d.status || "Unknown",
  }))

  return (
    <div
      className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full"
      style={{ height }}
    >
      <div className="relative flex-1 w-full h-full min-h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="displayName"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              stroke="none"
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {centerValue && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-xl font-extrabold text-foreground leading-none">
              {centerValue}
            </span>
            {centerLabel && (
              <span className="text-[10px] uppercase font-semibold text-muted-foreground mt-0.5">
                {centerLabel}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5 w-full sm:w-44 text-xs shrink-0 max-h-48 overflow-y-auto pr-1">
        {chartData.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 truncate">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: COLORS[idx % COLORS.length] }}
              />
              <span className="truncate text-foreground/80 font-medium">{item.displayName}</span>
            </div>
            <span className="font-semibold text-foreground text-right shrink-0">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DistributionDonutChart
