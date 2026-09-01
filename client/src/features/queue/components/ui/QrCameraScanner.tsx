import React, { useEffect, useRef, useState, useCallback } from "react"
import jsQR from "jsqr"
import {
  SwitchCamera,
  Zap,
  ZapOff,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Volume2,
  VolumeX,
  Camera,
  CameraOff,
} from "lucide-react"
import { toast } from "sonner"

const SCAN_INTERVAL_MS = 150

interface QrCameraScannerProps {
  onScanSuccess: (decodedText: string) => void
  onScanError?: (errorMessage: string) => void
  isProcessing?: boolean
}

interface CameraDevice {
  id: string
  label: string
}

export const QrCameraScanner: React.FC<QrCameraScannerProps> = ({
  onScanSuccess,
  isProcessing = false,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const animFrameIdRef = useRef<number | null>(null)
  const isScanningRef = useRef<boolean>(false)
  const lastScannedTextRef = useRef<string>("")
  const lastScannedTimeRef = useRef<number>(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [cameras, setCameras] = useState<CameraDevice[]>([])
  const [selectedCameraId, setSelectedCameraId] = useState<string>("")
  const [isCameraEnabled, setIsCameraEnabled] = useState<boolean>(false)
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false)
  const [isInitializing, setIsInitializing] = useState<boolean>(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment")
  const [isTorchSupported, setIsTorchSupported] = useState<boolean>(false)
  const [isTorchOn, setIsTorchOn] = useState<boolean>(false)
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true)
  const [lastScannedResult, setLastScannedResult] = useState<string | null>(null)

  const playScanBeep = useCallback(() => {
    if (!isAudioEnabled) return
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = "sine"
      osc.frequency.setValueAtTime(880, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1)

      gain.gain.setValueAtTime(0.15, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start()
      osc.stop(ctx.currentTime + 0.12)
    } catch {}
  }, [isAudioEnabled])

  const parseQrContent = useCallback((rawText: string): string => {
    const trimmed = rawText.trim()
    if (!trimmed) return ""

    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      try {
        const url = new URL(trimmed)
        const tokenParam = url.searchParams.get("token") || url.searchParams.get("qrToken")
        const bookingIdParam = url.searchParams.get("bookingId") || url.searchParams.get("id")
        if (tokenParam) return tokenParam
        if (bookingIdParam) return bookingIdParam
      } catch {}
    }

    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        const parsed = JSON.parse(trimmed)
        if (parsed.qrToken) return String(parsed.qrToken)
        if (parsed.token) return String(parsed.token)
        if (parsed.bookingId) return String(parsed.bookingId)
      } catch {}
    }

    return trimmed
  }, [])

  const handleDecodedText = useCallback(
    (decodedText: string) => {
      console.log("🎯 [QR Scanner] QR Code Detected in Camera Feed:", {
        rawPayload: decodedText,
        detectedAt: new Date().toISOString(),
      })

      const parsedText = parseQrContent(decodedText)
      if (!parsedText) return

      const now = Date.now()
      if (parsedText === lastScannedTextRef.current && now - lastScannedTimeRef.current < 2500) {
        return
      }

      console.log("✓ [QR Scanner] Processed Token / Booking ID:", parsedText)

      lastScannedTextRef.current = parsedText
      lastScannedTimeRef.current = now

      playScanBeep()
      try {
        if (navigator.vibrate) navigator.vibrate(80)
      } catch {}

      setLastScannedResult(parsedText)
      onScanSuccess(parsedText)

      setTimeout(() => {
        setLastScannedResult(null)
      }, 3000)
    },
    [onScanSuccess, parseQrContent, playScanBeep]
  )

  const isMountedRef = useRef<boolean>(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const stopCamera = useCallback(async () => {
    isScanningRef.current = false

    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current)
      animFrameIdRef.current = null
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        track.stop()
        track.enabled = false
      })
      mediaStreamRef.current = null
    }

    if (videoRef.current) {
      if (videoRef.current.srcObject) {
        try {
          const stream = videoRef.current.srcObject as MediaStream
          stream.getTracks().forEach((track) => {
            track.stop()
            track.enabled = false
          })
        } catch {}
      }
      videoRef.current.srcObject = null
    }

    setIsCameraActive(false)
    setIsTorchOn(false)
  }, [])

  const startScanningLoop = useCallback(() => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas")
    }
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d", { willReadFrequently: true })
    if (!ctx) return

    interface BarcodeResult {
      rawValue?: string
    }
    let nativeDetector: { detect: (target: ImageBitmapSource) => Promise<BarcodeResult[]> } | null =
      null
    if ("BarcodeDetector" in window) {
      try {
        const DetectorClass = (
          window as unknown as {
            BarcodeDetector: new (opts: Record<string, unknown>) => {
              detect: (target: ImageBitmapSource) => Promise<BarcodeResult[]>
            }
          }
        ).BarcodeDetector
        nativeDetector = new DetectorClass({ formats: ["qr_code"] })
      } catch {}
    }

    let lastProcessedAt = 0

    const scanFrame = async () => {
      if (!isScanningRef.current) return

      const now = performance.now()
      if (now - lastProcessedAt < SCAN_INTERVAL_MS) {
        animFrameIdRef.current = requestAnimationFrame(scanFrame)
        return
      }
      lastProcessedAt = now

      const video = videoRef.current
      if (video && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.videoWidth > 0) {
        const vWidth = video.videoWidth
        const vHeight = video.videoHeight

        if (canvas.width !== vWidth || canvas.height !== vHeight) {
          canvas.width = vWidth
          canvas.height = vHeight
        }

        try {
          if (nativeDetector) {
            try {
              const barcodes = await nativeDetector.detect(video)
              if (barcodes && barcodes.length > 0 && barcodes[0]?.rawValue) {
                handleDecodedText(barcodes[0].rawValue)
                animFrameIdRef.current = requestAnimationFrame(scanFrame)
                return
              }
            } catch {}
          }

          ctx.drawImage(video, 0, 0, vWidth, vHeight)
          let imageData = ctx.getImageData(0, 0, vWidth, vHeight)
          let code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "attemptBoth",
          })

          if (code && code.data) {
            handleDecodedText(code.data)
            animFrameIdRef.current = requestAnimationFrame(scanFrame)
            return
          }

          ctx.save()
          ctx.scale(-1, 1)
          ctx.drawImage(video, -vWidth, 0, vWidth, vHeight)
          ctx.restore()

          const mirroredData = ctx.getImageData(0, 0, vWidth, vHeight)
          code = jsQR(mirroredData.data, mirroredData.width, mirroredData.height, {
            inversionAttempts: "attemptBoth",
          })

          if (code && code.data) {
            handleDecodedText(code.data)
            animFrameIdRef.current = requestAnimationFrame(scanFrame)
            return
          }
        } catch {}
      }

      if (isScanningRef.current) {
        animFrameIdRef.current = requestAnimationFrame(scanFrame)
      }
    }

    animFrameIdRef.current = requestAnimationFrame(scanFrame)
  }, [handleDecodedText])

  const startCamera = useCallback(async () => {
    if (!isMountedRef.current) return
    setCameraError(null)
    setIsInitializing(true)
    await stopCamera()

    try {
      const constraints: MediaStreamConstraints = {
        video: selectedCameraId
          ? { deviceId: { exact: selectedCameraId }, width: { ideal: 960 }, height: { ideal: 540 } }
          : { facingMode: facingMode, width: { ideal: 960 }, height: { ideal: 540 } },
        audio: false,
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)

      if (!isMountedRef.current) {
        stream.getTracks().forEach((track) => {
          track.stop()
          track.enabled = false
        })
        return
      }

      mediaStreamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play().catch(() => {})
      }

      const track = stream.getVideoTracks()[0]
      if (track) {
        const capabilities = track.getCapabilities?.() as Record<string, unknown> | undefined
        if (capabilities && capabilities.torch) {
          setIsTorchSupported(true)
        } else {
          setIsTorchSupported(false)
        }
      }

      isScanningRef.current = true
      setIsCameraActive(true)
      setIsInitializing(false)

      startScanningLoop()
    } catch (err: unknown) {
      console.error("Camera stream error:", err)
      isScanningRef.current = false
      setIsCameraActive(false)
      setIsInitializing(false)

      const errorObj = err as { name?: string; message?: string }
      if (errorObj?.name === "NotAllowedError" || errorObj?.name === "PermissionDeniedError") {
        setCameraError(
          "Camera permission denied. Please allow camera access in your browser settings."
        )
      } else if (errorObj?.name === "NotFoundError" || errorObj?.name === "DevicesNotFoundError") {
        setCameraError("No camera hardware found on this system.")
      } else if (errorObj?.name === "NotReadableError" || errorObj?.name === "TrackStartError") {
        setCameraError("Camera is currently in use by another application or tab.")
      } else {
        setCameraError("Unable to initialize camera video stream.")
      }
    }
  }, [facingMode, selectedCameraId, startScanningLoop, stopCamera])

  useEffect(() => {
    const listCameras = async () => {
      try {
        if (!navigator.mediaDevices?.enumerateDevices) return
        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = devices
          .filter((d) => d.kind === "videoinput")
          .map((d, index) => ({
            id: d.deviceId,
            label: d.label || `Camera ${index + 1}`,
          }))

        setCameras(videoDevices)
      } catch (err) {
        console.warn("Failed to enumerate video devices:", err)
      }
    }

    listCameras()
  }, [])

  useEffect(() => {
    if (!isCameraEnabled) {
      stopCamera()
      return
    }
    startCamera()
    return () => {
      stopCamera()
    }
  }, [isCameraEnabled, startCamera, stopCamera])

  const toggleCameraEnabled = useCallback(() => {
    setIsCameraEnabled((prev) => !prev)
  }, [])

  useEffect(() => {
    const handlePageHide = () => {
      stopCamera()
    }
    const handleVisibilityChange = () => {
      if (document.hidden) {
        handlePageHide()
      } else if (isCameraEnabled && isScanningRef.current) {
        startCamera()
      }
    }

    window.addEventListener("pagehide", handlePageHide)
    window.addEventListener("beforeunload", handlePageHide)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      window.removeEventListener("pagehide", handlePageHide)
      window.removeEventListener("beforeunload", handlePageHide)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      stopCamera()
    }
  }, [isCameraEnabled, startCamera, stopCamera])

  const toggleFacingMode = () => {
    const nextMode = facingMode === "environment" ? "user" : "environment"
    setFacingMode(nextMode)
    if (cameras.length > 1) {
      const match = cameras.find((c) => {
        const lbl = c.label.toLowerCase()
        if (nextMode === "environment") {
          return lbl.includes("back") || lbl.includes("environment") || lbl.includes("rear")
        } else {
          return (
            lbl.includes("front") ||
            lbl.includes("user") ||
            lbl.includes("selfie") ||
            lbl.includes("facetime")
          )
        }
      })
      setSelectedCameraId(
        match ? match.id : cameras.find((c) => c.id !== selectedCameraId)?.id || ""
      )
    } else {
      setSelectedCameraId("")
    }
  }

  const toggleTorch = async () => {
    if (!isTorchSupported || !mediaStreamRef.current) return
    try {
      const nextState = !isTorchOn
      const track = mediaStreamRef.current.getVideoTracks()[0]
      if (track && "applyConstraints" in track) {
        await (
          track as unknown as { applyConstraints: (c: Record<string, unknown>) => Promise<void> }
        ).applyConstraints({
          advanced: [{ torch: nextState }],
        })
        setIsTorchOn(nextState)
      }
    } catch (err) {
      console.error("Failed to toggle torch:", err)
      toast.error("Torch control is not supported by your camera hardware")
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsInitializing(true)
      const img = new Image()
      const objectUrl = URL.createObjectURL(file)

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject(new Error("Failed to load image file"))
        img.src = objectUrl
      })

      const tempCanvas = document.createElement("canvas")
      tempCanvas.width = img.naturalWidth || img.width
      tempCanvas.height = img.naturalHeight || img.height
      const tempCtx = tempCanvas.getContext("2d")

      if (!tempCtx) {
        throw new Error("Could not initialize 2D context")
      }

      tempCtx.drawImage(img, 0, 0)
      const imgData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height)
      let code = jsQR(imgData.data, imgData.width, imgData.height, {
        inversionAttempts: "attemptBoth",
      })

      if (!code) {
        tempCtx.save()
        tempCtx.scale(-1, 1)
        tempCtx.drawImage(img, -tempCanvas.width, 0, tempCanvas.width, tempCanvas.height)
        tempCtx.restore()

        const flippedData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height)
        code = jsQR(flippedData.data, flippedData.width, flippedData.height, {
          inversionAttempts: "attemptBoth",
        })
      }

      URL.revokeObjectURL(objectUrl)

      if (code && code.data) {
        handleDecodedText(code.data)
        toast.success("✓ QR code detected and decoded successfully from image!")
      } else {
        toast.error("Could not find a valid QR code in the uploaded image")
      }
    } catch (err) {
      console.error("Failed to scan QR image:", err)
      toast.error("Could not process the uploaded image")
    } finally {
      setIsInitializing(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  return (
    <div className="w-full flex flex-col space-y-4">
      <div className="relative aspect-[4/3] rounded-3xl bg-slate-950 border-2 border-border overflow-hidden flex flex-col items-center justify-center shadow-inner group">
        <video
          ref={videoRef}
          playsInline
          autoPlay
          muted
          className="absolute inset-0 w-full h-full object-cover -scale-x-100"
        />

        {!isCameraEnabled && (
          <div className="absolute inset-0 bg-slate-950 p-6 flex flex-col items-center justify-center text-center space-y-4 z-20">
            <div className="h-14 w-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <CameraOff className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-200">Camera is off</p>
              <p className="text-xs text-slate-400 max-w-xs">
                Kept off by default to avoid lag. Start it when you're ready to scan.
              </p>
            </div>
            <button
              type="button"
              onClick={toggleCameraEnabled}
              className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Camera className="h-4 w-4" />
              Start Camera Scanner
            </button>
          </div>
        )}

        {isCameraEnabled && isCameraActive && !isInitializing && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="w-64 h-64 sm:w-72 sm:h-72 border-2 border-primary/60 rounded-3xl relative flex items-center justify-center animate-pulse">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-2xl" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-2xl" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-2xl" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-2xl" />

              <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent absolute shadow-lg shadow-primary/50 animate-bounce" />
            </div>
          </div>
        )}

        {isCameraEnabled && isInitializing && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs flex flex-col items-center justify-center space-y-3 z-20">
            <RefreshCw className="h-8 w-8 text-primary animate-spin" />
            <p className="text-xs font-semibold text-slate-300">
              Initializing High-Speed Camera...
            </p>
          </div>
        )}

        {isCameraEnabled && cameraError && (
          <div className="absolute inset-0 bg-slate-950/95 p-6 flex flex-col items-center justify-center text-center space-y-3 z-20">
            <AlertTriangle className="h-10 w-10 text-amber-500" />
            <p className="text-xs font-medium text-slate-300 max-w-xs">{cameraError}</p>
            <button
              type="button"
              onClick={() => startCamera()}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry Camera Connection
            </button>
          </div>
        )}

        {lastScannedResult && (
          <div className="absolute top-4 left-4 right-4 z-30 animate-in slide-in-from-top-4 duration-200">
            <div className="bg-emerald-500 text-slate-950 font-bold px-4 py-2.5 rounded-2xl shadow-xl flex items-center justify-between text-xs">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                Scanned: {lastScannedResult}
              </span>
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center space-y-2 z-30">
            <RefreshCw className="h-8 w-8 text-primary animate-spin" />
            <span className="text-xs font-bold text-slate-200">Validating Admit Pass...</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleCameraEnabled}
            className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-semibold cursor-pointer transition-colors ${
              isCameraEnabled
                ? "bg-destructive/10 hover:bg-destructive/20 text-destructive border-destructive/30"
                : "bg-primary/10 hover:bg-primary/20 text-primary border-primary/30"
            }`}
            title={isCameraEnabled ? "Turn Off Camera" : "Turn On Camera"}
          >
            {isCameraEnabled ? <CameraOff className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
            <span className="hidden sm:inline">
              {isCameraEnabled ? "Stop Camera" : "Start Camera"}
            </span>
          </button>

          {isCameraEnabled && (
            <button
              type="button"
              onClick={toggleFacingMode}
              className="p-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground border border-border flex items-center gap-2 text-xs font-semibold cursor-pointer transition-colors"
              title="Switch Front/Back Camera"
            >
              <SwitchCamera className="h-4 w-4 text-primary" />
              <span className="hidden sm:inline">Switch Camera</span>
            </button>
          )}

          {isCameraEnabled && isTorchSupported && (
            <button
              type="button"
              onClick={toggleTorch}
              className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-semibold cursor-pointer transition-colors ${
                isTorchOn
                  ? "bg-amber-500/20 text-amber-500 border-amber-500/40"
                  : "bg-muted hover:bg-muted/80 text-foreground border-border"
              }`}
              title="Toggle Flashlight"
            >
              {isTorchOn ? (
                <Zap className="h-4 w-4 text-amber-500 fill-amber-500" />
              ) : (
                <ZapOff className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Flash</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsAudioEnabled((prev) => !prev)}
            className="p-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground border border-border flex items-center gap-2 text-xs font-semibold cursor-pointer transition-colors"
            title="Toggle Scan Beep Sound"
          >
            {isAudioEnabled ? (
              <Volume2 className="h-4 w-4 text-primary" />
            ) : (
              <VolumeX className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground border border-border flex items-center gap-2 text-xs font-semibold cursor-pointer transition-colors"
          >
            <Upload className="h-4 w-4 text-primary" />
            <span>Upload Image</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default QrCameraScanner
