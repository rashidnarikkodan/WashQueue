import { Response } from "express"
import { AuthenticatedRequest } from "@/infrastructure/http/middleware/authenticate"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { ERROR_MESSAGES } from "@/common/constants/error.constants"
import success from "@/common/utils/success"
import { AppError } from "@/common/errors/app-error"
import {
  ICreateStationUseCase,
  IUpdateStationUseCase,
  IGetStationUseCase,
  IGetStationsUseCase,
  ISubmitStationUseCase,
  IReviewStationUseCase,
} from "../application/interfaces/station-usecases.interface"
import { UnauthorizedError } from "@/common/errors/unauthorized-error"
import { IMediaStorage } from "@/core/application/interfaces/media.interface"

export class StationController {
  constructor(
    private readonly createStationUseCase: ICreateStationUseCase,
    private readonly updateStationUseCase: IUpdateStationUseCase,
    private readonly getStationUseCase: IGetStationUseCase,
    private readonly getStationsUseCase: IGetStationsUseCase,
    private readonly submitStationUseCase: ISubmitStationUseCase,
    private readonly reviewStationUseCase: IReviewStationUseCase,
    private readonly mediaStorage: IMediaStorage
  ) {}

  create = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId
    if (!userId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const body = req.body
    if (typeof body.contact === "string") body.contact = JSON.parse(body.contact)
    if (typeof body.location === "string") body.location = JSON.parse(body.location)
    if (typeof body.address === "string") body.address = JSON.parse(body.address)
    if (typeof body.images === "string") body.images = JSON.parse(body.images)
    if (!body.images) body.images = []

    const files = req.files as Express.Multer.File[] | undefined
    if (files && files.length > 0) {
      const uploadedImages = await Promise.all(
        files.map(async (file, index) => {
          const uploaded = await this.mediaStorage.upload(file.buffer, file.originalname)
          return {
            url: uploaded.url,
            publicId: uploaded.publicId || "",
            isPrimary: body.images.length === 0 && index === 0,
          }
        })
      )
      body.images = [...body.images, ...uploadedImages]
    }

    const processedImages = await Promise.all(
      (body.images || []).map(async (img: any) => {
        if (img.url && img.url.startsWith("data:")) {
          const matches = img.url.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
          if (matches && matches[2]) {
            const buffer = Buffer.from(matches[2], "base64")
            const mimeType = matches[1] || "image/jpeg"
            const extension = mimeType.split("/")[1] || "jpg"
            const filename = `station-${Date.now()}.${extension}`
            try {
              const uploaded = await this.mediaStorage.upload(buffer, filename)
              return {
                url: uploaded.url,
                publicId: uploaded.publicId || "",
                isPrimary: img.isPrimary ?? false,
              }
            } catch (err) {
              console.error("Cloudinary base64 upload failed:", err)
            }
          }
        }
        return img
      })
    )
    body.images = processedImages

    const station = await this.createStationUseCase.execute(userId, body)

    success(
      res,
      { stationId: station.id, station: station.getProps() },
      HTTP_STATUS.CREATED,
      "Station draft created successfully"
    )
  }

  update = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId
    if (!userId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const { stationId } = req.params
    if (!stationId) {
      throw new AppError("Station ID is required", HTTP_STATUS.BAD_REQUEST)
    }

    const body = req.body
    if (typeof body.step === "string") body.step = parseInt(body.step, 10)
    if (body.step === 1) {
      if (typeof body.contact === "string") body.contact = JSON.parse(body.contact)
      if (typeof body.location === "string") body.location = JSON.parse(body.location)
      if (typeof body.address === "string") body.address = JSON.parse(body.address)
      if (typeof body.images === "string") body.images = JSON.parse(body.images)
      if (!body.images) body.images = []

      const files = req.files as Express.Multer.File[] | undefined
      if (files && files.length > 0) {
        const uploadedImages = await Promise.all(
          files.map(async (file, index) => {
            const uploaded = await this.mediaStorage.upload(file.buffer, file.originalname)
            return {
              url: uploaded.url,
              publicId: uploaded.publicId || "",
              isPrimary: body.images.length === 0 && index === 0,
            }
          })
        )
        body.images = [...body.images, ...uploadedImages]
      }

      const processedImages = await Promise.all(
        (body.images || []).map(async (img: any) => {
          if (img.url && img.url.startsWith("data:")) {
            const matches = img.url.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
            if (matches && matches[2]) {
              const buffer = Buffer.from(matches[2], "base64")
              const mimeType = matches[1] || "image/jpeg"
              const extension = mimeType.split("/")[1] || "jpg"
              const filename = `station-${Date.now()}.${extension}`
              try {
                const uploaded = await this.mediaStorage.upload(buffer, filename)
                return {
                  url: uploaded.url,
                  publicId: uploaded.publicId || "",
                  isPrimary: img.isPrimary ?? false,
                }
              } catch (err) {
                console.error("Cloudinary base64 upload failed:", err)
              }
            }
          }
          return img
        })
      )
      body.images = processedImages
    } else if (body.step === 2) {
      if (typeof body.operatingHours === "string") body.operatingHours = JSON.parse(body.operatingHours)
      if (typeof body.holidays === "string") body.holidays = JSON.parse(body.holidays)
      if (typeof body.slotConfig === "string") body.slotConfig = JSON.parse(body.slotConfig)
    } else if (body.step === 3) {
      if (typeof body.pricing === "string") body.pricing = JSON.parse(body.pricing)
    } else if (body.step === 4) {
      if (typeof body.amenities === "string") body.amenities = JSON.parse(body.amenities)
      if (typeof body.extraServices === "string") body.extraServices = JSON.parse(body.extraServices)
    }

    const result = await this.updateStationUseCase.execute(stationId, userId, body)

    success(res, result, HTTP_STATUS.OK, "Station updated successfully")
  }

  getById = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId
    if (!userId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const { stationId } = req.params
    if (!stationId) {
      throw new AppError("Station ID is required", HTTP_STATUS.BAD_REQUEST)
    }

    const result = await this.getStationUseCase.execute(stationId, userId)
    success(res, result, HTTP_STATUS.OK, "Station retrieved successfully")
  }

  getStations = async (req: AuthenticatedRequest, res: Response) => {
    const stations = await this.getStationsUseCase.execute(req.query)
    // Map Station domain entities to plain props objects for JSON serialization
    const data = stations.map((s) => s.getProps())
    success(res, data, HTTP_STATUS.OK, "Stations retrieved successfully")
  }

  submit = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId
    if (!userId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const { stationId } = req.params
    if (!stationId) {
      throw new AppError("Station ID is required", HTTP_STATUS.BAD_REQUEST)
    }

    const station = await this.submitStationUseCase.execute(stationId, userId)
    success(res, station.getProps(), HTTP_STATUS.OK, "Station submitted successfully for review")
  }

  review = async (req: AuthenticatedRequest, res: Response) => {
    const { stationId } = req.params
    if (!stationId) {
      throw new AppError("Station ID is required", HTTP_STATUS.BAD_REQUEST)
    }

    const { action, rejectionReason } = req.body
    const station = await this.reviewStationUseCase.execute(stationId, action, rejectionReason)

    success(
      res,
      station.getProps(),
      HTTP_STATUS.OK,
      `Station ${action === "APPROVE" ? "approved" : "rejected"} successfully`
    )
  }
}
