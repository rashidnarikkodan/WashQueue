import { useState, useEffect } from "react"
import { Info, MapPin, Building, Image as ImageIcon, Navigation, ArrowRight, Upload, X } from "lucide-react"
import FormInput from "@/shared/components/form/FormInput"
import { stationDetailsSchema, type StationDetailsFormData } from "../../schemas/station.schema"
import type { StationImage } from "../../types"

export interface StationDetailsFormValues extends StationDetailsFormData {
  images?: File[]
  existingImages?: StationImage[]
}

interface StationDetailsFormProps {
  initialValues?: Partial<StationDetailsFormValues>
  onSubmit: (
    data: StationDetailsFormData,
    newImageFiles: File[],
    existingImages: StationImage[],
    deletedImagePublicIds: string[]
  ) => void
  onCancel: () => void
  isLoading?: boolean
}

export default function StationDetailsForm({
  initialValues,
  onSubmit,
  onCancel,
  isLoading = false,
}: StationDetailsFormProps) {
  const [formData, setFormData] = useState<StationDetailsFormData>({
    name: initialValues?.name || "",
    phone: initialValues?.phone || "",
    email: initialValues?.email || "",
    description: initialValues?.description || "",
    street: initialValues?.street || "",
    city: initialValues?.city || "",
    pincode: initialValues?.pincode || "",
    district: initialValues?.district || "",
    state: initialValues?.state || "",
    country: initialValues?.country || "India",
    latitude: initialValues?.latitude ?? 0,
    longitude: initialValues?.longitude ?? 0,
  })

  const [imageFiles, setImageFiles] = useState<File[]>(initialValues?.images || [])
  const [existingImages, setExistingImages] = useState<StationImage[]>(
    initialValues?.existingImages || []
  )
  const [deletedImagePublicIds, setDeletedImagePublicIds] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isGettingLocation, setIsGettingLocation] = useState(false)

  useEffect(() => {
    if (initialValues) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData((prev) => ({
        ...prev,
        name: initialValues.name ?? prev.name,
        phone: initialValues.phone ?? prev.phone,
        email: initialValues.email ?? prev.email,
        description: initialValues.description ?? prev.description,
        street: initialValues.street ?? prev.street,
        city: initialValues.city ?? prev.city,
        pincode: initialValues.pincode ?? prev.pincode,
        district: initialValues.district ?? prev.district,
        state: initialValues.state ?? prev.state,
        country: initialValues.country ?? prev.country,
        latitude: initialValues.latitude ?? prev.latitude,
        longitude: initialValues.longitude ?? prev.longitude,
      }))
      if (initialValues.existingImages) {
        setExistingImages(initialValues.existingImages)
      }
      if (initialValues.images) {
        setImageFiles(initialValues.images)
      }
    }
  }, [initialValues])

  const handleChange = (field: keyof StationDetailsFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.")
      return
    }
    setIsGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(6))
        const lng = parseFloat(pos.coords.longitude.toFixed(6))
        setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }))
        setIsGettingLocation(false)
      },
      (err) => {
        console.error("Failed to get location", err)
        setIsGettingLocation(false)
      }
    )
  }

  const handleFileDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files)
      setImageFiles((prev) => [...prev, ...selected])
      if (errors.images) {
        setErrors((prev) => {
          const next = { ...prev }
          delete next.images
          return next
        })
      }
    }
  }

  const handleRemoveExistingImage = (index: number) => {
    const target = existingImages[index]
    if (target && target.publicId) {
      setDeletedImagePublicIds((prev) => [...prev, target.publicId])
    }
    setExistingImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleRemoveNewImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const validation = stationDetailsSchema.safeParse(formData)
    const errMap: Record<string, string> = {}

    if (!validation.success) {
      validation.error.issues.forEach((issue) => {
        const path = String(issue.path[0])
        if (path) {
          errMap[path] = issue.message
        }
      })
    }

    if (existingImages.length === 0 && imageFiles.length === 0) {
      errMap.images = "At least one station photo is required."
    }

    if (Object.keys(errMap).length > 0) {
      setErrors(errMap)
      return
    }

    setErrors({})
    onSubmit(validation.data!, imageFiles, existingImages, deletedImagePublicIds)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 text-left">
      {/* Editorial Header */}
      <div className="space-y-2 border-b border-slate-800/80 pb-6">
        <span className="text-[12px] font-bold tracking-[2.4px] text-[#ADC6FF] uppercase">
          STEP 1 OF 5
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#DCE1FB] tracking-tight">
          Station Details
        </h1>
        <p className="text-sm sm:text-base text-[#C2C6D6] opacity-80 font-normal">
          Give accurate information about station for your own credibility and trust
        </p>
      </div>

      {/* Section 1: Basic Information */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold tracking-wider text-[#C2C6D6] uppercase">
          <Info size={16} className="text-[#ADC6FF]" />
          <span>BASIC INFORMATION</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormInput
            label="STATION NAME"
            type="text"
            placeholder="e.g. Blue Lagoon Auto Spa"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            error={errors.name}
          />
          <FormInput
            label="STATION PHONE NUMBER"
            type="tel"
            placeholder="10-digit phone number"
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            error={errors.phone}
          />
          <FormInput
            label="STATION CONTACT EMAIL"
            type="email"
            placeholder="contact@station.com"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            error={errors.email}
          />
        </div>

        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1">
            TELL CUSTOMER ABOUT YOUR STATION
          </label>
          <textarea
            rows={3}
            placeholder="Describe your premium services, equipment, and customer experience..."
            value={formData.description || ""}
            onChange={(e) => handleChange("description", e.target.value)}
            className="w-full bg-muted/90 text-foreground border border-border/80 rounded-xl p-3.5 text-sm placeholder-muted-foreground/80 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/80 transition-all"
          />
        </div>
      </div>

      {/* Section 2: Location Mapping */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-sm font-semibold tracking-wider text-[#C2C6D6] uppercase">
            <MapPin size={16} className="text-[#ADC6FF]" />
            <span>LOCATION MAPPING</span>
          </div>
          <button
            type="button"
            onClick={handleGetCurrentLocation}
            disabled={isGettingLocation}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#ADC6FF] hover:underline cursor-pointer disabled:opacity-50"
          >
            <Navigation size={14} className={isGettingLocation ? "animate-spin" : ""} />
            <span>{isGettingLocation ? "Locating..." : "Use my current location"}</span>
          </button>
        </div>

        {/* Map Placeholder Block */}
        <div className="relative w-full h-48 sm:h-64 rounded-2xl border border-slate-800 bg-[#070D1F] overflow-hidden flex flex-col justify-center items-center p-4">
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
          <div className="z-10 flex flex-col items-center gap-2 text-center">
            <div className="w-10 h-10 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center animate-bounce">
              <MapPin size={22} />
            </div>
            <p className="text-xs text-slate-300 font-semibold">
              Location Pin: {formData.latitude}° N, {formData.longitude}° W
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            label="LATITUDE"
            type="number"
            placeholder="e.g. 34.0522"
            value={formData.latitude || ""}
            onChange={(e) => handleChange("latitude", parseFloat(e.target.value) || 0)}
            error={errors.latitude}
          />
          <FormInput
            label="LONGITUDE"
            type="number"
            placeholder="e.g. -118.2437"
            value={formData.longitude || ""}
            onChange={(e) => handleChange("longitude", parseFloat(e.target.value) || 0)}
            error={errors.longitude}
          />
        </div>
      </div>

      {/* Section 3: Full Address */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold tracking-wider text-[#C2C6D6] uppercase">
          <Building size={16} className="text-[#ADC6FF]" />
          <span>FULL ADDRESS</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormInput
            label="Street / Building No"
            type="text"
            placeholder="123 Main Street"
            value={formData.street}
            onChange={(e) => handleChange("street", e.target.value)}
            error={errors.street}
          />
          <FormInput
            label="Village / Town / City"
            type="text"
            placeholder="Los Angeles"
            value={formData.city}
            onChange={(e) => handleChange("city", e.target.value)}
            error={errors.city}
          />
          <FormInput
            label="PIN / Zip Code"
            type="text"
            placeholder="90001"
            value={formData.pincode}
            onChange={(e) => handleChange("pincode", e.target.value)}
            error={errors.pincode}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormInput
            label="District"
            type="text"
            placeholder="Central"
            value={formData.district || ""}
            onChange={(e) => handleChange("district", e.target.value)}
            error={errors.district}
          />
          <FormInput
            label="State"
            type="text"
            placeholder="California"
            value={formData.state}
            onChange={(e) => handleChange("state", e.target.value)}
            error={errors.state}
          />
          <FormInput
            label="Country"
            type="text"
            placeholder="India"
            value={formData.country}
            onChange={(e) => handleChange("country", e.target.value)}
            error={errors.country}
          />
        </div>
      </div>

      {/* Section 4: Station Media */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold tracking-wider text-[#C2C6D6] uppercase">
          <ImageIcon size={16} className="text-[#ADC6FF]" />
          <span>STATION MEDIA</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Saved / Existing Images */}
          {existingImages.map((img, idx) => (
            <div
              key={`existing-${idx}-${img.publicId || img.url}`}
              className="relative rounded-2xl border border-slate-800 bg-slate-950/40 p-2 flex flex-col items-center gap-2 h-44 overflow-hidden group"
            >
              <img
                src={img.url}
                alt={`Station saved media ${idx + 1}`}
                className="w-full h-32 object-cover rounded-xl"
              />
              <div className="flex items-center justify-between w-full px-1">
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-wider">
                  Saved Image
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveExistingImage(idx)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-900/80 hover:bg-red-500 text-white transition-all cursor-pointer shadow-md z-10"
                title="Delete image"
              >
                <X size={14} />
              </button>
            </div>
          ))}

          {/* New Selected Image Files */}
          {imageFiles.map((file, idx) => (
            <div
              key={`new-${idx}-${file.name}`}
              className="relative rounded-2xl border border-slate-800 bg-slate-950/40 p-2 flex flex-col items-center gap-2 h-44 overflow-hidden group"
            >
              <img
                src={URL.createObjectURL(file)}
                alt={`Station new media ${idx + 1}`}
                className="w-full h-32 object-cover rounded-xl"
              />
              <span className="text-xs text-slate-300 truncate max-w-[90%] font-medium">
                {file.name}
              </span>
              <button
                type="button"
                onClick={() => handleRemoveNewImage(idx)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-900/80 hover:bg-red-500 text-white transition-all cursor-pointer shadow-md z-10"
                title="Delete image"
              >
                <X size={14} />
              </button>
            </div>
          ))}

          <label className="border-2 border-dashed border-slate-800 hover:border-primary/60 bg-slate-950/20 hover:bg-primary/5 rounded-2xl p-6 flex flex-col justify-center items-center text-center gap-2 cursor-pointer h-44 transition-all">
            <input
              type="file"
              multiple
              accept="image/png, image/jpeg"
              onChange={handleFileDrop}
              className="hidden"
            />
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Upload size={18} />
            </div>
            <p className="text-xs font-semibold text-slate-200">
              Click to upload or drag & drop
            </p>
            <p className="text-[10px] text-slate-500 font-medium">
              High-quality station photos (PNG, JPG max 5MB)
            </p>
          </label>
        </div>

        {errors.images && (
          <span className="text-xs text-red-400 font-medium">{errors.images}</span>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="flex justify-between items-center border-t border-slate-800/80 pt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 rounded-xl border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/50 text-sm font-bold transition-all cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 bg-[#ADC6FF] text-[#002E6A] hover:bg-blue-300 disabled:opacity-50 text-sm font-bold px-8 py-2.5 rounded-xl shadow-lg shadow-blue-500/10 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>{isLoading ? "Saving..." : "Continue"}</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </form>
  )
}
