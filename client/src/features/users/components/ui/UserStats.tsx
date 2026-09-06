import React from "react"
import {
  Users,
  UserCheck,
  ShieldCheck,
  UserX,
  AlertCircle,
  CheckCircle2,
  FileText,
} from "lucide-react"
import { StatsHUD, type StatItem } from "@/shared/components/stats"

interface UserStatsProps {
  totalUsers: number
  activeUsers: number
  blockedUsers: number
  ownersCount: number
  isOwnerApproval?: boolean
}

const UserStats: React.FC<UserStatsProps> = ({
  totalUsers,
  activeUsers,
  blockedUsers,
  ownersCount,
  isOwnerApproval = false,
}) => {
  if (isOwnerApproval) {
    const ownerStats: StatItem[] = [
      {
        id: "pending",
        label: "Pending Review",
        value: blockedUsers,
        variant: "amber",
        icon: AlertCircle,
      },
      {
        id: "approved",
        label: "Approved Owners",
        value: activeUsers,
        variant: "emerald",
        icon: CheckCircle2,
      },
      {
        id: "total",
        label: "Total Owners",
        value: totalUsers,
        variant: "primary",
        icon: FileText,
      },
    ]

    return <StatsHUD stats={ownerStats} columns={3} />
  }

  const userStats: StatItem[] = [
    {
      id: "total",
      label: "Total Users",
      value: totalUsers,
      variant: "primary",
      icon: Users,
    },
    {
      id: "active",
      label: "Active",
      value: activeUsers,
      variant: "emerald",
      icon: UserCheck,
    },
    {
      id: "owners",
      label: "Owners",
      value: ownersCount,
      variant: "amber",
      icon: ShieldCheck,
    },
    {
      id: "blocked",
      label: "Blocked",
      value: blockedUsers,
      variant: "rose",
      icon: UserX,
    },
  ]

  return <StatsHUD stats={userStats} columns={4} />
}

export default UserStats
