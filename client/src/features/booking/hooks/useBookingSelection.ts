import { useState, useEffect, useMemo, useCallback } from "react"
import { vehicleApi } from "@/shared/apis/vehicle.api"
import type { Vehicle, CreateVehicleInput } from "@/features/vehicle/types"
import type { StationDetails, StationPricing, ExtraService } from "@/features/station/types"
import type { ServicePlanOption, ExtraServiceOption } from "../components/ServiceSelectionStep"

interface UseBookingSelectionParams {
  station: StationDetails | null
  stationId?: string | null
}

export function useBookingSelection({ station, stationId }: UseBookingSelectionParams) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [isVehiclesLoading, setIsVehiclesLoading] = useState(true)
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null)
  const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = useState(false)
  const [isAddingVehicle, setIsAddingVehicle] = useState(false)

  const [selectedPlanId, setSelectedPlanId] = useState<string | null>("HALF_WASH")
  const [selectedExtraIds, setSelectedExtraIds] = useState<string[]>([])

  const loadUserVehicles = useCallback(async () => {
    try {
      const data = await vehicleApi.getVehicles()
      setVehicles(data)
    } catch {
      // Failed to load user vehicles; fallback to empty state
    } finally {
      setIsVehiclesLoading(false)
    }
  }, [])

  useEffect(() => {
    let ignore = false
    void Promise.resolve().then(async () => {
      if (ignore) return
      await loadUserVehicles()
    })
    return () => {
      ignore = true
    }
  }, [loadUserVehicles])

  const stationClassIds = useMemo<Set<string> | null>(() => {
    if (!station?.pricing || station.pricing.length === 0) return null
    return new Set(
      station.pricing
        .filter((p: StationPricing) => p.isActive !== false)
        .map((p: StationPricing) => p.vehicleClassId)
    )
  }, [station])

  const availableVehicles = useMemo(() => {
    if (!stationClassIds) return []
    return vehicles.filter((v) => v.classId && stationClassIds.has(v.classId))
  }, [vehicles, stationClassIds])

  const isStep1Loading = isVehiclesLoading || (Boolean(stationId) && !station)

  useEffect(() => {
    queueMicrotask(() => {
      if (availableVehicles.length > 0) {
        const isCurrentValid = availableVehicles.some((v) => v.id === selectedVehicleId)
        if (!isCurrentValid) {
          const primary = availableVehicles.find((v) => v.isPrimary) || availableVehicles[0]
          setSelectedVehicleId(primary.id)
        }
      } else {
        setSelectedVehicleId(null)
      }
    })
  }, [availableVehicles, selectedVehicleId])

  const selectedVehicle = useMemo(
    () => availableVehicles.find((v) => v.id === selectedVehicleId) || availableVehicles[0] || null,
    [availableVehicles, selectedVehicleId]
  )

  const handleAddVehicleSubmit = async (input: CreateVehicleInput): Promise<boolean> => {
    setIsAddingVehicle(true)
    try {
      const created = await vehicleApi.createVehicle(input)
      setVehicles((data) => [...data, created])
      setSelectedVehicleId(created.id)
      setIsAddVehicleModalOpen(false)
      return true
    } catch (err) {
      console.error(err)
      return false
    } finally {
      setIsAddingVehicle(false)
    }
  }

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
    vehicles,
    availableVehicles,
    selectedVehicle,
    selectedVehicleId,
    setSelectedVehicleId,
    isStep1Loading,
    isAddVehicleModalOpen,
    setIsAddVehicleModalOpen,
    isAddingVehicle,
    handleAddVehicleSubmit,
    stationClassIds,
    refreshVehicles: loadUserVehicles,

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
