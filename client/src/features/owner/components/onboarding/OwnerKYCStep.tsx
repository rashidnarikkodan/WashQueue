import { ChevronRight } from "lucide-react"
import { User, Building2, ShieldCheck, FileText } from "lucide-react"
import FormInput from "../../../../shared/components/form/FormInput"
import FormSelect from "../../../../shared/components/form/FormSelect"
import FormUpload from "../../../../shared/components/form/FormUpload"
import type { OnboardingDetails } from "../../services/owner.api"

interface OwnerKYCStepProps {
  formData: {
    fullName: string
    phone: string
    whatsapp: string
    businessName: string
    gstNumber: string
    idProofType: string
  }
  fieldErrors: Record<string, string>
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
  idProofFile: File | null
  onIdProofChange: (file: File | null) => void
  businessLicenseFile: File | null
  onBusinessLicenseChange: (file: File | null) => void
  gstCertificateFile: File | null
  onGstCertificateChange: (file: File | null) => void
  savedDetails: OnboardingDetails
  onCancel: () => void
  onContinue: () => void
  isLoading: boolean
}

export default function OwnerKYCStep({
  formData,
  fieldErrors,
  onChange,
  idProofFile,
  onIdProofChange,
  businessLicenseFile,
  onBusinessLicenseChange,
  gstCertificateFile,
  onGstCertificateChange,
  savedDetails,
  onCancel,
  onContinue,
  isLoading,
}: OwnerKYCStepProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="space-y-1">
        <span className="text-[10px] sm:text-xs font-bold text-primary tracking-widest uppercase block">
          STEP 1 OF 3
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
          Owner &amp; KYC Details
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 font-medium">
          Provide your personal, business, and identification details to set up your profile.
        </p>
      </div>

      <div className="h-[1px] bg-slate-800/60" />

      {/* Personal Information */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <User size={16} className="text-primary" />
          <h3 className="text-sm font-black text-slate-200 uppercase tracking-wider">
            Personal Information
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <FormInput
              label="Legal Full Name"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={onChange}
              placeholder="Enter your full name"
              leftIcon={<User size={16} />}
              error={fieldErrors.fullName}
            />
          </div>

          <div className="md:col-span-1">
            <FormInput
              label="Phone Number"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={onChange}
              placeholder="Enter phone number"
              prefix="🇮🇳 +91"
              error={fieldErrors.phone}
            />
          </div>

          <div className="md:col-span-1">
            <FormInput
              label="Whatsapp Number (optional)"
              type="tel"
              name="whatsapp"
              value={formData.whatsapp}
              onChange={onChange}
              placeholder="Enter phone number"
              prefix="🇮🇳 +91"
              error={fieldErrors.whatsapp}
            />
          </div>
        </div>
      </div>

      <div className="h-[1px] bg-slate-800/40" />

      {/* Business Information */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Building2 size={16} className="text-primary" />
          <h3 className="text-sm font-black text-slate-200 uppercase tracking-wider">
            Business Information
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-1">
            <FormInput
              label="Business Name"
              type="text"
              name="businessName"
              value={formData.businessName}
              onChange={onChange}
              placeholder="Enter your business name"
              leftIcon={<Building2 size={16} />}
              error={fieldErrors.businessName}
            />
          </div>

          <div className="md:col-span-1">
            <FormInput
              label="GST Number (optional)"
              type="text"
              name="gstNumber"
              value={formData.gstNumber}
              onChange={onChange}
              placeholder="Enter GST number (optional)"
              leftIcon={<FileText size={16} />}
              error={fieldErrors.gstNumber}
            />
          </div>
        </div>
      </div>

      <div className="h-[1px] bg-slate-800/40" />

      {/* Identity Verification */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-primary" />
          <h3 className="text-sm font-black text-slate-200 uppercase tracking-wider">
            Identity Verification
          </h3>
        </div>

        <div className="space-y-6">
          <FormSelect
            label="Select ID Proof Type"
            name="idProofType"
            value={formData.idProofType}
            onChange={onChange}
            placeholder="Select ID proof type"
            options={[
              { value: "aadhar", label: "Aadhar Card" },
              { value: "pan", label: "PAN Card" },
              { value: "passport", label: "Passport" },
              { value: "dl", label: "Driving License" },
            ]}
            error={fieldErrors.idProofType}
          />

          <FormUpload
            label="Upload ID Proof"
            file={idProofFile}
            onChange={onIdProofChange}
            variant="card"
            subtext="PNG, JPG, PDF UP TO 10MB"
            existingUrl={savedDetails.idProofUrl}
            error={fieldErrors.idProofFile}
          />
        </div>
      </div>

      <div className="h-[1px] bg-slate-800/40" />

      {/* Business Verification (Optional) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-primary" />
            <h3 className="text-sm font-black text-slate-200 uppercase tracking-wider">
              Business Verification
            </h3>
          </div>
          <span className="bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest uppercase">
            Optional
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormUpload
            label="Business License (optional)"
            file={businessLicenseFile}
            onChange={onBusinessLicenseChange}
            variant="row"
            subtext="Click to upload / PNG, JPG, PDF up to 10MB"
            existingUrl={savedDetails.businessLicenseUrl}
          />

          <FormUpload
            label="GST Certificate (optional)"
            file={gstCertificateFile}
            onChange={onGstCertificateChange}
            variant="row"
            subtext="Click to upload / PNG, JPG, PDF up to 10MB"
            existingUrl={savedDetails.gstCertificateUrl}
          />
        </div>
      </div>

      <div className="h-[1px] bg-slate-800/60" />

      {/* Footer Actions */}
      <div className="flex justify-between items-center pt-2 select-none">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-900/60 text-slate-400 hover:text-white text-xs font-extrabold tracking-wider transition-all cursor-pointer"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={onContinue}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 min-w-[160px] px-6 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 font-extrabold text-xs tracking-wider transition-all cursor-pointer shadow-lg shadow-primary/10 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading && (
            <div className="h-3.5 w-3.5 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin shrink-0" />
          )}
          <span>{isLoading ? "Saving..." : "Save & Continue"}</span>
          {!isLoading && <ChevronRight size={14} />}
        </button>
      </div>
    </div>
  )
}
