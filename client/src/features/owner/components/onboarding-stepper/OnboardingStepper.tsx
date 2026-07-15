import { Stepper } from "@/shared/components/stepper";
import { ONBOARDING_STEPS } from "./stepper.config";

interface OnboardingStepperProps {
  currentStep: number;
}

/**
 * Owner-specific stepper wrapper.
 *
 * Owns the step definitions and owner-specific display text.
 * Delegates all rendering to the shared Stepper component.
 */
export default function OnboardingStepper({ currentStep }: OnboardingStepperProps) {
  return (
    <Stepper
      steps={ONBOARDING_STEPS}
      currentStep={currentStep}
      heading="Become an Owner."
      description="Start accepting bookings for your car wash stations."
      footerNote="Application will be reviewed before activation."
    />
  );
}
