import UnifiedBookingDetailsView, {
  type UnifiedBookingDetailsViewProps,
} from "./UnifiedBookingDetailsView"

export default function CustomerBookingDetailsView(
  props: Omit<UnifiedBookingDetailsViewProps, "userRole">
) {
  return <UnifiedBookingDetailsView {...props} userRole="CUSTOMER" />
}
