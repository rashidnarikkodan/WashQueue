import type { StepDef } from "@/shared/components/stepper";

/**
 * Owner onboarding step definitions — single source of truth for this feature.
 * Consumed by OnboardingStepper and passed into the shared Stepper component.
 */
export const ONBOARDING_STEPS: StepDef[] = [
  { id: 1, title: "Owner & KYC Details", shortTitle: "KYC" },
  { id: 2, title: "Payout Setup", shortTitle: "Payout" },
  { id: 3, title: "Review & Submit", shortTitle: "Review" },
];

export const TOTAL_STEPS = ONBOARDING_STEPS.length;
