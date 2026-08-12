import type { TabConfig } from "@/shared/components/data-table"

/** Tabs for UserManagement page */
export const userTabs: TabConfig[] = [
  { id: "all", label: "All Users" },
  { id: "customer", label: "Customers" },
  {
    id: "owner",
    label: "Owners",
    activeColor: "border-[#ADC6FF] text-[#ADC6FF]",
  },
  {
    id: "manager",
    label: "Managers",
  },
]

/** Tabs for OwnerApproval page */
export const ownerApprovalTabs: TabConfig[] = [
  { id: "all", label: "All Owners" },
  { id: "customer", label: "Pending Verification" },
  {
    id: "owner",
    label: "Approved Owners",
    activeColor: "border-[#ADC6FF] text-[#ADC6FF]",
  },
]
