import { useMemo } from "react"
import { Building, Shield } from "lucide-react"
import OnboardingDetailsSummary from "./OnboardingDetailsSummary"
import { DataTable, type Column } from "@/shared/components/data-table"
import type { User, OwnerStation } from "../../types"

interface OwnerProfileOverviewCardProps {
  user: User
  stations: OwnerStation[]
}

export default function OwnerProfileOverviewCard({
  user,
  stations,
}: OwnerProfileOverviewCardProps) {
  const columns: Column<OwnerStation>[] = useMemo(
    () => [
      {
        id: "name",
        header: "Station Name",
        accessor: "name",
        cell: (s) => <span className="font-extrabold text-foreground">{s.name}</span>,
      },
      {
        id: "location",
        header: "Location",
        accessor: "location",
        cell: (s) => <span className="text-muted-foreground">{s.location}</span>,
      },
      {
        id: "status",
        header: "Status",
        accessor: "status",
        cell: (s) => (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded font-bold border text-[9px] uppercase ${
              s.status === "ONLINE"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : s.status === "MAINTENANCE"
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  : "bg-slate-500/10 text-muted-foreground border-slate-500/20"
            }`}
          >
            {s.status}
          </span>
        ),
      },
      {
        id: "sessions",
        header: "Total Sessions",
        accessor: "sessions",
        cell: (s) => (
          <span className="font-black text-foreground">{s.sessions.toLocaleString()}</span>
        ),
      },
    ],
    []
  )

  return (
    <div className="border border-border bg-card/60 backdrop-blur-md rounded-3xl p-5 xl:p-6 shadow-xl space-y-6 text-left">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Building size={16} className="text-primary" />
          <h2 className="text-base font-black uppercase text-foreground tracking-widest font-sans">
            Owner Profile Overview
          </h2>
        </div>
        <p className="text-muted-foreground text-xs font-medium">
          Enterprise Partner Account Overview
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-12">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={14} className="text-primary" />
            <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
              Submitted KYC &amp; Verification Details
            </h3>
          </div>

          <OnboardingDetailsSummary details={user.onboardingDetails || {}} email={user.email} />
        </div>

        <div className="lg:col-span-12 space-y-3.5 pt-4 border-t border-border/40">
          <h4 className="text-[10px] text-muted-foreground font-black tracking-widest uppercase">
            Registered Service Stations ({stations.length})
          </h4>

          <DataTable<OwnerStation>
            columns={columns}
            data={stations}
            rowKey={(s) => s._id ?? s.name}
            emptyMessage="No stations registered under this account."
          />
        </div>
      </div>
    </div>
  )
}
