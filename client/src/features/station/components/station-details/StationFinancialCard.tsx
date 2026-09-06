export default function StationFinancialCard() {
  return (
    <div className="bg-[#191f31] p-6 sm:p-8 rounded-2xl border border-[#adc6ff]/10 space-y-6">
      <h3 className="text-lg font-bold text-white">Financial Overview</h3>

      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-[#8c909f] font-semibold">
            <span>Monthly Payout Progress</span>
            <span className="text-white">$12.4k / $15k</span>
          </div>
          <div className="w-full bg-[#2e3447] h-2 rounded-full overflow-hidden">
            <div className="bg-[#4ae176] h-full w-[82%] rounded-full"></div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-[#151b2d] rounded-xl border border-white/5 space-y-1">
            <div className="text-[10px] font-bold text-[#8c909f] uppercase">Taxes</div>
            <div className="text-base font-bold text-white">$842.10</div>
          </div>
          <div className="p-4 bg-[#151b2d] rounded-xl border border-white/5 space-y-1">
            <div className="text-[10px] font-bold text-[#8c909f] uppercase">Fee (5%)</div>
            <div className="text-base font-bold text-white">$192.00</div>
          </div>
        </div>

        <button
          type="button"
          className="w-full py-3.5 bg-[#2e3447] hover:bg-[#3e495d] text-[#adc6ff] text-sm font-bold rounded-xl transition-all cursor-pointer shadow-md"
        >
          Withdraw Earnings
        </button>
      </div>
    </div>
  )
}
