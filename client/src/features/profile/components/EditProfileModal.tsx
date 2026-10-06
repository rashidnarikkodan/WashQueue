import { useEffect, useRef, useState } from "react"
import { X, Camera, Check, Loader2, UserCheck, Briefcase, Wrench, Shield } from "lucide-react"
import type { UserProfile, UpdateProfileInput } from "../types"
import { getInitials } from "@/shared/utils/avatar"
import SelectInput from "@/shared/components/form/SelectInput"

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  profile: UserProfile | null
  onSubmit: (input: UpdateProfileInput) => Promise<boolean>
  isSubmitting?: boolean
}

export default function EditProfileModal({
  isOpen,
  onClose,
  profile,
  onSubmit,
  isSubmitting = false,
}: EditProfileModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  // Common fields
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [avatar, setAvatar] = useState("")
  const [bio, setBio] = useState("")
  const [emergencyContact, setEmergencyContact] = useState("")

  // Owner fields
  const [businessName, setBusinessName] = useState("")
  const [businessEmail, setBusinessEmail] = useState("")
  const [taxId, setTaxId] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [headquarters, setHeadquarters] = useState("")

  // Manager fields
  const [assignedStationName, setAssignedStationName] = useState("")
  const [shiftSchedule, setShiftSchedule] = useState("Morning Shift (08:00 AM - 04:00 PM)")
  const [managerBadgeId, setManagerBadgeId] = useState("")

  // Admin fields
  const [adminTier, setAdminTier] = useState("Super Administrator")
  const [department, setDepartment] = useState("")

  const [errors, setErrors] = useState<Record<string, string>>({})

  const role = profile?.role || "customer"

  const resetForm = () => {
    if (profile) {
      setName(profile.name || "")
      setPhone(profile.phone || "")
      setAvatar(profile.avatar || "")
      setBio(profile.bio || "")
      setEmergencyContact(profile.emergencyContact || "")

      setBusinessName(profile.businessName || "")
      setBusinessEmail(profile.businessEmail || profile.email || "")
      setTaxId(profile.taxId || "")
      setWhatsapp(profile.whatsapp || profile.phone || "")
      setHeadquarters(profile.headquarters || "")

      setAssignedStationName(profile.assignedStationName || "")
      setShiftSchedule(profile.shiftSchedule || "Morning Shift (08:00 AM - 04:00 PM)")
      setManagerBadgeId(profile.managerBadgeId || "")

      setAdminTier(profile.adminTier || "Super Administrator")
      setDepartment(profile.department || "Platform Operations & Security")
    }
    setErrors({})
  }

  useEffect(() => {
    if (isOpen && profile) {
      queueMicrotask(() => {
        setName(profile.name || "")
        setPhone(profile.phone || "")
        setAvatar(profile.avatar || "")
        setBio(profile.bio || "")
        setEmergencyContact(profile.emergencyContact || "")

        setBusinessName(profile.businessName || "")
        setBusinessEmail(profile.businessEmail || profile.email || "")
        setTaxId(profile.taxId || "")
        setWhatsapp(profile.whatsapp || profile.phone || "")
        setHeadquarters(profile.headquarters || "")

        setAssignedStationName(profile.assignedStationName || "")
        setShiftSchedule(profile.shiftSchedule || "Morning Shift (08:00 AM - 04:00 PM)")
        setManagerBadgeId(profile.managerBadgeId || "")

        setAdminTier(profile.adminTier || "Super Administrator")
        setDepartment(profile.department || "Platform Operations & Security")
        setErrors({})
      })
    }
  }, [isOpen, profile])

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
    return () => {
      document.body.style.overflow = ""
    }
  }, [])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!name.trim()) {
      newErrors.name = "Full Name is required"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const inputData: UpdateProfileInput = {
      name: name.trim(),
      phone: phone.trim() || undefined,
      avatar: avatar.trim() || undefined,
      bio: bio.trim() || undefined,
      emergencyContact: emergencyContact.trim() || undefined,
    }

    if (role === "owner") {
      inputData.businessName = businessName.trim() || undefined
      inputData.businessEmail = businessEmail.trim() || undefined
      inputData.taxId = taxId.trim() || undefined
      inputData.whatsapp = whatsapp.trim() || undefined
      inputData.headquarters = headquarters.trim() || undefined
    } else if (role === "manager") {
      inputData.assignedStationName = assignedStationName.trim() || undefined
      inputData.shiftSchedule = shiftSchedule || undefined
      inputData.managerBadgeId = managerBadgeId.trim() || undefined
    } else if (role === "admin") {
      inputData.adminTier = adminTier || undefined
      inputData.department = department.trim() || undefined
    }

    const success = await onSubmit(inputData)
    if (success) {
      onClose()
    }
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      onClose()
    }
  }

  const [imgError, setImgError] = useState(false)
  const avatarInitials = getInitials(name || profile?.name)

  const shiftOptions = [
    { value: "Morning Shift (08:00 AM - 04:00 PM)", label: "Morning Shift (08:00 AM - 04:00 PM)" },
    { value: "Evening Shift (04:00 PM - 12:00 AM)", label: "Evening Shift (04:00 PM - 12:00 AM)" },
    {
      value: "Night Operations (12:00 AM - 08:00 AM)",
      label: "Night Operations (12:00 AM - 08:00 AM)",
    },
    { value: "Full Day Supervisory Shift", label: "Full Day Supervisory Shift" },
  ]

  const adminTierOptions = [
    { value: "Super Administrator", label: "Super Administrator (Level 5)" },
    { value: "Platform Operations Manager", label: "Platform Operations Manager (Level 4)" },
    { value: "Security & Support Auditor", label: "Security & Support Auditor (Level 3)" },
  ]

  return (
    <dialog
      ref={dialogRef}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onClick={handleBackdropClick}
      className="fixed inset-0 m-auto bg-card border border-border shadow-2xl rounded-[24px] p-0 w-full max-w-[850px] max-h-[90vh] overflow-hidden backdrop:bg-background/80 backdrop:backdrop-blur-md text-foreground"
    >
      <div className="flex justify-between items-center px-8 py-6 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <UserCheck className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-foreground tracking-tight">Edit Profile</h2>
            <p className="text-xs text-muted-foreground capitalize font-medium">
              Updating details for {role} account
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col max-h-[calc(90vh-170px)]">
        <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-4 flex flex-col items-center sm:items-start gap-4">
              <div className="relative">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-border overflow-hidden bg-gradient-to-br from-muted to-card flex items-center justify-center shadow-xl">
                  {avatar && !imgError ? (
                    <img
                      src={avatar}
                      alt={name}
                      onError={() => setImgError(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-black text-3xl text-primary">{avatarInitials}</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const url = prompt("Enter image URL for avatar:", avatar)
                    if (url !== null) setAvatar(url)
                  }}
                  className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-pointer"
                  title="Update photo URL"
                >
                  <Camera className="w-4 h-4 text-primary-foreground" />
                </button>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">
                  Verified Account
                </span>
              </div>
            </div>

            <div className="md:col-span-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-muted/60 text-foreground text-sm font-semibold border border-border focus:border-primary focus:outline-none transition-all placeholder:text-muted-foreground"
                    placeholder="Enter full name"
                    required
                  />
                  {errors.name && <p className="text-xs text-red-400 font-medium">{errors.name}</p>}
                </div>

                <div className="space-y-2 relative">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={profile?.email || ""}
                      disabled
                      className="w-full px-4 py-3 pr-10 rounded-xl bg-muted/40 text-muted-foreground text-sm font-semibold border border-border cursor-not-allowed opacity-90"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full bg-emerald-500/10 text-emerald-500">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-muted/60 text-foreground text-sm font-semibold border border-border focus:border-primary focus:outline-none transition-all placeholder:text-muted-foreground"
                    placeholder="+1 (555) 012-3456"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Emergency Contact Phone
                  </label>
                  <input
                    type="text"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-muted/60 text-foreground text-sm font-semibold border border-border focus:border-primary focus:outline-none transition-all placeholder:text-muted-foreground"
                    placeholder="+1 (555) 998-1122"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Personal Bio / Notes
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-muted/60 text-foreground text-sm font-semibold border border-border focus:border-primary focus:outline-none transition-all placeholder:text-muted-foreground resize-none"
                  placeholder="Tell us about your background or service role..."
                />
              </div>

              {/* Owner Specific Section */}
              {role === "owner" && (
                <div className="pt-6 border-t border-border space-y-6">
                  <div className="flex items-center gap-2 text-amber-500">
                    <Briefcase className="w-4 h-4" />
                    <span className="text-xs font-extrabold uppercase tracking-wider">
                      Business & Station Operations Details
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        Business Name
                      </label>
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-muted/60 text-foreground text-sm font-semibold border border-border focus:border-primary focus:outline-none transition-all"
                        placeholder="WashQueue Enterprise"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        Tax / Registration ID
                      </label>
                      <input
                        type="text"
                        value={taxId}
                        onChange={(e) => setTaxId(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-muted/60 text-foreground text-sm font-semibold border border-border focus:border-primary focus:outline-none transition-all"
                        placeholder="US-TAX-8849201"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        Business Email
                      </label>
                      <input
                        type="email"
                        value={businessEmail}
                        onChange={(e) => setBusinessEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-muted/60 text-foreground text-sm font-semibold border border-border focus:border-primary focus:outline-none transition-all"
                        placeholder="business@washqueue.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        WhatsApp Hotline
                      </label>
                      <input
                        type="text"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-muted/60 text-foreground text-sm font-semibold border border-border focus:border-primary focus:outline-none transition-all"
                        placeholder="+1 555-019-2831"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Headquarters Address
                    </label>
                    <input
                      type="text"
                      value={headquarters}
                      onChange={(e) => setHeadquarters(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-muted/60 text-foreground text-sm font-semibold border border-border focus:border-primary focus:outline-none transition-all"
                      placeholder="100 Grand Avenue, Suite 400, NY"
                    />
                  </div>
                </div>
              )}

              {/* Manager Specific Section */}
              {role === "manager" && (
                <div className="pt-6 border-t border-border space-y-6">
                  <div className="flex items-center gap-2 text-blue-500">
                    <Wrench className="w-4 h-4" />
                    <span className="text-xs font-extrabold uppercase tracking-wider">
                      Manager Station & Shift Settings
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        Assigned Station Name
                      </label>
                      <input
                        type="text"
                        value={assignedStationName}
                        onChange={(e) => setAssignedStationName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-muted/60 text-foreground text-sm font-semibold border border-border focus:border-primary focus:outline-none transition-all"
                        placeholder="Metro Central Wash Station"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        Staff Badge ID
                      </label>
                      <input
                        type="text"
                        value={managerBadgeId}
                        onChange={(e) => setManagerBadgeId(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-muted/60 text-foreground text-sm font-semibold border border-border focus:border-primary focus:outline-none transition-all"
                        placeholder="MGR-8821"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Shift Schedule
                    </label>
                    <SelectInput
                      options={shiftOptions}
                      value={shiftSchedule}
                      onChange={(val) => setShiftSchedule(val)}
                      placeholder="Select shift schedule"
                    />
                  </div>
                </div>
              )}

              {/* Admin Specific Section */}
              {role === "admin" && (
                <div className="pt-6 border-t border-border space-y-6">
                  <div className="flex items-center gap-2 text-purple-500">
                    <Shield className="w-4 h-4" />
                    <span className="text-xs font-extrabold uppercase tracking-wider">
                      Admin Governance & Clearance Tier
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        Admin Tier
                      </label>
                      <SelectInput
                        options={adminTierOptions}
                        value={adminTier}
                        onChange={(val) => setAdminTier(val)}
                        placeholder="Select admin tier"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        Governance Department
                      </label>
                      <input
                        type="text"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-muted/60 text-foreground text-sm font-semibold border border-border focus:border-primary focus:outline-none transition-all"
                        placeholder="Platform Operations & Security"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center px-8 py-6 border-t border-border bg-card">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-3 rounded-xl text-muted-foreground hover:text-foreground font-bold text-sm transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={resetForm}
              disabled={isSubmitting}
              className="px-6 py-3 rounded-xl border border-border bg-muted/60 hover:bg-muted text-foreground font-bold text-sm transition-colors cursor-pointer"
            >
              Reset Changes
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-sm shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Changes
            </button>
          </div>
        </div>
      </form>
    </dialog>
  )
}
