import type { StepStatus, StepWithStatus } from "./types";
import { ONBOARDING_STEPS, TOTAL_STEPS } from "./stepper.config";

/**
 * Returns the status of a step relative to the current active step.
 * Pure function — no side effects.
 */
export function getStepStatus(stepId: number, currentStep: number): StepStatus {
  if (stepId < currentStep) return "completed";
  if (stepId === currentStep) return "active";
  return "pending";
}

/**
 * Enriches every step definition with its computed status.
 */
export function getStepsWithStatus(currentStep: number): StepWithStatus[] {
  return ONBOARDING_STEPS.map((step) => ({
    ...step,
    status: getStepStatus(step.id, currentStep),
  }));
}

/**
 * Returns a value between 0–100 representing how far through the flow the user is.
 * e.g. step 1 of 3 → 33.33, step 3 of 3 → 100
 */
export function calculateProgress(
  currentStep: number,
  totalSteps: number = TOTAL_STEPS
): number {
  return Math.min((currentStep / totalSteps) * 100, 100);
}

/**
 * Returns the next step after currentStep, or null when on the last step.
 */
export function getNextStep(
  stepsWithStatus: StepWithStatus[]
): StepWithStatus | null {
  return stepsWithStatus.find((s) => s.status === "pending") ?? null;
}
