import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Fuel,
  Shapes,
  ReceiptText,
  Hourglass,
  MessageSquareMore,
  ShieldAlert,
  Bell,
  BarChart3,
  Settings,
  Calendar,
  CreditCard,
  Car,
  LifeBuoy,
  BookOpen,
  User,
} from "lucide-react"

import type { LucideIcon } from "lucide-react"

export type SidebarItem = {
  name: string
  path: string
  icon: LucideIcon
}

export const adminSideBarItems: SidebarItem[] = [
  {
    name: "Dashboard",
    path: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Booking Monitoring",
    path: "/admin/bookings",
    icon: ReceiptText,
  },
  {
    name: "Issue Management",
    path: "/admin/issues",
    icon: LifeBuoy,
  },
  {
    name: "Station Management",
    path: "/admin/stations",
    icon: Fuel,
  },
  {
    name: "Owner Verification",
    path: "/admin/owners",
    icon: ShieldCheck,
  },
  {
    name: "User Management",
    path: "/admin/users",
    icon: Users,
  },
  {
    name: "Settlement Monitoring",
    path: "/admin/settlements",
    icon: CreditCard,
  },
  {
    name: "Fraud Monitoring",
    path: "/admin/fraud",
    icon: ShieldAlert,
  },
  {
    name: "Reviews & Ratings",
    path: "/admin/reviews",
    icon: MessageSquareMore,
  },
  {
    name: "Reports & Analytics",
    path: "/admin/reports",
    icon: BarChart3,
  },
  {
    name: "Catalog Management",
    path: "/admin/categories",
    icon: Shapes,
  },
  {
    name: "Notifications Management",
    path: "/admin/notifications",
    icon: Bell,
  },
  {
    name: "Knowledge Base",
    path: "/admin/knowledge-docs",
    icon: BookOpen,
  },
  {
    name: "System Settings",
    path: "/admin/settings",
    icon: Settings,
  },
  {
    name: "My Profile",
    path: "/admin/profile",
    icon: User,
  },
]

export const ownerSideBarItems: SidebarItem[] = [
  {
    name: "Dashboard",
    path: "/owner/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Queue Management",
    path: "/owner/queues",
    icon: Hourglass,
  },
  {
    name: "Bookings",
    path: "/owner/bookings",
    icon: Calendar,
  },
  {
    name: "Issue Management",
    path: "/owner/issues",
    icon: LifeBuoy,
  },
  {
    name: "My Stations",
    path: "/owner/stations",
    icon: Fuel,
  },
  {
    name: "Financial Records",
    path: "/owner/financial-records",
    icon: CreditCard,
  },
  {
    name: "Analytics",
    path: "/owner/analytics",
    icon: BarChart3,
  },
  {
    name: "Customer Feedback",
    path: "/owner/feedback",
    icon: MessageSquareMore,
  },
  {
    name: "Notifications",
    path: "/owner/notifications",
    icon: Bell,
  },
  {
    name: "My Profile",
    path: "/owner/profile",
    icon: User,
  },
]

export const managerSideBarItems: SidebarItem[] = [
  {
    name: "Dashboard",
    path: "/manager/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Queue Management",
    path: "/manager/queues",
    icon: Hourglass,
  },
  {
    name: "Bookings",
    path: "/manager/bookings",
    icon: Calendar,
  },
  {
    name: "Issue Management",
    path: "/manager/issues",
    icon: LifeBuoy,
  },
  {
    name: "Customer Feedback",
    path: "/manager/feedback",
    icon: MessageSquareMore,
  },
  {
    name: "Notifications",
    path: "/manager/notifications",
    icon: Bell,
  },
  {
    name: "Station",
    path: "/manager/station",
    icon: Car,
  },
  {
    name: "My Profile",
    path: "/manager/profile",
    icon: User,
  },
]
