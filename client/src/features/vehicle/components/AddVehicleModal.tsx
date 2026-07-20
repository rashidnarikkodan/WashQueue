import { useEffect, useRef, useState } from "react"
import { X, Loader2, Car } from "lucide-react"
import FormInput from "@/shared/components/form/FormInput"
import FormSelect from "@/shared/components/form/FormSelect"
import { useVehicleCatelogStore } from "@/features/vehicle-catelog/store/vehicleCatelogStore"
import type { CreateVehicleInput } from "../types"

interface AddVehicleModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (input: CreateVehicleInput) => Promise<boolean>
  isSubmitting?: boolean
}

export default function AddVehicleModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}: AddVehicleModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  
  const { categories, classes, loadData } = useVehicleCatelogStore()

  // Form Fields State
  const [nickname, setNickname] = useState("")
  const [brand, setBrand] = useState("")
  const [model, setModel] = useState("")
  const [year, setYear] = useState(new Date().getFullYear())
  const [registrationNumber, setRegistrationNumber] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [classId, setClassId] = useState("")
  const [isPrimary, setIsPrimary] = useState(false)

  // Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch catalog data when open if not already loaded
  useEffect(() => {
    if (isOpen && (categories.length === 0 || classes.length === 0)) {
      loadData()
    }
  }, [isOpen, categories.length, classes.length, loadData])

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
  }

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

  const handleSubmit = async (e: React.FormEvent) => {
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

  const categoryOptions = categories
    .filter((c) => c.isActive)
    .map((c) => ({ value: c.id, label: c.name }))

  // Filter classes belonging to chosen category
  const classOptions = classes
    .filter((cl) => cl.isActive && (!categoryId || cl.categoryId === categoryId))
    .map((cl) => ({ value: cl.id, label: cl.name }))

  return (
    <dialog
      ref={dialogRef}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onClick={handleBackdropClick}
      className="bg-card border border-border/80 shadow-2xl rounded-3xl p-0 w-full max-w-lg overflow-hidden backdrop:bg-slate-900/60 backdrop:backdrop-blur-sm"
    >
      {/* Title Header */}
      <div className="flex justify-between items-center px-6 py-5 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Car className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-black text-foreground">Register Premium Vehicle</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
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

        <div className="grid grid-cols-2 gap-4">
          <FormSelect
            label="Category"
            placeholder="Select Category"
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value)
              setClassId("") // Reset class selection if category changes
            }}
            options={categoryOptions}
            error={errors.categoryId}
          />

          <FormSelect
            label="Class"
            placeholder="Select Class"
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            options={classOptions}
            error={errors.classId}
            disabled={!categoryId}
          />
        </div>

        {/* Primary Checkbox */}
        <div className="flex items-center gap-3 bg-muted/40 border border-border/60 p-4 rounded-2xl">
          <input
            id="isPrimaryCheckbox"
            type="checkbox"
            checked={isPrimary}
            onChange={(e) => setIsPrimary(e.target.checked)}
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 accent-primary"
          />
          <label htmlFor="isPrimaryCheckbox" className="text-xs font-bold text-foreground cursor-pointer select-none">
            Set as Primary Vehicle
          </label>
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
