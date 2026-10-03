export interface ReviewStationRequestInput {
  action: "APPROVE" | "REJECT" | "SUSPEND"
  rejectionReason?: string
}
