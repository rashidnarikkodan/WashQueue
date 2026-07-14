import type { Step } from "./types";

/**
 * Single source of truth for all onboarding step definitions.
 * Import this everywhere step labels are needed — never hardcode step titles.
 */
export const ONBOARDING_STEPS: Step[] = [
  {
    id: 1,
    title: "Owner & KYC Details",
    shortTitle: "KYC",
  },
  {
    id: 2,
    title: "Payout Setup",
    shortTitle: "Payout",
  },
  {
    id: 3,
    title: "Review & Submit",
    shortTitle: "Review",
  },
];

export const TOTAL_STEPS = ONBOARDING_STEPS.length;
