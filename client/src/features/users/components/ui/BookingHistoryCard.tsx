import { useState } from "react"
import { Clock } from "lucide-react"
import type { Booking } from "../../types"

interface BookingHistoryCardProps {
  bookings: Booking[]
}

export default function BookingHistoryCard({ bookings }: BookingHistoryCardProps) {
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [currentPage, setCurrentPage] = useState<number>(1)
  const bookingsPerPage = 3

  const filteredBookings = bookings.filter((b) =>
    statusFilter === "ALL" ? true : b.status === statusFilter
  )

  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / bookingsPerPage))
  const displayedBookings = filteredBookings.slice(
    (currentPage - 1) * bookingsPerPage,
    currentPage * bookingsPerPage
  )

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="border border-border bg-[#111726]/60 backdrop-blur-md rounded-2xl p-4.5 shadow-md flex flex-col justify-between">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
            Total Bookings
          </p>
          <p className="text-2xl font-black text-foreground">{bookings.length}</p>
        </div>
        <div className="border border-border bg-[#111726]/60 backdrop-blur-md rounded-2xl p-4.5 shadow-md flex flex-col justify-between">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
            Completed
          </p>
          <p className="text-2xl font-black text-emerald-400">
            {bookings.filter((b) => b.status === "COMPLETED").length}
          </p>
        </div>
        <div className="border border-border bg-[#111726]/60 backdrop-blur-md rounded-2xl p-4.5 shadow-md flex flex-col justify-between">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
            Cancelled
          </p>
          <p className="text-2xl font-black text-rose-400">
            {bookings.filter((b) => b.status === "CANCELLED").length}
          </p>
        </div>
        <div className="border border-border bg-[#111726]/60 backdrop-blur-md rounded-2xl p-4.5 shadow-md flex flex-col justify-between">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
            Pending
          </p>
          <p className="text-2xl font-black text-muted-foreground">
            {bookings.filter((b) => b.status === "PENDING").length}
          </p>
        </div>
      </div>

      <div className="border border-border bg-[#111726]/60 backdrop-blur-md rounded-3xl p-5 xl:p-6 shadow-xl space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-[#ADC6FF]" />
            <h2 className="text-base font-black uppercase text-foreground tracking-widest">
              Recent Booking History
            </h2>
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="bg-slate-900 border border-border rounded-xl px-3 py-1.5 text-xs font-semibold text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="ALL">All Status</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-150">
            <thead>
              <tr className="border-b border-border text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                <th className="pb-3">Booking ID</th>
                <th className="pb-3">Station</th>
                <th className="pb-3">Vehicle</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-xs">
              {displayedBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-muted-foreground font-medium">
                    No bookings found matching filter.
                  </td>
                </tr>
              ) : (
                displayedBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-850/10">
                    <td className="py-3.5 font-bold text-[#ADC6FF]">{b.id}</td>
                    <td className="py-3.5 font-semibold text-foreground">{b.stationName}</td>
                    <td className="py-3.5 text-muted-foreground">{b.vehicle}</td>
                    <td className="py-3.5 text-muted-foreground">{b.date}</td>
                    <td className="py-3.5 font-black text-foreground">${b.amount.toFixed(2)}</td>
                    <td className="py-3.5 text-right">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded font-bold border text-[9px] ${
                          b.status === "COMPLETED"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : b.status === "CANCELLED"
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                              : "bg-slate-500/10 text-muted-foreground border-slate-500/20"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredBookings.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-border/40 text-xs text-muted-foreground">
            <p>
              Showing {filteredBookings.length === 0 ? 0 : (currentPage - 1) * bookingsPerPage + 1}-
              {Math.min(filteredBookings.length, currentPage * bookingsPerPage)} of{" "}
              {filteredBookings.length} entries
            </p>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="p-1.5 rounded-lg border border-border hover:bg-muted disabled:opacity-50 disabled:hover:bg-transparent transition-all cursor-pointer"
              >
                &lt;
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-7 h-7 rounded-lg font-bold border transition-all cursor-pointer ${
                    currentPage === i + 1
                      ? "bg-[#ADC6FF] text-[#020617] border-[#ADC6FF]"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                className="p-1.5 rounded-lg border border-border hover:bg-muted disabled:opacity-50 disabled:hover:bg-transparent transition-all cursor-pointer"
              >
                &gt;
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
