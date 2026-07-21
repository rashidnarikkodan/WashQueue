import path from "path"
import { randomUUID } from "crypto"

import { IMediaStorage, UploadedFile } from "@/core/application/interfaces/media.interface"
import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import cloudinary from "@/configs/cloudinary.config"

export class CloudinaryService implements IMediaStorage {
  private readonly defaultFolder = "washqueue/onboarding"

  async upload(fileBuffer: Buffer, filename?: string): Promise<UploadedFile> {
    return this.uploadToCloudinary({
      fileBuffer,
      filename,
    })
  }

  async update(
    publicId: string,
    fileBuffer: Buffer,
    filename?: string
  ): Promise<UploadedFile> {
    return this.uploadToCloudinary({
      fileBuffer,
      filename,
      publicId,
      overwrite: true,
    })
  }

  async delete(publicId: string): Promise<void> {
    try {
      const result = await cloudinary.uploader.destroy(publicId)

      if (result.result !== "ok" && result.result !== "not found") {
        throw new AppError(
          `Cloudinary delete failed: ${result.result}`,
          HTTP_STATUS.INTERNAL_SERVER_ERROR
        )
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }

      throw new AppError(
        "Failed to delete file from Cloudinary",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    }
  }

  private uploadToCloudinary({
    fileBuffer,
    filename,
    publicId,
    overwrite = false,
  }: {
    fileBuffer: Buffer
    filename?: string
    publicId?: string
    overwrite?: boolean
  }): Promise<UploadedFile> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: this.defaultFolder,
          resource_type: "auto",
          overwrite,
          invalidate: overwrite,
          public_id:
            publicId ??
            `${randomUUID()}-${filename ? path.parse(filename).name : "file"}`,
        },
        (error, result) => {
          if (error) {
            return reject(
              new AppError(
                `Cloudinary upload failed: ${error.message}`,
                HTTP_STATUS.INTERNAL_SERVER_ERROR
              )
            )
          }

          if (!result) {
            return reject(
              new AppError(
                "Cloudinary upload returned an empty result",
                HTTP_STATUS.INTERNAL_SERVER_ERROR
              )
            )
          }

          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          })
        }
      )

      uploadStream.end(fileBuffer)
    })
  }
}