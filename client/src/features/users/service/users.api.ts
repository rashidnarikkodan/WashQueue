import { api } from "@/shared/config/axios";
import { API_ROUTES } from "@/shared/constants/api.const";
import { handleApiError } from "@/shared/utils/handleApiError";
import type { GetUsersFilters, GetUsersResponse, User } from "../types";

interface UserApiPayload {
  id?: string;
  _id?: string;
  name?: string;
  email?: string;
  role?: User["role"];
  phone?: string;
  isBlocked?: boolean;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  authProvider?: string;
  lastLoginAt?: string;
  onboardingStep?: number;
  onboardingDetails?: Record<string, string | number | boolean | undefined | null>;
  // Onboarding fields returned flat by the server (merged from the OnboardingDetails document)
  legalFullName?: string;
  businessName?: string;
  gstNumber?: string;
  whatsapp?: string;
  idProofType?: string;
  idProofUrl?: string;
  businessLicenseUrl?: string;
  gstCertificateUrl?: string;
  accountHolderName?: string;
  accountNumber?: string;
  bankName?: string;
  bankProofUrl?: string;
  ifscCode?: string;
  rejectionReason?: string;
}

interface UsersApiResponse {
  data?: {
    users?: UserApiPayload[];
    pagination?: GetUsersResponse["pagination"];
    stats?: GetUsersResponse["stats"];
  };
}

const toUser = (u?: UserApiPayload): User => ({
  id: u?.id ?? u?._id ?? "",
  name: u?.name ?? "",
  email: u?.email ?? "",
  role: u?.role ?? "customer",
  phone: u?.phone,
  isBlocked: u?.isBlocked ?? false,
  isVerified: u?.isVerified ?? false,
  createdAt: u?.createdAt ?? "",
  updatedAt: u?.updatedAt ?? "",
  authProvider: u?.authProvider,
  lastLoginAt: u?.lastLoginAt,
  onboardingStep: u?.onboardingStep,
  rejectionReason: u?.rejectionReason,
  // Merge: use explicit onboardingDetails if present, otherwise build it from
  // the flat onboarding fields the server sometimes returns at the root level.
  onboardingDetails: u?.onboardingDetails ?? (
    (u?.legalFullName || u?.businessName || u?.idProofUrl) ? {
      fullName: u?.legalFullName,
      businessName: u?.businessName,
      gstNumber: u?.gstNumber,
      phone: u?.phone,
      whatsapp: u?.whatsapp,
      idProofType: u?.idProofType,
      idProofUrl: u?.idProofUrl,
      businessLicenseUrl: u?.businessLicenseUrl,
      gstCertificateUrl: u?.gstCertificateUrl,
      accountHolderName: u?.accountHolderName,
      accountNumber: u?.accountNumber,
      bankName: u?.bankName,
      bankProofUrl: u?.bankProofUrl,
      ifscCode: u?.ifscCode,
      rejectionReason: u?.rejectionReason,
    } : undefined
  ),
});

export const usersApi = {
  getUsers: async (filters: GetUsersFilters): Promise<GetUsersResponse> => {
    try {
      const params: Record<string, boolean|string|number> = {};
      
      if (filters.page) params.page = filters.page;
      if (filters.limit) params.limit = filters.limit;
      if (filters.search) params.search = filters.search;
      if (filters.role && filters.role !== "all") params.role = filters.role;
      
      if (typeof filters.isBlocked === "boolean") {
        params.isBlocked = filters.isBlocked ? "true" : "false";
      }
      
      if (filters.sortBy) params.sortBy = filters.sortBy;
      if (filters.sortOrder) params.sortOrder = filters.sortOrder;

      const response = await api.get(API_ROUTES.USERS.ROOT, { params });
      const resJson = response.data as UsersApiResponse;

      return {
        users: (resJson.data?.users ?? []).map((u) => toUser(u)),
        pagination: resJson.data?.pagination ?? { total: 0, page: 1, limit: 5, totalPages: 0, hasNextPage: false, hasPrevPage: false },
        stats: resJson.data?.stats
      };
    } catch (error: unknown) {
      handleApiError(error,"Failed to retrieve users")
    }
  },

  getUser: async (id: string): Promise<User> => {
    try {
      const response = await api.get(API_ROUTES.USERS.BY_ID(id));
      const resData = response.data as { data?: UserApiPayload };
      const u = resData.data;

      return toUser(u);
    } catch (error: unknown) {
      handleApiError(error,"Failed to retrieve user details")
    }
  },

  updateUser: async (id: string, updates: Partial<User>): Promise<User> => {
    try {
      const response = await api.patch(API_ROUTES.USERS.BY_ID(id), updates, { skipToast: true });
      const resData = response.data as { data?: UserApiPayload };
      const u = resData.data;

      return toUser(u);
    } catch (error: unknown) {
      handleApiError(error,"Failed to update user")
    }
  },
};
