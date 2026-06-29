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
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

export type SidebarItem = {
  name: string;
  path: string;
  icon: LucideIcon;
};

export const adminSideBarItems: SidebarItem[] = [
  {
    name: "Dashboard",
    path: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "User Management",
    path: "/admin/users",
    icon: Users,
  },
  {
    name: "Provider Verification",
    path: "/admin/providers",
    icon: ShieldCheck,
  },
  {
    name: "Station Management",
    path: "/admin/stations",
    icon: Fuel,
  },
  {
    name: "Vehicle Category Management",
    path: "/admin/categories",
    icon: Shapes,
  },
  {
    name: "Booking Monitoring",
    path: "/admin/bookings",
    icon: ReceiptText,
  },
  {
    name: "Queue Monitoring",
    path: "/admin/queues",
    icon: Hourglass,
  },
  {
    name: "Reviews & Ratings Moderation",
    path: "/admin/reviews",
    icon: MessageSquareMore,
  },
  {
    name: "Fraud Monitoring",
    path: "/admin/fraud",
    icon: ShieldAlert,
  },
  {
    name: "Notifications Management",
    path: "/admin/notifications",
    icon: Bell,
  },
  {
    name: "Reports & Analytics",
    path: "/admin/reports",
    icon: BarChart3,
  },
  {
    name: "System Settings",
    path: "/admin/settings",
    icon: Settings,
  },
];


export const providerSideBarItems: SidebarItem[] = [
  {
    name: "Dashboard",
    path: "/provider/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Queue Management",
    path: "/provider/queues",
    icon: Hourglass,
  },
  {
    name: "Bookings",
    path: "/provider/bookings",
    icon: Calendar,
  },
  {
    name: "My Stations",
    path: "/provider/stations",
    icon: Fuel,
  },
  {
    name: "Financial Records",
    path: "/provider/financial-records",
    icon: CreditCard,
  },
  {
    name: "Analytics",
    path: "/provider/analytics",
    icon: BarChart3,
  },
  {
    name: "Customer Feedback",
    path: "/provider/feedback",
    icon: MessageSquareMore,
  },
  {
    name: "Notifications",
    path: "/provider/notifications",
    icon: Bell,
  },
  {
    name: "Team & Managers",
    path: "/provider/team",
    icon: Users,
  },
];