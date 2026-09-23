import { api } from "../config/axios"
import { API_ROUTES } from "../constants/api.const"

export type DateRangeFilter = "7_DAYS" | "30_DAYS" | "90_DAYS" | "YEAR" | "ALL"

export interface TimeSeriesPoint {
  date: string
  revenue: number
  bookingsCount: number
  commission?: number
}

export interface StatusDistributionItem {
  status: string
  count: number
  percentage: number
}

export interface ServiceDistributionItem {
  name: string
  count: number
  revenue: number
}

export interface StationLeaderboardItem {
  stationId: string
  name: string
  city?: string
  totalBookings: number
  totalRevenue: number
  rating: number
}

export interface AdminDashboardData {
  kpis: {
    totalGrossVolume: number
    totalPlatformCommission: number
    totalBookings: number
    completedBookings: number
    completionRate: number
    totalCustomers: number
    totalOwners: number
    totalManagers: number
    totalStations: number
    activeStations: number
    pendingApprovals: number
    openDisputes: number
  }
  growthTrend: TimeSeriesPoint[]
  bookingStatusDistribution: StatusDistributionItem[]
  topStations: StationLeaderboardItem[]
  recentBookings: Array<{
    id: string
    bookingNumber: string
    stationName: string
    customerName: string
    amount: number
    status: string
    serviceType: string
    createdAt: string
  }>
}

export interface OwnerStationSummary {
  stationId: string
  name: string
  city?: string
  totalBays: number
  activeBays: number
  todayBookings: number
  totalRevenue: number
  rating: number
  isActive: boolean
  assignedManagerName?: string
}

export interface OwnerDashboardData {
  kpis: {
    totalGrossRevenue: number
    netSettlementAmount: number
    totalBookings: number
    completedBookings: number
    completionRate: number
    totalStations: number
    activeStations: number
    totalManagers: number
    averageRating: number
  }
  revenueTrend: TimeSeriesPoint[]
  stationComparison: Array<{
    stationId: string
    name: string
    revenue: number
    bookingsCount: number
    rating: number
  }>
  serviceDistribution: ServiceDistributionItem[]
  stations: OwnerStationSummary[]
  recentBookings: Array<{
    id: string
    bookingNumber: string
    stationName: string
    customerName: string
    vehiclePlate: string
    amount: number
    status: string
    createdAt: string
  }>
}

export interface LiveBayState {
  bayNumber: number
  isOccupied: boolean
  currentBookingNumber?: string
  vehiclePlate?: string
  serviceType?: string
  status?: string
  timeRemainingMinutes?: number
}

export interface HourlyTrafficPoint {
  hour: string
  bookingsCount: number
}

export interface ManagerDashboardData {
  station: {
    id: string
    name: string
    address?: string
    city?: string
    totalBays: number
    rating: number
    totalReviews: number
    status: string
  }
  kpis: {
    todayTotalScheduled: number
    todayCheckedIn: number
    todayInService: number
    todayCompleted: number
    todayNoShow: number
    todayRevenue: number
    bayOccupancyRate: number
    averageServiceMinutes: number
  }
  bayStates: LiveBayState[]
  hourlyTrafficToday: HourlyTrafficPoint[]
  weeklyVolume: TimeSeriesPoint[]
  upcomingQueue: Array<{
    id: string
    bookingNumber: string
    customerName: string
    customerPhone?: string
    vehiclePlate: string
    serviceType: string
    windowStart: string
    windowEnd: string
    status: string
    amount: number
    isWalkIn: boolean
  }>
  activeIssues: Array<{
    id: string
    issueNumber: string
    title: string
    priority: string
    status: string
    reportedAt: string
  }>
}

export const analyticsApi = {
  getAdminDashboard: async (range: DateRangeFilter = "30_DAYS"): Promise<AdminDashboardData> => {
    const res = await api.get<{ success: boolean; data: AdminDashboardData }>(
      API_ROUTES.ANALYTICS.ADMIN,
      { params: { range } }
    )
    return res.data.data
  },

  getOwnerDashboard: async (range: DateRangeFilter = "30_DAYS"): Promise<OwnerDashboardData> => {
    const res = await api.get<{ success: boolean; data: OwnerDashboardData }>(
      API_ROUTES.ANALYTICS.OWNER,
      { params: { range } }
    )
    return res.data.data
  },

  getManagerDashboard: async (stationId?: string): Promise<ManagerDashboardData> => {
    const res = await api.get<{ success: boolean; data: ManagerDashboardData }>(
      API_ROUTES.ANALYTICS.MANAGER,
      { params: { stationId } }
    )
    return res.data.data
  },
}
