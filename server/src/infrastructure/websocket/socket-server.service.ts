import { Server as HttpServer } from "http"
import { Server as SocketIOServer, Socket } from "socket.io"
import jwt from "jsonwebtoken"
import env from "@/configs/env.config"
import logger from "@/configs/logger.config"

export interface SocketUserPayload {
  userId: string
  role?: string
}

function readCookie(cookieHeader: string | undefined, name: string): string {
  if (!cookieHeader) return ""
  for (const pair of cookieHeader.split(";")) {
    const separatorIndex = pair.indexOf("=")
    if (separatorIndex === -1) continue
    const key = pair.slice(0, separatorIndex).trim()
    if (key === name) {
      return decodeURIComponent(pair.slice(separatorIndex + 1).trim())
    }
  }
  return ""
}

export class SocketServerService {
  private static instance: SocketServerService
  private io: SocketIOServer | null = null

  private constructor() {}

  public static getInstance(): SocketServerService {
    if (!SocketServerService.instance) {
      SocketServerService.instance = new SocketServerService()
    }
    return SocketServerService.instance
  }

  public init(httpServer: HttpServer): SocketIOServer {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: env.CLIENT_URL,
        methods: ["GET", "POST"],
        credentials: true,
      },
      pingTimeout: 30000,
      pingInterval: 10000,
    })

    this.io.use((socket: Socket, next) => {
      try {
        const token =
          (socket.handshake.auth?.token as string) ||
          (socket.handshake.headers?.authorization?.replace("Bearer ", "") as string) ||
          (socket.handshake.query?.token as string) ||
          readCookie(socket.handshake.headers?.cookie, "accessToken")

        if (token) {
          try {
            const decoded = jwt.verify(token, env.ACCESS_TOKEN_SECRET) as {
              userId?: string
              id?: string
              role?: string
            }
            const userId = decoded.userId || decoded.id
            if (userId) {
              ;(socket as Socket & { user?: SocketUserPayload }).user = {
                userId,
                role: decoded.role,
              }
            }
          } catch {}
        }
        next()
      } catch (err) {
        next(err as Error)
      }
    })

    this.io.on("connection", (socket: Socket) => {
      const user = (socket as Socket & { user?: SocketUserPayload }).user
      logger.info({ socketId: socket.id, userId: user?.userId }, "[SocketIO] Client connected")

      if (user?.userId) {
        const userRoom = `user:${user.userId}`
        socket.join(userRoom)
        logger.info({ socketId: socket.id, userRoom }, "[SocketIO] Socket joined user room")
      }

      socket.on("join_station", (data: { stationId: string }) => {
        if (data?.stationId) {
          const stationRoom = `station:${data.stationId}`
          socket.join(stationRoom)
          logger.info({ socketId: socket.id, stationRoom }, "[SocketIO] Joined station room")
        }
      })

      socket.on("leave_station", (data: { stationId: string }) => {
        if (data?.stationId) {
          socket.leave(`station:${data.stationId}`)
        }
      })

      socket.on("join_booking", (data: { bookingId: string }) => {
        if (data?.bookingId) {
          socket.join(`booking:${data.bookingId}`)
        }
      })

      socket.on("disconnect", (reason) => {
        logger.info({ socketId: socket.id, reason }, "[SocketIO] Client disconnected")
      })
    })

    logger.info("[SocketIO] Real-time Socket.IO server initialized successfully")
    return this.io
  }

  public getIO(): SocketIOServer | null {
    return this.io
  }

  public emitToStation(stationId: string, event: string, payload: unknown): void {
    if (!this.io || !stationId) return
    const room = `station:${stationId}`
    this.io.to(room).emit(event, payload)
    logger.debug({ room, event }, "[SocketIO] Emitted event to station room")
  }

  public emitToUser(userId: string, event: string, payload: unknown): void {
    if (!this.io || !userId) return
    const room = `user:${userId}`
    this.io.to(room).emit(event, payload)
    logger.debug({ room, event }, "[SocketIO] Emitted event to user room")
  }

  public emitToBooking(bookingId: string, event: string, payload: unknown): void {
    if (!this.io || !bookingId) return
    const room = `booking:${bookingId}`
    this.io.to(room).emit(event, payload)
    logger.debug({ room, event }, "[SocketIO] Emitted event to booking room")
  }
}
