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
  isVisible?: boolean
  reportCount?: number
  flags?: string[]
  createdAt?: Date
  updatedAt?: Date
}

export const MAX_REVIEW_EDITS = 2

export class Review {
  private readonly props: ReviewProps

  constructor(props: ReviewProps) {
    const validatedRating = new Rating(props.rating)

    this.props = {
      ...props,
      rating: validatedRating.val,
      comment: props.comment ? props.comment.trim() : "",
      updateCount: props.updateCount ?? 0,
      isVisible: props.isVisible ?? true,
      reportCount: props.reportCount ?? 0,
      flags: props.flags ? [...props.flags] : [],
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

  get isVisible(): boolean {
    return this.props.isVisible ?? true
  }

  get reportCount(): number {
    return this.props.reportCount ?? 0
  }

  get flags(): string[] {
    return this.props.flags ? [...this.props.flags] : []
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt
  }

  updateReview(rating: number, comment?: string): void {
    if ((this.props.updateCount || 0) >= MAX_REVIEW_EDITS) {
      throw new Error(`Review can only be edited a maximum of ${MAX_REVIEW_EDITS} times`)
    }

    const validatedRating = new Rating(rating)

    this.props.rating = validatedRating.val
    if (comment !== undefined) {
      this.props.comment = comment.trim()
    }
    this.props.updateCount = (this.props.updateCount || 0) + 1
    this.props.updatedAt = new Date()
  }

  setVisible(isVisible: boolean): void {
    this.props.isVisible = isVisible
    this.props.updatedAt = new Date()
  }

  hide(): void {
    this.setVisible(false)
  }

  show(): void {
    this.setVisible(true)
  }

  report(reason?: string): void {
    this.props.reportCount = (this.props.reportCount || 0) + 1
    if (reason && !this.props.flags?.includes(reason.toUpperCase())) {
      this.props.flags = [...(this.props.flags || []), reason.toUpperCase()]
    }
    this.props.updatedAt = new Date()
  }

  dismissReports(): void {
    this.props.reportCount = 0
    this.props.flags = []
    this.props.updatedAt = new Date()
  }

  setFlags(flags: string[]): void {
    this.props.flags = flags.map((f) => f.toUpperCase())
    this.props.updatedAt = new Date()
  }

  get data(): ReviewProps {
    return {
      ...this.props,
      flags: this.props.flags ? [...this.props.flags] : [],
    }
  }
}
