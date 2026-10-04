export enum IssueCategory {
  VEHICLE_DAMAGE = "Vehicle Damage",
  WASH_QUALITY = "Wash Quality",
  HARDWARE_FAILURE = "Hardware Failure",
  BILLING = "Billing",
  WAIT_TIME = "Wait Time / Delay",
  STAFF_BEHAVIOR = "Staff Behavior",
  OTHER = "Other",
}

export const VALID_ISSUE_CATEGORIES = Object.values(IssueCategory)
