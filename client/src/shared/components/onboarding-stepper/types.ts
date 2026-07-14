/** Onboarding step statuses */
export type StepStatus = "active" | "completed" | "pending";

/** A single step definition (source of truth from stepper.config.ts) */
export interface Step {
  id: number;
  title: string;
  /** Short label used in the mobile "Next:" hint */
  shortTitle: string;
}

/** A step enriched with its computed status for rendering */
export interface StepWithStatus extends Step {
  status: StepStatus;
}

/** Props passed down to both MobileStepper and DesktopStepper */
export interface StepperRenderProps {
  steps: StepWithStatus[];
  currentStep: number;
  totalSteps: number;
  progressPercent: number;
  /** The step directly after the active one, or null on the last step */
  nextStep: StepWithStatus | null;
  activeStep: StepWithStatus;
  className?: string;
}
