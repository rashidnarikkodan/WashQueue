export type StepStatus = "active" | "completed" | "pending"

export interface StepDef {
  id: number
  title: string
  shortTitle: string
}

export interface StepWithStatus extends StepDef {
  status: StepStatus
}

export interface StepperRenderProps {
  steps: StepWithStatus[]
  currentStep: number
  totalSteps: number
  progressPercent: number
  nextStep: StepWithStatus | null
  activeStep: StepWithStatus
  heading?: string
  description?: string
  footerNote?: string
  className?: string
  setActiveStep: (step: number) => void
}
