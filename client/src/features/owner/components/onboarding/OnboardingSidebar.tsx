import { Check } from "lucide-react";

interface Step {
  id: number;
  label: string;
  status: "active" | "pending" | "completed";
}

interface OnboardingSidebarProps {
  currentStep?: number;
}

export default function OnboardingSidebar({ currentStep = 1 }: OnboardingSidebarProps) {
  const steps: Step[] = [
    {
      id: 1,
      label: "Owner & KYC Details",
      status: currentStep === 1 ? "active" : currentStep > 1 ? "completed" : "pending",
    },
    {
      id: 2,
      label: "Payout Setup",
      status: currentStep === 2 ? "active" : currentStep > 2 ? "completed" : "pending",
    },
    {
      id: 3,
      label: "Review & Submit",
      status: currentStep === 3 ? "active" : currentStep > 3 ? "completed" : "pending",
    },
  ];

  return (
    <div className="flex flex-col justify-center min-h-[450px] py-4 lg:py-8 lg:pr-8 text-left space-y-12">
      {/* Brand & Introduction Header */}
      <div className="space-y-10">
        {/* Welcome Headers */}
        <div className="space-y-4">
          <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Become an Owner.
          </h1>
          <p className="text-base text-slate-400 font-medium leading-relaxed max-w-sm">
            Start accepting bookings for your car wash stations.
          </p>
        </div>
      </div>

      {/* Stepper Steps List */}
      <div className="flex-1 flex flex-col justify-center space-y-6 max-w-xs">
        {steps.map((step) => {
          const isActive = step.status === "active";
          const isCompleted = step.status === "completed";

          return (
            <div
              key={step.id}
              className={`flex items-center gap-4 transition-all duration-300 ${
                isActive ? "opacity-100 scale-[1.02]" : "opacity-50"
              }`}
            >
              {/* Badge Circle Indicator */}
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all border ${
                  isCompleted
                    ? "bg-emerald-500 border-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10"
                    : isActive
                    ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "border-slate-700 bg-transparent text-slate-500"
                }`}
              >
                {isCompleted ? (
                  <Check size={16} strokeWidth={3} />
                ) : (
                  <span>{step.id}</span>
                )}
              </div>

              {/* Step Label Info */}
              <div className="flex flex-col">
                <span
                  className={`text-sm font-bold transition-colors ${
                    isActive ? "text-white" : isCompleted ? "text-emerald-400" : "text-slate-500"
                  }`}
                >
                  {step.label}
                </span>
                {isActive && (
                  <span className="text-[11px] font-black tracking-widest text-primary uppercase mt-0.5">
                    Active
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Stepper Footer Notice */}
      <div className="text-xs text-slate-500 leading-normal font-semibold max-w-xs pt-4 border-t border-slate-800/40">
        Application will be reviewed before activation.
      </div>
    </div>
  );
}
