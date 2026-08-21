import type { StepDef, StepStatus, StepWithStatus } from "./types"

export function getStepStatus(stepId: number, currentStep: number): StepStatus {
  if (stepId < currentStep) return "completed"
  if (stepId === currentStep) return "active"
  return "pending"
}

export function getStepsWithStatus(steps: StepDef[], currentStep: number): StepWithStatus[] {
  return steps.map((step) => ({
    ...step,
    status: getStepStatus(step.id, currentStep),
  }))
}

export function calculateProgress(currentStep: number, totalSteps: number): number {
  return Math.min((currentStep / totalSteps) * 100, 100)
}

export function getNextStep(stepsWithStatus: StepWithStatus[]): StepWithStatus | null {
  return stepsWithStatus.find((s) => s.status === "pending") ?? null
}
