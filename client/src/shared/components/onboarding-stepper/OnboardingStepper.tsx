import MobileStepper from "./MobileStepper";
import DesktopStepper from "./DesktopStepper";
import { getStepsWithStatus, calculateProgress, getNextStep } from "./utils";
import { TOTAL_STEPS } from "./stepper.config";

interface OnboardingStepperProps {
  currentStep: number;
}

/**
 * OnboardingStepper — the single orchestrator.
 *
 * Computes all derived state once and passes it down to the two
 * pure presentation components. No step logic lives anywhere else.
 */
export default function OnboardingStepper({
  currentStep,
}: OnboardingStepperProps) {
  // ─── Derive all state from currentStep ──────────────────────────────────────
  const steps = getStepsWithStatus(currentStep);
  const progressPercent = calculateProgress(currentStep, TOTAL_STEPS);
  const activeStep = steps.find((s) => s.status === "active") ?? steps[0];
  const nextStep = getNextStep(steps);

  const renderProps = {
    steps,
    currentStep,
    totalSteps: TOTAL_STEPS,
    progressPercent,
    activeStep,
    nextStep,
  };

  return (
    <>
      {/* Mobile compact progress indicator — hidden on lg+ */}
      <MobileStepper {...renderProps} className="block lg:hidden" />

      {/* Desktop vertical sidebar stepper — hidden below lg */}
      <DesktopStepper {...renderProps} className="hidden lg:flex" />
    </>
  );
}
