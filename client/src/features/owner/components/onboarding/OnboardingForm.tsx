import { useState, useRef } from "react";
import { Upload, FileText, ChevronRight, X, ArrowLeft, Send, Check, ShieldCheck, HelpCircle, User, Building2, CreditCard, Landmark } from "lucide-react";
import Loading from "../../../../shared/components/ui/Loading";
import FormInput from "../../../../shared/components/ui/FormInput";
import { useAuthStore } from "../../../../features/auth/store/authStore";

interface OnboardingFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
}

export default function OnboardingForm({
  onSubmit,
  onCancel,
  isLoading = false,
  step,
  setStep,
}: OnboardingFormProps) {
  const { user } = useAuthStore();

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    whatsapp: "",
    businessName: "",
    businessType: "",
    gstNumber: "",
    idProofType: "",
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    accountType: "Savings Account",
  });

  // Files State
  const [idProofFile, setIdProofFile] = useState<File | null>(null);
  const [businessLicenseFile, setBusinessLicenseFile] = useState<File | null>(null);
  const [gstCertificateFile, setGstCertificateFile] = useState<File | null>(null);
  const [bankProofFile, setBankProofFile] = useState<File | null>(null);

  // File Inputs Refs
  const idProofInputRef = useRef<HTMLInputElement>(null);
  const businessLicenseInputRef = useRef<HTMLInputElement>(null);
  const gstCertificateInputRef = useRef<HTMLInputElement>(null);
  const bankProofInputRef = useRef<HTMLInputElement>(null);

  // Input change handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // File selection handlers
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: React.Dispatch<React.SetStateAction<File | null>>
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  // Navigation validations (bypassed for testing)
  const handleContinueToStep2 = () => {
    setStep(2);
  };

  const handleContinueToStep3 = () => {
    setStep(3);
  };

  // Form Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      idProofFile,
      businessLicenseFile,
      gstCertificateFile,
      bankProofFile,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 text-left">
      {/* -------------------- STEP 1: OWNER & KYC DETAILS -------------------- */}
      {step === 1 && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Header */}
          <div className="space-y-1">
            <span className="text-[10px] sm:text-xs font-bold text-primary tracking-widest uppercase block">
              STEP 1 OF 3
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
              Owner & KYC Details
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
              {/* Full Name */}
              <div className="md:col-span-1">
                <FormInput
                  label="Legal Full Name"
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  leftIcon={<User size={16} />}
                />
              </div>

              {/* Phone Number */}
              <div className="md:col-span-1">
                <FormInput
                  label="Phone Number"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  prefix="🇮🇳 +91"
                />
              </div>

              {/* Whatsapp Number */}
              <div className="md:col-span-1">
                <FormInput
                  label="Whatsapp Number (optional)"
                  type="tel"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  prefix="🇮🇳 +91"
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
              {/* Business Name */}
              <div className="md:col-span-1">
                <FormInput
                  label="Business Name"
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  placeholder="Enter your business name"
                  leftIcon={<Building2 size={16} />}
                />
              </div>

              {/* Business Type */}
              <div className="space-y-1.5 md:col-span-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1">
                  Business Type
                </label>
                <select
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleChange}
                  className="w-full bg-muted border border-border/80 hover:border-border focus:border-primary rounded-xl px-3 py-3 text-sm text-foreground outline-none transition-all focus:ring-2 focus:ring-primary/20 font-semibold cursor-pointer"
                >
                  <option value="" className="text-slate-600">Select business type</option>
                  <option value="single">Single Station</option>
                  <option value="enterprise">Multi-Station Enterprise</option>
                  <option value="detailer">Detailer Studio</option>
                </select>
              </div>

              {/* GST Number */}
              <div className="md:col-span-1">
                <FormInput
                  label="GST Number (optional)"
                  type="text"
                  name="gstNumber"
                  value={formData.gstNumber}
                  onChange={handleChange}
                  placeholder="Enter GST number (optional)"
                  leftIcon={<FileText size={16} />}
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Side: Upload Controls */}
              <div className="space-y-4 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1">
                    Select ID Proof Type
                  </label>
                  <select
                    name="idProofType"
                    value={formData.idProofType}
                    onChange={handleChange}
                    className="w-full bg-muted border border-border/80 hover:border-border focus:border-primary rounded-xl px-3 py-3 text-sm text-foreground outline-none transition-all focus:ring-2 focus:ring-primary/20 font-semibold cursor-pointer"
                  >
                    <option value="" className="text-slate-650">Select ID proof type</option>
                    <option value="aadhar">Aadhar Card</option>
                    <option value="pan">PAN Card</option>
                    <option value="passport">Passport</option>
                    <option value="dl">Driving License</option>
                  </select>
                </div>

                {/* Upload Dropzone Container */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1">
                    Upload ID Proof
                  </label>
                  <div
                    onClick={() => idProofInputRef.current?.click()}
                    className="group border-2 border-dashed border-slate-800 hover:border-primary/60 bg-slate-950/10 hover:bg-primary/5 rounded-2xl p-6 flex flex-col justify-center items-center text-center gap-3 transition-all duration-300 cursor-pointer"
                  >
                    <input
                      type="file"
                      ref={idProofInputRef}
                      className="hidden"
                      onChange={(e) => handleFileChange(e, setIdProofFile)}
                      accept="image/png, image/jpeg, application/pdf"
                    />
                    <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 border border-slate-850 group-hover:scale-105 transition-transform">
                      <Upload size={20} className="text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-200">
                        {idProofFile ? idProofFile.name : "Drag and drop your file here"}
                      </p>
                      <p className="text-xs text-slate-400">
                        or <span className="text-primary font-bold">click to browse</span>
                      </p>
                    </div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      PNG, JPG, PDF UP TO 10MB
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Side: Preview Card */}
              <div className="border border-slate-850 bg-slate-950/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-4 min-h-[220px]">
                {idProofFile ? (
                  <div className="space-y-3">
                    <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 flex items-center justify-center mx-auto animate-in zoom-in duration-300">
                      <FileText size={24} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-white max-w-[200px] truncate">{idProofFile.name}</p>
                      <p className="text-[11px] text-slate-500 font-semibold font-mono">
                        {(idProofFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIdProofFile(null);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 font-bold tracking-wide transition-colors"
                    >
                      <X size={14} /> Remove file
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-14 h-14 rounded-full bg-slate-900 border border-slate-850 flex items-center justify-center mx-auto text-slate-600">
                      <FileText size={24} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-300">Document Preview</h4>
                      <p className="text-xs text-slate-500 max-w-[200px] leading-relaxed font-semibold">
                        Your uploaded ID proof will appear here.
                      </p>
                    </div>
                  </div>
                )}
              </div>
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
              {/* License Upload Box */}
              <div
                onClick={() => businessLicenseInputRef.current?.click()}
                className="flex items-center justify-between p-4 border border-slate-800/80 hover:border-slate-700 bg-slate-950/20 hover:bg-slate-900/40 rounded-2xl cursor-pointer transition-all duration-300 group"
              >
                <input
                  type="file"
                  ref={businessLicenseInputRef}
                  className="hidden"
                  onChange={(e) => handleFileChange(e, setBusinessLicenseFile)}
                  accept="image/png, image/jpeg, application/pdf"
                />
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-800 text-slate-400 group-hover:scale-105 transition-transform shrink-0">
                    <Upload size={18} className="text-primary" />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-xs font-bold text-white truncate">
                      {businessLicenseFile ? businessLicenseFile.name : "Business License (optional)"}
                    </p>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                      {businessLicenseFile
                        ? `${(businessLicenseFile.size / (1024 * 1024)).toFixed(2)} MB`
                        : "Click to upload / PNG, JPG, PDF up to 10MB"}
                    </p>
                  </div>
                </div>
                {businessLicenseFile ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setBusinessLicenseFile(null);
                    }}
                    className="w-7 h-7 rounded-full bg-slate-900 border border-slate-850 hover:bg-slate-850 flex items-center justify-center text-slate-450 hover:text-white transition-colors"
                  >
                    <X size={14} />
                  </button>
                ) : (
                  <span className="text-[10px] font-black text-primary uppercase border border-primary/20 bg-primary/5 px-2.5 py-1.5 rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-all shrink-0">
                    Choose File
                  </span>
                )}
              </div>

              {/* GST Certificate Upload Box */}
              <div
                onClick={() => gstCertificateInputRef.current?.click()}
                className="flex items-center justify-between p-4 border border-slate-800/80 hover:border-slate-700 bg-slate-950/20 hover:bg-slate-900/40 rounded-2xl cursor-pointer transition-all duration-300 group"
              >
                <input
                  type="file"
                  ref={gstCertificateInputRef}
                  className="hidden"
                  onChange={(e) => handleFileChange(e, setGstCertificateFile)}
                  accept="image/png, image/jpeg, application/pdf"
                />
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-800 text-slate-400 group-hover:scale-105 transition-transform shrink-0">
                    <Upload size={18} className="text-primary" />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-xs font-bold text-white truncate">
                      {gstCertificateFile ? gstCertificateFile.name : "GST Certificate (optional)"}
                    </p>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                      {gstCertificateFile
                        ? `${(gstCertificateFile.size / (1024 * 1024)).toFixed(2)} MB`
                        : "Click to upload / PNG, JPG, PDF up to 10MB"}
                    </p>
                  </div>
                </div>
                {gstCertificateFile ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setGstCertificateFile(null);
                    }}
                    className="w-7 h-7 rounded-full bg-slate-900 border border-slate-850 hover:bg-slate-850 flex items-center justify-center text-slate-450 hover:text-white transition-colors"
                  >
                    <X size={14} />
                  </button>
                ) : (
                  <span className="text-[10px] font-black text-primary uppercase border border-primary/20 bg-primary/5 px-2.5 py-1.5 rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-all shrink-0">
                    Choose File
                  </span>
                )}
              </div>
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
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 font-extrabold text-xs tracking-wider transition-all cursor-pointer shadow-lg shadow-primary/10"
            >
              <span>Continue</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* -------------------- STEP 2: PAYOUT SETUP -------------------- */}
      {step === 2 && (
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
              {/* Account Holder Name */}
              <div>
                <FormInput
                  label="Account Holder Name"
                  type="text"
                  name="accountHolderName"
                  value={formData.accountHolderName}
                  onChange={handleChange}
                  placeholder="Enter account holder name"
                  leftIcon={<User size={16} />}
                />
              </div>

              {/* Bank Name Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1">
                  Bank Name
                </label>
                <select
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleChange}
                  className="w-full bg-muted border border-border/80 hover:border-border focus:border-primary rounded-xl px-3 py-3 text-sm text-foreground outline-none transition-all focus:ring-2 focus:ring-primary/20 font-semibold cursor-pointer"
                >
                  <option value="" className="text-slate-650">Select bank name</option>
                  <option value="Federal Bank">Federal Bank</option>
                  <option value="State Bank of India">State Bank of India</option>
                  <option value="HDFC Bank">HDFC Bank</option>
                  <option value="ICICI Bank">ICICI Bank</option>
                  <option value="Axis Bank">Axis Bank</option>
                </select>
              </div>

              {/* Account Number */}
              <div>
                <FormInput
                  label="Account Number"
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  placeholder="Enter account number"
                  leftIcon={<CreditCard size={16} />}
                />
              </div>

              {/* IFSC Code */}
              <div className="space-y-1">
                <FormInput
                  label="IFSC Code"
                  type="text"
                  name="ifscCode"
                  value={formData.ifscCode}
                  onChange={handleChange}
                  placeholder="Enter IFSC code"
                  leftIcon={<Landmark size={16} />}
                />
                <span className="text-[10px] text-slate-500 font-medium pl-1 flex items-center gap-1 mt-0.5">
                  <HelpCircle size={10} /> Used to identify your bank branch securely.
                </span>
              </div>

              {/* Account Type */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1">
                  Account Type
                </label>
                <select
                  name="accountType"
                  value={formData.accountType}
                  onChange={handleChange}
                  className="w-full bg-muted border border-border/80 hover:border-border focus:border-primary rounded-xl px-3 py-3 text-sm text-foreground outline-none transition-all focus:ring-2 focus:ring-primary/20 font-semibold cursor-pointer"
                >
                  <option value="Savings Account">Savings Account</option>
                  <option value="Current Account">Current Account</option>
                </select>
              </div>
            </div>
          </div>

          <div className="h-[1px] bg-slate-800/40" />

          {/* Bank Verification Document Upload */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider">
              Bank Verification
            </h3>
            <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
              Upload a cancelled cheque or passbook front page for verification.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Side: Upload Zone */}
              <div
                onClick={() => bankProofInputRef.current?.click()}
                className="group border-2 border-dashed border-slate-850 hover:border-primary/60 bg-slate-950/10 hover:bg-primary/5 rounded-2xl p-6 flex flex-col justify-center items-center text-center gap-3 transition-all duration-300 cursor-pointer min-h-[220px]"
              >
                <input
                  type="file"
                  ref={bankProofInputRef}
                  className="hidden"
                  onChange={(e) => handleFileChange(e, setBankProofFile)}
                  accept="image/png, image/jpeg, application/pdf"
                />
                <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 border border-slate-850 group-hover:scale-105 transition-transform">
                  <Upload size={20} className="text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-200">Upload Bank Proof</p>
                  <p className="text-xs text-slate-400">
                    or <span className="text-primary font-bold">click to browse</span>
                  </p>
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  PNG, JPG, PDF UP TO 10MB
                </span>
              </div>

              {/* Right Side: Preview Panel */}
              <div className="border border-slate-850 bg-slate-950/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-4 min-h-[220px]">
                {bankProofFile ? (
                  <div className="space-y-3 animate-in zoom-in duration-300">
                    <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 flex items-center justify-center mx-auto">
                      <FileText size={24} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-white max-w-[200px] truncate">{bankProofFile.name}</p>
                      <p className="text-[11px] text-slate-500 font-semibold font-mono">
                        {(bankProofFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setBankProofFile(null);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 font-bold tracking-wide transition-colors"
                    >
                      <X size={14} /> Remove file
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-14 h-14 rounded-full bg-slate-900 border border-slate-850 flex items-center justify-center mx-auto text-slate-600">
                      <FileText size={24} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-300">Uploaded bank proof preview</h4>
                      <p className="text-xs text-slate-500 max-w-[200px] leading-relaxed font-semibold">
                        will appear here.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="h-[1px] bg-slate-800/40" />

          {/* Security Notice Card */}
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
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-900/60 text-slate-400 hover:text-white text-xs font-extrabold tracking-wider transition-all cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleContinueToStep3}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 font-extrabold text-xs tracking-wider transition-all cursor-pointer shadow-lg shadow-primary/10"
            >
              <span>Continue</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* -------------------- STEP 3: REVIEW & SUBMIT -------------------- */}
      {step === 3 && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Header */}
          <div className="space-y-1">
            <span className="text-[10px] sm:text-xs font-bold text-primary tracking-widest uppercase block">
              STEP 3 OF 3
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
              Review & Submit
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
          <div className="space-y-6 pt-2">
            {/* Section 1: Provider Details */}
            <div className="border border-slate-800/80 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-primary">
                    <ShieldCheck size={16} />
                  </div>
                  <h4 className="text-sm font-black text-white uppercase tracking-wider">
                    Owner Details
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  Edit
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs border-b border-slate-800/60 pb-5">
                <div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                    Legal Full Name
                  </span>
                  <span className="text-slate-200 font-bold">{formData.fullName || "Not Provided"}</span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                    Email Address
                  </span>
                  <span className="text-slate-200 font-bold">{user?.email || "business@domain.com"}</span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                    Phone Number
                  </span>
                  <span className="text-slate-200 font-bold">{formData.phone ? `+91 ${formData.phone}` : "Not Provided"}</span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                    Business Name
                  </span>
                  <span className="text-slate-200 font-bold">{formData.businessName || "Not Provided"}</span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                    Business Type
                  </span>
                  <span className="text-slate-200 font-bold capitalize">{formData.businessType || "Not Provided"}</span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                    GST Number
                  </span>
                  <span className="text-slate-200 font-bold uppercase">{formData.gstNumber || "Not Provided"}</span>
                </div>
              </div>

              {/* ID Proof detail preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1 text-xs">
                <div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">
                    ID Proof Type
                  </span>
                  <div className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-850 rounded-xl">
                    <FileText size={18} className="text-primary" />
                    <div>
                      <p className="font-bold text-white capitalize">{formData.idProofType || "None"} Card</p>
                      <p className="text-[10px] text-slate-500">Verification Document</p>
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">
                    Uploaded Document
                  </span>
                  <div className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-850 rounded-xl justify-between">
                    <span className="font-bold text-slate-300 truncate max-w-[150px]">
                      {idProofFile ? idProofFile.name : "None"}
                    </span>
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-black tracking-widest uppercase">
                      {idProofFile ? "Attached" : "Missing"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Payout Details */}
            <div className="border border-slate-800/80 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
                    <ShieldCheck size={16} />
                  </div>
                  <h4 className="text-sm font-black text-white uppercase tracking-wider">
                    Payout Details
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  Edit
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs border-b border-slate-800/60 pb-5">
                <div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                    Account Holder Name
                  </span>
                  <span className="text-slate-200 font-bold">{formData.accountHolderName || "Not Provided"}</span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                    Bank Name
                  </span>
                  <span className="text-slate-200 font-bold">{formData.bankName || "Not Provided"}</span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                    Account Number
                  </span>
                  <span className="text-slate-200 font-bold">{formData.accountNumber || "Not Provided"}</span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                    IFSC Code
                  </span>
                  <span className="text-slate-200 font-bold uppercase">{formData.ifscCode || "Not Provided"}</span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                    Account Type
                  </span>
                  <span className="text-slate-200 font-bold">{formData.accountType}</span>
                </div>
              </div>

              {/* Bank proof detail preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1 text-xs">
                <div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">
                    Verification Method
                  </span>
                  <div className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-850 rounded-xl">
                    <FileText size={18} className="text-primary" />
                    <div>
                      <p className="font-bold text-white">Bank Verification File</p>
                      <p className="text-[10px] text-slate-500">Cancelled Cheque / Passbook</p>
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">
                    Uploaded Proof
                  </span>
                  <div className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-850 rounded-xl justify-between">
                    <span className="font-bold text-slate-300 truncate max-w-[150px]">
                      {bankProofFile ? bankProofFile.name : "None"}
                    </span>
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-black tracking-widest uppercase">
                      {bankProofFile ? "Attached" : "Missing"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="h-[1px] bg-slate-800/40" />

          {/* Security Notice Info Banner */}
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
              onClick={() => setStep(2)}
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
