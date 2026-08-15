import React, { useEffect, useRef, useState, useCallback } from "react"
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
} from "lucide-react"
import { toast } from "sonner"

interface QrCameraScannerProps {
  onScanSuccess: (decodedText: string) => void
  onScanError?: (errorMessage: string) => void
  isProcessing?: boolean
}

interface CameraDevice {
  id: string
  label: string
}

interface Html5QrcodeInstance {
  stop: () => Promise<void>
  getRunningTrackCapabilities: () => Record<string, unknown>
  applyVideoConstraints: (constraints: Record<string, unknown>) => Promise<void>
  start: (
    cameraConstraint: string | { facingMode: string },
    config: Record<string, unknown>,
    onSuccess: (decodedText: string) => void,
    onError: (errorMessage: string) => void
  ) => Promise<void>
  scanFile: (imageFile: File, showImage?: boolean) => Promise<string>
}

export const QrCameraScanner: React.FC<QrCameraScannerProps> = ({
  onScanSuccess,
  onScanError,
  isProcessing = false,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const html5ScannerRef = useRef<Html5QrcodeInstance | null>(null)
  const animFrameIdRef = useRef<number | null>(null)
  const isScanningRef = useRef<boolean>(false)
  const lastScannedTextRef = useRef<string>("")
  const lastScannedTimeRef = useRef<number>(0)

  const [cameras, setCameras] = useState<CameraDevice[]>([])
  const [selectedCameraId, setSelectedCameraId] = useState<string>("")
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false)
  const [isInitializing, setIsInitializing] = useState<boolean>(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment")
  const [isTorchSupported, setIsTorchSupported] = useState<boolean>(false)
  const [isTorchOn, setIsTorchOn] = useState<boolean>(false)
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true)
  const [lastScannedResult, setLastScannedResult] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Web Audio Synthesizer Beep for Instant Scan Feedback
  const playScanBeep = useCallback(() => {
    if (!isAudioEnabled) return
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = "sine"
      osc.frequency.setValueAtTime(880, ctx.currentTime) // A5 note
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1) // A6 note

      gain.gain.setValueAtTime(0.15, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start()
      osc.stop(ctx.currentTime + 0.12)
    } catch {
      // Audio playback failed or blocked by browser policy
    }
  }, [isAudioEnabled])

  // Parse QR string (extract raw token, booking ID, JSON payload, or URL query param)
  const parseQrContent = useCallback((rawText: string): string => {
    const trimmed = rawText.trim()
    if (!trimmed) return ""

    // Case 1: URL format (e.g. https://domain.com/check-in?token=XYZ or ?bookingId=WQ-123)
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      try {
        const url = new URL(trimmed)
        const tokenParam = url.searchParams.get("token") || url.searchParams.get("qrToken")
        const bookingIdParam = url.searchParams.get("bookingId") || url.searchParams.get("id")
        if (tokenParam) return tokenParam
        if (bookingIdParam) return bookingIdParam
      } catch {
        // Fallback to raw string
      }
    }

    // Case 2: JSON payload (e.g. {"bookingId": "WQ-829301", "qrToken": "..."})
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        const parsed = JSON.parse(trimmed)
        if (parsed.qrToken) return String(parsed.qrToken)
        if (parsed.token) return String(parsed.token)
        if (parsed.bookingId) return String(parsed.bookingId)
      } catch {
        // Fallback to raw string
      }
    }

    // Case 3: Raw token or booking number string
    return trimmed
  }, [])

  // Handle successful QR detection
  const handleDecodedText = useCallback(
    (decodedText: string) => {
      const parsedText = parseQrContent(decodedText)
      if (!parsedText) return

      const now = Date.now()
      // Cooldown check (2.5 seconds) to prevent duplicate scans
      if (
        parsedText === lastScannedTextRef.current &&
        now - lastScannedTimeRef.current < 2500
      ) {
        return
      }

      lastScannedTextRef.current = parsedText
      lastScannedTimeRef.current = now

      playScanBeep()
      setLastScannedResult(parsedText)
      onScanSuccess(parsedText)

      // Clear recent scan badge after 3 seconds
      setTimeout(() => {
        setLastScannedResult(null)
      }, 3000)
    },
    [onScanSuccess, parseQrContent, playScanBeep]
  )

  // Stop Camera Stream
  const stopCamera = useCallback(async () => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current)
      animFrameIdRef.current = null
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      mediaStreamRef.current = null
    }

    if (html5ScannerRef.current) {
      try {
        await html5ScannerRef.current.stop()
      } catch {
        // Ignore html5scanner stop errors
      }
      html5ScannerRef.current = null
    }

    isScanningRef.current = false
    setIsCameraActive(false)
    setIsTorchOn(false)
  }, [])

  // Native Frame Detection Loop using window.BarcodeDetector or Canvas
  const startNativeFrameDetection = useCallback(
    (videoEl: HTMLVideoElement) => {
      interface BarcodeResult {
        rawValue?: string
      }
      let barcodeDetector: { detect: (target: HTMLVideoElement) => Promise<BarcodeResult[]> } | null = null
      if ("BarcodeDetector" in window) {
        try {
          const DetectorClass = (window as unknown as { BarcodeDetector: new (opts: Record<string, unknown>) => { detect: (target: HTMLVideoElement) => Promise<BarcodeResult[]> } }).BarcodeDetector
          barcodeDetector = new DetectorClass({
            formats: ["qr_code"],
          })
        } catch (err) {
          console.warn("BarcodeDetector initialization error:", err)
        }
      }

      const detectFrame = async () => {
        if (!isScanningRef.current || !videoEl || videoEl.readyState < 2) {
          animFrameIdRef.current = requestAnimationFrame(detectFrame)
          return
        }

        try {
          if (barcodeDetector) {
            const barcodes = await barcodeDetector.detect(videoEl)
            if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
              handleDecodedText(barcodes[0].rawValue)
            }
          }
        } catch {
          // Detection frame error ignored
        }

        if (isScanningRef.current) {
          animFrameIdRef.current = requestAnimationFrame(detectFrame)
        }
      }

      animFrameIdRef.current = requestAnimationFrame(detectFrame)
    },
    [handleDecodedText]
  )

  // Start Camera Stream (dual engine: Html5Qrcode or Native MediaDevices)
  const startCamera = useCallback(async () => {
    setCameraError(null)
    setIsInitializing(true)
    await stopCamera()

    // Engine 1: Try Html5Qrcode library
    try {
      const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import("html5-qrcode")
      if (!html5ScannerRef.current) {
        html5ScannerRef.current = new Html5Qrcode("qr-camera-viewfinder", {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false,
        }) as unknown as Html5QrcodeInstance
      }

      const config = {
        fps: 15,
        qrbox: (w: number, h: number) => {
          const minDim = Math.min(w, h)
          const boxSize = Math.floor(minDim * 0.7)
          return { width: boxSize, height: boxSize }
        },
        aspectRatio: 1.333333,
      }

      const cameraConstraint = selectedCameraId
        ? selectedCameraId
        : { facingMode: facingMode }

      await html5ScannerRef.current.start(
        cameraConstraint,
        config,
        (decodedText: string) => handleDecodedText(decodedText),
        (errorMessage: string) => {
          if (onScanError) onScanError(errorMessage)
        }
      )

      isScanningRef.current = true
      setIsCameraActive(true)

      // Check Torch capabilities
      try {
        const capabilities = html5ScannerRef.current.getRunningTrackCapabilities()
        if (capabilities && capabilities.torch !== undefined) {
          setIsTorchSupported(true)
        }
      } catch {
        setIsTorchSupported(false)
      }

      setIsInitializing(false)
      return
    } catch (err) {
      console.warn("Html5Qrcode engine initialization failed/fallback to Native MediaStream:", err)
    }

    // Engine 2: Fallback to Native MediaStream API
    try {
      const constraints: MediaStreamConstraints = {
        video: selectedCameraId
          ? { deviceId: { exact: selectedCameraId } }
          : { facingMode: facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      mediaStreamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      // Check torch support on track
      const track = stream.getVideoTracks()[0]
      if (track) {
        const capabilities = track.getCapabilities() as Record<string, unknown>
        if (capabilities && capabilities.torch) {
          setIsTorchSupported(true)
        }
      }

      isScanningRef.current = true
      setIsCameraActive(true)

      if (videoRef.current) {
        startNativeFrameDetection(videoRef.current)
      }
    } catch (err: unknown) {
      console.error("Native camera stream error:", err)
      isScanningRef.current = false
      setIsCameraActive(false)
      const errorObj = err as { name?: string; message?: string }
      if (errorObj?.name === "NotAllowedError" || String(err).includes("Permission")) {
        setCameraError("Camera access permission was denied. Please allow camera access in browser settings.")
      } else if (errorObj?.name === "NotFoundError" || String(err).includes("NotFound")) {
        setCameraError("No camera hardware detected on this device.")
      } else if (errorObj?.name === "NotReadableError") {
        setCameraError("Camera is currently being used by another application.")
      } else {
        setCameraError(errorObj?.message || String(err) || "Failed to initialize camera scanner.")
      }
    } finally {
      setIsInitializing(false)
    }
  }, [facingMode, handleDecodedText, onScanError, selectedCameraId, startNativeFrameDetection, stopCamera])

  // Fetch available camera devices on mount
  useEffect(() => {
    let isMounted = true

    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          if (!isMounted) return
          const videoDevices = devices
            .filter((d) => d.kind === "videoinput")
            .map((d, index) => ({
              id: d.deviceId,
              label: d.label || `Camera ${index + 1}`,
            }))

          setCameras(videoDevices)

          if (videoDevices.length > 0 && !selectedCameraId) {
            const backCam = videoDevices.find(
              (c) =>
                c.label.toLowerCase().includes("back") ||
                c.label.toLowerCase().includes("environment") ||
                c.label.toLowerCase().includes("rear")
            )
            setSelectedCameraId(backCam ? backCam.id : videoDevices[0].id)
          }
        })
        .catch((err) => console.warn("enumerateDevices error:", err))
    }

    return () => {
      isMounted = false
      stopCamera()
    }
  }, [selectedCameraId, stopCamera])

  // Auto-start camera when selectedCameraId or facingMode changes
  useEffect(() => {
    let ignore = false
    void Promise.resolve().then(async () => {
      if (ignore) return
      await startCamera()
    })
    return () => {
      ignore = true
    }
  }, [selectedCameraId, facingMode, startCamera])

  // Toggle Facing Mode
  const toggleFacingMode = () => {
    const nextMode = facingMode === "environment" ? "user" : "environment"
    setFacingMode(nextMode)
    setSelectedCameraId("")
  }

  // Toggle Torch/Flash
  const toggleTorch = async () => {
    if (!isTorchSupported) return
    try {
      const nextState = !isTorchOn
      if (html5ScannerRef.current) {
        await html5ScannerRef.current.applyVideoConstraints({
          advanced: [{ torch: nextState }],
        })
      } else if (mediaStreamRef.current) {
        const track = mediaStreamRef.current.getVideoTracks()[0]
        if (track && "applyConstraints" in track) {
          await (track as unknown as { applyConstraints: (c: Record<string, unknown>) => Promise<void> }).applyConstraints({
            advanced: [{ torch: nextState }],
          })
        }
      }
      setIsTorchOn(nextState)
    } catch (err) {
      console.error("Failed to toggle torch:", err)
      toast.error("Torch control is not supported by your camera hardware")
    }
  }

  // Scan QR Code from uploaded Image File
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsInitializing(true)
      const { Html5Qrcode } = await import("html5-qrcode")
      const html5QrCode = new Html5Qrcode("qr-file-temp-element")
      const result = await html5QrCode.scanFile(file, true)
      handleDecodedText(result)
      toast.success("QR code decoded successfully from image!")
    } catch (err) {
      console.error("Failed to scan QR image:", err)
      toast.error("Could not find a valid QR code in the uploaded image")
    } finally {
      setIsInitializing(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  return (
    <div className="w-full flex flex-col space-y-4">
      {/* Scanner Viewfinder Box */}
      <div className="relative aspect-[4/3] rounded-3xl bg-slate-950 border-2 border-border overflow-hidden flex flex-col items-center justify-center shadow-inner group">
        {/* Container for Html5Qrcode Viewfinder */}
        <div id="qr-camera-viewfinder" className="absolute inset-0 w-full h-full object-cover" />

        {/* Hidden Fallback Video Element for Native Stream */}
        <video
          ref={videoRef}
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-0"
        />

        {/* Hidden Temp Container for File Image Scanning */}
        <div id="qr-file-temp-element" className="hidden" />

        {/* Viewfinder Target Reticle Animation */}
        {isCameraActive && !isInitializing && (
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

        {/* Status Overlay Badges */}
        {isInitializing && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs flex flex-col items-center justify-center space-y-3 z-20">
            <RefreshCw className="h-8 w-8 text-primary animate-spin" />
            <p className="text-xs font-semibold text-slate-300">Initializing High-Speed Camera...</p>
          </div>
        )}

        {cameraError && (
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

      {/* Control Actions & Toolbar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          {cameras.length > 1 && (
            <button
              type="button"
              onClick={toggleFacingMode}
              className="p-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground border border-border flex items-center gap-2 text-xs font-semibold cursor-pointer transition-colors"
              title="Switch Front/Back Camera"
            >
              <SwitchCamera className="h-4 w-4 text-primary" />
              <span className="hidden sm:inline">Flip Camera</span>
            </button>
          )}

          {isTorchSupported && (
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
              {isTorchOn ? <Zap className="h-4 w-4 text-amber-500 fill-amber-500" /> : <ZapOff className="h-4 w-4" />}
              <span className="hidden sm:inline">Flash</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsAudioEnabled((prev) => !prev)}
            className="p-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground border border-border flex items-center gap-2 text-xs font-semibold cursor-pointer transition-colors"
            title="Toggle Scan Beep Sound"
          >
            {isAudioEnabled ? <Volume2 className="h-4 w-4 text-primary" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}
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
