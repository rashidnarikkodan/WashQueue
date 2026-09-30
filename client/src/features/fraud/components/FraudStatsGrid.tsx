import React from "react";
import { AlertCircle, UserCheck, Ban, Lock, ShieldCheck } from "lucide-react";
import type { FraudMetricsDto } from "../types/fraud.types";

interface FraudStatsGridProps {
  metrics: FraudMetricsDto | null;
  isLoading?: boolean;
}

export const FraudStatsGrid: React.FC<FraudStatsGridProps> = ({ metrics, isLoading }) => {
  const cards = [
    {
      id: "total-alerts",
      label: "TOTAL FRAUD ALERTS",
      value: metrics ? String(metrics.totalAlerts).padStart(2, "0") : "00",
      trend: metrics?.alertsTrend || "0%",
      trendType: "up",
      icon: AlertCircle,
      iconColor: "text-rose-400 bg-rose-500/10",
      indicatorColor: "bg-rose-500",
    },
    {
      id: "high-risk-users",
      label: "HIGH-RISK USERS",
      value: metrics ? String(metrics.highRiskUsersCount).padStart(2, "0") : "00",
      trend: metrics?.highRiskTrend || "0%",
      trendType: "down",
      icon: UserCheck,
      iconColor: "text-blue-400 bg-blue-500/10",
      indicatorColor: "bg-blue-500",
    },
    {
      id: "suspended-accounts",
      label: "SUSPENDED ACCOUNTS",
      value: metrics ? String(metrics.suspendedAccountsCount).padStart(2, "0") : "00",
      trend: "Current status",
      trendType: "neutral",
      icon: Ban,
      iconColor: "text-slate-400 bg-slate-500/10",
      indicatorColor: "bg-slate-400",
    },
    {
      id: "failed-logins",
      label: "FAILED LOGINS",
      value: metrics ? String(metrics.failedLoginsCount).padStart(2, "0") : "00",
      trend: metrics?.loginsTrend || "0%",
      trendType: "up",
      icon: Lock,
      iconColor: "text-amber-400 bg-amber-500/10",
      indicatorColor: "bg-amber-500",
    },
    {
      id: "critical-threats",
      label: "CRITICAL THREATS",
      value: metrics ? String(metrics.criticalThreatsCount).padStart(2, "0") : "00",
      trend: "Active monitoring",
      trendType: "neutral",
      icon: ShieldCheck,
      iconColor: "text-emerald-400 bg-emerald-500/10",
      indicatorColor: "bg-emerald-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className="relative flex flex-col justify-between p-4 rounded-xl border border-border/80 bg-card/70 backdrop-blur-md hover:border-primary/30 transition-all duration-200"
          >
            <div className="flex items-start justify-between">
              <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                {card.label}
              </span>
              <div className={`p-1.5 rounded-lg ${card.iconColor}`}>
                <Icon size={16} />
              </div>
            </div>

            <div className="mt-3">
              <span className="text-3xl font-bold tracking-tight text-foreground">
                {isLoading ? "--" : card.value}
              </span>
            </div>

            <div className="mt-2 flex items-center gap-1.5 text-[11px]">
              {card.trendType === "up" && (
                <span className="text-rose-400 font-medium">{card.trend}</span>
              )}
              {card.trendType === "down" && (
                <span className="text-blue-400 font-medium">{card.trend}</span>
              )}
              {card.trendType === "neutral" && (
                <span className="text-muted-foreground">{card.trend}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
