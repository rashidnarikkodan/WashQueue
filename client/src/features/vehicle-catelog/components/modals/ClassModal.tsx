import { useEffect, useRef, useState } from "react"
import { X, Loader2 } from "lucide-react"
import type { VehicleCategory, VehicleClass, CreateClassInput, UpdateClassInput } from "../../types"
import FormInput from "@/shared/components/form/FormInput"
import FormSelect from "@/shared/components/form/FormSelect"
import FormSwitch from "@/shared/components/form/FormSwitch"

interface ClassModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateClassInput | UpdateClassInput) => Promise<void>
  categories: VehicleCategory[]
  vehicleClass?: VehicleClass | null
  defaultCategoryId?: string
}

const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/--+/g, "-")
}

export default function ClassModal({
  isOpen,
  onClose,
  onSave,
  categories,
  vehicleClass,
  defaultCategoryId,
}: ClassModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [categoryId, setCategoryId] = useState("")
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [order, setOrder] = useState<number>(0)
  const [isActive, setIsActive] = useState(true)
  const [isSlugManual, setIsSlugManual] = useState(false)

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
      }
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError(null)
      setErrors({})
      if (vehicleClass) {
        setCategoryId(vehicleClass.categoryId)
        setName(vehicleClass.name)
        setSlug(vehicleClass.slug)
        setDescription(vehicleClass.description || "")
        setOrder(vehicleClass.order)
        setIsActive(vehicleClass.isActive)
        setIsSlugManual(true)
      } else {
        setCategoryId(defaultCategoryId || (categories[0]?.id ?? ""))
        setName("")
        setSlug("")
        setDescription("")
        setOrder(0)
        setIsActive(true)
        setIsSlugManual(false)
      }
    }
  }, [isOpen, vehicleClass, defaultCategoryId, categories])

  useEffect(() => {
    return () => {
      document.body.style.overflow = ""
    }
  }, [])

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setName(val)
    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: "" }))
    }
    if (!isSlugManual) {
      setSlug(slugify(val))
      if (errors.slug) {
        setErrors((prev) => ({ ...prev, slug: "" }))
      }
    }
  }

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(e.target.value)
    setIsSlugManual(true)
    if (errors.slug) {
      setErrors((prev) => ({ ...prev, slug: "" }))
    }
  }

  const handleCancel = () => {
    if (isSubmitting) return
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: Record<string, string> = {}
    if (!categoryId) {
      newErrors.categoryId = "Category is required"
    }
    if (!name.trim()) {
      newErrors.name = "Class name is required"
    } else if (name.trim().length > 100) {
      newErrors.name = "Class name must be under 100 characters"
    }

    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
    if (slug.trim() && !slugRegex.test(slug.trim())) {
      newErrors.slug = "Slug must be url-friendly (alphanumeric and dashes only)"
    } else if (slug.trim().length > 100) {
      newErrors.slug = "Slug must be under 100 characters"
    }

    if (description.trim().length > 500) {
      newErrors.description = "Description must be under 500 characters"
    }

    if (order < 0) {
      newErrors.order = "Display order must be 0 or greater"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)
    setError(null)
    setErrors({})

    try {
      if (vehicleClass) {
        const updates: UpdateClassInput = {
          categoryId,
          name: name.trim(),
          slug: slug.trim() || undefined,
          description: description.trim() || undefined,
          order,
          isActive,
        }
        await onSave(updates)
      } else {
        const payload: CreateClassInput = {
          categoryId,
          name: name.trim(),
          slug: slug.trim() || undefined,
          description: description.trim() || undefined,
          order,
        }
        await onSave(payload)
      }
      onClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred while saving"
      setError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancelClick = (e: React.SyntheticEvent) => {
    e.preventDefault()
    handleCancel()
  }

  return (
    <dialog
      ref={dialogRef}
      onCancel={handleCancelClick}
      className="m-auto w-full max-w-md rounded-2xl border border-slate-800/80 bg-card p-0 shadow-2xl backdrop:bg-slate-950/60 backdrop:backdrop-blur-md overflow-hidden outline-none animate-in fade-in zoom-in-95 duration-200"
    >
      <div className="flex flex-col p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-lg font-bold text-slate-100 leading-snug">
            {vehicleClass ? "Edit Vehicle Class" : "Add New Vehicle Class"}
          </h3>
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="text-slate-500 hover:text-slate-300 p-1 hover:bg-slate-800/40 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {error && (
            <div className="p-3 text-xs bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl">
              {error}
            </div>
          )}

          <FormSelect
            label="Category *"
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value)
              if (errors.categoryId) {
                setErrors((prev) => ({ ...prev, categoryId: "" }))
              }
            }}
            placeholder="Select a category"
            options={categories.map((cat) => ({ value: cat.id, label: cat.name }))}
            error={errors.categoryId}
          />

          <FormInput
            label="Class Name *"
            type="text"
            value={name}
            onChange={handleNameChange}
            placeholder="e.g. SUV / Crossover, Sedan"
            disabled={isSubmitting}
            error={errors.name}
            required
          />

          <FormInput
            label={`URL Slug / Class Code ${!isSlugManual && name.trim() ? "(Auto-generated)" : ""}`}
            type="text"
            value={slug}
            onChange={handleSlugChange}
            placeholder="e.g. suv-crossover"
            disabled={isSubmitting}
            error={errors.slug}
          />

          <div className="space-y-1.5 text-left">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value)
                if (errors.description) {
                  setErrors((prev) => ({ ...prev, description: "" }))
                }
              }}
              placeholder="Enter class description..."
              disabled={isSubmitting}
              rows={3}
              className={`w-full bg-slate-950/40 border text-slate-100 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors disabled:opacity-50 resize-none ${
                errors.description
                  ? "border-red-500/80 focus:border-red-500"
                  : "border-slate-800/80 focus:border-primary/50"
              }`}
            />
            {errors.description && (
              <span className="text-[11px] text-red-400 font-medium pl-1 text-left block">
                {errors.description}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Display Order"
              type="number"
              value={order}
              onChange={(e) => {
                setOrder(parseInt(e.target.value) || 0)
                if (errors.order) {
                  setErrors((prev) => ({ ...prev, order: "" }))
                }
              }}
              placeholder="0"
              disabled={isSubmitting}
              error={errors.order}
            />

            {vehicleClass && (
              <div className="flex flex-col justify-end pb-2">
                <FormSwitch
                  label="Active"
                  checked={isActive}
                  onChange={setIsActive}
                  disabled={isSubmitting}
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-slate-800 bg-slate-950/30 hover:bg-slate-900/60 text-slate-400 hover:text-slate-200 text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed select-none"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-md select-none shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting && <Loader2 size={13} className="animate-spin" />}
              <span>{vehicleClass ? "Save Changes" : "Create"}</span>
            </button>
          </div>
        </form>
      </div>
    </dialog>
  )
}
