import React from "react";
import type { WatchlistUser } from "../types/fraud.types";

interface SuspiciousWatchlistTableProps {
  users: WatchlistUser[];
  onReview: (user: WatchlistUser) => void;
  isLoading?: boolean;
}

export const SuspiciousWatchlistTable: React.FC<SuspiciousWatchlistTableProps> = ({
  users,
  onReview,
  isLoading,
}) => {
  return (
    <div className="rounded-xl border border-border/80 bg-card/70 backdrop-blur-md p-5 mt-4">
      <div className="flex items-center justify-between pb-3">
        <h2 className="text-base font-semibold text-foreground">Suspicious Activity Watchlist</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              <th className="py-3 px-3">User</th>
              <th className="py-3 px-3">Role</th>
              <th className="py-3 px-3">Cancellation Rate</th>
              <th className="py-3 px-3">Duplicate Signal</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30 text-xs">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-muted-foreground">
                  Loading watchlist...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-muted-foreground">
                  No users on suspicious watchlist
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const isHighRate = user.cancellationRate >= 50;
                const isMediumRate = user.cancellationRate >= 25 && user.cancellationRate < 50;
                const barColor = isHighRate
                  ? "bg-rose-500"
                  : isMediumRate
                  ? "bg-amber-500"
                  : "bg-emerald-500";
                const textColor = isHighRate
                  ? "text-rose-400"
                  : isMediumRate
                  ? "text-amber-400"
                  : "text-emerald-400";

                return (
                  <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center font-semibold text-primary shrink-0 border border-primary/30">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                          ) : (
                            user.name.charAt(0)
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate">{user.name}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-muted-foreground font-medium">
                      {user.role}
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="w-28 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className={`font-semibold ${textColor}`}>{user.cancellationRate}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${barColor}`}
                            style={{ width: `${Math.min(100, user.cancellationRate)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      {user.duplicateSignalStatus === "YES (HIGH)" ? (
                        <span className="font-bold text-rose-400 text-[11px]">
                          YES (HIGH)
                        </span>
                      ) : user.duplicateSignalStatus === "SUSPICIOUS" ? (
                        <span className="font-semibold text-amber-400 text-[11px]">
                          SUSPICIOUS
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-[11px]">No Match</span>
                      )}
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            user.status === "ACTIVE"
                              ? "bg-emerald-500"
                              : user.status === "FLAGGED"
                              ? "bg-rose-500"
                              : "bg-amber-500"
                          }`}
                        />
                        <span className="font-semibold text-[11px] tracking-wider text-muted-foreground uppercase">
                          {user.status}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => onReview(user)}
                        className="px-3.5 py-1.5 text-xs font-semibold rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-150 shadow-sm"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
