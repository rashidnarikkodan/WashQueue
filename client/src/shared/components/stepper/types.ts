/** Status of an individual step */
export type StepStatus = "active" | "completed" | "pending"

/** A step definition passed by the consumer */
export interface StepDef {
  id: number
  title: string
  /** Short label shown in the mobile "Next:" hint */
  shortTitle: string
}

/** A step enriched with its computed display status */
export interface StepWithStatus extends StepDef {
  status: StepStatus
}

/** All derived state the orchestrator passes to presentation components */
export interface StepperRenderProps {
  steps: StepWithStatus[]
  currentStep: number
  totalSteps: number
  progressPercent: number
  /** The next pending step, or null when on the last step */
  nextStep: StepWithStatus | null
  activeStep: StepWithStatus
  /** Optional: heading rendered above the step list on desktop */
  heading?: string
  /** Optional: subheading rendered below the heading on desktop */
  description?: string
  /** Optional: small text rendered in the footer on desktop */
  footerNote?: string
  className?: string
}
