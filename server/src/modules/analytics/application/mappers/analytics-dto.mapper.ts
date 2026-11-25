import {
  AdminDashboardData,
  OwnerDashboardData,
  ManagerDashboardData,
} from "../../domain/types/analytics.types"

export class AnalyticsDTOMapper {
  static toAdminDashboardDTO(data: AdminDashboardData): AdminDashboardData {
    return {
      kpis: {
        totalGrossVolume: data.kpis.totalGrossVolume ?? 0,
        totalPlatformCommission: data.kpis.totalPlatformCommission ?? 0,
        totalBookings: data.kpis.totalBookings ?? 0,
        completedBookings: data.kpis.completedBookings ?? 0,
        completionRate: data.kpis.completionRate ?? 0,
        totalCustomers: data.kpis.totalCustomers ?? 0,
        totalOwners: data.kpis.totalOwners ?? 0,
        totalManagers: data.kpis.totalManagers ?? 0,
        totalStations: data.kpis.totalStations ?? 0,
        activeStations: data.kpis.activeStations ?? 0,
        pendingApprovals: data.kpis.pendingApprovals ?? 0,
        openDisputes: data.kpis.openDisputes ?? 0,
      },
      growthTrend: (data.growthTrend || []).map((p) => ({
        date: p.date,
        revenue: p.revenue,
        bookingsCount: p.bookingsCount,
        commission: p.commission,
      })),
      bookingStatusDistribution: (data.bookingStatusDistribution || []).map((s) => ({
        status: s.status,
        count: s.count,
        percentage: s.percentage,
      })),
      topStations: (data.topStations || []).map((st) => ({
        stationId: st.stationId,
        name: st.name,
        city: st.city,
        totalBookings: st.totalBookings,
        totalRevenue: st.totalRevenue,
        rating: st.rating,
      })),
      recentBookings: (data.recentBookings || []).map((b) => ({
        id: b.id,
        bookingNumber: b.bookingNumber,
        stationName: b.stationName,
        customerName: b.customerName,
        amount: b.amount,
        status: b.status,
        serviceType: b.serviceType,
        createdAt: b.createdAt,
      })),
    }
  }

  static toOwnerDashboardDTO(data: OwnerDashboardData): OwnerDashboardData {
    return {
      kpis: {
        totalGrossRevenue: data.kpis.totalGrossRevenue ?? 0,
        netSettlementAmount: data.kpis.netSettlementAmount ?? 0,
        totalBookings: data.kpis.totalBookings ?? 0,
        completedBookings: data.kpis.completedBookings ?? 0,
        completionRate: data.kpis.completionRate ?? 0,
        totalStations: data.kpis.totalStations ?? 0,
        activeStations: data.kpis.activeStations ?? 0,
        totalManagers: data.kpis.totalManagers ?? 0,
        averageRating: data.kpis.averageRating ?? 0,
      },
      revenueTrend: (data.revenueTrend || []).map((p) => ({
        date: p.date,
        revenue: p.revenue,
        bookingsCount: p.bookingsCount,
        commission: p.commission,
      })),
      stationComparison: (data.stationComparison || []).map((s) => ({
        stationId: s.stationId,
        name: s.name,
        revenue: s.revenue,
        bookingsCount: s.bookingsCount,
        rating: s.rating,
      })),
      serviceDistribution: (data.serviceDistribution || []).map((s) => ({
        name: s.name,
        count: s.count,
        revenue: s.revenue,
      })),
      stations: (data.stations || []).map((st) => ({
        stationId: st.stationId,
        name: st.name,
        city: st.city,
        totalBays: st.totalBays,
        activeBays: st.activeBays,
        todayBookings: st.todayBookings,
        totalRevenue: st.totalRevenue,
        rating: st.rating,
        isActive: st.isActive,
        assignedManagerName: st.assignedManagerName,
      })),
      recentBookings: (data.recentBookings || []).map((b) => ({
        id: b.id,
        bookingNumber: b.bookingNumber,
        stationName: b.stationName,
        customerName: b.customerName,
        vehiclePlate: b.vehiclePlate,
        amount: b.amount,
        status: b.status,
        createdAt: b.createdAt,
      })),
    }
  }

  static toManagerDashboardDTO(data: ManagerDashboardData): ManagerDashboardData {
    return {
      station: {
        id: data.station.id,
        name: data.station.name,
        address: data.station.address,
        city: data.station.city,
        totalBays: data.station.totalBays,
        rating: data.station.rating,
        totalReviews: data.station.totalReviews,
        status: data.station.status,
      },
      kpis: {
        todayTotalScheduled: data.kpis.todayTotalScheduled ?? 0,
        todayCheckedIn: data.kpis.todayCheckedIn ?? 0,
        todayInService: data.kpis.todayInService ?? 0,
        todayCompleted: data.kpis.todayCompleted ?? 0,
        todayNoShow: data.kpis.todayNoShow ?? 0,
        todayRevenue: data.kpis.todayRevenue ?? 0,
        bayOccupancyRate: data.kpis.bayOccupancyRate ?? 0,
        averageServiceMinutes: data.kpis.averageServiceMinutes ?? 0,
      },
      bayStates: (data.bayStates || []).map((b) => ({
        bayNumber: b.bayNumber,
        isOccupied: b.isOccupied,
        currentBookingNumber: b.currentBookingNumber,
        vehiclePlate: b.vehiclePlate,
        serviceType: b.serviceType,
        status: b.status,
        timeRemainingMinutes: b.timeRemainingMinutes,
      })),
      hourlyTrafficToday: (data.hourlyTrafficToday || []).map((h) => ({
        hour: h.hour,
        bookingsCount: h.bookingsCount,
      })),
      weeklyVolume: (data.weeklyVolume || []).map((v) => ({
        date: v.date,
        revenue: v.revenue,
        bookingsCount: v.bookingsCount,
        commission: v.commission,
      })),
      upcomingQueue: (data.upcomingQueue || []).map((q) => ({
        id: q.id,
        bookingNumber: q.bookingNumber,
        customerName: q.customerName,
        customerPhone: q.customerPhone,
        vehiclePlate: q.vehiclePlate,
        serviceType: q.serviceType,
        windowStart: q.windowStart,
        windowEnd: q.windowEnd,
        status: q.status,
        amount: q.amount,
        isWalkIn: q.isWalkIn,
      })),
      activeIssues: (data.activeIssues || []).map((issue) => ({
        id: issue.id,
        issueNumber: issue.issueNumber,
        title: issue.title,
        priority: issue.priority,
        status: issue.status,
        reportedAt: issue.reportedAt,
      })),
    }
  }
}
