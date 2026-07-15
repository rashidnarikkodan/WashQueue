import type { SelectFilter, ToggleFilter } from "@/shared/components/data-table";
import { ROLE } from "@/shared/constants/role.const";
import { FILTER_STATUS } from "@/shared/constants/status.const";

interface BuildUserFiltersOptions {
  roleFilter: string;
  setRoleFilter: (role: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  highCancellation: boolean;
  setHighCancellation: (val: boolean) => void;
  fraudFlag: boolean;
  setFraudFlag: (val: boolean) => void;
}

export function buildUserFilters({
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter,
  highCancellation,
  setHighCancellation,
  fraudFlag,
  setFraudFlag,
}: BuildUserFiltersOptions): {
  selectFilters: SelectFilter[];
  toggleFilters: ToggleFilter[];
} {
  const selectFilters: SelectFilter[] = [
    {
      id: "role",
      label: "Sort By",
      value: roleFilter,
      onChange: setRoleFilter,
      options: [
        { label: "All Roles", value: "all" },
        { label: "Admin", value: ROLE.ADMIN },
        { label: "Manager", value: ROLE.MANAGER },
        { label: "Owner", value: ROLE.OWNER },
        { label: "Customer", value: ROLE.CUSTOMER },
      ],
    },
    {
      id: "status",
      label: "Status",
      value: statusFilter,
      onChange: setStatusFilter,
      options: [
        { label: "Any Status", value: FILTER_STATUS.ALL },
        { label: "Active", value: FILTER_STATUS.ACTIVE },
        { label: "Blocked", value: FILTER_STATUS.BLOCKED },
      ],
    },
  ];

  const toggleFilters: ToggleFilter[] = [
    {
      id: "highCancellation",
      label: "High Cancellation",
      value: highCancellation,
      onChange: setHighCancellation,
      activeColor: "bg-primary/25 border border-primary/30",
      thumbActiveColor: "bg-[#ADC6FF]",
    },
    {
      id: "fraudFlag",
      label: "Fraud Flag",
      value: fraudFlag,
      onChange: setFraudFlag,
      activeColor: "bg-rose-500/25 border border-rose-500/30",
      thumbActiveColor: "bg-[#FFB4AB]",
    },
  ];

  return { selectFilters, toggleFilters };
}
