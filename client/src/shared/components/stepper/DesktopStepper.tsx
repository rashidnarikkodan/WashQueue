import { Check } from "lucide-react";
import type { StepperRenderProps } from "./types";

/**
 * DesktopStepper — pure presentation.
 *
 * Renders the vertical sidebar stepper for `lg` and above viewports.
 * The optional `heading`, `description`, and `footerNote` props allow
 * any feature to inject its own text without coupling to this component.
 */
export default function DesktopStepper({
  steps,
  heading,
  description,
  footerNote,
  className = "",
}: StepperRenderProps) {
  return (
    <div
      className={`flex flex-col justify-center min-h-[450px] py-4 lg:py-8 lg:pr-8 text-left space-y-12 ${className}`}
    >
      {/* Optional heading + description block */}
      {(heading || description) && (
        <div className="space-y-10">
          <div className="space-y-4">
            {heading && (
              <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
                {heading}
              </h1>
            )}
            {description && (
              <p className="text-base text-slate-400 font-medium leading-relaxed max-w-sm">
                {description}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Step list */}
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
              {/* Badge circle */}
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

              {/* Step label */}
              <div className="flex flex-col">
                <span
                  className={`text-sm font-bold transition-colors ${
                    isActive
                      ? "text-white"
                      : isCompleted
                      ? "text-emerald-400"
                      : "text-slate-500"
                  }`}
                >
                  {step.title}
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

      {/* Optional footer note */}
      {footerNote && (
        <div className="text-xs text-slate-500 leading-normal font-semibold max-w-xs pt-4 border-t border-slate-800/40">
          {footerNote}
        </div>
      )}
    </div>
  );
}
