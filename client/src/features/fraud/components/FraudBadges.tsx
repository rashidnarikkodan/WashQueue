import React from "react";
import { ShieldAlert, AlertTriangle, CheckCircle, Clock, XCircle } from "lucide-react";
import type { RiskLevel, FraudEventStatus, ActorType } from "../types/fraud.types";

export const RiskLevelBadge: React.FC<{ level: RiskLevel | string }> = ({ level }) => {
  const norm = String(level).toUpperCase();
  if (norm === "HIGH") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
        <ShieldAlert size={12} className="shrink-0" />
        HIGH SEVERITY
      </span>
    );
  }
  if (norm === "MEDIUM") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
        <AlertTriangle size={12} className="shrink-0" />
        MEDIUM SEVERITY
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
      <CheckCircle size={12} className="shrink-0" />
      LOW SEVERITY
    </span>
  );
};

export const FraudStatusBadge: React.FC<{ status: FraudEventStatus | string }> = ({ status }) => {
  const norm = String(status).toUpperCase();
  if (norm === "OPEN") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
        OPEN
      </span>
    );
  }
  if (norm === "REVIEWING") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
        <Clock size={12} />
        REVIEWING
      </span>
    );
  }
  if (norm === "RESOLVED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <CheckCircle size={12} />
        RESOLVED
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">
      <XCircle size={12} />
      DISMISSED
    </span>
  );
};

export const ActorRoleBadge: React.FC<{ role: ActorType | string }> = ({ role }) => {
  const norm = String(role).toUpperCase();
  if (norm === "OWNER") {
    return (
      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-500/15 text-blue-400 border border-blue-500/25">
        Owner
      </span>
    );
  }
  if (norm === "MANAGER") {
    return (
      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-purple-500/15 text-purple-400 border border-purple-500/25">
        Manager
      </span>
    );
  }
  if (norm === "ADMIN") {
    return (
      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-rose-500/15 text-rose-400 border border-rose-500/25">
        Admin
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-500/15 text-slate-300 border border-slate-500/25">
      Customer
    </span>
  );
};
