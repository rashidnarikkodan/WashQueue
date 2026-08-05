import { Building, Shield } from "lucide-react"
import OnboardingDetailsSummary from "./OnboardingDetailsSummary"
import type { User, OwnerStation } from "../../types"

interface OwnerProfileOverviewCardProps {
  user: User
  stations: OwnerStation[]
}

export default function OwnerProfileOverviewCard({
  user,
  stations,
}: OwnerProfileOverviewCardProps) {
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
        {/* Onboarding Documents and Details Section */}
        <div className="lg:col-span-12">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={14} className="text-primary" />
            <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
              Submitted KYC &amp; Verification Details
            </h3>
          </div>

          <OnboardingDetailsSummary details={user.onboardingDetails || {}} email={user.email} />
        </div>

        {/* Manage stations side */}
        <div className="lg:col-span-12 space-y-3.5 pt-4 border-t border-border/40">
          <h4 className="text-[10px] text-muted-foreground font-black tracking-widest uppercase">
            Registered Service Stations ({stations.length})
          </h4>

          <div className="overflow-x-auto border border-border/40 rounded-2xl bg-background/20">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
                  <th className="p-3">Station Name</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Total Sessions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {stations.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-muted-foreground font-medium">
                      No stations registered under this account.
                    </td>
                  </tr>
                ) : (
                  stations.map((s, idx) => (
                    <tr key={idx} className="hover:bg-slate-850/10">
                      <td className="p-3 font-extrabold text-foreground">{s.name}</td>
                      <td className="p-3 text-muted-foreground">{s.location}</td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded font-bold border text-[9px] ${
                            s.status === "ONLINE"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : s.status === "MAINTENANCE"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                : "bg-slate-500/10 text-muted-foreground border-slate-500/20"
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="p-3 text-right font-black text-foreground">
                        {s.sessions.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
