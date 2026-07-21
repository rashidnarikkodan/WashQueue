import { useState } from "react"
import { ChevronDown, Car, Bike } from "lucide-react"
import type { StationPricing } from "../../types"

interface StationPricingSectionProps {
  pricing?: StationPricing[]
}

export function StationPricingSection({ pricing = [] }: StationPricingSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState("Car")

  return (
    <div className="space-y-6">
      {/* Header & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
          Select Category &amp; Class
        </h2>

        {/* Category Dropdown Pill */}
        <div className="relative inline-block">
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-xs font-semibold text-slate-300">
            {selectedCategory === "Car" ? <Car size={16} className="text-blue-400" /> : <Bike size={16} className="text-blue-400" />}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent border-none text-slate-200 focus:outline-none cursor-pointer font-bold pr-4 appearance-none"
            >
              <option value="Car" className="bg-slate-900 text-white">Car Catalog</option>
              <option value="Bike" className="bg-slate-900 text-white">Bike Catalog</option>
              <option value="Commercial" className="bg-slate-900 text-white">Commercial Vehicles</option>
            </select>
            <ChevronDown size={14} className="text-slate-400 pointer-events-none -ml-4" />
          </div>
        </div>
      </div>

      {/* Pricing Table Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
        <div className="grid grid-cols-12 px-6 py-4 border-b border-slate-800 bg-slate-950/40 text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
          <div className="col-span-6">Type / Vehicle Class</div>
          <div className="col-span-3 text-right">Half Wash</div>
          <div className="col-span-3 text-right">Full Wash</div>
        </div>

        <div className="divide-y divide-slate-800/60">
          {pricing && pricing.length > 0 ? (
            pricing.map((p, idx) => (
              <div
                key={idx}
                className="grid grid-cols-12 px-6 py-5 items-center hover:bg-blue-500/[0.02] transition-colors"
              >
                <div className="col-span-6 space-y-1">
                  <h4 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    {p.vehicleClassId}
                  </h4>
                  <p className="text-xs text-slate-400">
                    High-pressure foam wash + Blow dry + Interior vacuum
                  </p>
                </div>

                <div className="col-span-3 text-right font-black text-xl text-blue-400">
                  ₹{p.halfWashPrice}
                </div>

                <div className="col-span-3 text-right font-black text-xl text-blue-400">
                  ₹{p.fullWashPrice}
                </div>
              </div>
            ))
          ) : (
            // Default Demo Rows matching Figma spec if no API pricing configured
            <>
              <div className="grid grid-cols-12 px-6 py-5 items-center hover:bg-blue-500/[0.02] transition-colors">
                <div className="col-span-6 space-y-1">
                  <h4 className="text-base font-bold text-slate-100">Hatchback</h4>
                  <p className="text-xs text-slate-400">High-pressure wash + Blow dry + Tire shine</p>
                </div>
                <div className="col-span-3 text-right font-black text-xl text-blue-400">₹400.00</div>
                <div className="col-span-3 text-right font-black text-xl text-blue-400">₹500.00</div>
              </div>

              <div className="grid grid-cols-12 px-6 py-5 items-center hover:bg-blue-500/[0.02] transition-colors">
                <div className="col-span-6 space-y-1">
                  <h4 className="text-base font-bold text-slate-100">Sedan</h4>
                  <p className="text-xs text-slate-400">Deep vacuum + Leather conditioning + Steam sanitize</p>
                </div>
                <div className="col-span-3 text-right font-black text-xl text-blue-400">₹450.00</div>
                <div className="col-span-3 text-right font-black text-xl text-blue-400">₹600.00</div>
              </div>

              <div className="grid grid-cols-12 px-6 py-5 items-center bg-blue-500/[0.05] hover:bg-blue-500/[0.08] transition-colors">
                <div className="col-span-6 space-y-1">
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    SUV <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-md border border-blue-500/30">Popular</span>
                  </h4>
                  <p className="text-xs text-slate-400">Ceramic coating + Clay bar + Paint correction</p>
                </div>
                <div className="col-span-3 text-right font-black text-xl text-blue-400">₹600.00</div>
                <div className="col-span-3 text-right font-black text-xl text-blue-400">₹800.00</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
