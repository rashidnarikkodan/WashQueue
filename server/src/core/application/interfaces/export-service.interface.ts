export interface ExportColumn<T> {
  header: string
  accessor: (row: T) => string | number | boolean | null | undefined
}

export interface ExportOptions<T> {
  filename: string
  columns: ExportColumn<T>[]
  data: T[]
}

export interface IExportService {
  export<T>(options: ExportOptions<T>): Promise<Buffer>
  getContentType(): string
  getFileExtension(): string
}
