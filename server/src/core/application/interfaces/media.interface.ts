export interface UploadedFile {
  url: string
  publicId?: string
}

export interface PresignedUploadParams {
  folder?: string
  filename?: string
  contentType?: string
  expiresIn?: number
}

export interface PresignedUploadResult {
  uploadUrl: string
  fileUrl: string
  key: string
}

export interface IMediaStorage {
  upload(fileBuffer: Buffer, filename?: string): Promise<UploadedFile>
  update(publicId: string, fileBuffer: Buffer, filename?: string): Promise<UploadedFile>
  delete(publicId: string): Promise<void>
}

export interface IPresignedMediaStorage extends IMediaStorage {
  generatePresignedUploadUrl(params: PresignedUploadParams): Promise<PresignedUploadResult>
}
