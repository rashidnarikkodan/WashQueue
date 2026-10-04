import { create } from "zustand"
import type { ReviewDto, ReviewPromptData } from "@/shared/types/review.types"

interface ReviewModalState {
  isOpen: boolean
  bookingData: ReviewPromptData | null
  existingReview: ReviewDto | null
  onSuccess?: (review: ReviewDto) => void
  openReviewModal: (
    data: ReviewPromptData,
    existingReview?: ReviewDto | null,
    onSuccess?: (review: ReviewDto) => void
  ) => void
  closeReviewModal: () => void
}

export const useReviewModalStore = create<ReviewModalState>((set) => ({
  isOpen: false,
  bookingData: null,
  existingReview: null,
  onSuccess: undefined,
  openReviewModal: (data, existingReview = null, onSuccess) =>
    set({
      isOpen: true,
      bookingData: data,
      existingReview,
      onSuccess,
    }),
  closeReviewModal: () =>
    set({
      isOpen: false,
      bookingData: null,
      existingReview: null,
      onSuccess: undefined,
    }),
}))
