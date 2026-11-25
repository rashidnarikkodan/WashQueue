import { HealthReport, ServiceHealth } from "./health.service"

export interface ServiceHealthDTO {
  status: ServiceHealth["status"]
  latencyMs?: number
  error?: string
}

export interface HealthReportDTO {
  status: "healthy" | "degraded" | "unhealthy"
  timestamp: string
  uptime: {
    seconds: number
    formatted: string
  }
  process: {
    nodeVersion: string
    platform: string
    arch: string
    environment: string
  }
  system: {
    memory: {
      process: {
        heapTotal: string
        heapUsed: string
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
    mongodb: ServiceHealthDTO
    redis: ServiceHealthDTO
    qdrant: ServiceHealthDTO
    ollama: ServiceHealthDTO
    websocket: ServiceHealthDTO
  }
}

export interface LiveStatusDTO {
  status: "ok"
  timestamp: string
  uptime: number
}

export interface ReadyStatusDTO {
  status: "ready"
  timestamp: string
}

export interface MetricsDTO {
  uptime: {
    seconds: number
    formatted: string
  }
  memory: {
    process: {
      heapTotal: string
      heapUsed: string
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
  services: {
    mongodb: ServiceHealthDTO
    redis: ServiceHealthDTO
    qdrant: ServiceHealthDTO
    ollama: ServiceHealthDTO
  }
}

export class HealthDTOMapper {
  static toReportDTO(report: HealthReport): HealthReportDTO {
    return {
      status: report.status,
      timestamp: report.timestamp,
      uptime: {
        seconds: report.uptime.seconds,
        formatted: report.uptime.formatted,
      },
      process: {
        nodeVersion: report.process.nodeVersion,
        platform: report.process.platform,
        arch: report.process.arch,
        environment: report.process.environment,
      },
      system: {
        memory: {
          process: {
            heapTotal: report.system.memory.process.heapTotal,
            heapUsed: report.system.memory.process.heapUsed,
            heapUsagePercentage: report.system.memory.process.heapUsagePercentage,
          },
          system: {
            total: report.system.memory.system.total,
            free: report.system.memory.system.free,
            used: report.system.memory.system.used,
            usagePercentage: report.system.memory.system.usagePercentage,
          },
        },
        cpu: {
          cores: report.system.cpu.cores,
          model: report.system.cpu.model,
          loadAverage: report.system.cpu.loadAverage,
        },
      },
      services: {
        mongodb: {
          status: report.services.mongodb.status,
          latencyMs: report.services.mongodb.latencyMs,
          error: report.services.mongodb.error,
        },
        redis: {
          status: report.services.redis.status,
          latencyMs: report.services.redis.latencyMs,
          error: report.services.redis.error,
        },
        qdrant: {
          status: report.services.qdrant.status,
          latencyMs: report.services.qdrant.latencyMs,
          error: report.services.qdrant.error,
        },
        ollama: {
          status: report.services.ollama.status,
          latencyMs: report.services.ollama.latencyMs,
          error: report.services.ollama.error,
        },
        websocket: {
          status: report.services.websocket.status,
          error: report.services.websocket.error,
        },
      },
    }
  }

  static toLiveDTO(uptimeSeconds: number): LiveStatusDTO {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: Math.floor(uptimeSeconds),
    }
  }

  static toReadyDTO(): ReadyStatusDTO {
    return {
      status: "ready",
      timestamp: new Date().toISOString(),
    }
  }

  static toMetricsDTO(report: HealthReport): MetricsDTO {
    return {
      uptime: report.uptime,
      memory: {
        process: {
          heapTotal: report.system.memory.process.heapTotal,
          heapUsed: report.system.memory.process.heapUsed,
          heapUsagePercentage: report.system.memory.process.heapUsagePercentage,
        },
        system: {
          total: report.system.memory.system.total,
          free: report.system.memory.system.free,
          used: report.system.memory.system.used,
          usagePercentage: report.system.memory.system.usagePercentage,
        },
      },
      cpu: report.system.cpu,
      services: {
        mongodb: {
          status: report.services.mongodb.status,
          latencyMs: report.services.mongodb.latencyMs,
          error: report.services.mongodb.error,
        },
        redis: {
          status: report.services.redis.status,
          latencyMs: report.services.redis.latencyMs,
          error: report.services.redis.error,
        },
        qdrant: {
          status: report.services.qdrant.status,
          latencyMs: report.services.qdrant.latencyMs,
          error: report.services.qdrant.error,
        },
        ollama: {
          status: report.services.ollama.status,
          latencyMs: report.services.ollama.latencyMs,
          error: report.services.ollama.error,
        },
      },
    }
  }
}
