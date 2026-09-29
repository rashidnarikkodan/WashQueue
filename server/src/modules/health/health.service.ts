import os from "os"
import mongoose from "mongoose"
import env from "@/configs/env.config"
import redis from "@/infrastructure/cache/redis.client"
import { qdrant } from "@/infrastructure/database/qdrant/connect"
import { SocketServerService } from "@/infrastructure/websocket/socket-server.service"

export interface ServiceHealth {
  status:
    | "connected"
    | "disconnected"
    | "available"
    | "unavailable"
    | "error"
    | "initialized"
    | "not_initialized"
  latencyMs?: number
  details?: Record<string, unknown>
  error?: string
}

export interface HealthReport {
  status: "healthy" | "degraded" | "unhealthy"
  timestamp: string
  uptime: {
    seconds: number
    formatted: string
  }
  process: {
    pid: number
    nodeVersion: string
    platform: string
    arch: string
    environment: string
    hostname: string
  }
  system: {
    memory: {
      process: {
        rss: string
        heapTotal: string
        heapUsed: string
        external: string
        heapUsagePercentage: string
      }
      system: {
        total: string
        free: string
        used: string
        usagePercentage: string
      }
    }
    cpu: {
      cores: number
      model: string
      loadAverage: number[]
    }
  }
  services: {
    mongodb: ServiceHealth
    redis: ServiceHealth
    qdrant: ServiceHealth
    ollama: ServiceHealth
    websocket: ServiceHealth
  }
}

export class HealthService {
  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    const parts: string[] = []
    if (days > 0) parts.push(`${days}d`)
    if (hours > 0) parts.push(`${hours}h`)
    if (minutes > 0) parts.push(`${minutes}m`)
    parts.push(`${secs}s`)

