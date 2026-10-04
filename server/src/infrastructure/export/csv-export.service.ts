import {
  IExportService,
  ExportOptions,
} from "@/core/application/interfaces/export-service.interface"

export class CsvExportService implements IExportService {
  async export<T>(options: ExportOptions<T>): Promise<Buffer> {
    const { columns, data } = options

    // Create header row
    const headers = columns.map((c) => `"${c.header.replace(/"/g, '""')}"`).join(",")

    // Create data rows
    const rows = data.map((row) => {
      return columns
        .map((c) => {
          const value = c.accessor(row)
          if (value === null || value === undefined) return '""'
          return `"${String(value).replace(/"/g, '""')}"`
        })
        .join(",")
    })

    const csvContent = [headers, ...rows].join("\n")

    // Add BOM for Excel UTF-8 compatibility
    const bom = Buffer.from([0xef, 0xbb, 0xbf])
    const content = Buffer.from(csvContent, "utf-8")

    return Buffer.concat([bom, content])
  }

  getContentType(): string {
    return "text/csv; charset=utf-8"
  }

  getFileExtension(): string {
    return ".csv"
  }
}
