import { useState } from "react"
import { Clock } from "lucide-react"
import type { Booking } from "../../types"
import { DataTable } from "@/shared/components/data-table"

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

        <div className="mt-4">
          <DataTable
            variant="widget"
            columns={[
              {
                id: "id",
                header: "Booking ID",
                cell: (b: Booking) => <span className="font-bold text-[#ADC6FF]">{b.id}</span>,
              },
              {
                id: "station",
                header: "Station",
                cell: (b: Booking) => <span className="font-semibold text-foreground">{b.stationName}</span>,
              },
              {
                id: "vehicle",
                header: "Vehicle",
                cell: (b: Booking) => <span className="text-muted-foreground">{b.vehicle}</span>,
              },
              {
                id: "date",
                header: "Date",
                cell: (b: Booking) => <span className="text-muted-foreground">{b.date}</span>,
              },
              {
                id: "amount",
                header: "Amount",
                cell: (b: Booking) => <span className="font-black text-foreground">${b.amount.toFixed(2)}</span>,
              },
              {
                id: "status",
                header: "Status",
                align: "right",
                cell: (b: Booking) => (
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
                ),
              },
            ]}
            data={displayedBookings}
            rowKey={(b) => b.id}
            emptyMessage="No bookings found matching filter."
            pagination={{
              page: currentPage,
              totalPages,
              total: filteredBookings.length,
              limit: bookingsPerPage,
              hasNextPage: currentPage < totalPages,
              hasPrevPage: currentPage > 1,
            }}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  )
}
