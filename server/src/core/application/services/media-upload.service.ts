import { IMediaStorage, UploadedFile } from "@/core/application/interfaces/media.interface"
import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"

export type MulterFileMap = Record<string, Express.Multer.File[]>

export class MediaUploadService {
  constructor(private readonly mediaStorage: IMediaStorage) {}

  /**
   * Uploads a single Multer file. Throws AppError if upload fails.
   */
  async uploadFile(file: Express.Multer.File): Promise<UploadedFile> {
    try {
      const uploaded = await this.mediaStorage.upload(file.buffer, file.originalname)
      if (!uploaded || !uploaded.url) {
        throw new AppError(`Failed to process upload for file ${file.originalname}`, HTTP_STATUS.INTERNAL_SERVER_ERROR)
      }
      return uploaded
    } catch (err: unknown) {
      if (err instanceof AppError) {
        throw err
      }
      const message = err instanceof Error ? err.message : "File upload failed"
      throw new AppError(`File upload error: ${message}`, HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }
  }

  /**
   * Helper to upload the first file for a given field name from a Multer file map.
   * Returns undefined if field is missing or has no files.
   * Throws AppError if the file exists but upload fails.
   */
  async uploadFileByFieldname(
    files: MulterFileMap | undefined,
    fieldname: string
  ): Promise<string | undefined> {
    const file = files?.[fieldname]?.[0]
    if (!file) {
      return undefined
    }
    const uploaded = await this.uploadFile(file)
    return uploaded.url
  }

  /**
   * Uploads multiple Multer files and returns their URLs and public IDs.
   * Throws AppError if any file upload fails.
   */
  async uploadMultipleFiles(
    files: Express.Multer.File[] | undefined
  ): Promise<{ url: string; publicId: string }[]> {
    if (!files || files.length === 0) {
      return []
    }

    const uploads = await Promise.all(files.map((file) => this.uploadFile(file)))
    return uploads.map((u, idx) => ({
      url: u.url,
      publicId: u.publicId ?? `img-${Date.now()}-${idx}`,
    }))
  }
}
