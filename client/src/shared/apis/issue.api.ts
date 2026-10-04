import { api } from "@/shared/config/axios"
import { API_ROUTES } from "@/shared/constants/api.const"
import { handleApiError } from "@/shared/utils/handleApiError"
import type {
  IssueDto,
  CreateIssuePayload,
  UpdateIssueStatusPayload,
  AssignIssuePayload,
  EscalateIssuePayload,
  ResolveIssuePayload,
  CloseIssuePayload,
  IssueQueryParams,
  IssueListResponse,
} from "@/features/issue/types/issue.types"

export const issueApi = {
  createIssue: async (payload: CreateIssuePayload): Promise<IssueDto> => {
    try {
      const response = await api.post(API_ROUTES.ISSUES.ROOT, payload)
      return response.data?.data
    } catch (error) {
      throw handleApiError(error, "Failed to submit issue")
    }
  },

  getMyIssues: async (params: IssueQueryParams = {}): Promise<IssueListResponse> => {
    try {
      const response = await api.get(API_ROUTES.ISSUES.MY_ISSUES, {
        params,
        skipToast: true,
      })
      return (
        response.data?.data || {
          issues: [],
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        }
      )
    } catch (error) {
      throw handleApiError(error, "Failed to load customer issues")
    }
  },

  getStationIssues: async (
    stationId: string,
    params: IssueQueryParams = {}
  ): Promise<IssueListResponse> => {
    try {
      const response = await api.get(API_ROUTES.ISSUES.BY_STATION(stationId), {
        params,
        skipToast: true,
      })
      return (
        response.data?.data || {
          issues: [],
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        }
      )
    } catch (error) {
      throw handleApiError(error, "Failed to load station issues")
    }
  },

  getAdminIssues: async (params: IssueQueryParams = {}): Promise<IssueListResponse> => {
    try {
      const response = await api.get(API_ROUTES.ISSUES.ADMIN_ALL, {
        params,
        skipToast: true,
      })
      return (
        response.data?.data || {
          issues: [],
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        }
      )
    } catch (error) {
      throw handleApiError(error, "Failed to load platform issues")
    }
  },

  getById: async (id: string): Promise<IssueDto> => {
    try {
      const response = await api.get(API_ROUTES.ISSUES.BY_ID(id), {
        skipToast: true,
      })
      return response.data?.data
    } catch (error) {
      throw handleApiError(error, "Failed to load issue details")
    }
  },

  updateStatus: async (id: string, payload: UpdateIssueStatusPayload): Promise<IssueDto> => {
    try {
      const response = await api.patch(API_ROUTES.ISSUES.STATUS(id), payload)
      return response.data?.data
    } catch (error) {
      throw handleApiError(error, "Failed to update issue status")
    }
  },

  assignManager: async (id: string, payload: AssignIssuePayload): Promise<IssueDto> => {
    try {
      const response = await api.patch(API_ROUTES.ISSUES.ASSIGN(id), payload)
      return response.data?.data
    } catch (error) {
      throw handleApiError(error, "Failed to assign manager")
    }
  },

  escalateIssue: async (id: string, payload: EscalateIssuePayload): Promise<IssueDto> => {
    try {
      const response = await api.post(API_ROUTES.ISSUES.ESCALATE(id), payload)
      return response.data?.data
    } catch (error) {
      throw handleApiError(error, "Failed to escalate issue")
    }
  },

  resolveIssue: async (id: string, payload: ResolveIssuePayload): Promise<IssueDto> => {
    try {
      const response = await api.post(API_ROUTES.ISSUES.RESOLVE(id), payload)
      return response.data?.data
    } catch (error) {
      throw handleApiError(error, "Failed to resolve issue")
    }
  },

  closeIssue: async (id: string, payload: CloseIssuePayload = {}): Promise<IssueDto> => {
    try {
      const response = await api.post(API_ROUTES.ISSUES.CLOSE(id), payload)
      return response.data?.data
    } catch (error) {
      throw handleApiError(error, "Failed to close issue")
    }
  },
}
