import { useEffect, useRef, useState } from "react"
import { X, Loader2, Car, Info, ImagePlus, Trash2 } from "lucide-react"
import FormInput from "@/shared/components/form/FormInput"
import FormSelect from "@/shared/components/form/FormSelect"
import FormSwitch from "@/shared/components/form/FormSwitch"
import { useVehicleCatelogStore } from "@/features/vehicle-catelog/store/catelog.store"
import { vehicleCatelogApi } from "@/shared/apis/catelog.api"
import type { VehicleCategory, VehicleClass } from "@/features/vehicle-catelog/types"
import type { Vehicle, CreateVehicleInput } from "../types"

// ─────────────────────────────────────────────
// Inline helper: info badge with popover tooltip
// ─────────────────────────────────────────────
interface InfoBadgeProps {
  description: string
}
function InfoBadge({ description }: InfoBadgeProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative inline-flex items-center">
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen((o) => !o)}
        className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
        aria-label="More info"
      >
        <Info className="w-3.5 h-3.5" />
      </button>
      {open && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-52 rounded-xl bg-popover border border-border shadow-xl p-3 text-[11px] text-muted-foreground leading-relaxed">
          {description}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-border" />
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Inline helper: selected item description chip
// ─────────────────────────────────────────────
interface DescriptionChipProps {
  description?: string
}
function DescriptionChip({ description }: DescriptionChipProps) {
  if (!description) return null
  return (
    <p className="text-[11px] text-muted-foreground mt-1.5 leading-snug border-l-2 border-primary/40 pl-2">
      {description}
    </p>
  )
}


interface AddVehicleModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (input: CreateVehicleInput) => Promise<boolean>
  initialVehicle?: Vehicle | null
  isSubmitting?: boolean
}

