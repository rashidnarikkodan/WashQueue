import env from "@/configs/env.config"
import {
  IMediaStorage,
  IPresignedMediaStorage,
} from "@/core/application/interfaces/media.interface"
import { CloudinaryService } from "./cloudinary.service"
import { S3StorageService } from "./s3.service"

export class StorageFactory {
  private static instance: IMediaStorage | null = null
  private static s3Instance: S3StorageService | null = null
  private static cloudinaryInstance: CloudinaryService | null = null

  public static getActiveProvider(): "cloudinary" | "s3" {
    return env.STORAGE_PROVIDER
  }

  public static getStorageService(): IMediaStorage {
    if (!this.instance) {
      if (env.STORAGE_PROVIDER === "s3") {
        this.instance = this.getS3Service()
      } else {
        this.instance = this.getCloudinaryService()
      }
    }
    return this.instance
  }

  public static getS3Service(): S3StorageService {
    if (!this.s3Instance) {
      this.s3Instance = new S3StorageService()
    }
    return this.s3Instance
  }

  public static getCloudinaryService(): CloudinaryService {
    if (!this.cloudinaryInstance) {
      this.cloudinaryInstance = new CloudinaryService()
    }
    return this.cloudinaryInstance
  }

  public static getPresignedStorageService(): IPresignedMediaStorage {
    return this.getS3Service()
  }

  public static reset(): void {
    this.instance = null
    this.s3Instance = null
    this.cloudinaryInstance = null
  }
}
