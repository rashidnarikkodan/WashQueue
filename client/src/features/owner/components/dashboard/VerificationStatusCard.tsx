import { useNavigate } from "react-router-dom";
import { 
  PlusCircle, 
  Hourglass, 
  ShieldCheck, 
  AlertOctagon, 
  ArrowRight, 
  Lock, 
  CheckCircle2, 
  FileText,
  UserCheck
} from "lucide-react";
import { useAuthStore } from "../../../auth/store/authStore";

export type VerificationState = "NOT_SUBMITTED" | "PENDING_REVIEW" | "VERIFIED" | "REJECTED";

interface VerificationStatusCardProps {
  forcedState?: VerificationState;
}

export default function VerificationStatusCard({ forcedState }: VerificationStatusCardProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  // Derive the verification state dynamically if not forced by a prop
  const getDerivedState = (): VerificationState => {
    if (forcedState) return forcedState;
    if (!user) return "NOT_SUBMITTED";
    
    if (user.isVerified) {
      return "VERIFIED";
    }
    
    // Check if onboarding is incomplete or not started
    if (!user.onboardingStep || user.onboardingStep < 4) {
      return "NOT_SUBMITTED";
    }
    
    // Submitted onboarding but not verified yet
    return "PENDING_REVIEW";
  };

  const state = getDerivedState();

  // Render specifications per state
  const config = {
    NOT_SUBMITTED: {
      badge: { text: "Action Required", className: "bg-slate-500/10 border-slate-500/20 text-slate-400" },
      icon: <PlusCircle className="h-5 w-5 text-slate-400" />,
      glowColor: "from-slate-500/5 to-transparent",
      borderColor: "border-slate-800",
      title: "Complete Business Onboarding",
      description: "List your wash station, configure services, and link your payout details to start receiving bookings on WashQueue.",
      actionText: "Continue Setup",
      actionIcon: <ArrowRight className="h-3.5 w-3.5" />,
      onClick: () => navigate("/owner/onboarding"),
      features: [
        { label: "Create Service Stations", allowed: false },
        { label: "Configure Washing Bays", allowed: false },
        { label: "Accept Live Queue Bookings", allowed: false },
        { label: "Receive Payout Settlements", allowed: false },
      ],
      eta: "Estimated setup time: 5-7 minutes",
    },
    PENDING_REVIEW: {
      badge: { text: "Under Review", className: "bg-amber-500/10 border-amber-500/20 text-amber-400" },
      icon: <Hourglass className="h-5 w-5 text-amber-400 animate-pulse" />,
      glowColor: "from-amber-500/5 to-transparent",
      borderColor: "border-amber-500/20",
      title: "Your Application is Under Review",
      description: "Our compliance team is verifying your business documents. Reviews are typically completed within 24 hours.",
      actionText: "Review Submitted Details",
      actionIcon: <FileText className="h-3.5 w-3.5" />,
      onClick: () => navigate("/owner/onboarding"),
      features: [
        { label: "Create Service Stations", allowed: false },
        { label: "Configure Washing Bays", allowed: false },
        { label: "Accept Live Queue Bookings", allowed: false },
        { label: "Receive Payout Settlements", allowed: false },
      ],
      eta: "Average verification response: < 24 Hours",
    },
    VERIFIED: {
      badge: { text: "Verified Partner", className: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" },
      icon: <ShieldCheck className="h-5 w-5 text-emerald-400" />,
      glowColor: "from-emerald-500/5 to-transparent",
      borderColor: "border-emerald-500/20",
      title: "Verification Approved",
      description: "Your business credentials have been successfully approved. You have full access to operations.",
      actionText: "Manage Stations",
      actionIcon: <UserCheck className="h-3.5 w-3.5" />,
      onClick: () => {}, // Handled on operational layout
      features: [
        { label: "Create Service Stations", allowed: true },
        { label: "Configure Washing Bays", allowed: true },
        { label: "Accept Live Queue Bookings", allowed: true },
        { label: "Receive Payout Settlements", allowed: true },
      ],
      eta: "Account is active and operational",
    },
    REJECTED: {
      badge: { text: "Action Required", className: "bg-red-500/10 border-red-500/20 text-red-400 animate-pulse" },
      icon: <AlertOctagon className="h-5 w-5 text-red-400" />,
      glowColor: "from-red-500/5 to-transparent",
      borderColor: "border-red-500/20",
      title: "Verification Rejected",
      description: "The uploaded identity proof or bank records could not be verified. Please update your details and resubmit.",
      actionText: "Fix Documents & Resubmit",
      actionIcon: <ArrowRight className="h-3.5 w-3.5" />,
      onClick: () => navigate("/owner/onboarding"),
      features: [
        { label: "Create Service Stations", allowed: false },
        { label: "Configure Washing Bays", allowed: false },
        { label: "Accept Live Queue Bookings", allowed: false },
        { label: "Receive Payout Settlements", allowed: false },
      ],
      eta: "Resubmissions will receive priority review.",
    },
  }[state];

  return (
    <div className={`relative overflow-hidden rounded-2xl border ${config.borderColor} bg-slate-950/20 p-6 md:p-8 text-left shadow-2xl transition-all duration-300`}>
      {/* Background Glow Dec */}
      <div className={`absolute top-0 right-0 h-64 w-64 bg-gradient-to-bl ${config.glowColor} filter blur-3xl rounded-full z-0 pointer-events-none`}></div>

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-start justify-between gap-8">
        
        {/* Left Column: Text Summary */}
        <div className="space-y-4 max-w-2xl">
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${config.badge.className}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
              {config.badge.text}
            </span>
            {config.eta && (
              <span className="text-[10px] text-slate-500 font-medium">{config.eta}</span>
            )}
          </div>

          <div className="flex items-start gap-4">
            <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900/80 border border-slate-800 shadow-md">
              {config.icon}
            </div>
            <div className="space-y-1.5">
              <h2 className="text-xl font-bold tracking-tight text-slate-100">{config.title}</h2>
              <p className="text-xs font-semibold leading-relaxed text-slate-400">{config.description}</p>
            </div>
          </div>

          {/* Contextual Action Button */}
          {state !== "VERIFIED" && (
            <button
              onClick={config.onClick}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-blue-600 hover:from-sky-400 hover:to-blue-500 text-foreground font-black text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-md select-none border border-primary/20"
            >
              <span>{config.actionText}</span>
              {config.actionIcon}
            </button>
          )}
        </div>

        {/* Right Column: Feature Restrictions Grid */}
        <div className="w-full lg:w-[320px] shrink-0 border border-slate-850 bg-slate-950/40 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-850">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Feature Restrictions</span>
          </div>

          <ul className="space-y-3">
            {config.features.map((feature, i) => (
              <li key={i} className="flex items-center justify-between text-xs font-bold">
                <span className={feature.allowed ? "text-slate-300" : "text-slate-500"}>
                  {feature.label}
                </span>
                <span className="shrink-0 pl-3">
                  {feature.allowed ? (
                    <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider">
                      <CheckCircle2 size={10} />
                      <span>Unlocked</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-slate-500 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider">
                      <Lock size={10} />
                      <span>Locked</span>
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}
