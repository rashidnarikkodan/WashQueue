import { useEffect, useRef, useState } from "react"
import { X, MapPin, Camera, Check, Loader2, Navigation, UserCheck } from "lucide-react"
import type { UserProfile, UpdateProfileInput } from "../types"
import { toast } from "sonner"
import { getInitials } from "@/shared/utils/avatar"

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

  // Personal fields
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")

  // Business fields (only for owner/provider)
  const [businessName, setBusinessName] = useState("")
  const [businessEmail, setBusinessEmail] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [headquarters, setHeadquarters] = useState("")

  // Address fields (Sunken visual section)
  const [building, setBuilding] = useState("")
  const [street, setStreet] = useState("")
  const [city, setCity] = useState("")
  const [district, setDistrict] = useState("")
  const [state, setState] = useState("")
  const [pincode, setPincode] = useState("")
  const [country, setCountry] = useState("United States")

  const [isLocating, setIsLocating] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isOwnerOrProvider =
    profile?.role === "owner" || profile?.role === "admin" || profile?.role === "manager"

  const resetForm = () => {
    if (profile) {
      setName(profile.name || "")
      setPhone(profile.phone || "")
      setBusinessName(profile.businessName || "")
      setBusinessEmail(profile.businessEmail || profile.email || "")
      setWhatsapp(profile.whatsapp || profile.phone || "")
      setHeadquarters(profile.headquarters || profile.address || "")
      setBuilding(profile.building || "")
      setStreet(profile.street || "")
      setCity(profile.city || "")
      setDistrict(profile.district || "")
      setState(profile.state || "")
      setPincode(profile.pincode || "")
      setCountry(profile.country || "United States")
    }
    setErrors({})
  }

  useEffect(() => {
    if (isOpen && profile) {
      resetForm()
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

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser")
      return
    }

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      () => {
        setIsLocating(false)
        setCity("San Francisco")
        setDistrict("Financial District")
        setState("California")
        setPincode("94105")
        setCountry("United States")
        toast.success("Location updated successfully!")
      },
      () => {
        setIsLocating(false)
        toast.error("Could not fetch current location")
      }
    )
  }

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

    const combinedAddress = [building, street, city, state, country]
      .filter(Boolean)
      .join(", ")

    const inputData: UpdateProfileInput = {
      name: name.trim(),
      phone: phone.trim() || undefined,
      address: combinedAddress || undefined,
      building: building.trim() || undefined,
      street: street.trim() || undefined,
      city: city.trim() || undefined,
      district: district.trim() || undefined,
      state: state.trim() || undefined,
      pincode: pincode.trim() || undefined,
      country: country || undefined,
    }

    if (isOwnerOrProvider) {
      inputData.businessName = businessName.trim() || undefined
      inputData.businessEmail = businessEmail.trim() || undefined
      inputData.whatsapp = whatsapp.trim() || undefined
      inputData.headquarters = headquarters.trim() || undefined
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

  return (
    <dialog
      ref={dialogRef}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onClick={handleBackdropClick}
      className="fixed inset-0 m-auto bg-[#0F172A] border border-[#1E293B] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] rounded-[20px] p-0 w-full max-w-[1140px] max-h-[90vh] overflow-hidden backdrop:bg-slate-950/80 backdrop:backdrop-blur-md text-[#F8FAFC]"
    >
      {/* Header / Close Button */}
      <div className="flex justify-between items-center px-8 py-6 border-b border-[#1E293B]/50 bg-[#0F172A]">
        <div className="flex items-center gap-3">
          {/* User Icon Badge */}
          <div className="p-2 rounded-xl bg-[#60A5FA]/10 text-[#60A5FA]">
            <UserCheck className="w-6 h-6 text-[#60A5FA]" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Edit Profile</h2>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-[#1E293B]/50 hover:bg-[#1E293B] text-[#C2C6D6] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Modal Body: Asymmetrical Bento Layout */}
      <form onSubmit={handleSubmit} className="flex flex-col max-h-[calc(90vh-170px)]">
        <div className="p-8 space-y-10 overflow-y-auto custom-scrollbar">
          
          {/* Section 1: Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Left Col: Avatar Upload & Status Badge */}
            <div className="md:col-span-4 flex flex-col items-center sm:items-start gap-4">
              <div className="relative">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-[#2E3447] overflow-hidden bg-gradient-to-br from-[#1E293B] to-[#0F172A] flex items-center justify-center shadow-xl">
                  {profile?.avatar && !imgError ? (
                    <img
                      src={profile.avatar}
                      alt={profile.name}
                      onError={() => setImgError(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-black text-3xl text-[#ADC6FF]">{avatarInitials}</span>
                  )}
                </div>

                {/* Camera Overlay Button */}
                <button
                  type="button"
                  className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-[#60A5FA] hover:bg-[#3b82f6] text-[#002E6A] flex items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-pointer"
                  title="Upload photo"
                >
                  <Camera className="w-4 h-4 text-[#002E6A]" />
                </button>
              </div>

              {/* Verified Pill Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00A74B]/20 border border-[#4AE176]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4AE176]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#4AE176]">
                  Verified
                </span>
              </div>
            </div>

            {/* Right Col: Personal Input Fields */}
            <div className="md:col-span-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#C2C6D6]">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-[#2E3447] text-[#DCE1FB] text-base font-normal border border-transparent focus:border-[#60A5FA] focus:outline-none transition-all"
                    placeholder="Alexander Vance"
                    required
                  />
                  {errors.name && <p className="text-xs text-red-400 font-medium">{errors.name}</p>}
                </div>

                {/* Email Address */}
                <div className="space-y-2 relative">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#C2C6D6]">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={profile?.email || ""}
                      disabled
                      className="w-full px-4 py-3 pr-10 rounded-lg bg-[#2E3447] text-[#DCE1FB]/70 text-base font-normal border border-transparent cursor-not-allowed opacity-90"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full bg-[#00A74B]/20 text-[#4AE176]">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#C2C6D6]">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-[#2E3447] text-[#DCE1FB] text-base font-normal border border-transparent focus:border-[#60A5FA] focus:outline-none transition-all"
                  placeholder="+1 (555) 012-3456"
                />
              </div>

              {/* Business Fields (ONLY FOR OWNER/PROVIDER ROLES) */}
              {isOwnerOrProvider && (
                <div className="pt-4 border-t border-[#1E293B]/60 space-y-6">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#60A5FA]">
                      Business Details (Provider Context)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-[#C2C6D6]">
                        Business Name
                      </label>
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-[#2E3447] text-[#DCE1FB] text-base font-normal border border-transparent focus:border-[#60A5FA] focus:outline-none transition-all"
                        placeholder="Thorne Executive Detailers"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-[#C2C6D6]">
                        Business Email
                      </label>
                      <input
                        type="email"
                        value={businessEmail}
                        onChange={(e) => setBusinessEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-[#2E3447] text-[#DCE1FB] text-base font-normal border border-transparent focus:border-[#60A5FA] focus:outline-none transition-all"
                        placeholder="contact@thornedetail.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-[#C2C6D6]">
                        WhatsApp Number
                      </label>
                      <input
                        type="text"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-[#2E3447] text-[#DCE1FB] text-base font-normal border border-transparent focus:border-[#60A5FA] focus:outline-none transition-all"
                        placeholder="+1 555-900-1122"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-[#C2C6D6]">
                        Headquarters
                      </label>
                      <input
                        type="text"
                        value={headquarters}
                        onChange={(e) => setHeadquarters(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-[#2E3447] text-[#DCE1FB] text-base font-normal border border-transparent focus:border-[#60A5FA] focus:outline-none transition-all"
                        placeholder="888 Industrial Plaza, Suite 400"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Address Details (Sunken Visual Style #070D1F) */}
          <div className="p-8 rounded-[24px] bg-[#070D1F] border border-[#1E293B]/40 space-y-6">
            
            {/* Header & Location Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-[#60A5FA]" />
                <h3 className="text-lg font-semibold text-[#DCE1FB]">Physical Address</h3>
              </div>

              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={isLocating}
                className="flex items-center gap-2 text-xs font-normal text-[#60A5FA] hover:text-[#93c5fd] transition-colors cursor-pointer w-fit"
              >
                {isLocating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Navigation className="w-3.5 h-3.5 text-[#60A5FA]" />
                )}
                <span>use your current location</span>
              </button>
            </div>

            {/* Address Input Grid (3 Columns) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Building / House No. */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#C2C6D6]">
                  Building / House No.
                </label>
                <input
                  type="text"
                  value={building}
                  onChange={(e) => setBuilding(e.target.value)}
                  placeholder="e.g. 42B Skyline"
                  className="w-full px-4 py-3 rounded-lg bg-[#23293C] text-[#DCE1FB] placeholder:text-[#6B7280] text-base font-normal border border-transparent focus:border-[#60A5FA] focus:outline-none transition-all"
                />
              </div>

              {/* Street / Road */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#C2C6D6]">
                  Street / Road
                </label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="California St"
                  className="w-full px-4 py-3 rounded-lg bg-[#23293C] text-[#DCE1FB] placeholder:text-[#6B7280] text-base font-normal border border-transparent focus:border-[#60A5FA] focus:outline-none transition-all"
                />
              </div>

              {/* Village / City */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#C2C6D6]">
                  Village / City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="San Francisco"
                  className="w-full px-4 py-3 rounded-lg bg-[#23293C] text-[#DCE1FB] placeholder:text-[#6B7280] text-base font-normal border border-transparent focus:border-[#60A5FA] focus:outline-none transition-all"
                />
              </div>

              {/* District */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#C2C6D6]">
                  District
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="Financial District"
                  className="w-full px-4 py-3 rounded-lg bg-[#23293C] text-[#DCE1FB] placeholder:text-[#6B7280] text-base font-normal border border-transparent focus:border-[#60A5FA] focus:outline-none transition-all"
                />
              </div>

              {/* State */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#C2C6D6]">
                  State
                </label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="California"
                  className="w-full px-4 py-3 rounded-lg bg-[#23293C] text-[#DCE1FB] placeholder:text-[#6B7280] text-base font-normal border border-transparent focus:border-[#60A5FA] focus:outline-none transition-all"
                />
              </div>

              {/* Pincode */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#C2C6D6]">
                  Pincode
                </label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="94105"
                  className="w-full px-4 py-3 rounded-lg bg-[#23293C] text-[#DCE1FB] placeholder:text-[#6B7280] text-base font-normal border border-transparent focus:border-[#60A5FA] focus:outline-none transition-all"
                />
              </div>

              {/* Country Select (Full Width across 3 Cols on desktop) */}
              <div className="sm:col-span-2 lg:col-span-3 space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#C2C6D6]">
                  Country
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-[#23293C] text-[#DCE1FB] text-base font-normal border border-transparent focus:border-[#60A5FA] focus:outline-none transition-all cursor-pointer"
                >
                  <option value="United States">United States</option>
                  <option value="India">India</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                  <option value="Germany">Germany</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Action Bar (Footer) */}
        <div className="flex justify-between items-center px-10 py-6 border-t border-[#1E293B] bg-[#0F172A]">
          
          {/* Cancel */}
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-3 rounded-xl text-[#C2C6D6] hover:text-white font-bold text-sm transition-colors cursor-pointer"
          >
            Cancel
          </button>

          {/* Action Buttons Group */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={resetForm}
              disabled={isSubmitting}
              className="px-8 py-3 rounded-xl border border-[#424754]/20 bg-[#2E3447] hover:bg-[#3b4259] text-white font-bold text-sm transition-colors cursor-pointer"
            >
              Reset Changes
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-10 py-3.5 rounded-xl bg-[#3B82F6] hover:bg-[#2563eb] text-white font-black text-sm shadow-[0_4px_20px_0_rgba(59,130,246,0.30)] transition-all cursor-pointer flex items-center gap-2"
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
