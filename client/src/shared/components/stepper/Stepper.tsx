import MobileStepper from "./MobileStepper";
import DesktopStepper from "./DesktopStepper";
import { getStepsWithStatus, calculateProgress, getNextStep } from "./utils";
import type { StepDef } from "./types";

export interface StepperProps {
  /** Step definitions owned by the consumer — titles, shortTitles, ids */
  steps: StepDef[];
  /** The 1-based index of the currently active step */
  currentStep: number;
  /** Heading rendered above the step list on desktop (optional) */
  heading?: string;
  /** Subheading rendered below the heading on desktop (optional) */
  description?: string;
  /** Small footer text rendered below the step list on desktop (optional) */
  footerNote?: string;
}

/**
 * Stepper — generic multi-step form progress component.
 *
 * Usage:
 *   <Stepper
 *     steps={MY_STEPS}
 *     currentStep={step}
 *     heading="Create your account"
 *     description="Fill in the details below."
 *     footerNote="All data is encrypted."
 *   />
 *
 * The component derives all display state internally and renders:
 *   - MobileStepper  (compact progress bar, hidden lg+)
 *   - DesktopStepper (vertical sidebar, visible lg+)
 *
 * No business logic should live in MobileStepper or DesktopStepper.
 */
export default function Stepper({
  steps,
  currentStep,
  heading,
  description,
  footerNote,
}: StepperProps) {
  const stepsWithStatus = getStepsWithStatus(steps, currentStep);
  const totalSteps = steps.length;
  const progressPercent = calculateProgress(currentStep, totalSteps);
  const activeStep = stepsWithStatus.find((s) => s.status === "active") ?? stepsWithStatus[0];
  const nextStep = getNextStep(stepsWithStatus);

  const renderProps = {
    steps: stepsWithStatus,
    currentStep,
    totalSteps,
    progressPercent,
    activeStep,
    nextStep,
    heading,
    description,
    footerNote,
  };

  return (
    <>
      {/* Compact progress indicator — shown below lg */}
      <MobileStepper {...renderProps} className="block lg:hidden" />

      {/* Vertical sidebar stepper — shown on lg+ */}
      <DesktopStepper {...renderProps} className="hidden lg:flex" />
    </>
  );
}
