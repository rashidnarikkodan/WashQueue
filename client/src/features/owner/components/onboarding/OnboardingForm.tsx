import { useState, useEffect } from "react"
import { useAuthStore } from "../../../../features/auth/store/authStore"
import type { OnboardingDetails } from "@/shared/apis/owner.api"
import { step1Schema, step2Schema } from "../../schemas/owner.schema"
import OwnerKYCStep from "./OwnerKYCStep"
import PayoutStep from "./PayoutStep"
import ReviewSubmitStep from "./ReviewSubmitStep"

interface OnboardingFormProps {
  step: number
  savedDetails: OnboardingDetails
  onSaveStep: (
    currentStep: number,
    formData: FormData,
    nextStep: number,
    setStep: (s: number) => void
  ) => Promise<void>
  onSubmit: () => void
  onCancel: () => void
  isLoading?: boolean
}

// Helper to build FormData from text/boolean fields + optional file
function buildFormData(
  fields: Record<string, string | number | boolean | null | undefined>,
  files?: Record<string, File | null>
): FormData {
  const fd = new FormData()
  for (const [key, val] of Object.entries(fields)) {
    if (val !== undefined && val !== null) {
      if (typeof val === "boolean") {
        fd.append(key, val ? "true" : "false")
      } else {
        fd.append(key, String(val))
      }
    }
  }
  if (files) {
    for (const [key, file] of Object.entries(files)) {
      if (file) fd.append(key, file)
    }
  }
  return fd
}

