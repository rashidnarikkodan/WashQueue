// Main component — use this everywhere
export { default as Stepper } from "./Stepper";
export type { StepperProps } from "./Stepper";

// Sub-components (available for custom layouts)
export { default as DesktopStepper } from "./DesktopStepper";
export { default as MobileStepper } from "./MobileStepper";

// Pure utilities
export { getStepStatus, getStepsWithStatus, calculateProgress, getNextStep } from "./utils";

// Types
export type { StepDef, StepWithStatus, StepStatus, StepperRenderProps } from "./types";
