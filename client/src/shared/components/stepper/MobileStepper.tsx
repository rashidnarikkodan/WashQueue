import type { StepperRenderProps } from "./types";

/**
 * MobileStepper — pure presentation.
 *
 * Renders the compact progress indicator for viewports below `lg`.
 * Receives all derived state from the Stepper orchestrator via props.
 */
export default function MobileStepper({
  currentStep,
  totalSteps,
  progressPercent,
  activeStep,
  nextStep,
  className = "",
}: StepperRenderProps) {
  return (
    <div className={`w-full max-w-2xl px-4 sm:px-0 mb-2 ${className}`}>
      <div className="bg-slate-950/40 border border-slate-900 rounded-2xl p-4 space-y-3">
        {/* Header info */}
        <div className="flex items-center justify-between text-[11px] font-bold">
          <div className="flex items-center gap-1.5">
            <span className="text-primary font-black uppercase tracking-wider">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-200">{activeStep.title}</span>
          </div>
          {nextStep && (
            <span className="text-slate-500 text-[10px] hidden sm:inline">
              Next: {nextStep.shortTitle}
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div className="relative w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-blue-500 rounded-full transition-all duration-500 ease-out shadow-[0_0_8px_rgba(59,130,246,0.3)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
