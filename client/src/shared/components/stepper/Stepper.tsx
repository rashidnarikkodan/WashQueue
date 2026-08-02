import MobileStepper from "./MobileStepper"
import DesktopStepper from "./DesktopStepper"
import { getStepsWithStatus, calculateProgress, getNextStep } from "./utils"
import type { StepDef } from "./types"

export interface StepperProps {
  steps: StepDef[]
  currentStep: number
  heading?: string
  setActiveStep?: (step: number) => void
  description?: string
  footerNote?: string
}

export default function Stepper({
  steps,
  currentStep,
  heading,
  description,
  setActiveStep = () => {},
  footerNote,
}: StepperProps) {
  const stepsWithStatus = getStepsWithStatus(steps, currentStep)
  const totalSteps = steps.length
  const progressPercent = calculateProgress(currentStep, totalSteps)
  const activeStep = stepsWithStatus.find((s) => s.status === "active") ?? stepsWithStatus[0]
  const nextStep = getNextStep(stepsWithStatus)

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
    setActiveStep
  }

  return (
    <>
      <MobileStepper {...renderProps} className="block lg:hidden" />
      <DesktopStepper {...renderProps} className="hidden lg:flex" />
    </>
  )
}