export default function OnboardingForm({
  step,
  savedDetails,
  onSaveStep,
  onSubmit,
  onCancel,
  isLoading = false,
}: OnboardingFormProps) {
  const { user } = useAuthStore()

  // Internal step state controlled by the form (mirrors store.onboardingStep for setStep calls)
  const [localStep, setLocalStep] = useState(step)

  // Keep localStep in sync with prop changes (e.g., after fetchOnboardingStatus resolves)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalStep(step)
  }, [step])

  // Form State — pre-fill from server draft
  const [formData, setFormData] = useState({
    fullName: savedDetails.fullName ?? "",
    phone: savedDetails.phone ?? "",
    whatsapp: savedDetails.whatsapp ?? "",
    businessName: savedDetails.businessName ?? "",
    gstNumber: savedDetails.gstNumber ?? "",
    idProofType: savedDetails.idProofType ?? "",
    accountHolderName: savedDetails.accountHolderName ?? "",
    bankName: savedDetails.bankName ?? "",
    accountNumber: savedDetails.accountNumber ?? "",
    ifscCode: savedDetails.ifscCode ?? "",
  })

  // Keep formData in sync with savedDetails when it is loaded/updated
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData({
      fullName: savedDetails.fullName ?? "",
      phone: savedDetails.phone ?? "",
      whatsapp: savedDetails.whatsapp ?? "",
      businessName: savedDetails.businessName ?? "",
      gstNumber: savedDetails.gstNumber ?? "",
      idProofType: savedDetails.idProofType ?? "",
      accountHolderName: savedDetails.accountHolderName ?? "",
      bankName: savedDetails.bankName ?? "",
      accountNumber: savedDetails.accountNumber ?? "",
      ifscCode: savedDetails.ifscCode ?? "",
    })
  }, [savedDetails])

  // Files State
  const [idProofFile, setIdProofFile] = useState<File | null>(null)
  const [businessLicenseFile, setBusinessLicenseFile] = useState<File | null>(null)
  const [gstCertificateFile, setGstCertificateFile] = useState<File | null>(null)
  const [bankProofFile, setBankProofFile] = useState<File | null>(null)

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  const handleIdProofChange = (file: File | null) => {
    setIdProofFile(file)
    if (fieldErrors.idProofFile) {
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next.idProofFile
        return next
      })
    }
  }

  const handleBankProofChange = (file: File | null) => {
    setBankProofFile(file)
    if (fieldErrors.bankProofFile) {
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next.bankProofFile
        return next
      })
    }
  }

  // Step 1 → 2: save owner & KYC details
  const handleContinueToStep2 = () => {
    const validationResult = step1Schema.safeParse({
      fullName: formData.fullName,
      phone: formData.phone,
      whatsapp: formData.whatsapp,
      businessName: formData.businessName,
      idProofType: formData.idProofType,
      gstNumber: formData.gstNumber,
    })

    const errors: Record<string, string> = {}
    if (!validationResult.success) {
      validationResult.error.issues.forEach((err) => {
        const path = err.path[0]
        if (path !== undefined) {
          errors[String(path)] = err.message
        }
      })
    }

    if (!idProofFile && !savedDetails.idProofUrl) {
      errors.idProofFile = "Identity verification document is required"
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setFieldErrors({})

    const fd = buildFormData(
      {
        fullName: formData.fullName,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        businessName: formData.businessName,
        gstNumber: formData.gstNumber,
        idProofType: formData.idProofType,
      },
      {
        idProofFile,
        businessLicenseFile,
        gstCertificateFile,
      }
    )
    onSaveStep(1, fd, 2, setLocalStep)
  }

  // Step 2 → 3: save payout/bank details
  const handleContinueToStep3 = () => {
    const validationResult = step2Schema.safeParse({
      accountHolderName: formData.accountHolderName,
      bankName: formData.bankName,
      accountNumber: formData.accountNumber,
      ifscCode: formData.ifscCode,
    })

    const errors: Record<string, string> = {}
    if (!validationResult.success) {
      validationResult.error.issues.forEach((err) => {
        const path = err.path[0]
        if (path !== undefined) {
          errors[String(path)] = err.message
        }
      })
    }

    if (!bankProofFile && !savedDetails.bankProofUrl) {
      errors.bankProofFile = "Bank verification proof document is required"
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setFieldErrors({})

    const fd = buildFormData(
      {
        accountHolderName: formData.accountHolderName,
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        ifscCode: formData.ifscCode,
      },
      { bankProofFile }
    )
    onSaveStep(2, fd, 3, setLocalStep)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit()
  }

  // Display the localStep (keeps UI in sync with save-step transitions)
  const activeStep = localStep

  return (
    <form onSubmit={handleSubmit} className="space-y-8 text-left">
      {activeStep === 1 && (
        <OwnerKYCStep
          formData={formData}
          fieldErrors={fieldErrors}
          onChange={handleChange}
          idProofFile={idProofFile}
          onIdProofChange={handleIdProofChange}
          businessLicenseFile={businessLicenseFile}
          onBusinessLicenseChange={setBusinessLicenseFile}
          gstCertificateFile={gstCertificateFile}
          onGstCertificateChange={setGstCertificateFile}
          savedDetails={savedDetails}
          onCancel={onCancel}
          onContinue={handleContinueToStep2}
          isLoading={isLoading}
        />
      )}

      {activeStep === 2 && (
        <PayoutStep
          formData={formData}
          fieldErrors={fieldErrors}
          onChange={handleChange}
          bankProofFile={bankProofFile}
          onBankProofChange={handleBankProofChange}
          savedDetails={savedDetails}
          onBack={() => setLocalStep(1)}
          onContinue={handleContinueToStep3}
          isLoading={isLoading}
        />
      )}

      {activeStep === 3 && (
        <ReviewSubmitStep
          formData={formData}
          savedDetails={savedDetails}
          userEmail={user?.email}
          idProofFile={idProofFile}
          bankProofFile={bankProofFile}
          businessLicenseFile={businessLicenseFile}
          gstCertificateFile={gstCertificateFile}
          onEditStep={(stepNum: number) => setLocalStep(stepNum)}
          onBack={() => setLocalStep(2)}
          isLoading={isLoading}
        />
      )}
    </form>
  )
}
