/**
 * Re-exports from the shared Stepper for any legacy imports within this feature.
 * All new code should import directly from "@/shared/components/stepper".
 */
export { getStepStatus, getStepsWithStatus, calculateProgress, getNextStep } from "@/shared/components/stepper";
