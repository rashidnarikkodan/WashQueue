import { describe, it, expect, vi, beforeEach } from "vitest"
import { HealthService } from "../health.service"
import { HealthController } from "../health.controller"
import { Request, Response } from "express"

describe("Health Module", () => {
  describe("HealthService", () => {
    it("should generate a complete health diagnostic report", async () => {
      const healthService = new HealthService()
      const report = await healthService.getFullReport()

      expect(report).toBeDefined()
      expect(["healthy", "degraded", "unhealthy"]).toContain(report.status)
      expect(report.timestamp).toBeDefined()

      // Process & uptime
      expect(report.uptime.seconds).toBeGreaterThanOrEqual(0)
      expect(report.uptime.formatted).toBeDefined()
      expect(report.process.pid).toBe(process.pid)
      expect(report.process.nodeVersion).toBe(process.version)
      expect(report.process.platform).toBe(process.platform)
      expect(report.process.arch).toBe(process.arch)

      // System memory & CPU
      expect(report.system.memory.process.heapTotal).toBeDefined()
      expect(report.system.memory.process.heapUsed).toBeDefined()
      expect(report.system.memory.system.total).toBeDefined()
      expect(report.system.cpu.cores).toBeGreaterThan(0)
      expect(report.system.cpu.loadAverage).toBeDefined()

      // Subservices
      expect(report.services.mongodb).toBeDefined()
      expect(report.services.redis).toBeDefined()
      expect(report.services.qdrant).toBeDefined()
      expect(report.services.ollama).toBeDefined()
      expect(report.services.websocket).toBeDefined()
    })

    it("should return readiness status boolean", async () => {
      const healthService = new HealthService()
      const isReady = await healthService.isReady()
      expect(typeof isReady).toBe("boolean")
    })
  })

  describe("HealthController", () => {
    let mockHealthService: HealthService
    let controller: HealthController
    let res: Partial<Response>

    beforeEach(() => {
      mockHealthService = {
        getFullReport: vi.fn().mockResolvedValue({
          status: "healthy",
          timestamp: new Date().toISOString(),
          uptime: { seconds: 120, formatted: "2m 0s" },
          process: {
            pid: 1234,
            nodeVersion: "v22.0.0",
            platform: "linux",
            arch: "x64",
            environment: "test",
            hostname: "test-host",
          },
          system: {
            memory: {
              process: {
                rss: "50 MB",
                heapTotal: "40 MB",
                heapUsed: "25 MB",
                external: "5 MB",
                heapUsagePercentage: "62.5%",
              },
              system: {
                total: "16 GB",
                free: "8 GB",
                used: "8 GB",
                usagePercentage: "50%",
              },
            },
            cpu: {
              cores: 8,
              model: "Intel Test CPU",
              loadAverage: [0.5, 0.4, 0.3],
            },
          },
          services: {
            mongodb: { status: "connected", latencyMs: 1.2 },
            redis: { status: "connected", latencyMs: 0.8 },
            qdrant: { status: "connected", latencyMs: 2.1 },
            ollama: { status: "available", latencyMs: 3.5 },
            websocket: { status: "initialized", details: { connectedClients: 0 } },
          },
        }),
        isReady: vi.fn().mockResolvedValue(true),
      } as unknown as HealthService

      controller = new HealthController(mockHealthService)

      res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      }
    })

    it("should return full health report on getReport", async () => {
      const req = {} as Request
      await controller.getReport(req, res as Response)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({ status: "healthy" }),
        })
      )
    })

    it("should return 200 on getLive", async () => {
      const req = {} as Request
      await controller.getLive(req, res as Response)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({ status: "ok" }),
        })
      )
    })

    it("should return 200 on getReady when services are healthy", async () => {
      const req = {} as Request
      await controller.getReady(req, res as Response)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({ status: "ready" }),
        })
      )
    })

    it("should return 503 on getReady when services are not ready", async () => {
      vi.spyOn(mockHealthService, "isReady").mockResolvedValueOnce(false)
      const req = {} as Request
      await controller.getReady(req, res as Response)

      expect(res.status).toHaveBeenCalledWith(503)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining("not ready"),
        })
      )
    })

    it("should return compact metrics on getMetrics", async () => {
      const req = {} as Request
      await controller.getMetrics(req, res as Response)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            uptime: expect.any(Object),
            memory: expect.any(Object),
            cpu: expect.any(Object),
            services: expect.any(Object),
          }),
        })
      )
    })
  })
})
