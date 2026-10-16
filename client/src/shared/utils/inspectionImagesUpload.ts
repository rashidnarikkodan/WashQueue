import { bookingApi } from "@/shared/apis/booking.api"

export interface UploadedInspectionPhoto {
  position: string
  public_id: string
  secured_url: string
}

export type CloudinaryImage = UploadedInspectionPhoto

interface PositionedFile {
  position: string
  file: File
}

export async function inspectionImagesUpload(
  photos: PositionedFile[]
): Promise<UploadedInspectionPhoto[]> {
  const uploadSig = await bookingApi.getInspectionUploadSignature()

  if (uploadSig.provider === "s3") {
    const uploaded: UploadedInspectionPhoto[] = await Promise.all(
      photos.map(async ({ position, file }) => {
        const presigned = await bookingApi.getInspectionUploadSignature({
          filename: file.name,
          contentType: file.type || "image/jpeg",
          folder: "washqueue/inspections",
        })

        if (!presigned.uploadUrl || !presigned.fileUrl || !presigned.key) {
          throw new Error(`Failed to generate S3 presigned URL for ${position} photo`)
        }

        const response = await fetch(presigned.uploadUrl, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type || "image/jpeg",
          },
        })

        if (!response.ok) {
          throw new Error(`Failed to upload ${position} photo to S3`)
        }

        return {
          position,
          public_id: presigned.key,
          secured_url: presigned.fileUrl,
        }
      })
    )

    return uploaded
  }

  const { signature, timestamp, folder, apiKey, cloudName } = uploadSig

  const uploaded: CloudinaryImage[] = await Promise.all(
    photos.map(async ({ position, file }) => {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("api_key", apiKey || "")
      formData.append("timestamp", String(timestamp || ""))
      formData.append("signature", signature || "")
      formData.append("folder", folder || "washqueue/inspections")

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Failed to upload ${position} photo`)
      }

      const result = await response.json()

      return {
        position,
        public_id: result.public_id,
        secured_url: result.secure_url,
      }
    })
  )

  return uploaded
}
