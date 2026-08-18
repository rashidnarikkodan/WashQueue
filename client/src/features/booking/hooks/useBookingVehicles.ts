import { useState, useEffect, useMemo, useCallback } from "react"
import { vehicleApi } from "@/shared/apis/vehicle.api"
import type { Vehicle, CreateVehicleInput } from "@/features/vehicle/types"
import type { StationDetails, StationPricing } from "@/features/station/types"

interface UseBookingVehiclesParams {
  station: StationDetails | null
  stationId?: string | null
}

export function useBookingVehicles({ station, stationId }: UseBookingVehiclesParams) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [isVehiclesLoading, setIsVehiclesLoading] = useState(true)
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null)
  const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = useState(false)
  const [isAddingVehicle, setIsAddingVehicle] = useState(false)

  // Fetch User Vehicles
  const loadUserVehicles = useCallback(async () => {
    try {
      const data = await vehicleApi.getVehicles()
      setVehicles(data)
    } catch {
      // Ignore API errors gracefully
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

  // Station Supported Class IDs Set
  const stationClassIds = useMemo<Set<string> | null>(() => {
    if (!station?.pricing || station.pricing.length === 0) return null
    return new Set(
      station.pricing
        .filter((p: StationPricing) => p.isActive !== false)
        .map((p: StationPricing) => p.vehicleClassId)
    )
  }, [station])

  // Available Vehicles matching station's supported classes
  const availableVehicles = useMemo(() => {
    if (!stationClassIds) return []
    return vehicles.filter((v) => v.classId && stationClassIds.has(v.classId))
  }, [vehicles, stationClassIds])

  // Combined Loading State to prevent dual rendering / UI flicker
  const isStep1Loading = isVehiclesLoading || (Boolean(stationId) && !station)

  // Keep selected vehicle ID synced to valid available vehicle
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

  // Selected Vehicle Object
  const selectedVehicle = useMemo(
    () => availableVehicles.find((v) => v.id === selectedVehicleId) || availableVehicles[0] || null,
    [availableVehicles, selectedVehicleId]
  )

  // Handle Add Vehicle Submission from Modal
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
  }
}
