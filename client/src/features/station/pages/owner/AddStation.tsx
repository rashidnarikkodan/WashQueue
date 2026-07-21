import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { toast } from "sonner"
import { AlertTriangle, Info } from "lucide-react"
import { Stepper } from "@/shared/components/stepper"
import { ADD_STATION_STEPPER } from "../../config/stepper.config"
import { stationApi } from "@/shared/apis/station.api"
import { getErrorMessage } from "@/shared/utils/error"
import { STATION_STATUS } from "../../types"
import type { CreateStationInput, ExtraServiceInput, StationImage } from "../../types"

// Form Step Components
import {
  StationDetailsForm,
  AvailabilityForm,
  PricingConfigurationForm,
  ExtraServicesForm,
  ReviewSubmit,
} from "../../components/station-forms"

import type { StationDetailsFormData, AvailabilityFormData } from "../../schemas/station.schema"
import type { PricingItem } from "../../components/station-forms/PricingConfigurationForm"

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/

const compressImage = (file: File, maxWidth = 1200, quality = 0.8): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        let width = img.width
        let height = img.height

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height)
          resolve(canvas.toDataURL("image/jpeg", quality))
        } else {
          resolve((event.target?.result as string) || "")
        }
      }
      img.onerror = () => resolve((event.target?.result as string) || "")
      img.src = (event.target?.result as string) || ""
    }
    reader.readAsDataURL(file)
  })
}

