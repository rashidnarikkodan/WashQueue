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
    owners: number;
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

export interface OwnerStation {
  name: string;
  location: string;
  status: "ONLINE" | "OFFLINE" | "MAINTENANCE";
  sessions: number;
}

export interface OwnerProfile {
  companyName: string;
  businessEmail: string;
  whatsapp: string;
  kycStatus: string;
  kycVerified: boolean;
  stations: OwnerStation[];
  totalEarnings: number;
  activeStations: number;
}
