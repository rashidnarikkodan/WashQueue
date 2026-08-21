import { useState, useEffect } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { toast } from "sonner"
import { AlertTriangle, Info } from "lucide-react"
import { Stepper } from "@/shared/components/stepper"
import { ADD_STATION_STEPPER } from "../config/stepper.config"
import { stationApi } from "@/shared/apis/station.api"
import { getErrorMessage } from "@/shared/utils/error"
import { STATION_STATUS } from "../types"
import type { ExtraServiceInput, StationImage } from "../types"

import {
  StationDetailsForm,
  AvailabilityForm,
  PricingConfigurationForm,
  ExtraServicesForm,
  ReviewSubmit,
} from "../components/station-forms"

import type { StationDetailsFormData, AvailabilityFormData } from "../schemas/station.schema"
import type { PricingItem } from "../components/station-forms/PricingConfigurationForm"

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/

import { useAuthStore } from "@/features/auth/store/auth.store"

export default function AddEditStation() {
  const navigate = useNavigate()
  const params = useParams<{ stationId?: string }>()
  const [searchParams] = useSearchParams()
  const targetStationId = params.stationId || searchParams.get("editStationId") || null
  const isEditMode = Boolean(targetStationId)

  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    if (user && user.role === "owner" && !user.isVerified) {
      toast.error(
        "Your owner account is pending approval by an administrator before you can create or manage wash stations."
      )
      navigate("/owner/stations")
    }
  }, [user, navigate])

  const [activeStep, setActiveStep] = useState<number>(1)
  const [stationId, setStationId] = useState<string | null>(targetStationId)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const [stationStatus, setStationStatus] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState<string | null>(null)
  const [existingImages, setExistingImages] = useState<StationImage[]>([])

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

  useEffect(() => {
    if (!targetStationId) return

    const loadStationData = async () => {
      setIsLoading(true)
      try {
        const detail = await stationApi.getStationById(targetStationId)
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

    loadStationData()
  }, [targetStationId])

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

    const formData = new FormData()
    formData.append("name", data.name)
    formData.append("description", data.description || "")
    formData.append("contact", JSON.stringify({ phone: data.phone, email: data.email }))
    formData.append(
      "location",
      JSON.stringify({ latitude: data.latitude, longitude: data.longitude })
    )
    formData.append(
      "address",
      JSON.stringify({
        street: data.street,
        city: data.city,
        state: data.state,
        country: data.country,
        pincode: data.pincode,
      })
    )
    formData.append("images", JSON.stringify(remainingExistingImages))

    images.forEach((file) => {
      formData.append("images", file)
    })

    try {
      if (!stationId) {
        const res = await stationApi.createStation(formData)
        const newStationId = res.stationId || res.station?.id
        setStationId(newStationId)
        if (res.station?.images) {
          setExistingImages(res.station.images)
        }
        setImageFiles([])
      } else {
        formData.append("step", "1")
        if (deletedPublicIds.length > 0) {
          formData.append("deletedImagePublicIds", JSON.stringify(deletedPublicIds))
        }
        const updatedDetail = await stationApi.updateStation(stationId, formData)
        if (updatedDetail?.station?.images) {
          setExistingImages(updatedDetail.station.images)
        }
        setImageFiles([])
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
      const updatedRes = await stationApi.updateStation(stationId, {
        step: 4,
        amenities: data.amenities,
        extraServices: cleanedExtraServices,
      })

      if (updatedRes.extraServices) {
        setExtraServicesData({
          amenities: data.amenities,
          extraServices: updatedRes.extraServices.map((es) => ({
            id: es.id,
            name: es.name,
            slug: es.slug,
            description: es.description || "",
            pricing: es.pricing || [],
            isActive: es.isActive ?? true,
          })),
        })
      }

      setActiveStep(5)
    } catch (err) {
      const msg = getErrorMessage(err, "Failed to save extra services.")
      setError(msg)
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFinalSubmit = async () => {
    if (!stationId) {
      toast.error("Station ID missing. Cannot submit.")
      return
    }
    setIsLoading(true)
    setError(null)

    try {
      if (stationStatus === STATION_STATUS.DRAFT || stationStatus === STATION_STATUS.REJECTED) {
        await stationApi.submitStation(stationId)
        toast.success("Station submitted for review successfully!")
      } else {
        await stationApi.updateStation(stationId, {
          step: 1,
          status: STATION_STATUS.PENDING_REVIEW,
        })
        toast.success("Station updates submitted! Station is now pending admin review.")
      }
      if (user?.role === "manager") {
        navigate(`/manager/station/${stationId}`)
      } else {
        navigate("/owner/stations")
      }
    } catch (err) {
      const msg = getErrorMessage(err, "Failed to submit station updates.")
      setError(msg)
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    if (user?.role === "manager") {
      navigate(stationId ? `/manager/station/${stationId}` : "/manager/station")
    } else {
      navigate("/owner/stations")
    }
  }

  const stepperHeading =
    stationStatus === STATION_STATUS.REJECTED
      ? "Retry Station Setup"
      : isEditMode
        ? "Edit Wash Station"
        : "Add Wash Station"

  const stepperDescription =
    stationStatus === STATION_STATUS.REJECTED
      ? "Review & update required details to resubmit your station."
      : isEditMode
        ? "Update station details, operating hours, pricing, and services."
        : "Setup station details, availability, pricing and services."

  return (
    <div className="w-full max-w-[1650px] mx-auto flex flex-col lg:flex-row items-start justify-center gap-6 lg:gap-16 px-4 py-8 sm:px-8">
      <div className="w-full lg:w-auto lg:sticky lg:top-8 shrink-0">
        <Stepper
          steps={ADD_STATION_STEPPER}
          currentStep={activeStep}
          setActiveStep={setActiveStep}
          heading={stepperHeading}
          description={stepperDescription}
          footerNote={
            isEditMode
              ? "Station updates will be sent for review."
              : "Application will be reviewed before activation."
          }
        />
      </div>

      <div className="grow max-w-6xl bg-transparent sm:bg-card border-0 sm:border border-slate-800/80 rounded-none sm:rounded-3xl p-4 sm:p-8 md:p-10 shadow-none sm:shadow-2xl relative z-10 w-full max-h-none sm:max-h-210 overflow-y-visible sm:overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800/60 scrollbar-track-transparent">
        {stationStatus === STATION_STATUS.REJECTED && (
          <div className="mb-6 p-4 border border-red-500/30 bg-red-500/10 rounded-2xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-extrabold text-red-300">Station Application Rejected</h4>
              <p className="text-xs text-red-200/90 mt-1 leading-relaxed">
                {rejectionReason ||
                  "Your previous station application was rejected. Please review and update the required information below, then click Submit in Step 5."}
              </p>
            </div>
          </div>
        )}

        {stationStatus === STATION_STATUS.DRAFT && (
          <div className="mb-6 p-4 border border-blue-500/30 bg-blue-500/10 rounded-2xl flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-extrabold text-blue-300">Resuming Saved Draft</h4>
              <p className="text-xs text-blue-200/90 mt-1 leading-relaxed">
                You are continuing the setup for your drafted wash station. You can edit any step
                below.
              </p>
            </div>
          </div>
        )}

        {isEditMode && stationStatus === STATION_STATUS.ACTIVE && (
          <div className="mb-6 p-4 border border-emerald-500/30 bg-emerald-500/10 rounded-2xl flex items-start gap-3">
            <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-extrabold text-emerald-300">Editing Active Station</h4>
              <p className="text-xs text-emerald-200/90 mt-1 leading-relaxed">
                Updating your station will save your changes and resubmit your station for admin
                review.
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
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        )}

        {activeStep === 3 && (
          <PricingConfigurationForm
            initialValues={pricing}
            onSubmit={handleStep3Submit}
            onBack={() => setActiveStep(2)}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        )}

        {activeStep === 4 && (
          <ExtraServicesForm
            initialValues={extraServicesData || undefined}
            pricing={pricing}
            onSubmit={handleStep4Submit}
            onBack={() => setActiveStep(3)}
            onCancel={handleCancel}
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
            isEditMode={isEditMode}
            onEditStep={(stepNum) => setActiveStep(stepNum)}
            onBack={() => setActiveStep(4)}
            onCancel={handleCancel}
            onSubmit={handleFinalSubmit}
            isLoading={isLoading}
            error={error}
          />
        )}
      </div>
    </div>
  )
}