    return parts.join(" ")
  }

  private async checkMongoDB(): Promise<ServiceHealth> {
    const start = performance.now()
    try {
      const state = mongoose.connection.readyState
      const stateMap: Record<number, ServiceHealth["status"]> = {
        0: "disconnected",
        1: "connected",
        2: "disconnected", // connecting
        3: "disconnected", // disconnecting
      }
      const isConnected = state === 1

      if (isConnected && mongoose.connection.db) {
        await mongoose.connection.db.admin().ping()
        const latencyMs = Number((performance.now() - start).toFixed(2))
        return {
          status: "connected",
          latencyMs,
          details: {
            database: mongoose.connection.name,
            host: mongoose.connection.host,
            readyState: "connected",
          },
        }
      }

      return {
        status: stateMap[state] ?? "disconnected",
        details: {
          readyState: state,
        },
      }
    } catch (err) {
      return {
        status: "error",
        error: err instanceof Error ? err.message : "MongoDB check failed",
      }
    }
  }

  private async checkRedis(): Promise<ServiceHealth> {
    const start = performance.now()
    try {
      const pong = await redis.ping()
      const latencyMs = Number((performance.now() - start).toFixed(2))
      return {
        status: pong === "PONG" ? "connected" : "error",
        latencyMs,
        details: {
          host: env.REDIS_HOST,
          port: env.REDIS_PORT,
          status: redis.status,
        },
      }
    } catch (err) {
      return {
        status: "error",
        error: err instanceof Error ? err.message : "Redis check failed",
        details: {
          host: env.REDIS_HOST,
          port: env.REDIS_PORT,
        },
      }
    }
  }

  private async checkQdrant(): Promise<ServiceHealth> {
    const start = performance.now()
    try {
      const collections = await qdrant.getCollections()
      const latencyMs = Number((performance.now() - start).toFixed(2))
      return {
        status: "connected",
        latencyMs,
        details: {
          url: env.QDRANT_URL,
          collectionsCount: collections.collections.length,
          collections: collections.collections.map((c) => c.name),
        },
      }
    } catch (err) {
      return {
        status: "error",
        error: err instanceof Error ? err.message : "Qdrant check failed",
        details: {
          url: env.QDRANT_URL,
        },
      }
    }
  }

  private async checkOllama(): Promise<ServiceHealth> {
    const start = performance.now()
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000)

      const response = await fetch(`${env.OLLAMA_BASE_URL}/api/tags`, {
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      const latencyMs = Number((performance.now() - start).toFixed(2))

      if (response.ok) {
        const data = (await response.json()) as { models?: Array<{ name: string }> }
        const installedModels = data.models?.map((m) => m.name) ?? []
        return {
          status: "available",
          latencyMs,
          details: {
            baseUrl: env.OLLAMA_BASE_URL,
            llmModel: env.OLLAMA_LLM_MODEL,
            embeddingModel: env.AI_EMBEDDING_MODEL,
            installedModels,
            isLLMModelInstalled: installedModels.some((m) => m.startsWith(env.OLLAMA_LLM_MODEL)),
            isEmbeddingModelInstalled: installedModels.some((m) =>
              m.startsWith(env.AI_EMBEDDING_MODEL)
            ),
          },
        }
      }

      return {
        status: "unavailable",
        latencyMs,
        details: {
          baseUrl: env.OLLAMA_BASE_URL,
          httpStatus: response.status,
        },
      }
    } catch (err) {
      return {
        status: "unavailable",
        error: err instanceof Error ? err.message : "Ollama check failed",
        details: {
          baseUrl: env.OLLAMA_BASE_URL,
        },
      }
    }
  }

  private checkWebSocket(): ServiceHealth {
    const io = SocketServerService.getInstance().getIO()
    if (!io) {
      return {
        status: "not_initialized",
        details: {
          connectedClients: 0,
        },
      }
    }

    return {
      status: "initialized",
      details: {
        connectedClients: io.sockets.sockets.size,
      },
    }
  }

  public async getFullReport(): Promise<HealthReport> {
    const uptimeSeconds = process.uptime()
    const memoryUsage = process.memoryUsage()
    const totalSysMem = os.totalmem()
    const freeSysMem = os.freemem()
    const usedSysMem = totalSysMem - freeSysMem

    const [mongodb, redisHealth, qdrantHealth, ollamaHealth] = await Promise.all([
      this.checkMongoDB(),
      this.checkRedis(),
      this.checkQdrant(),
      this.checkOllama(),
    ])

    const websocket = this.checkWebSocket()

    // Determine overall status
    let status: HealthReport["status"] = "healthy"
    if (mongodb.status !== "connected" || redisHealth.status !== "connected") {
      status = "unhealthy"
    } else if (qdrantHealth.status !== "connected" || ollamaHealth.status !== "available") {
      status = "degraded"
    }

    return {
      status,
      timestamp: new Date().toISOString(),
      uptime: {
        seconds: Math.floor(uptimeSeconds),
        formatted: this.formatUptime(uptimeSeconds),
      },
      process: {
        pid: process.pid,
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        environment: env.NODE_ENV,
        hostname: os.hostname(),
      },
      system: {
        memory: {
          process: {
            rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
            heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
            heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
            external: `${(memoryUsage.external / 1024 / 1024).toFixed(2)} MB`,
            heapUsagePercentage: `${((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100).toFixed(1)}%`,
          },
          system: {
            total: `${(totalSysMem / 1024 / 1024 / 1024).toFixed(2)} GB`,
            free: `${(freeSysMem / 1024 / 1024 / 1024).toFixed(2)} GB`,
            used: `${(usedSysMem / 1024 / 1024 / 1024).toFixed(2)} GB`,
            usagePercentage: `${((usedSysMem / totalSysMem) * 100).toFixed(1)}%`,
          },
        },
        cpu: {
          cores: os.cpus().length,
          model: os.cpus()[0]?.model ?? "Unknown",
          loadAverage: os.loadavg(),
        },
      },
      services: {
        mongodb,
        redis: redisHealth,
        qdrant: qdrantHealth,
        ollama: ollamaHealth,
        websocket,
      },
    }
  }

  public async isReady(): Promise<boolean> {
    try {
      const isMongoConnected = mongoose.connection.readyState === 1
      const pong = await redis.ping()
      return isMongoConnected && pong === "PONG"
    } catch {
      return false
    }
  }
}
