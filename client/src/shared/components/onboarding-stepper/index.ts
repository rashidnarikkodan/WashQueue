// Main orchestrator — use this in pages
export { default as OnboardingStepper } from "./OnboardingStepper";

// Sub-components (exported for testing or direct use)
export { default as DesktopStepper } from "./DesktopStepper";
export { default as MobileStepper } from "./MobileStepper";

// Config & utilities
export { ONBOARDING_STEPS, TOTAL_STEPS } from "./stepper.config";
export { getStepStatus, getStepsWithStatus, calculateProgress, getNextStep } from "./utils";

// Types
export type { Step, StepWithStatus, StepStatus, StepperRenderProps } from "./types";
