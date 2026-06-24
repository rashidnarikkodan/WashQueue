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