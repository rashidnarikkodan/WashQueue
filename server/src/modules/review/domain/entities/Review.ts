import { Rating } from "../value-objects/rating.vo"

export interface ReviewProps {
  id?: string
  userId: string
  ownerId: string
  stationId: string
  bookingId: string
  rating: number
  comment: string
  updateCount: number
  createdAt?: Date
  updatedAt?: Date
}

export class Review {
  private readonly props: ReviewProps

  constructor(props: ReviewProps) {
    const validatedRating = new Rating(props.rating)

    this.props = {
      ...props,
      rating: validatedRating.val,
      comment: props.comment ? props.comment.trim() : "",
      updateCount: props.updateCount ?? 0,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    }
  }

  get id(): string | undefined {
    return this.props.id
  }

  get userId(): string {
    return this.props.userId
  }

  get ownerId(): string {
    return this.props.ownerId
  }

  get stationId(): string {
    return this.props.stationId
  }

  get bookingId(): string {
    return this.props.bookingId
  }

  get rating(): number {
    return this.props.rating
  }

  get comment(): string {
    return this.props.comment
  }

  get updateCount(): number {
    return this.props.updateCount
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt
  }

  updateReview(rating: number, comment?: string): void {
    const validatedRating = new Rating(rating)

    this.props.rating = validatedRating.val
    if (comment !== undefined) {
      this.props.comment = comment.trim()
    }
    this.props.updateCount = (this.props.updateCount || 0) + 1
    this.props.updatedAt = new Date()
  }

  get data(): ReviewProps {
    return { ...this.props }
  }
}
