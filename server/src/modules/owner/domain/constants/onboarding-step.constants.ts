// Onboarding steps are a client-driven wizard (arbitrary step numbers 1..N); only the
// first step and the final "submitted, pending admin review" step carry business meaning
// on the server, so only those two are named here.
export const ONBOARDING_STEP = {
  FIRST_STEP: 1,
  IN_REVIEW: 4,
} as const
