import type { TabConfig } from "@/shared/components/data-table"

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

export const ownerApprovalTabs: TabConfig[] = [
  { id: "all", label: "All Owners" },
  { id: "pending", label: "Pending Verification" },
  {
    id: "approved",
    label: "Approved Owners",
    activeColor: "border-[#ADC6FF] text-[#ADC6FF]",
  },
  { id: "draft", label: "Draft Applications" },
]
