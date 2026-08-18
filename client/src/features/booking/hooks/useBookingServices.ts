import { useState, useMemo, useCallback } from "react"
import type { StationDetails, StationPricing, ExtraService } from "@/features/station/types"
import type { Vehicle } from "@/features/vehicle/types"
import type {
  ServicePlanOption,
  ExtraServiceOption,
} from "../components/ServiceSelectionStep"

interface UseBookingServicesParams {
  station: StationDetails | null
  selectedVehicle: Vehicle | null
}

export function useBookingServices({ station, selectedVehicle }: UseBookingServicesParams) {
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>("HALF_WASH")
  const [selectedExtraIds, setSelectedExtraIds] = useState<string[]>([])

  // Match Station Pricing based on Selected Vehicle's classId
  const matchingPricing = useMemo<StationPricing | null>(() => {
    if (!station?.pricing || station.pricing.length === 0) return null
    if (selectedVehicle?.classId) {
      const found = station.pricing.find(
        (p: StationPricing) => p.vehicleClassId === selectedVehicle.classId
      )
      if (found) return found
    }
    return station.pricing[0]
  }, [station, selectedVehicle])

  // Derive Service Plans from matched vehicle class pricing
  const plans: ServicePlanOption[] = useMemo(() => {
    const p = matchingPricing
    if (p) {
      return [
        {
          id: "HALF_WASH",
          name: "Express Half Wash",
          price: p.halfWashPrice,
          durationMins: 30,
          description:
            "Exterior foam wash, pressure rinse, wheel cleaning, and exterior window buffing.",
        },
        {
          id: "FULL_WASH",
          name: "Complete Full Wash",
          price: p.fullWashPrice,
          durationMins: 60,
          description:
            "Full body foam wash, interior vacuuming, dashboard wipe down, tire polish & underbody wash.",
        },
      ]
    }

    return []
  }, [matchingPricing])

  // Derive Extra Services dynamically based on vehicle classId
  const extraServices: ExtraServiceOption[] = useMemo(() => {
    if (station?.extraServices && station.extraServices.length > 0) {
      return station.extraServices.map((e: ExtraService) => {
        const classPricing = e.pricing?.find(
          (p: { vehicleClassId: string; price: number }) =>
            p.vehicleClassId === selectedVehicle?.classId
        )
        const price = classPricing ? classPricing.price : e.pricing?.[0]?.price || 0
        return {
          id: e.id,
          name: e.name,
          price,
          description: e.description,
        }
      })
    }
    return []
  }, [station, selectedVehicle])

  const selectedPlan = useMemo(
    () => plans.find((p) => p.id === selectedPlanId) || null,
    [plans, selectedPlanId]
  )

  const selectedExtras = useMemo(
    () => extraServices.filter((e) => selectedExtraIds.includes(e.id)),
    [extraServices, selectedExtraIds]
  )

  const totalPrice = useMemo(() => {
    const base = selectedPlan ? selectedPlan.price : 0
    const extras = selectedExtras.reduce((sum, item) => sum + item.price, 0)
    return base + extras
  }, [selectedPlan, selectedExtras])

  const toggleExtraService = useCallback((id: string) => {
    setSelectedExtraIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }, [])

  return {
    plans,
    selectedPlan,
    selectedPlanId,
    setSelectedPlanId,
    extraServices,
    selectedExtras,
    selectedExtraIds,
    setSelectedExtraIds,
    toggleExtraService,
    totalPrice,
  }
}
