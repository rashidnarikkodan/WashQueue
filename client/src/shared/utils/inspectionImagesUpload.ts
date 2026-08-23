import { bookingApi } from "@/shared/apis/booking.api"

interface CloudinaryImage {
  position: string
  public_id: string
  secured_url: string
}

interface PositionedFile {
  position: string
  file: File
}

export async function inspectionImagesUpload(
  photos: PositionedFile[]
): Promise<CloudinaryImage[]> {
  const { signature, timestamp, folder, apiKey, cloudName } =
    await bookingApi.getInspectionUploadSignature()

  const uploaded: CloudinaryImage[] = await Promise.all(
    photos.map(async ({ position, file }) => {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("api_key", apiKey)
      formData.append("timestamp", String(timestamp))
      formData.append("signature", signature)
      formData.append("folder", folder)

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      )

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
