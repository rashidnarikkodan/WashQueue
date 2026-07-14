import { z } from "zod"

/** Submit onboarding has no required body fields — just needs authentication */
export const submitOnboardingSchema = z.object({})
