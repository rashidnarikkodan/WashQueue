import { api } from "@/shared/config/axios";
import type { RoleType } from "@/shared/constants/role.const";
import type { PaginationMeta } from "@/shared/components/ui/Pagination";

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

export const usersApi = {
  getUsers: async (filters: GetUsersFilters): Promise<GetUsersResponse> => {
    try {
      const params: Record<string, any> = {};
      
      if (filters.page) params.page = filters.page;
      if (filters.limit) params.limit = filters.limit;
      if (filters.search) params.search = filters.search;
      if (filters.role && filters.role !== "ALL") params.role = filters.role;
      
      if (typeof filters.isBlocked === "boolean") {
        params.isBlocked = filters.isBlocked ? "true" : "false";
      }
      
      if (filters.sortBy) params.sortBy = filters.sortBy;
      if (filters.sortOrder) params.sortOrder = filters.sortOrder;

      const response = await api.get("/users", { params });
      const resJson = response.data;

      return {
        users: (resJson.data.users || []).map((u: any) => ({
          id: u.id || u._id,
          name: u.name || "",
          email: u.email,
          role: u.role,
          phone: u.phone,
          isBlocked: u.isBlocked,
          isVerified: u.isVerified,
          createdAt: u.createdAt,
          updatedAt: u.updatedAt,
          authProvider: u.authProvider,
          lastLoginAt: u.lastLoginAt
        })),
        pagination: resJson.data.pagination,
        stats: resJson.data.stats
      };
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Failed to retrieve users";
      throw new Error(message);
    }
  },

  getUser: async (id: string): Promise<User> => {
    try {
      const response = await api.get(`/users/${id}`);
      const resJson = response.data;
      const u = resJson.data;

      return {
        id: u.id || u._id,
        name: u.name || "",
        email: u.email,
        role: u.role,
        phone: u.phone,
        isBlocked: u.isBlocked,
        isVerified: u.isVerified,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
        authProvider: u.authProvider,
        lastLoginAt: u.lastLoginAt
      };
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Failed to retrieve user details";
      throw new Error(message);
    }
  },

  updateUser: async (id: string, updates: Partial<User>): Promise<User> => {
    try {
      const response = await api.patch(`/users/${id}`, updates, { skipToast: true });
      const resJson = response.data;
      const u = resJson.data;

      return {
        id: u.id || u._id,
        name: u.name || "",
        email: u.email,
        role: u.role,
        phone: u.phone,
        isBlocked: u.isBlocked,
        isVerified: u.isVerified,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
        authProvider: u.authProvider,
        lastLoginAt: u.lastLoginAt
      };
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Failed to update user";
      throw new Error(message);
    }
  },

  deleteUser: async (id: string): Promise<boolean> => {
    try {
      const response = await api.delete(`/users/${id}`, { skipToast: true });
      return response.data.success;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Failed to delete user";
      throw new Error(message);
    }
  }
};
