import type { StepDef, StepStatus, StepWithStatus } from "./types";

/**
 * Returns the display status of a single step.
 * Pure function — no side effects.
 */
export function getStepStatus(stepId: number, currentStep: number): StepStatus {
  if (stepId < currentStep) return "completed";
  if (stepId === currentStep) return "active";
  return "pending";
}

/**
 * Enriches each step definition with its computed status.
 */
export function getStepsWithStatus(
  steps: StepDef[],
  currentStep: number
): StepWithStatus[] {
  return steps.map((step) => ({
    ...step,
    status: getStepStatus(step.id, currentStep),
  }));
}

/**
 * Returns a 0–100 progress percentage based on the current step position.
 */
export function calculateProgress(
  currentStep: number,
  totalSteps: number
): number {
  return Math.min((currentStep / totalSteps) * 100, 100);
}

/**
 * Returns the first pending step (i.e. the next step to complete), or null on
 * the last step.
 */
export function getNextStep(
  stepsWithStatus: StepWithStatus[]
): StepWithStatus | null {
  return stepsWithStatus.find((s) => s.status === "pending") ?? null;
}
