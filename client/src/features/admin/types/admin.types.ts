import type { AdminDashboardData } from "@/shared/apis"

export type TopStation = NonNullable<AdminDashboardData["topStations"]>[number] & { rank: number }
export type RecentBooking = NonNullable<AdminDashboardData["recentBookings"]>[number]
