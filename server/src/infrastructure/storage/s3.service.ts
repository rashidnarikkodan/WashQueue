import path from "path"
import { randomUUID } from "crypto"
import { PutObjectCommand, DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

import {
  IPresignedMediaStorage,
  UploadedFile,
  PresignedUploadParams,
  PresignedUploadResult,
} from "@/core/application/interfaces/media.interface"
import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { s3Client as defaultS3Client, s3StorageConfig } from "@/configs/s3.config"

export class S3StorageService implements IPresignedMediaStorage {
  private readonly defaultFolder = "washqueue/onboarding"
  private readonly client: S3Client
  private readonly bucketName: string
  private readonly region: string
  private readonly cloudFrontDomain?: string

  constructor(client: S3Client = defaultS3Client) {
    this.client = client
    this.bucketName = s3StorageConfig.bucketName
    this.region = s3StorageConfig.region
    this.cloudFrontDomain = s3StorageConfig.cloudFrontDomain
  }

  async upload(fileBuffer: Buffer, filename?: string): Promise<UploadedFile> {
    const key = this.generateKey(this.defaultFolder, filename)
    const contentType = this.getContentType(filename)

    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: fileBuffer,
          ContentType: contentType,
        })
      )

      return {
        url: this.buildFileUrl(key),
        publicId: key,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "S3 upload failed"
      throw new AppError(`S3 upload error: ${message}`, HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }
  }

  async update(publicId: string, fileBuffer: Buffer, filename?: string): Promise<UploadedFile> {
    const contentType = this.getContentType(filename)

    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: publicId,
          Body: fileBuffer,
          ContentType: contentType,
        })
      )

      return {
        url: this.buildFileUrl(publicId),
        publicId,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "S3 update failed"
      throw new AppError(`S3 update error: ${message}`, HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }
  }

  async delete(publicId: string): Promise<void> {
    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: publicId,
        })
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : "S3 delete failed"
      throw new AppError(`S3 delete error: ${message}`, HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }
  }

  async generatePresignedUploadUrl(
    params: PresignedUploadParams = {}
  ): Promise<PresignedUploadResult> {
    const folder = params.folder || "washqueue/inspections"
    const key = this.generateKey(folder, params.filename)
    const contentType = params.contentType || this.getContentType(params.filename)
    const expiresIn = params.expiresIn || 600

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: contentType,
      })

      const uploadUrl = await getSignedUrl(this.client, command, { expiresIn })
      const fileUrl = this.buildFileUrl(key)

      return {
        uploadUrl,
        fileUrl,
        key,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to generate presigned URL"
      throw new AppError(
        `S3 presigned URL generation error: ${message}`,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    }
  }

  private generateKey(folder: string, filename?: string): string {
    const uuid = randomUUID()
    const cleanFolder = folder.replace(/^\/+|\/+$/g, "")
    if (!filename) {
      return `${cleanFolder}/${uuid}-file`
    }
    const parsed = path.parse(filename)
    const cleanName = parsed.name.replace(/[^a-zA-Z0-9_-]/g, "_")
    return `${cleanFolder}/${uuid}-${cleanName}${parsed.ext || ""}`
  }

  private buildFileUrl(key: string): string {
    if (this.cloudFrontDomain) {
      const cleanDomain = this.cloudFrontDomain.replace(/^https?:\/\/|\/+$/g, "")
      return `https://${cleanDomain}/${key}`
    }
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`
  }

  private getContentType(filename?: string): string {
    if (!filename) return "application/octet-stream"
    const ext = path.extname(filename).toLowerCase()
    switch (ext) {
      case ".jpg":
      case ".jpeg":
        return "image/jpeg"
      case ".png":
        return "image/png"
      case ".webp":
        return "image/webp"
      case ".gif":
        return "image/gif"
      case ".pdf":
        return "application/pdf"
      default:
        return "application/octet-stream"
    }
  }
}
