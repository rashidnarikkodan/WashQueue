import { api } from "@/shared/config/axios";
import type { RoleType } from "@/shared/constants/role.const";
import type { PaginationMeta } from "@/shared/components/ui/Pagination";
import { API_ROUTES } from "@/shared/constants/route.const";
import { getErrorMessage } from "@/shared/utils/error";

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

interface UserApiPayload {
  id?: string;
  _id?: string;
  name?: string;
  email?: string;
  role?: RoleType;
  phone?: string;
  isBlocked?: boolean;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  authProvider?: string;
  lastLoginAt?: string;
}

interface UsersApiResponse {
  data?: {
    users?: UserApiPayload[];
    pagination?: PaginationMeta;
    stats?: GetUsersResponse["stats"];
  };
}

export const usersApi = {
  getUsers: async (filters: GetUsersFilters): Promise<GetUsersResponse> => {
    try {
      const params: Record<string, string | number | boolean> = {};
      
      if (filters.page) params.page = filters.page;
      if (filters.limit) params.limit = filters.limit;
      if (filters.search) params.search = filters.search;
      if (filters.role && filters.role !== "ALL") params.role = filters.role;
      
      if (typeof filters.isBlocked === "boolean") {
        params.isBlocked = filters.isBlocked ? "true" : "false";
      }
      
      if (filters.sortBy) params.sortBy = filters.sortBy;
      if (filters.sortOrder) params.sortOrder = filters.sortOrder;

      const response = await api.get(API_ROUTES.USERS.ROOT, { params });
      const resJson = response.data as UsersApiResponse;

      return {
        users: (resJson.data?.users || []).map((u: UserApiPayload) => ({
          id: u.id ?? u._id ?? "",
          name: u.name ?? "",
          email: u.email ?? "",
          role: u.role ?? "customer",
          phone: u.phone,
          isBlocked: u.isBlocked ?? false,
          isVerified: u.isVerified ?? false,
          createdAt: u.createdAt ?? "",
          updatedAt: u.updatedAt ?? "",
          authProvider: u.authProvider,
          lastLoginAt: u.lastLoginAt
        })),
        pagination: resJson.data?.pagination ?? { total: 0, page: 1, limit: 5, totalPages: 0, hasNextPage: false, hasPrevPage: false },
        stats: resJson.data?.stats
      };
    } catch (error: unknown) {
      const message = getErrorMessage(error, "Failed to retrieve users");
      throw new Error(message);
    }
  },

  getUser: async (id: string): Promise<User> => {
    try {
      const response = await api.get(API_ROUTES.USERS.BY_ID(id));
      const resJson = response.data as UsersApiResponse;
      const u = (resJson.data ?? {}) as UserApiPayload;

      return {
        id: u.id ?? u._id ?? "",
        name: u.name ?? "",
        email: u.email ?? "",
        role: u.role ?? "customer",
        phone: u.phone,
        isBlocked: u.isBlocked ?? false,
        isVerified: u.isVerified ?? false,
        createdAt: u.createdAt ?? "",
        updatedAt: u.updatedAt ?? "",
        authProvider: u.authProvider,
        lastLoginAt: u.lastLoginAt
      };
    } catch (error: unknown) {
      const message = getErrorMessage(error, "Failed to retrieve user details");
      throw new Error(message);
    }
  },

  updateUser: async (id: string, updates: Partial<User>): Promise<User> => {
    try {
      const response = await api.patch(API_ROUTES.USERS.BY_ID(id), updates, { skipToast: true });
      const resJson = response.data as UsersApiResponse;
      const u = (resJson.data ?? {}) as UserApiPayload;

      return {
        id: u.id ?? u._id ?? "",
        name: u.name ?? "",
        email: u.email ?? "",
        role: u.role ?? "customer",
        phone: u.phone,
        isBlocked: u.isBlocked ?? false,
        isVerified: u.isVerified ?? false,
        createdAt: u.createdAt ?? "",
        updatedAt: u.updatedAt ?? "",
        authProvider: u.authProvider,
        lastLoginAt: u.lastLoginAt
      };
    } catch (error: unknown) {
      const message = getErrorMessage(error, "Failed to update user");
      throw new Error(message);
    }
  },
};
