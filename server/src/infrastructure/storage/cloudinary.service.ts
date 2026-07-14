import { v2 as cloudinary } from "cloudinary"
import { IMediaStorage, UploadedFile } from "@/core/application/media.interface"
import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"

export class CloudinaryService implements IMediaStorage {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    })
  }

  async upload(fileBuffer: Buffer, filename?: string): Promise<UploadedFile> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "washqueue/onboarding",
          public_id: filename ? `${Date.now()}-${filename.split(".")[0]}` : undefined,
          resource_type: "auto",
        },
        (error, result) => {
          if (error) {
            return reject(new AppError(`Cloudinary upload failed: ${error.message}`, HTTP_STATUS.INTERNAL_SERVER_ERROR))
          }
          if (!result) {
            return reject(new AppError("Cloudinary upload returned empty result", HTTP_STATUS.INTERNAL_SERVER_ERROR))
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
