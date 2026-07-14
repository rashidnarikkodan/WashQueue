import { FileText, ChevronRight, ShieldCheck } from "lucide-react";

interface OnboardingDetailsSummaryProps {
  details: {
    fullName?: string;
    phone?: string;
    whatsapp?: string;
    businessName?: string;
    businessType?: string;
    gstNumber?: string;
    idProofType?: string;
    idProofUrl?: string;
    accountHolderName?: string;
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    accountType?: string;
    bankProofUrl?: string;
    businessLicenseUrl?: string;
    gstCertificateUrl?: string;
  };
  email?: string;
  idProofFile?: File | null;
  bankProofFile?: File | null;
  businessLicenseFile?: File | null;
  gstCertificateFile?: File | null;
  onEditStep?: (step: number) => void;
}

const OnboardingDetailsSummary = ({
  details,
  email,
  idProofFile,
  bankProofFile,
  businessLicenseFile,
  gstCertificateFile,
  onEditStep,
}: OnboardingDetailsSummaryProps) => {
  const getApiUrl = (path?: string) => {
    if (!path) return "";
    const base = import.meta.env.VITE_API_URL || "http://localhost:3000";
    return `${base}${path}`;
  };

  return (
    <div className="space-y-6 pt-2 text-left">
      {/* Section 1: Owner & Business Identity */}
      <div className="border border-slate-800/80 rounded-2xl p-5 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-primary">
              <ShieldCheck size={16} />
            </div>
            <h4 className="text-sm font-black text-white uppercase tracking-wider">
              Identity & Business Details
            </h4>
          </div>
          {onEditStep && (
            <button
              type="button"
              onClick={() => onEditStep(1)}
              className="text-xs font-bold text-primary hover:underline cursor-pointer"
            >
              Edit
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs border-b border-slate-800/60 pb-5">
          <div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
              Legal Full Name
            </span>
            <span className="text-slate-200 font-bold">{details.fullName || "Not Provided"}</span>
          </div>
          {email && (
            <div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                Email Address
              </span>
              <span className="text-slate-200 font-bold truncate block max-w-[180px]">{email}</span>
            </div>
          )}
          <div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
              Phone Number
            </span>
            <span className="text-slate-200 font-bold">
              {details.phone ? `+91 ${details.phone}` : "Not Provided"}
            </span>
          </div>
          {details.whatsapp && (
            <div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                WhatsApp Number
              </span>
              <span className="text-slate-200 font-bold">{details.whatsapp}</span>
            </div>
          )}
          <div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
              Business Name
            </span>
            <span className="text-slate-200 font-bold">{details.businessName || "Not Provided"}</span>
          </div>
          {details.gstNumber && (
            <div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                GST Number
              </span>
              <span className="text-slate-200 font-bold uppercase">{details.gstNumber}</span>
            </div>
          )}
        </div>

        {/* Identity & Legal Docs verification proof */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1 text-xs">
          <div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">
              ID Proof Type
            </span>
            <div className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-850 rounded-xl">
              <FileText size={18} className="text-primary" />
              <div>
                <p className="font-bold text-white capitalize">{details.idProofType || "None"} Card</p>
                <p className="text-[10px] text-slate-500">Legal ID Verification</p>
              </div>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">
              Uploaded Document
            </span>
            {onEditStep ? (
              <div className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-850 rounded-xl justify-between">
                <span className="font-bold text-slate-300 truncate max-w-[150px]">
                  {idProofFile ? idProofFile.name : details.idProofUrl ? "Previously uploaded" : "None"}
                </span>
                <span className={`${(idProofFile || details.idProofUrl) ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"} border px-2 py-0.5 rounded text-[10px] font-black tracking-widest uppercase`}>
                  {(idProofFile || details.idProofUrl) ? "Attached" : "Missing"}
                </span>
              </div>
            ) : details.idProofUrl ? (
              <a
                href={getApiUrl(details.idProofUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 border border-border/80 hover:border-primary/50 bg-muted/20 hover:bg-muted/40 rounded-xl transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 border border-border/80 text-slate-400 flex items-center justify-center shrink-0">
                    <FileText size={16} />
                  </div>
                  <div className="text-left min-w-0">
                    <span className="text-xs font-bold text-slate-200 block truncate">
                      ID Proof
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">Click to preview document</span>
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-500" />
              </a>
            ) : (
              <div className="p-3.5 bg-red-500/5 border border-red-500/20 text-red-400 rounded-xl text-xs font-bold text-center">
                Missing Document
              </div>
            )}
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
          {onEditStep && (
            <button
              type="button"
              onClick={() => onEditStep(2)}
              className="text-xs font-bold text-primary hover:underline cursor-pointer"
            >
              Edit
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs border-b border-slate-800/60 pb-5">
          <div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
              Account Holder Name
            </span>
            <span className="text-slate-200 font-bold">{details.accountHolderName || "Not Provided"}</span>
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
              Bank Name
            </span>
            <span className="text-slate-200 font-bold">{details.bankName || "Not Provided"}</span>
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
              Account Number
            </span>
            <span className="text-slate-200 font-bold font-mono">{details.accountNumber || "Not Provided"}</span>
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
              IFSC Code
            </span>
            <span className="text-slate-200 font-bold uppercase font-mono">{details.ifscCode || "Not Provided"}</span>
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
              Account Type
            </span>
            <span className="text-slate-200 font-bold">{details.accountType || "Not Provided"}</span>
          </div>
        </div>

        {/* Bank Proof preview */}
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
            {onEditStep ? (
              <div className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-850 rounded-xl justify-between">
                <span className="font-bold text-slate-300 truncate max-w-[150px]">
                  {bankProofFile ? bankProofFile.name : details.bankProofUrl ? "Previously uploaded" : "None"}
                </span>
                <span className={`${(bankProofFile || details.bankProofUrl) ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"} border px-2 py-0.5 rounded text-[10px] font-black tracking-widest uppercase`}>
                  {(bankProofFile || details.bankProofUrl) ? "Attached" : "Missing"}
                </span>
              </div>
            ) : details.bankProofUrl ? (
              <a
                href={getApiUrl(details.bankProofUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 border border-border/80 hover:border-primary/50 bg-muted/20 hover:bg-muted/40 rounded-xl transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 border border-border/80 text-slate-400 flex items-center justify-center shrink-0">
                    <FileText size={16} />
                  </div>
                  <div className="text-left min-w-0">
                    <span className="text-xs font-bold text-slate-200 block truncate">
                      Bank Proof
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">Click to preview document</span>
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-500" />
              </a>
            ) : (
              <div className="p-3.5 bg-red-500/5 border border-red-500/20 text-red-400 rounded-xl text-xs font-bold text-center">
                Missing Document
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section 3: Optional Business Verification (License/GST certificates) */}
      {(details.businessLicenseUrl || details.gstCertificateUrl || businessLicenseFile || gstCertificateFile) && (
        <div className="border border-slate-800/80 rounded-2xl p-5 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-500">
                <FileText size={16} />
              </div>
              <h4 className="text-sm font-black text-white uppercase tracking-wider">
                Business Licenses & Verification
              </h4>
            </div>
            {onEditStep && (
              <button
                type="button"
                onClick={() => onEditStep(1)}
                className="text-xs font-bold text-primary hover:underline cursor-pointer"
              >
                Edit
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Business License */}
            {(details.businessLicenseUrl || businessLicenseFile) && (
              <div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 text-left">
                  Business License
                </span>
                {onEditStep ? (
                  <div className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-850 rounded-xl justify-between">
                    <span className="font-bold text-slate-350 truncate max-w-[150px]">
                      {businessLicenseFile ? businessLicenseFile.name : "Attached"}
                    </span>
                    <span className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 border px-2 py-0.5 rounded text-[10px] font-black tracking-widest uppercase">
                      Attached
                    </span>
                  </div>
                ) : details.businessLicenseUrl ? (
                  <a
                    href={getApiUrl(details.businessLicenseUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 border border-border/80 hover:border-primary/50 bg-muted/20 hover:bg-muted/40 rounded-xl transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-slate-900 border border-border/80 text-slate-400 flex items-center justify-center shrink-0">
                        <FileText size={16} />
                      </div>
                      <div className="text-left min-w-0">
                        <span className="text-xs font-bold text-slate-200 block truncate">
                          Business License
                        </span>
                        <span className="text-[10px] text-slate-500 font-semibold">Click to preview document</span>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-slate-500" />
                  </a>
                ) : null}
              </div>
            )}

            {/* GST Certificate */}
            {(details.gstCertificateUrl || gstCertificateFile) && (
              <div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 text-left">
                  GST Certificate
                </span>
                {onEditStep ? (
                  <div className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-850 rounded-xl justify-between">
                    <span className="font-bold text-slate-350 truncate max-w-[150px]">
                      {gstCertificateFile ? gstCertificateFile.name : "Attached"}
                    </span>
                    <span className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 border px-2 py-0.5 rounded text-[10px] font-black tracking-widest uppercase">
                      Attached
                    </span>
                  </div>
                ) : details.gstCertificateUrl ? (
                  <a
                    href={getApiUrl(details.gstCertificateUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 border border-border/80 hover:border-primary/50 bg-muted/20 hover:bg-muted/40 rounded-xl transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-slate-900 border border-border/80 text-slate-400 flex items-center justify-center shrink-0">
                        <FileText size={16} />
                      </div>
                      <div className="text-left min-w-0">
                        <span className="text-xs font-bold text-slate-200 block truncate">
                          GST Certificate
                        </span>
                        <span className="text-[10px] text-slate-500 font-semibold">Click to preview document</span>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-slate-500" />
                  </a>
                ) : null}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingDetailsSummary;
