import React from "react";
import { Terminal, LogIn, Globe, Key, AlertTriangle, ShieldCheck } from "lucide-react";
import type { SecurityAuditLog } from "../types/fraud.types";

interface RealTimeSecurityLogsCardProps {
  logs: SecurityAuditLog[];
  onViewFullAuditTrail?: () => void;
  isLoading?: boolean;
}

export const RealTimeSecurityLogsCard: React.FC<RealTimeSecurityLogsCardProps> = ({
  logs,
  onViewFullAuditTrail,
  isLoading,
}) => {
  const getLogIcon = (type: SecurityAuditLog["type"]) => {
    switch (type) {
      case "LOGIN_FAILED":
        return (
          <div className="h-8 w-8 rounded-full flex items-center justify-center bg-rose-500/15 text-rose-400 shrink-0">
            <LogIn size={15} />
          </div>
        );
      case "UNUSUAL_GEO":
        return (
          <div className="h-8 w-8 rounded-full flex items-center justify-center bg-emerald-500/15 text-emerald-400 shrink-0">
            <Globe size={15} />
          </div>
        );
      case "KEY_ROTATED":
        return (
          <div className="h-8 w-8 rounded-full flex items-center justify-center bg-blue-500/15 text-blue-400 shrink-0">
            <Key size={15} />
          </div>
        );
      case "BURST_ATTEMPT":
        return (
          <div className="h-8 w-8 rounded-full flex items-center justify-center bg-amber-500/15 text-amber-400 shrink-0">
            <AlertTriangle size={15} />
          </div>
        );
      default:
        return (
          <div className="h-8 w-8 rounded-full flex items-center justify-center bg-slate-500/15 text-slate-400 shrink-0">
            <ShieldCheck size={15} />
          </div>
        );
    }
  };

  return (
    <div className="rounded-xl border border-border/80 bg-card/70 backdrop-blur-md p-5 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center gap-2 pb-4 border-b border-border/40">
          <Terminal size={18} className="text-primary" />
          <h2 className="text-base font-semibold text-foreground">Real-time Security Logs</h2>
        </div>

        <div className="mt-4 space-y-4">
          {isLoading ? (
            <div className="py-8 text-center text-xs text-muted-foreground">Streaming security logs...</div>
          ) : logs.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">No recent security events logged</div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="flex items-start gap-3">
                {getLogIcon(log.type)}
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-1">
                    <p className="text-xs font-semibold text-foreground">{log.title}</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">
                    {log.meta}
                  </p>
                  <p className="text-xs text-foreground/80 mt-1 leading-relaxed">
                    {log.description}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-border/40 text-center">
        <button
          onClick={onViewFullAuditTrail}
          className="text-xs font-bold tracking-wider text-muted-foreground hover:text-foreground uppercase transition-colors"
        >
          View Full Audit Trail
        </button>
      </div>
    </div>
  );
};
