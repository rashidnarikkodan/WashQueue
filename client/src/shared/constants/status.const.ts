export const FILTER_STATUS = {
  ALL: "all",
  ACTIVE: "active",
  BLOCKED: "blocked",
} as const;

export type FilterStatusType = typeof FILTER_STATUS[keyof typeof FILTER_STATUS];
