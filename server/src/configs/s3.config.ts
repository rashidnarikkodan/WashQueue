import { S3Client } from "@aws-sdk/client-s3"
import env from "./env.config"

export interface S3StorageConfig {
  bucketName: string
  region: string
  cloudFrontDomain?: string
}

export const s3StorageConfig: S3StorageConfig = {
  bucketName: env.AWS_S3_BUCKET_NAME || "washqueue-media",
  region: env.AWS_REGION || "us-east-1",
  cloudFrontDomain: env.AWS_CLOUDFRONT_DOMAIN,
}

export const createS3Client = (): S3Client => {
  const credentials =
    env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: env.AWS_ACCESS_KEY_ID,
          secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
        }
      : undefined

  return new S3Client({
    region: s3StorageConfig.region,
    credentials,
  })
}

export const s3Client = createS3Client()
export default s3Client
