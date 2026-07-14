import { useState } from "react";
import {
  ChevronRight,
  ArrowLeft,
  Send,
  Check,
  ShieldCheck,
  HelpCircle,
  User,
  Building2,
  CreditCard,
  Landmark,
  FileText,
} from "lucide-react";
import Loading from "../../../../shared/components/ui/Loading";
import FormInput from "../../../../shared/components/form/FormInput";
import FormSelect from "../../../../shared/components/form/FormSelect";
import FormUpload from "../../../../shared/components/form/FormUpload";
import { useAuthStore } from "../../../../features/auth/store/authStore";
import type { OnboardingDetails } from "../../services/owner.api";
import { step1Schema, step2Schema } from "../../schemas/owner.schema";
import OnboardingDetailsSummary from "../../../users/components/ui/OnboardingDetailsSummary";

interface OnboardingFormProps {
  step: number;
  savedDetails: OnboardingDetails;
  onSaveStep: (
    currentStep: number,
    formData: FormData,
    nextStep: number,
    setStep: (s: number) => void
  ) => Promise<void>;
  onSubmit: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

// Helper to build FormData from text/boolean fields + optional file
function buildFormData(
  fields: Record<string, string | number | boolean | null | undefined>,
  files?: Record<string, File | null>
): FormData {
  const fd = new FormData();
  for (const [key, val] of Object.entries(fields)) {
    if (val !== undefined && val !== null) {
      if (typeof val === "boolean") {
        fd.append(key, val ? "true" : "false");
      } else {
        fd.append(key, String(val));
      }
    }
  }
  if (files) {
    for (const [key, file] of Object.entries(files)) {
      if (file) fd.append(key, file);
    }
  }
  return fd;
}

export default function OnboardingForm({
  step,
  savedDetails,
  onSaveStep,
  onSubmit,
  onCancel,
  isLoading = false,
}: OnboardingFormProps) {
  const { user } = useAuthStore();

  // Internal step state controlled by the form (mirrors store.onboardingStep for setStep calls)
  const [localStep, setLocalStep] = useState(step);

  // Keep localStep in sync with prop changes (e.g., after fetchOnboardingStatus resolves)
  // We rely on OwnerOnboarding passing the correct initial step through `step` prop.

  // Form State — pre-fill from server draft
  const [formData, setFormData] = useState({
    fullName: savedDetails.fullName ?? "",
    phone: savedDetails.phone ?? "",
    whatsapp: savedDetails.whatsapp ?? "",
    businessName: savedDetails.businessName ?? "",
    businessType: savedDetails.businessType ?? "",
    gstNumber: savedDetails.gstNumber ?? "",
    idProofType: savedDetails.idProofType ?? "",
    hasStation: savedDetails.hasStation ?? false,
    hasMobileService: savedDetails.hasMobileService ?? false,
    accountHolderName: savedDetails.accountHolderName ?? "",
    bankName: savedDetails.bankName ?? "",
    accountNumber: savedDetails.accountNumber ?? "",
    ifscCode: savedDetails.ifscCode ?? "",
    accountType: savedDetails.accountType ?? "Savings Account",
  });

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  // Files State
  const [idProofFile, setIdProofFile] = useState<File | null>(null);
  const [businessLicenseFile, setBusinessLicenseFile] = useState<File | null>(null);
  const [gstCertificateFile, setGstCertificateFile] = useState<File | null>(null);
  const [bankProofFile, setBankProofFile] = useState<File | null>(null);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleIdProofChange = (file: File | null) => {
    setIdProofFile(file);
    if (fieldErrors.idProofFile) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.idProofFile;
        return next;
      });
    }
  };

  const handleBankProofChange = (file: File | null) => {
    setBankProofFile(file);
    if (fieldErrors.bankProofFile) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.bankProofFile;
        return next;
      });
    }
  };

  // Step 1 → 2: save owner & KYC details
  const handleContinueToStep2 = () => {
    const validationResult = step1Schema.safeParse({
      fullName: formData.fullName,
      phone: formData.phone,
      whatsapp: formData.whatsapp,
      businessName: formData.businessName,
      businessType: formData.businessType,
      idProofType: formData.idProofType,
      gstNumber: formData.gstNumber,
      hasStation: formData.hasStation,
      hasMobileService: formData.hasMobileService,
    });

    const errors: Record<string, string> = {};
    if (!validationResult.success) {
      validationResult.error.issues.forEach((err) => {
        const path = err.path[0];
        if (path !== undefined) {
          errors[String(path)] = err.message;
        }
      });
    }

    if (!idProofFile && !savedDetails.idProofUrl) {
      errors.idProofFile = "Identity verification document is required";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});

    const fd = buildFormData(
      {
        fullName: formData.fullName,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        businessName: formData.businessName,
        businessType: formData.businessType,
        gstNumber: formData.gstNumber,
        idProofType: formData.idProofType,
        hasStation: formData.hasStation,
        hasMobileService: formData.hasMobileService,
      },
      {
        idProofFile,
        businessLicenseFile,
        gstCertificateFile,
      }
    );
    onSaveStep(1, fd, 2, setLocalStep);
  };

  // Step 2 → 3: save payout/bank details
  const handleContinueToStep3 = () => {
    const validationResult = step2Schema.safeParse({
      accountHolderName: formData.accountHolderName,
      bankName: formData.bankName,
      accountNumber: formData.accountNumber,
      ifscCode: formData.ifscCode,
      accountType: formData.accountType,
    });

    const errors: Record<string, string> = {};
    if (!validationResult.success) {
      validationResult.error.issues.forEach((err) => {
        const path = err.path[0];
        if (path !== undefined) {
          errors[String(path)] = err.message;
        }
      });
    }

    if (!bankProofFile && !savedDetails.bankProofUrl) {
      errors.bankProofFile = "Bank verification proof document is required";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});

    const fd = buildFormData(
      {
        accountHolderName: formData.accountHolderName,
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        ifscCode: formData.ifscCode,
        accountType: formData.accountType,
      },
      { bankProofFile }
    );
    onSaveStep(2, fd, 3, setLocalStep);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  // Display the localStep (keeps UI in sync with save-step transitions)
  const activeStep = localStep;

  return (
    <form onSubmit={handleSubmit} className="space-y-8 text-left">
      {/* -------------------- STEP 1: OWNER & KYC DETAILS -------------------- */}
      {activeStep === 1 && (
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
                  onChange={handleChange}
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
                  onChange={handleChange}
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
                  onChange={handleChange}
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <FormInput
                  label="Business Name"
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  placeholder="Enter your business name"
                  leftIcon={<Building2 size={16} />}
                  error={fieldErrors.businessName}
                />
              </div>

              <div className="md:col-span-1">
                <FormSelect
                  label="Business Type"
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleChange}
                  placeholder="Select business type"
                  options={[
                    { value: "INDIVIDUAL", label: "Individual / Freelancer" },
                    { value: "SOLE_PROP", label: "Sole Proprietorship" },
                    { value: "PARTNERSHIP", label: "Partnership" },
                    { value: "PVT_LTD", label: "Private Limited Company" },
                  ]}
                  error={fieldErrors.businessType}
                />
              </div>

              <div className="md:col-span-1">
                <FormInput
                  label="GST Number (optional)"
                  type="text"
                  name="gstNumber"
                  value={formData.gstNumber}
                  onChange={handleChange}
                  placeholder="Enter GST number (optional)"
                  leftIcon={<FileText size={16} />}
                  error={fieldErrors.gstNumber}
                />
              </div>
            </div>
          </div>

          <div className="h-[1px] bg-slate-800/40" />

          {/* Service Capabilities */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Check size={16} className="text-primary" />
              <h3 className="text-sm font-black text-slate-200 uppercase tracking-wider">
                Service Capabilities
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/50 p-5 border border-slate-800/60 rounded-2xl">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="hasStation"
                  checked={!!formData.hasStation}
                  onChange={handleCheckboxChange}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-primary focus:ring-primary focus:ring-offset-slate-900 mt-1"
                />
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors block">
                    Physical Washing Station / Outlet
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium block">
                    Check this if you have a physical garage, studio, or station where customers bring their vehicles.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="hasMobileService"
                  checked={!!formData.hasMobileService}
                  onChange={handleCheckboxChange}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-primary focus:ring-primary focus:ring-offset-slate-900 mt-1"
                />
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors block">
                    Mobile Detailing / Doorstep Service
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium block">
                    Check this if you provide mobile vehicle wash or detailing services at the customer's location.
                  </span>
                </div>
              </label>
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
                onChange={handleChange}
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
                onChange={handleIdProofChange}
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
                onChange={setBusinessLicenseFile}
                variant="row"
                subtext="Click to upload / PNG, JPG, PDF up to 10MB"
                existingUrl={savedDetails.businessLicenseUrl}
              />

              <FormUpload
                label="GST Certificate (optional)"
                file={gstCertificateFile}
                onChange={setGstCertificateFile}
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
              onClick={handleContinueToStep2}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 font-extrabold text-xs tracking-wider transition-all cursor-pointer shadow-lg shadow-primary/10 disabled:opacity-50"
            >
              {isLoading ? <Loading size="sm" /> : (
                <>
                  <span>Save &amp; Continue</span>
                  <ChevronRight size={14} />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* -------------------- STEP 2: PAYOUT SETUP -------------------- */}
      {activeStep === 2 && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Header */}
          <div className="space-y-1">
            <span className="text-[10px] sm:text-xs font-bold text-primary tracking-widest uppercase block">
              STEP 2 OF 3
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
              Payout Setup
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">
              Add your bank account details to receive earnings and settlements securely.
            </p>
          </div>

          <div className="h-[1px] bg-slate-800/60" />

          {/* Bank Information Grid */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-primary">
                <ShieldCheck size={16} />
              </div>
              <h3 className="text-sm font-black text-slate-200 uppercase tracking-wider">
                Bank Information
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <FormInput
                  label="Account Holder Name"
                  type="text"
                  name="accountHolderName"
                  value={formData.accountHolderName}
                  onChange={handleChange}
                  placeholder="Enter account holder name"
                  leftIcon={<User size={16} />}
                  error={fieldErrors.accountHolderName}
                />
              </div>

              <div>
                <FormSelect
                  label="Bank Name"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleChange}
                  placeholder="Select bank name"
                  options={[
                    { value: "Federal Bank", label: "Federal Bank" },
                    { value: "State Bank of India", label: "State Bank of India" },
                    { value: "HDFC Bank", label: "HDFC Bank" },
                    { value: "ICICI Bank", label: "ICICI Bank" },
                    { value: "Axis Bank", label: "Axis Bank" },
                  ]}
                  error={fieldErrors.bankName}
                />
              </div>

              <div>
                <FormInput
                  label="Account Number"
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  placeholder="Enter account number"
                  leftIcon={<CreditCard size={16} />}
                  error={fieldErrors.accountNumber}
                />
              </div>

              <div className="space-y-1">
                <FormInput
                  label="IFSC Code"
                  type="text"
                  name="ifscCode"
                  value={formData.ifscCode}
                  onChange={handleChange}
                  placeholder="Enter IFSC code"
                  leftIcon={<Landmark size={16} />}
                  error={fieldErrors.ifscCode}
                />
                <span className="text-[10px] text-slate-500 font-medium pl-1 flex items-center gap-1 mt-0.5">
                  <HelpCircle size={10} /> Used to identify your bank branch securely.
                </span>
              </div>

              <div className="md:col-span-2">
                <FormSelect
                  label="Account Type"
                  name="accountType"
                  value={formData.accountType}
                  onChange={handleChange}
                  options={[
                    { value: "Savings Account", label: "Savings Account" },
                    { value: "Current Account", label: "Current Account" },
                  ]}
                  error={fieldErrors.accountType}
                />
              </div>
            </div>
          </div>

          <div className="h-[1px] bg-slate-800/40" />

          {/* Bank Verification Document Upload */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider">
              Bank Verification
            </h3>
            <FormUpload
              label="Upload Bank Proof"
              file={bankProofFile}
              onChange={handleBankProofChange}
              variant="card"
              subtext="PNG, JPG, PDF UP TO 10MB"
              existingUrl={savedDetails.bankProofUrl}
              error={fieldErrors.bankProofFile}
            />
          </div>

          <div className="h-[1px] bg-slate-800/40" />

          {/* Security Notice */}
          <div className="flex items-start gap-4 p-5 border border-blue-500/15 bg-blue-500/5 rounded-2xl">
            <div className="w-9 h-9 rounded-full bg-blue-500/10 border border-blue-500/20 text-primary flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck size={18} />
            </div>
            <div className="space-y-0.5 text-left">
              <h4 className="text-xs font-black text-white uppercase tracking-wider">
                Your banking information is encrypted and securely stored.
              </h4>
              <p className="text-[11px] text-slate-500 font-semibold">
                WashQueue never shares your payout details publicly.
              </p>
            </div>
          </div>

          <div className="h-[1px] bg-slate-800/60" />

          {/* Footer Actions */}
          <div className="flex justify-between items-center pt-2 select-none">
            <button
              type="button"
              onClick={() => setLocalStep(1)}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-900/60 text-slate-400 hover:text-white text-xs font-extrabold tracking-wider transition-all cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleContinueToStep3}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 font-extrabold text-xs tracking-wider transition-all cursor-pointer shadow-lg shadow-primary/10 disabled:opacity-50"
            >
              {isLoading ? <Loading size="sm" /> : (
                <>
                  <span>Save &amp; Continue</span>
                  <ChevronRight size={14} />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* -------------------- STEP 3: REVIEW & SUBMIT -------------------- */}
      {activeStep === 3 && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Header */}
          <div className="space-y-1">
            <span className="text-[10px] sm:text-xs font-bold text-primary tracking-widest uppercase block">
              STEP 3 OF 3
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
              Review &amp; Submit
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">
              Please review all details carefully before submitting your owner application.
            </p>
          </div>

          <div className="h-[1px] bg-slate-800/60" />

          {/* Banner Info */}
          <div className="flex items-center gap-4 p-4 border border-blue-500/20 bg-blue-500/10 rounded-2xl">
            <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white shrink-0">
              <Check size={14} strokeWidth={3} />
            </div>
            <div className="space-y-0.5 text-left">
              <h4 className="text-xs font-bold text-blue-100">
                Once submitted, your application will be reviewed within 1–2 business days.
              </h4>
              <p className="text-[10px] text-blue-300 font-medium opacity-80">
                We will notify you via email and in-app updates.
              </p>
            </div>
          </div>

          {/* Details Overview Box */}
          <OnboardingDetailsSummary
            details={formData}
            email={user?.email}
            idProofFile={idProofFile}
            bankProofFile={bankProofFile}
            businessLicenseFile={businessLicenseFile}
            gstCertificateFile={gstCertificateFile}
            onEditStep={(stepNum) => setLocalStep(stepNum)}
          />

          <div className="h-[1px] bg-slate-800/40" />

          {/* Security Notice */}
          <div className="flex items-center justify-between p-4 border border-emerald-500/15 bg-emerald-500/5 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck size={16} />
              </div>
              <div className="space-y-0.5 text-left text-xs">
                <h4 className="font-bold text-slate-200">
                  Your information is secure and encrypted.
                </h4>
                <p className="text-[10px] text-slate-500">
                  WashQueue never shares your personal or banking details publicly.
                </p>
              </div>
            </div>
            <div className="hidden sm:inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-[9px] font-black tracking-wider uppercase">
              🔒 Bank-grade security
            </div>
          </div>

          <div className="h-[1px] bg-slate-800/60" />

          {/* Footer Actions */}
          <div className="flex justify-between items-center pt-2 select-none">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => setLocalStep(2)}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-900/60 text-slate-400 hover:text-white text-xs font-extrabold tracking-wider transition-all cursor-pointer disabled:opacity-50"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-extrabold text-xs tracking-wider transition-all cursor-pointer shadow-lg shadow-emerald-500/10 disabled:opacity-50"
            >
              {isLoading ? (
                <Loading size="sm" />
              ) : (
                <>
                  <Send size={13} />
                  <span>Submit Application</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
