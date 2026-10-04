import UnifiedBookingDetailsView, {
  type UnifiedBookingDetailsViewProps,
} from "./UnifiedBookingDetailsView"

export default function ProviderBookingDetailsView(
  props: Omit<UnifiedBookingDetailsViewProps, "userRole">
) {
  return <UnifiedBookingDetailsView {...props} userRole="MANAGER" />
}
