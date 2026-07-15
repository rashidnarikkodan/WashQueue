export interface UploadedFile {
  url: string
  publicId?: string
}

export interface IMediaStorage {
  upload(file: Buffer, filename?: string): Promise<UploadedFile>
}