export default function AddStation() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editStationId = searchParams.get("editStationId")

  // Orchestrator State
  const [activeStep, setActiveStep] = useState<number>(1)
  const [stationId, setStationId] = useState<string | null>(editStationId)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Status & Rejection Tracking
  const [stationStatus, setStationStatus] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState<string | null>(null)
  const [existingImages, setExistingImages] = useState<StationImage[]>([])

  // Accumulated Form Data
  const [stationDetails, setStationDetails] = useState<StationDetailsFormData | null>(null)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [availability, setAvailability] = useState<
    (AvailabilityFormData & { holidays?: { date: string; reason?: string }[] }) | null
  >(null)
  const [pricing, setPricing] = useState<PricingItem[]>([])
  const [extraServicesData, setExtraServicesData] = useState<{
    amenities: string[]
    extraServices: ExtraServiceInput[]
  } | null>(null)

  // Load existing station data if editing/resuming draft or rejected station
  useEffect(() => {
    if (!editStationId) return

    const loadDraftStation = async () => {
      setIsLoading(true)
      try {
        const detail = await stationApi.getStationById(editStationId)
        const s = detail.station
        setStationId(s.id)
        setStationStatus(s.status)
        setRejectionReason(s.rejectionReason || null)
        setExistingImages(s.images || [])

        setStationDetails({
          name: s.name,
          phone: s.contact?.phone || "",
          email: s.contact?.email || "",
          description: s.description || "",
          street: s.address?.street || "",
          city: s.address?.city || "",
          district: "",
          state: s.address?.state || "",
          country: s.address?.country || "India",
          pincode: s.address?.pincode || "",
          latitude: s.location?.latitude || 0,
          longitude: s.location?.longitude || 0,
        })

        if (s.operatingHours && s.operatingHours.length > 0) {
          setAvailability({
            operatingHours: s.operatingHours,
            holidays: s.holidays
              ? s.holidays.map((h) => ({ date: String(h.date), reason: h.reason }))
              : [],
            ...(s.slotConfig || {
              bays: 1,
              windowDurationMins: 30,
              capacityPerWindow: 1,
              walkInReservedSlots: 0,
              maxAdvanceBookingDays: 7,
              bufferBetweenWindowsMins: 5,
              allowWalkIns: true,
            }),
          })
        }

        if (detail.pricing && detail.pricing.length > 0) {
          setPricing(
            detail.pricing.map((p) => ({
              vehicleClassId: p.vehicleClassId,
              halfWashPrice: p.halfWashPrice,
              fullWashPrice: p.fullWashPrice,
              isActive: p.isActive,
            }))
          )
        }

        if (s.amenities || detail.extraServices) {
          setExtraServicesData({
            amenities: s.amenities || [],
            extraServices: (detail.extraServices || []).map((es) => ({
              id: es.id,
              name: es.name,
              description: es.description || "",
              pricing: es.pricing || [],
              isActive: es.isActive ?? true,
            })),
          })
        }

        // Set active step based on progress
        if (s.name && s.operatingHours?.length && detail.pricing?.length) {
          setActiveStep(4)
        } else if (s.name && s.operatingHours?.length) {
          setActiveStep(3)
        } else if (s.name) {
          setActiveStep(2)
        }
      } catch (err) {
        const msg = getErrorMessage(err, "Failed to load station for editing.")
        setError(msg)
        toast.error(msg)
      } finally {
        setIsLoading(false)
      }
    }

    loadDraftStation()
  }, [editStationId])

  // Step 1: Submit Station Details
  const handleStep1Submit = async (
    data: StationDetailsFormData,
    images: File[],
    remainingExistingImages: StationImage[],
    deletedPublicIds: string[]
  ) => {
    setIsLoading(true)
    setError(null)
    setStationDetails(data)
    setImageFiles(images)
    setExistingImages(remainingExistingImages)

    const newlyProcessedImages = await Promise.all(
      images.map(async (file, idx) => {
        const dataUrl = await compressImage(file)
        return {
          url: dataUrl,
          publicId: `img_${Date.now()}_${idx}`,
          isPrimary: remainingExistingImages.length === 0 && idx === 0,
        }
      })
    )

    const combinedImages = [...remainingExistingImages, ...newlyProcessedImages]

    const payload: CreateStationInput = {
      name: data.name,
      description: data.description || "",
      contact: {
        phone: data.phone,
        email: data.email,
      },
      location: {
        latitude: data.latitude,
        longitude: data.longitude,
      },
      address: {
        street: data.street,
        city: data.city,
        state: data.state,
        country: data.country,
        pincode: data.pincode,
      },
      images: combinedImages,
    }

    try {
      if (!stationId) {
        // First time creating station draft
        const res = await stationApi.createStation(payload)
        setStationId(res.stationId)
      } else {
        // Updating existing draft or rejected station
        await stationApi.updateStation(stationId, {
          step: 1,
          name: data.name,
          description: data.description,
          contact: { phone: data.phone, email: data.email },
          location: { latitude: data.latitude, longitude: data.longitude },
          address: {
            street: data.street,
            city: data.city,
            state: data.state,
            country: data.country,
            pincode: data.pincode,
          },
          images: combinedImages,
          deletedImagePublicIds: deletedPublicIds.length > 0 ? deletedPublicIds : undefined,
        })
      }
      setActiveStep(2)
    } catch (err) {
      const msg = getErrorMessage(err, "Failed to save station details.")
      setError(msg)
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  // Step 2: Submit Availability
  const handleStep2Submit = async (
    data: AvailabilityFormData & { holidays?: { date: string; reason?: string }[] }
  ) => {
    if (!stationId) {
      toast.error("Station ID missing. Please complete Step 1 first.")
      return
    }
    setIsLoading(true)
    setError(null)
    setAvailability(data)

    try {
      await stationApi.updateStation(stationId, {
        step: 2,
        operatingHours: data.operatingHours,
        holidays: data.holidays || [],
        slotConfig: {
          bays: data.bays,
          windowDurationMins: data.windowDurationMins,
          capacityPerWindow: data.capacityPerWindow,
          walkInReservedSlots: data.walkInReservedSlots,
          maxAdvanceBookingDays: data.maxAdvanceBookingDays,
          bufferBetweenWindowsMins: data.bufferBetweenWindowsMins,
          allowWalkIns: data.allowWalkIns,
        },
      })
      setActiveStep(3)
    } catch (err) {
      const msg = getErrorMessage(err, "Failed to save availability settings.")
      setError(msg)
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  // Step 3: Submit Pricing
  const handleStep3Submit = async (pricingList: PricingItem[]) => {
    if (!stationId) {
      toast.error("Station ID missing. Please complete Step 1 first.")
      return
    }
    setIsLoading(true)
    setError(null)
    setPricing(pricingList)

    const validPricing = pricingList.filter((p) => OBJECT_ID_REGEX.test(p.vehicleClassId))

    if (validPricing.length === 0) {
      const msg = "Please configure pricing for at least one valid vehicle class."
      setError(msg)
      toast.error(msg)
      setIsLoading(false)
      return
    }

    try {
      await stationApi.updateStation(stationId, {
        step: 3,
        pricing: validPricing,
      })
      setActiveStep(4)
    } catch (err) {
      const msg = getErrorMessage(err, "Failed to save pricing configuration.")
      setError(msg)
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  // Step 4: Submit Extra Services & Amenities
  const handleStep4Submit = async (data: {
    amenities: string[]
    extraServices: ExtraServiceInput[]
  }) => {
    if (!stationId) {
      toast.error("Station ID missing. Please complete Step 1 first.")
      return
    }
    setIsLoading(true)
    setError(null)
    setExtraServicesData(data)

    const cleanedExtraServices = data.extraServices
      .filter((s) => s.name.trim().length >= 2 && !s.isDeleted)
      .map((s) => ({
        ...s,
        id: s.id && OBJECT_ID_REGEX.test(s.id) ? s.id : undefined,
        pricing: s.pricing.filter((p) => OBJECT_ID_REGEX.test(p.vehicleClassId)),
      }))
      .filter((s) => s.pricing.length > 0)

    try {
      await stationApi.updateStation(stationId, {
        step: 4,
        amenities: data.amenities,
        extraServices: cleanedExtraServices,
      })
      setActiveStep(5)
    } catch (err) {
      const msg = getErrorMessage(err, "Failed to save extra services.")
      setError(msg)
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  // Step 5: Final Review & Submit
  const handleFinalSubmit = async () => {
    if (!stationId) {
      toast.error("Station ID missing. Cannot submit.")
      return
    }
    setIsLoading(true)
    setError(null)

    try {
      await stationApi.submitStation(stationId)
      toast.success("Station submitted for review successfully!")
      navigate("/owner/stations")
    } catch (err) {
      const msg = getErrorMessage(err, "Failed to submit station for review.")
      setError(msg)
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    navigate("/owner/stations")
  }

  return (
    <div className="w-full max-w-[1650px] mx-auto flex flex-col lg:flex-row items-start justify-center gap-6 lg:gap-16 px-4 py-8 sm:px-8">
      {/* Left Column: Form Step Tracking */}
      <div className="w-full lg:w-auto lg:sticky lg:top-8 shrink-0">
        <Stepper
          steps={ADD_STATION_STEPPER}
          currentStep={activeStep}
          heading={stationStatus === STATION_STATUS.REJECTED ? "Retry Station Setup" : "Add Wash Station."}
          description="Setup station details, availability, pricing and services."
          footerNote="Application will be reviewed before activation."
        />
      </div>

      {/* Right Column: Main Form Card Container */}
      <div className="grow max-w-6xl bg-transparent sm:bg-card border-0 sm:border border-slate-800/80 rounded-none sm:rounded-3xl p-4 sm:p-8 md:p-10 shadow-none sm:shadow-2xl relative z-10 w-full max-h-none sm:max-h-210 overflow-y-visible sm:overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800/60 scrollbar-track-transparent">
        {/* Rejection Notice Banner */}
        {stationStatus === STATION_STATUS.REJECTED && (
          <div className="mb-6 p-4 border border-red-500/30 bg-red-500/10 rounded-2xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-extrabold text-red-300">Station Application Rejected</h4>
              <p className="text-xs text-red-200/90 mt-1 leading-relaxed">
                {rejectionReason || "Your previous station application was rejected. Please review and update the required information below, then click Submit in Step 5."}
              </p>
            </div>
          </div>
        )}

        {/* Draft Notice Banner */}
        {stationStatus === STATION_STATUS.DRAFT && (
          <div className="mb-6 p-4 border border-blue-500/30 bg-blue-500/10 rounded-2xl flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-extrabold text-blue-300">Resuming Saved Draft</h4>
              <p className="text-xs text-blue-200/90 mt-1 leading-relaxed">
                You are continuing the setup for your drafted wash station. You can edit any step below.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 border border-red-500/20 bg-red-500/10 rounded-2xl text-red-300 text-sm">
            {error}
          </div>
        )}

        {activeStep === 1 && (
          <StationDetailsForm
            initialValues={{
              ...stationDetails,
              images: imageFiles,
              existingImages: existingImages,
            }}
            onSubmit={handleStep1Submit}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        )}

        {activeStep === 2 && (
          <AvailabilityForm
            initialValues={availability || undefined}
            onSubmit={handleStep2Submit}
            onBack={() => setActiveStep(1)}
            isLoading={isLoading}
          />
        )}

        {activeStep === 3 && (
          <PricingConfigurationForm
            initialValues={pricing}
            onSubmit={handleStep3Submit}
            onBack={() => setActiveStep(2)}
            isLoading={isLoading}
          />
        )}

        {activeStep === 4 && (
          <ExtraServicesForm
            initialValues={extraServicesData || undefined}
            onSubmit={handleStep4Submit}
            onBack={() => setActiveStep(3)}
            isLoading={isLoading}
          />
        )}

        {activeStep === 5 && (
          <ReviewSubmit
            stationDetails={stationDetails || undefined}
            imageFiles={imageFiles}
            existingImages={existingImages}
            availability={availability || undefined}
            pricing={pricing}
            extraServicesData={extraServicesData || undefined}
            onEditStep={(stepNum) => setActiveStep(stepNum)}
            onBack={() => setActiveStep(4)}
            onSubmit={handleFinalSubmit}
            isLoading={isLoading}
            error={error}
          />
        )}
      </div>
    </div>
  )
}
