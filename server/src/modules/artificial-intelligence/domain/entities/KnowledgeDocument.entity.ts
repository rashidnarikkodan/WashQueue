export type KnowledgeDocumentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED"

export type KnowledgeDocumentCategory =
  "FAQ" | "POLICY" | "SERVICE" | "BOOKING" | "PAYMENT" | "QUEUE" | "SUPPORT"

export interface KnowledgeDocumentProps {
  id: string
  title: string
  content: string
  category: KnowledgeDocumentCategory
  status: KnowledgeDocumentStatus
  locale: string
  version: number
  chunkCount?: number
  publishedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export default class KnowledgeDocument {
  private props: KnowledgeDocumentProps

  constructor(props: KnowledgeDocumentProps) {
    this.validate(props)

    this.props = {
      ...props,
      chunkCount: props.chunkCount ?? 0,
      createdAt: new Date(props.createdAt),
      updatedAt: new Date(props.updatedAt),
    }
  }

  // ---------- Getters ----------

  get id(): string {
    return this.props.id
  }

  get title(): string {
    return this.props.title
  }

  get content(): string {
    return this.props.content
  }

  get category(): KnowledgeDocumentCategory {
    return this.props.category
  }

  get status(): KnowledgeDocumentStatus {
    return this.props.status
  }

  get locale(): string {
    return this.props.locale
  }

  get version(): number {
    return this.props.version
  }

  get chunkCount(): number {
    return this.props.chunkCount ?? 0
  }

  get createdAt(): Date {
    return new Date(this.props.createdAt)
  }

  get updatedAt(): Date {
    return new Date(this.props.updatedAt)
  }

  // ---------- Domain behavior ----------

  setChunkCount(count: number): void {
    if (count < 0) {
      throw new Error("Chunk count cannot be negative")
    }
    this.props.chunkCount = count
    this.touch()
  }

  updateContent(title: string, content: string): void {
    this.props.title = this.validateTitle(title)
    this.props.content = this.validateContent(content)

    this.touch()
  }

  changeCategory(category: KnowledgeDocumentCategory): void {
    this.props.category = category
    this.touch()
  }

  changeLocale(locale: string): void {
    if (!locale.trim()) {
      throw new Error("Knowledge document locale cannot be empty")
    }

    this.props.locale = locale.trim()
    this.touch()
  }

  publish(): void {
    if (this.props.status === "ARCHIVED") {
      throw new Error("Archived knowledge document cannot be published")
    }

    this.props.status = "PUBLISHED"
    this.touch()
  }

  archive(): void {
    this.props.status = "ARCHIVED"
    this.touch()
  }

  unpublish(): void {
    if (this.props.status !== "PUBLISHED") {
      throw new Error("Only published documents can be unpublished")
    }

    this.props.status = "DRAFT"
    this.touch()
  }

  createNewVersion(): void {
    this.props.version += 1
    this.props.status = "DRAFT"
    this.touch()
  }

  // ---------- Persistence ----------

  toJSON(): KnowledgeDocumentProps {
    return {
      id: this.props.id,
      title: this.props.title,
      content: this.props.content,
      category: this.props.category,
      status: this.props.status,
      locale: this.props.locale,
      version: this.props.version,
      chunkCount: this.props.chunkCount ?? 0,
      createdAt: new Date(this.props.createdAt),
      updatedAt: new Date(this.props.updatedAt),
    }
  }

  // ---------- Internal ----------

  private touch(): void {
    this.props.updatedAt = new Date()
  }

  private validate(props: KnowledgeDocumentProps): void {
    if (!props.id.trim()) {
      throw new Error("Knowledge document id cannot be empty")
    }

    this.validateTitle(props.title)
    this.validateContent(props.content)

    if (!props.locale.trim()) {
      throw new Error("Knowledge document locale cannot be empty")
    }

    if (!Number.isInteger(props.version) || props.version < 1) {
      throw new Error("Knowledge document version must be a positive integer")
    }

    if (!(props.createdAt instanceof Date)) {
      throw new Error("Invalid createdAt")
    }

    if (!(props.updatedAt instanceof Date)) {
      throw new Error("Invalid updatedAt")
    }
  }

  private validateTitle(title: string): string {
    const value = title.trim()

    if (!value) {
      throw new Error("Knowledge document title cannot be empty")
    }

    return value
  }

  private validateContent(content: string): string {
    const value = content.trim()

    if (!value) {
      throw new Error("Knowledge document content cannot be empty")
    }

    return value
  }
}
