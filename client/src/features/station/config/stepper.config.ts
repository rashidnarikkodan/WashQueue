import type { StepDef } from "@/shared/components/stepper"
export const ADD_STATION_STEPPER:StepDef[] = [
  {
    id: 1,
    title: "Station Details",
    shortTitle: "Details",
  },
  {
    id: 2,
    title: "Setup Availability",
    shortTitle: "Availability",
  },
  {
    id: 3,
    title: "Price Configuration",
    shortTitle: "Pricing",
  },
  {
    id: 4,
    title: "Extra Services & Amenities",
    shortTitle: "Extras",
  },
  {
    id: 5,
    title: "Review & Submit",
    shortTitle: "Review",
  },
]

export const TOTAL_STEPS = ADD_STATION_STEPPER.length
