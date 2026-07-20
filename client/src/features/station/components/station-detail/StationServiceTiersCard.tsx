import { Settings, Sparkles } from "lucide-react"
import type { PricingItem } from "../station-forms/PricingConfigurationForm"

interface StationServiceTiersCardProps {
  pricing?: PricingItem[]
  onEditPricing?: () => void
}

export default function StationServiceTiersCard({
  pricing = [],
  onEditPricing,
}: StationServiceTiersCardProps) {
  const defaultTiers = [
    { name: "Basic Wash", duration: "12 min • Standard Dry", price: "$25", featured: false },
    { name: "Hydro Elite", duration: "25 min • Ceramic Finish", price: "$65", featured: true },
    { name: "Full Detail", duration: "60 min • Interior Deep", price: "$180", featured: false },
  ]

  const hasConfiguredPricing = pricing.some((p) => p.isActive && (p.halfWashPrice > 0 || p.fullWashPrice > 0))

  return (
    <div className="bg-[#151b2d] p-6 sm:p-8 rounded-2xl border border-white/5 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Sparkles size={18} className="text-[#adc6ff]" />
          <span>Service Tiers</span>
        </h3>
        <button
          type="button"
          onClick={onEditPricing}
          className="text-[#8c909f] hover:text-white transition-colors cursor-pointer p-1"
          title="Configure pricing"
        >
          <Settings size={18} />
        </button>
      </div>

      <div className="space-y-3.5">
        {!hasConfiguredPricing
          ? defaultTiers.map((tier, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border flex justify-between items-center transition-all ${
                  tier.featured
                    ? "bg-[#adc6ff]/10 border-[#adc6ff]/30 text-[#adc6ff]"
                    : "bg-[#191f31] border-white/5 text-white"
                }`}
              >
                <div>
                  <div className="font-bold text-sm">{tier.name}</div>
                  <div className="text-xs text-[#8c909f] mt-0.5">{tier.duration}</div>
                </div>
                <div className="text-lg font-extrabold text-[#adc6ff]">{tier.price}</div>
              </div>
            ))
          : pricing
              .filter((p) => p.isActive)
              .map((p, idx) => (
                <div
                  key={idx}
                  className="bg-[#191f31] p-4 rounded-xl border border-white/5 flex justify-between items-center"
                >
                  <div>
                    <div className="font-bold text-sm text-white">Class {p.vehicleClassId}</div>
                    <div className="text-xs text-[#8c909f] mt-0.5">
                      Half Wash: ${p.halfWashPrice} • Full Wash: ${p.fullWashPrice}
                    </div>
                  </div>
                  <div className="text-lg font-extrabold text-[#adc6ff]">${p.fullWashPrice}</div>
                </div>
              ))}
      </div>
    </div>
  )
}
