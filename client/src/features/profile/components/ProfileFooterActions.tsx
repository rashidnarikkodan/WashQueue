import { Link } from "react-router-dom"
import {
  KeyRound,
  LogOut,
  Fuel,
  Calendar,
  Users,
  BarChart3,
  Wrench,
  CreditCard,
} from "lucide-react"

interface ProfileFooterActionsProps {
  onChangePasswordClick: () => void
  onSignOutClick: () => void
  isLocal?: boolean
  role?: string
}

export default function ProfileFooterActions({
  onChangePasswordClick,
  onSignOutClick,
  isLocal = true,
  role = "customer",
}: ProfileFooterActionsProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl text-card-foreground">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-foreground">Quick Role Actions & Security</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage navigation shortcuts and account security credentials
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isLocal && (
            <button
              type="button"
              onClick={onChangePasswordClick}
              className="px-5 py-2.5 rounded-xl border border-border bg-muted/50 hover:bg-muted text-foreground font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <KeyRound className="w-4 h-4 text-primary" />
              <span>Change Password</span>
            </button>
          )}

          <button
            type="button"
            onClick={onSignOutClick}
            className="px-5 py-2.5 rounded-xl border border-red-500/30 bg-red-500/5 hover:bg-red-500/10 text-red-500 font-extrabold text-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <div className="pt-4 border-t border-border/60">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground block mb-3">
          Role Shortcuts
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {role === "owner" && (
            <>
              <Link
                to="/owner/stations"
                className="p-3.5 rounded-xl bg-muted/40 hover:bg-muted/70 border border-border/60 flex items-center gap-3 transition-colors group"
              >
                <Fuel className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-foreground">My Stations</span>
              </Link>
              <Link
                to="/owner/financial-records"
                className="p-3.5 rounded-xl bg-muted/40 hover:bg-muted/70 border border-border/60 flex items-center gap-3 transition-colors group"
              >
                <CreditCard className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-foreground">Financials</span>
              </Link>
              <Link
                to="/owner/analytics"
                className="p-3.5 rounded-xl bg-muted/40 hover:bg-muted/70 border border-border/60 flex items-center gap-3 transition-colors group"
              >
                <BarChart3 className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-foreground">Analytics</span>
              </Link>
              <Link
                to="/owner/queues"
                className="p-3.5 rounded-xl bg-muted/40 hover:bg-muted/70 border border-border/60 flex items-center gap-3 transition-colors group"
              >
                <Wrench className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-foreground">Queue Board</span>
              </Link>
            </>
          )}

          {role === "manager" && (
            <>
              <Link
                to="/manager/queues"
                className="p-3.5 rounded-xl bg-muted/40 hover:bg-muted/70 border border-border/60 flex items-center gap-3 transition-colors group"
              >
                <Wrench className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-foreground">Queue Desk</span>
              </Link>
              <Link
                to="/manager/check-in"
                className="p-3.5 rounded-xl bg-muted/40 hover:bg-muted/70 border border-border/60 flex items-center gap-3 transition-colors group"
              >
                <Calendar className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-foreground">Check-in</span>
              </Link>
              <Link
                to="/manager/pre-inspection"
                className="p-3.5 rounded-xl bg-muted/40 hover:bg-muted/70 border border-border/60 flex items-center gap-3 transition-colors group"
              >
                <BarChart3 className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-foreground">Inspections</span>
              </Link>
              <Link
                to="/manager/station"
                className="p-3.5 rounded-xl bg-muted/40 hover:bg-muted/70 border border-border/60 flex items-center gap-3 transition-colors group"
              >
                <Fuel className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-foreground">Station Overview</span>
              </Link>
            </>
          )}

          {role === "admin" && (
            <>
              <Link
                to="/admin/users"
                className="p-3.5 rounded-xl bg-muted/40 hover:bg-muted/70 border border-border/60 flex items-center gap-3 transition-colors group"
              >
                <Users className="w-4 h-4 text-purple-500 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-foreground">Users</span>
              </Link>
              <Link
                to="/admin/stations"
                className="p-3.5 rounded-xl bg-muted/40 hover:bg-muted/70 border border-border/60 flex items-center gap-3 transition-colors group"
              >
                <Fuel className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-foreground">Stations</span>
              </Link>
              <Link
                to="/admin/settlements"
                className="p-3.5 rounded-xl bg-muted/40 hover:bg-muted/70 border border-border/60 flex items-center gap-3 transition-colors group"
              >
                <CreditCard className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-foreground">Settlements</span>
              </Link>
              <Link
                to="/admin/reports"
                className="p-3.5 rounded-xl bg-muted/40 hover:bg-muted/70 border border-border/60 flex items-center gap-3 transition-colors group"
              >
                <BarChart3 className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-foreground">Reports</span>
              </Link>
            </>
          )}

          {role === "customer" && (
            <>
              <Link
                to="/bookings"
                className="p-3.5 rounded-xl bg-muted/40 hover:bg-muted/70 border border-border/60 flex items-center gap-3 transition-colors group"
              >
                <Calendar className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-foreground">My Bookings</span>
              </Link>
              <Link
                to="/stations"
                className="p-3.5 rounded-xl bg-muted/40 hover:bg-muted/70 border border-border/60 flex items-center gap-3 transition-colors group"
              >
                <Fuel className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-foreground">Explore Stations</span>
              </Link>
              <Link
                to="/wallet"
                className="p-3.5 rounded-xl bg-muted/40 hover:bg-muted/70 border border-border/60 flex items-center gap-3 transition-colors group"
              >
                <CreditCard className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-foreground">My Wallet</span>
              </Link>
              <Link
                to="/issues"
                className="p-3.5 rounded-xl bg-muted/40 hover:bg-muted/70 border border-border/60 flex items-center gap-3 transition-colors group"
              >
                <Wrench className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-foreground">Support Tickets</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
