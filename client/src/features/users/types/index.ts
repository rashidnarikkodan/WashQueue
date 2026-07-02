import type { RoleType } from "../../../shared/constants/role.const";
import type { PaginationMeta } from "../../../shared/types";

export interface User {
  id: string;
  name: string;
  email: string;
  role: RoleType;
  phone?: string;
  isBlocked: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  authProvider?: string;
  lastLoginAt?: string;
}

export interface GetUsersFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isBlocked?: boolean;
  sortBy?: "createdAt" | "name" | "email";
  sortOrder?: "asc" | "desc";
}

export interface GetUsersResponse {
  users: User[];
  pagination: PaginationMeta;
  stats?: {
    total: number;
    active: number;
    blocked: number;
    providers: number;
  };
}

export interface Vehicle {
  id: string;
  name: string;
  plate: string;
  addedDate: string;
}

export interface Booking {
  id: string;
  stationName: string;
  vehicle: string;
  date: string;
  amount: number;
  status: "COMPLETED" | "CANCELLED" | "PENDING";
}

export interface ProviderStation {
  name: string;
  location: string;
  status: "ONLINE" | "OFFLINE" | "MAINTENANCE";
  sessions: number;
}

export interface ProviderProfile {
  companyName: string;
  businessEmail: string;
  whatsapp: string;
  kycStatus: string;
  kycVerified: boolean;
  stations: ProviderStation[];
  totalEarnings: number;
  activeStations: number;
}
