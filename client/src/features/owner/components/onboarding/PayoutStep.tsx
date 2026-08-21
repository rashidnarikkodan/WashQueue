import {
  ChevronRight,
  ArrowLeft,
  ShieldCheck,
  HelpCircle,
  User,
  CreditCard,
  Landmark,
} from "lucide-react"
import FormInput from "../../../../shared/components/form/FormInput"
import FormSelect from "../../../../shared/components/form/FormSelect"
import FormUpload from "../../../../shared/components/form/FormUpload"
import type { OnboardingDetails } from "@/shared/apis/owner.api"

interface PayoutStepProps {
  formData: {
    accountHolderName: string
    bankName: string
    accountNumber: string
    ifscCode: string
  }
  fieldErrors: Record<string, string>
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
  bankProofFile: File | null
  onBankProofChange: (file: File | null) => void
  savedDetails: OnboardingDetails
  onBack: () => void
  onContinue: () => void
  isLoading: boolean
}

export default function PayoutStep({
  formData,
  fieldErrors,
  onChange,
  bankProofFile,
  onBankProofChange,
  savedDetails,
  onBack,
  onContinue,
  isLoading,
}: PayoutStepProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
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
              onChange={onChange}
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
              onChange={onChange}
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
              onChange={onChange}
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
              onChange={onChange}
              placeholder="Enter IFSC code"
              leftIcon={<Landmark size={16} />}
              error={fieldErrors.ifscCode}
            />
            <span className="text-[10px] text-slate-500 font-medium pl-1 flex items-center gap-1 mt-0.5">
              <HelpCircle size={10} /> Used to identify your bank branch securely.
            </span>
          </div>
        </div>
      </div>

      <div className="h-[1px] bg-slate-800/40" />

      <div className="space-y-4">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider">
          Bank Verification
        </h3>
        <FormUpload
          label="Upload Bank Proof"
          file={bankProofFile}
          onChange={onBankProofChange}
          variant="card"
          subtext="PNG, JPG, PDF UP TO 10MB"
          existingUrl={savedDetails.bankProofUrl}
          error={fieldErrors.bankProofFile}
        />
      </div>

      <div className="h-[1px] bg-slate-800/40" />

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

      <div className="flex justify-between items-center pt-2 select-none">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-900/60 text-slate-400 hover:text-white text-xs font-extrabold tracking-wider transition-all cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={onContinue}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 font-extrabold text-xs tracking-wider transition-all cursor-pointer shadow-lg shadow-primary/10 disabled:opacity-50"
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
