import { describe, it, expect, vi, beforeEach } from "vitest"
import { S3Client } from "@aws-sdk/client-s3"
import { S3StorageService } from "../s3.service"
import { StorageFactory } from "../storage.factory"
import { AppError } from "@/common/errors/app-error"

vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: vi.fn().mockResolvedValue("https://mock-presigned-url.com/washqueue/test.jpg"),
}))

describe("S3StorageService", () => {
  let mockS3Client: { send: ReturnType<typeof vi.fn> }
  let s3Service: S3StorageService

  beforeEach(() => {
    mockS3Client = {
      send: vi.fn().mockResolvedValue({}),
    }
    s3Service = new S3StorageService(mockS3Client as unknown as S3Client)
  })

  describe("upload", () => {
    it("should successfully upload a file and return url and publicId", async () => {
      const buffer = Buffer.from("test file content")
      const result = await s3Service.upload(buffer, "test-document.pdf")

      expect(mockS3Client.send).toHaveBeenCalledTimes(1)
      expect(result.url).toBeDefined()
      expect(result.publicId).toBeDefined()
      expect(result.publicId).toContain("test-document.pdf")
      expect(result.publicId).toContain("washqueue/uploads/")
    })

    it("should upload a file with custom folder", async () => {
      const buffer = Buffer.from("test file content")
      const result = await s3Service.upload(buffer, "vehicle.jpg", "washqueue/vehicles")

      expect(mockS3Client.send).toHaveBeenCalledTimes(1)
      expect(result.publicId).toContain("washqueue/vehicles/")
      expect(result.publicId).toContain("vehicle.jpg")
    })

    it("should throw AppError when S3 upload fails", async () => {
      mockS3Client.send.mockRejectedValueOnce(new Error("AWS S3 Connection Timeout"))
      const buffer = Buffer.from("test file content")

      await expect(s3Service.upload(buffer, "error.png")).rejects.toThrow(AppError)
    })
  })

  describe("update", () => {
    it("should upload file to existing publicId", async () => {
      const buffer = Buffer.from("updated content")
      const existingKey = "washqueue/onboarding/doc-123.pdf"

      const result = await s3Service.update(existingKey, buffer, "new-name.pdf")

      expect(mockS3Client.send).toHaveBeenCalledTimes(1)
      expect(result.publicId).toBe(existingKey)
      expect(result.url).toContain(existingKey)
    })

    it("should throw AppError when S3 update fails", async () => {
      mockS3Client.send.mockRejectedValueOnce(new Error("S3 PutObject failure"))
      const buffer = Buffer.from("updated content")

      await expect(s3Service.update("key", buffer)).rejects.toThrow(AppError)
    })
  })

  describe("delete", () => {
    it("should delete object by publicId", async () => {
      await s3Service.delete("washqueue/onboarding/test.png")
      expect(mockS3Client.send).toHaveBeenCalledTimes(1)
    })

    it("should throw AppError when S3 delete fails", async () => {
      mockS3Client.send.mockRejectedValueOnce(new Error("S3 DeleteObject failure"))
      await expect(s3Service.delete("key")).rejects.toThrow(AppError)
    })
  })

  describe("generatePresignedUploadUrl", () => {
    it("should generate presigned upload URL and file URL", async () => {
      const result = await s3Service.generatePresignedUploadUrl({
        filename: "front-inspection.jpg",
        contentType: "image/jpeg",
        folder: "washqueue/inspections",
      })

      expect(result.uploadUrl).toBe("https://mock-presigned-url.com/washqueue/test.jpg")
      expect(result.fileUrl).toContain("front-inspection.jpg")
      expect(result.key).toContain("washqueue/inspections/")
    })
  })
})

describe("StorageFactory", () => {
  beforeEach(() => {
    StorageFactory.reset()
  })

  it("should return active provider string", () => {
    const provider = StorageFactory.getActiveProvider()
    expect(["cloudinary", "s3"]).toContain(provider)
  })

  it("should return an IMediaStorage instance", () => {
    const storage = StorageFactory.getStorageService()
    expect(storage).toBeDefined()
    expect(typeof storage.upload).toBe("function")
    expect(typeof storage.update).toBe("function")
    expect(typeof storage.delete).toBe("function")
  })

  it("should provide S3 service instance", () => {
    const s3 = StorageFactory.getS3Service()
    expect(s3).toBeInstanceOf(S3StorageService)
  })
})
