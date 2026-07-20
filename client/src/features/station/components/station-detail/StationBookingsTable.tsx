import { Car } from "lucide-react"

export default function StationBookingsTable() {
  const mockBookings = [
    {
      vehicle: "Tesla Model Y",
      plate: "AB-1234",
      service: "Ceramic Ultra Coat",
      status: "In Bay",
      amount: "$125.00",
      statusVariant: "in-bay",
    },
    {
      vehicle: "BMW iX",
      plate: "WQ-9921",
      service: "Premium Wash",
      status: "Queued",
      amount: "$45.00",
      statusVariant: "queued",
    },
    {
      vehicle: "Audi e-tron GT",
      plate: "EV-5501",
      service: "Full Express Detail",
      status: "Queued",
      amount: "$85.00",
      statusVariant: "queued",
    },
  ]

  return (
    <div className="bg-[#151b2d] rounded-2xl border border-white/5 overflow-hidden">
      <div className="p-6 sm:p-8 flex justify-between items-center border-b border-slate-800/80">
        <h2 className="text-xl font-extrabold text-[#dce1fb] tracking-tight">Active Bookings</h2>
        <button type="button" className="text-[#adc6ff] hover:underline text-sm font-bold cursor-pointer">
          View History
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[#8c909f] text-[10px] font-bold uppercase tracking-widest bg-[#191f31]/60 border-b border-slate-800/80">
              <th className="px-6 sm:px-8 py-4">Vehicle</th>
              <th className="px-6 sm:px-8 py-4">Service</th>
              <th className="px-6 sm:px-8 py-4">Status</th>
              <th className="px-6 sm:px-8 py-4 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-sm">
            {mockBookings.map((b, idx) => (
              <tr key={idx} className="hover:bg-[#23293c]/50 transition-colors">
                <td className="px-6 sm:px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#2e3447] rounded-xl flex items-center justify-center text-[#adc6ff]">
                      <Car size={20} />
                    </div>
                    <div>
                      <div className="font-bold text-white">{b.vehicle}</div>
                      <div className="text-xs text-[#8c909f]">{b.plate}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 sm:px-8 py-5 text-[#c2c6d6] font-medium">{b.service}</td>
                <td className="px-6 sm:px-8 py-5">
                  <span
                    className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                      b.statusVariant === "in-bay"
                        ? "bg-[#4ae176]/15 text-[#4ae176] border border-[#4ae176]/30"
                        : "bg-[#adc6ff]/15 text-[#adc6ff] border border-[#adc6ff]/30"
                    }`}
                  >
                    {b.status}
                  </span>
                </td>
                <td className="px-6 sm:px-8 py-5 text-right font-bold text-white">{b.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
