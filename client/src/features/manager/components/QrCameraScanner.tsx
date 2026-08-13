import React, { useEffect, useRef, useState, useCallback } from "react"
import {
  Camera,
  SwitchCamera,
  Zap,
  ZapOff,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Scan,
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

export const QrCameraScanner: React.FC<QrCameraScannerProps> = ({
  onScanSuccess,
  onScanError,
  isProcessing = false,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const html5ScannerRef = useRef<any>(null)
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
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
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
    } catch (e) {
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
      } catch (e) {
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
      } catch (e) {
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
      } catch (e) {
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
      let barcodeDetector: any = null
      if ("BarcodeDetector" in window) {
        try {
          barcodeDetector = new (window as any).BarcodeDetector({
            formats: ["qr_code"],
          })
        } catch (e) {
          console.warn("BarcodeDetector initialization error:", e)
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
        } catch (e) {
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
        })
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
        if (capabilities && (capabilities as any).torch !== undefined) {
          setIsTorchSupported(true)
        }
      } catch (e) {
        setIsTorchSupported(false)
      }

      setIsInitializing(false)
      return
    } catch (err: any) {
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
        const capabilities = track.getCapabilities() as any
        if (capabilities && capabilities.torch) {
          setIsTorchSupported(true)
        }
      }

      isScanningRef.current = true
      setIsCameraActive(true)

      if (videoRef.current) {
        startNativeFrameDetection(videoRef.current)
      }
    } catch (err: any) {
      console.error("Native camera stream error:", err)
      isScanningRef.current = false
      setIsCameraActive(false)
      let msg = "Failed to start camera."
      if (err?.name === "NotAllowedError" || String(err).includes("Permission")) {
        msg = "Camera access permission was denied. Please allow camera access in browser settings."
      } else if (err?.name === "NotFoundError" || String(err).includes("NotFound")) {
        msg = "No camera hardware detected on this device."
      } else if (err?.name === "NotReadableError") {
        msg = "Camera is currently being used by another application."
      } else {
        msg = err?.message || String(err) || "Failed to initialize camera scanner."
      }
      setCameraError(msg)
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
        .catch((e) => console.warn("enumerateDevices error:", e))
    }

    return () => {
      isMounted = false
      stopCamera()
    }
  }, [selectedCameraId, stopCamera])

  // Auto-start camera when selectedCameraId or facingMode changes
  useEffect(() => {
    startCamera()
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
          advanced: [{ torch: nextState }] as any,
        })
      } else if (mediaStreamRef.current) {
        const track = mediaStreamRef.current.getVideoTracks()[0]
        if (track && (track as any).applyConstraints) {
          await (track as any).applyConstraints({
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
    } catch (err: any) {
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
        <div
          id="qr-camera-viewfinder"
          className="w-full h-full object-cover [&_video]:w-full [&_video]:h-full [&_video]:object-cover"
        />

        {/* Native HTML5 Video Element Fallback */}
        <video
          ref={videoRef}
          playsInline
          muted
          className="w-full h-full object-cover absolute inset-0 hidden border-0"
        />

        {/* Temporary element for file scanner */}
        <div id="qr-file-temp-element" className="hidden" />

        {/* Reticle Overlay Graphic when active */}
        {isCameraActive && !cameraError && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8 z-10">
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-2xl border-2 border-dashed border-primary/50 flex items-center justify-center">
              {/* Corner Reticle Accents */}
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg" />
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg" />
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg" />

              {/* Scanning Laser Beam Effect */}
              <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse shadow-[0_0_12px_#3b82f6]" />
            </div>
          </div>
        )}

        {/* Floating Top Controls Overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20 gap-2">
          {/* Active Status Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-[11px] font-bold">
            <span className={`h-2 w-2 rounded-full ${isCameraActive ? "bg-emerald-400 animate-ping" : "bg-amber-400"}`} />
            <span>{isCameraActive ? "LIVE CAMERA" : isInitializing ? "STARTING..." : "STOPPED"}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Toggle */}
            <button
              type="button"
              onClick={() => setIsAudioEnabled(!isAudioEnabled)}
              className="p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white hover:bg-black/80 transition-colors"
              title={isAudioEnabled ? "Mute scan sound" : "Enable scan sound"}
            >
              {isAudioEnabled ? <Volume2 className="h-4 w-4 text-emerald-400" /> : <VolumeX className="h-4 w-4 text-slate-400" />}
            </button>

            {/* Torch / Flash Button */}
            {isTorchSupported && (
              <button
                type="button"
                onClick={toggleTorch}
                className="p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white hover:bg-black/80 transition-colors"
                title="Toggle Torch/Flash"
              >
                {isTorchOn ? <Zap className="h-4 w-4 text-amber-300 fill-amber-300" /> : <ZapOff className="h-4 w-4 text-slate-400" />}
              </button>
            )}

            {/* Switch Front/Back Camera */}
            {cameras.length > 1 && (
              <button
                type="button"
                onClick={toggleFacingMode}
                className="p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white hover:bg-black/80 transition-colors"
                title="Switch Camera"
              >
                <SwitchCamera className="h-4 w-4 text-primary" />
              </button>
            )}
          </div>
        </div>

        {/* Processing / Scan Overlay */}
        {(isProcessing || isInitializing) && (
          <div className="absolute inset-0 z-30 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center text-white space-y-3 p-6 text-center">
            <RefreshCw className="h-10 w-10 text-primary animate-spin" />
            <p className="text-sm font-bold">
              {isProcessing ? "Verifying Check-In..." : "Initializing Camera Stream..."}
            </p>
          </div>
        )}

        {/* Error Fallback View */}
        {cameraError && (
          <div className="absolute inset-0 z-30 bg-slate-950 p-6 flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="space-y-1 max-w-xs">
              <p className="text-sm font-bold text-white">Camera Unavailable</p>
              <p className="text-xs text-slate-400 leading-relaxed">{cameraError}</p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => startCamera()}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-all flex items-center gap-2"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Retry Camera
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-700 transition-all flex items-center gap-2 border border-slate-700"
              >
                <Upload className="h-3.5 w-3.5" /> Upload Image
              </button>
            </div>
          </div>
        )}

        {/* Last Scanned Instant Notification Toast Overlay */}
        {lastScannedResult && (
          <div className="absolute bottom-4 left-4 right-4 z-20 bg-emerald-500 text-slate-950 px-4 py-2.5 rounded-2xl shadow-xl font-mono text-xs font-bold flex items-center justify-between animate-in slide-in-from-bottom-4">
            <div className="flex items-center gap-2 truncate">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span className="truncate">Scanned: {lastScannedResult}</span>
            </div>
            <Sparkles className="h-4 w-4 shrink-0 animate-spin-slow" />
          </div>
        )}
      </div>

      {/* Control Toolbar Below Viewfinder */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/40 p-3 rounded-2xl border border-border/60 text-xs">
        {/* Camera Selector Dropdown if multiple devices */}
        {cameras.length > 0 ? (
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Camera className="h-4 w-4 text-muted-foreground shrink-0" />
            <select
              value={selectedCameraId}
              onChange={(e) => setSelectedCameraId(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs font-medium text-foreground focus:outline-none focus:border-primary"
            >
              {cameras.map((cam) => (
                <option key={cam.id} value={cam.id}>
                  {cam.label}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Scan className="h-4 w-4 text-primary" />
            <span>Scanning active • Auto reticle targeting</span>
          </div>
        )}

        {/* File Scan Action */}
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
            className="px-3 py-1.5 rounded-xl bg-muted hover:bg-muted/80 border border-border text-foreground font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Scan QR Code from saved image file"
          >
            <Upload className="h-3.5 w-3.5 text-primary" />
            <span>Upload QR Image</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default QrCameraScanner