export default function AddVehicleModal({
  isOpen,
  onClose,
  onSubmit,
  initialVehicle = null,
  isSubmitting = false,
}: AddVehicleModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  const { categories, loadData } = useVehicleCatelogStore()

  // Dynamically loaded classes for the selected category
  const [categoryClasses, setCategoryClasses] = useState<VehicleClass[]>([])
  const [isLoadingClasses, setIsLoadingClasses] = useState(false)

  // Form Fields State
  const [nickname, setNickname] = useState("")
  const [brand, setBrand] = useState("")
  const [model, setModel] = useState("")
  const [year, setYear] = useState(new Date().getFullYear())
  const [registrationNumber, setRegistrationNumber] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [classId, setClassId] = useState("")
  const [isPrimary, setIsPrimary] = useState(false)

  // Image upload state
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  // Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({})

  const resetForm = () => {
    setNickname("")
    setBrand("")
    setModel("")
    setYear(new Date().getFullYear())
    setRegistrationNumber("")
    setCategoryId("")
    setClassId("")
    setIsPrimary(false)
    setErrors({})
    setCategoryClasses([])
    setImageFile(null)
    setImagePreview(null)
  }

  // Populate initial vehicle data if editing
  useEffect(() => {
    if (isOpen && initialVehicle) {
      setNickname(initialVehicle.nickname || "")
      setBrand(initialVehicle.brand || "")
      setModel(initialVehicle.model || "")
      setYear(initialVehicle.year || new Date().getFullYear())
      setRegistrationNumber(initialVehicle.registrationNumber || "")
      setCategoryId(initialVehicle.categoryId || "")
      setClassId(initialVehicle.classId || "")
      setIsPrimary(initialVehicle.isPrimary || false)
      if (initialVehicle.image?.url) {
        setImagePreview(initialVehicle.image.url)
      }

      if (initialVehicle.categoryId) {
        setIsLoadingClasses(true)
        vehicleCatelogApi
          .getClasses({ categoryId: initialVehicle.categoryId })
          .then((data) => {
            setCategoryClasses(data ?? [])
          })
          .catch((err) => {
            console.error("Failed to load classes", err)
            setCategoryClasses([])
          })
          .finally(() => {
            setIsLoadingClasses(false)
          })
      }
    }
  }, [isOpen, initialVehicle])

  // Fetch categories when modal opens (if not already loaded)
  useEffect(() => {
    if (isOpen && categories.length === 0) {
      loadData()
    }
  }, [isOpen, categories.length, loadData])

  // Native Dialog Sync
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal()
        document.body.style.overflow = "hidden"
      }
    } else {
      if (dialog.open) {
        dialog.close()
        document.body.style.overflow = ""
        resetForm()
      }
    }
  }, [isOpen])

  // Cleanup overflow styling
  useEffect(() => {
    return () => {
      document.body.style.overflow = ""
    }
  }, [])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!nickname.trim()) {
      newErrors.nickname = "Nickname is required"
    } else if (nickname.trim().length < 2) {
      newErrors.nickname = "Nickname must be at least 2 characters"
    }

    if (!brand.trim()) {
      newErrors.brand = "Brand is required"
    }

    if (!model.trim()) {
      newErrors.model = "Model is required"
    }

    const currentYear = new Date().getFullYear()
    if (!year) {
      newErrors.year = "Model year is required"
    } else if (year < 1900 || year > currentYear + 1) {
      newErrors.year = `Year must be between 1900 and ${currentYear + 1}`
    }

    if (!categoryId) {
      newErrors.categoryId = "Vehicle category is required"
    }

    if (!classId) {
      newErrors.classId = "Vehicle class is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const success = await onSubmit({
      nickname: nickname.trim(),
      brand: brand.trim(),
      model: model.trim(),
      year: Number(year),
      registrationNumber: registrationNumber.trim() || null,
      categoryId,
      classId,
      isPrimary,
      imageFile: imageFile ?? undefined,
    })

    if (success) {
      onClose()
    }
  }

  // Backdrop Click Dismiss
  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    const dialog = dialogRef.current
    if (e.target === dialog) {
      onClose()
    }
  }

  const activeCategories = categories.filter((c) => c.isActive)
  const activeClasses = categoryClasses.filter((cl) => cl.isActive)

  const selectedCategory: VehicleCategory | undefined = activeCategories.find((c) => c.id === categoryId)
  const selectedClass: VehicleClass | undefined = activeClasses.find((cl) => cl.id === classId)

  return (
    <dialog
      ref={dialogRef}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onClick={handleBackdropClick}
      className="fixed inset-0 m-auto bg-card border border-border/80 shadow-2xl rounded-3xl p-0 w-full max-w-lg overflow-hidden backdrop:bg-slate-900/60 backdrop:backdrop-blur-sm"
    >
      {/* Title Header */}
      <div className="flex justify-between items-center px-6 py-5 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Car className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-black text-foreground">
            {initialVehicle ? "Edit Vehicle Details" : "Register Premium Vehicle"}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body Form */}
      <form onSubmit={handleFormSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-200px)]">

        {/* Landscape Image Upload Zone */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1">
              Vehicle Photo <span className="text-muted-foreground/50">(Optional)</span>
            </span>
            {imagePreview && (
              <button
                type="button"
                onClick={() => { setImageFile(null); setImagePreview(null) }}
                className="flex items-center gap-1 text-[11px] text-red-400 hover:text-red-300 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3 h-3" /> Remove
              </button>
            )}
          </div>

          {imagePreview ? (
            /* Preview panel */
            <div
              className="relative w-full h-36 rounded-2xl overflow-hidden border border-border cursor-pointer group"
              onClick={() => imageInputRef.current?.click()}
            >
              <img
                src={imagePreview}
                alt="Vehicle preview"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-xs font-bold tracking-wider">Change Photo</span>
              </div>
            </div>
          ) : (
            /* Drop zone */
            <div
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && imageInputRef.current?.click()}
              onClick={() => imageInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                const file = e.dataTransfer.files?.[0]
                if (file && file.type.startsWith("image/")) {
                  setImageFile(file)
                  setImagePreview(URL.createObjectURL(file))
                }
              }}
              className="w-full h-36 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 bg-muted/30 hover:bg-muted/60 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer group"
            >
              <div className="p-3 rounded-xl bg-muted text-muted-foreground group-hover:text-primary transition-colors">
                <ImagePlus className="w-5 h-5" />
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-foreground">Upload a landscape photo</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Click or drag & drop · JPG, PNG · Max 10MB</p>
              </div>
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                setImageFile(file)
                setImagePreview(URL.createObjectURL(file))
              }
            }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="Nickname"
            type="text"
            placeholder="e.g. My Cruiser"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            error={errors.nickname}
            required
          />

          <FormInput
            label="Reg Plate"
            type="text"
            placeholder="e.g. KL11AB1234"
            value={registrationNumber}
            onChange={(e) => setRegistrationNumber(e.target.value)}
            error={errors.registrationNumber}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="Brand"
            type="text"
            placeholder="e.g. BMW"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            error={errors.brand}
            required
          />

          <FormInput
            label="Model"
            type="text"
            placeholder="e.g. X5"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            error={errors.model}
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-4">
          <FormInput
            label="Model Year"
            type="number"
            placeholder="e.g. 2024"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            error={errors.year}
            required
          />
        </div>

        {/* Category & Class with info badges */}
        <div className="grid grid-cols-2 gap-4">
          {/* Category */}
          <div className="flex flex-col gap-1 w-full">
            <FormSelect
              label="Category"
              required
              value={categoryId}
              options={activeCategories.map((c) => ({ value: c.id, label: c.name }))}
              placeholder="Select Category"
              error={errors.categoryId}
              labelRight={
                selectedCategory?.description ? (
                  <InfoBadge description={selectedCategory.description} />
                ) : activeCategories.length > 0 ? (
                  <InfoBadge description="Vehicle categories group similar types of vehicles. Select a category to load matching classes." />
                ) : null
              }
              onChange={(e) => {
                const newCategoryId = e.target.value
                setCategoryId(newCategoryId)
                setClassId("")
                if (!newCategoryId) {
                  setCategoryClasses([])
                  return
                }
                setIsLoadingClasses(true)
                vehicleCatelogApi
                  .getClasses({ categoryId: newCategoryId })
                  .then((data) => {
                    setCategoryClasses(data ?? [])
                  })
                  .catch((err) => {
                    console.error("Failed to load classes", err)
                    setCategoryClasses([])
                  })
                  .finally(() => {
                    setIsLoadingClasses(false)
                  })
              }}
            />
            <DescriptionChip description={selectedCategory?.description} />
          </div>

          {/* Class */}
          <div className="flex flex-col gap-1 w-full relative">
            <FormSelect
              label="Class"
              required
              value={classId}
              disabled={!categoryId || isLoadingClasses}
              options={activeClasses.map((cl) => ({ value: cl.id, label: cl.name }))}
              placeholder={
                isLoadingClasses
                  ? "Loading classes…"
                  : categoryId
                    ? "Select Class"
                    : "Select Category first"
              }
              error={errors.classId}
              labelRight={
                selectedClass?.description ? (
                  <InfoBadge description={selectedClass.description} />
                ) : categoryId && activeClasses.length > 0 ? (
                  <InfoBadge description="Classes refine the vehicle type within the selected category. e.g. Sedan, SUV, Hatchback." />
                ) : null
              }
              onChange={(e) => setClassId(e.target.value)}
            />
            {isLoadingClasses && (
              <div className="absolute right-3 top-[38px] pointer-events-none z-20">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            )}
            <DescriptionChip description={selectedClass?.description} />
          </div>
        </div>

        {/* Primary Switch */}
        <div className="bg-muted/40 border border-border/60 p-4 rounded-2xl">
          <FormSwitch
            label="Set as Primary Vehicle"
            checked={isPrimary}
            onChange={setIsPrimary}
            id="isPrimarySwitch"
            description="Primary vehicle will be selected by default when booking washes."
          />
        </div>

        {/* Actions Footer */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-3 rounded-xl hover:bg-muted text-muted-foreground font-extrabold text-xs tracking-wider transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold text-xs tracking-wider transition-all cursor-pointer shadow-md shadow-primary/10 flex items-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Vehicle
          </button>
        </div>
      </form>
    </dialog>
  )
}
