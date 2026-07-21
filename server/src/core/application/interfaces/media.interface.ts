export interface UploadedFile {
  url: string
  publicId?: string
}

export interface IMediaStorage {
  upload(fileBuffer: Buffer, filename?: string): Promise<UploadedFile>
  update(
    publicId: string,
    fileBuffer: Buffer,
    filename?: string
  ): Promise<UploadedFile>
  delete(publicId: string): Promise<void>
}
