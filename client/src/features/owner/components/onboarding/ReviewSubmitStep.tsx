import { ArrowLeft, Send, Check, ShieldCheck } from "lucide-react";
import Loading from "../../../../shared/components/ui/Loading";
import OnboardingDetailsSummary from "../../../users/components/ui/OnboardingDetailsSummary";
import type { OnboardingDetails } from "../../services/owner.api";

interface ReviewSubmitStepProps {
  formData: Record<string, any>;
  savedDetails: OnboardingDetails;
  userEmail?: string;
  idProofFile: File | null;
  bankProofFile: File | null;
  businessLicenseFile: File | null;
  gstCertificateFile: File | null;
  onEditStep: (step: number) => void;
  onBack: () => void;
  isLoading: boolean;
}

export default function ReviewSubmitStep({
  formData,
  savedDetails,
  userEmail,
  idProofFile,
  bankProofFile,
  businessLicenseFile,
  gstCertificateFile,
  onEditStep,
  onBack,
  isLoading,
}: ReviewSubmitStepProps) {
  // Merge savedDetails and active formData so previously uploaded files show correctly
  const mergedDetails = { ...savedDetails, ...formData };

  return (
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
        details={mergedDetails}
        email={userEmail}
        idProofFile={idProofFile}
        bankProofFile={bankProofFile}
        businessLicenseFile={businessLicenseFile}
        gstCertificateFile={gstCertificateFile}
        onEditStep={onEditStep}
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
          onClick={onBack}
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
  );
}
