import React from "react";
import { Shield, MoreVertical, XCircle, Star, Copy, ExternalLink } from "lucide-react";
import { RiskLevelBadge } from "./FraudBadges";
import type { FraudEventDto } from "../types/fraud.types";

interface ActiveFraudAlertsCardProps {
  alerts: FraudEventDto[];
  onInvestigate: (alert: FraudEventDto) => void;
  onViewAll?: () => void;
  isLoading?: boolean;
}

export const ActiveFraudAlertsCard: React.FC<ActiveFraudAlertsCardProps> = ({
  alerts,
  onInvestigate,
  onViewAll,
  isLoading,
}) => {
  const getIconForAlert = (alert: FraudEventDto) => {
    if (alert.riskLevel === "HIGH") {
      return (
        <div className="h-9 w-9 rounded-full flex items-center justify-center bg-rose-500/15 text-rose-400 shrink-0">
          <XCircle size={18} />
        </div>
      );
    }
    if (alert.riskLevel === "MEDIUM") {
      return (
        <div className="h-9 w-9 rounded-full flex items-center justify-center bg-amber-500/15 text-amber-400 shrink-0">
          <Star size={18} />
        </div>
      );
    }
    return (
      <div className="h-9 w-9 rounded-full flex items-center justify-center bg-blue-500/15 text-blue-400 shrink-0">
        <Copy size={18} />
      </div>
    );
  };

  const formatActorDisplay = (alert: FraudEventDto) => {
    const role = alert.actorType === "OWNER" ? "Owner" : alert.actorType === "MANAGER" ? "Manager" : "Customer";
    const name = alert.metadata?.userName || alert.userId.slice(-6);
    return `${name} (${role})`;
  };

  return (
    <div className="rounded-xl border border-border/80 bg-card/70 backdrop-blur-md p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between pb-4 border-b border-border/40">
        <div className="flex items-center gap-2">
          <Shield size={18} className="text-primary" />
          <h2 className="text-base font-semibold text-foreground">Active Fraud Alerts</h2>
        </div>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            View All Alerts
            <ExternalLink size={12} />
          </button>
        )}
      </div>

      <div className="mt-4 space-y-3">
        {isLoading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Loading active alerts...</div>
        ) : alerts.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">No active fraud alerts detected</div>
        ) : (
          alerts.slice(0, 4).map((alert, idx) => {
            const ruleCodeFormatted = alert.signals[0]?.code
              ? alert.signals[0].code.replace(/^(CUST_|BOOKING_|OPS_|ACCT_)/, "").replace(/_/g, " ")
              : alert.eventType.replace(/_/g, " ");

            return (
              <div
                key={alert.id || alert._id || `alert-${idx}`}
                className="flex items-center justify-between p-3.5 rounded-lg border border-border/50 bg-background/50 hover:bg-muted/40 transition-colors gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {getIconForAlert(alert)}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <RiskLevelBadge level={alert.riskLevel} />
                      <span className="text-sm font-semibold text-foreground capitalize truncate">
                        {ruleCodeFormatted.toLowerCase()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      <span className="text-foreground/90 font-medium">
                        {formatActorDisplay(alert)}
                      </span>
                      {" • "}
                      <span>{alert.reason}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onInvestigate(alert)}
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-md bg-foreground/10 hover:bg-foreground/20 text-foreground transition-all duration-150"
                  >
                    Investigate
                  </button>
                  <button className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
