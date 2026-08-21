import { useCallback, useEffect, useRef, useState } from "react"
import {
  SwitchCamera,
  Zap,
  ZapOff,
  RefreshCw,
  AlertTriangle,
  Camera,
  RotateCcw,
  Check,
  X,
} from "lucide-react"
import { toast } from "sonner"

interface PhotoCaptureCameraProps {
  title: string
  subtitle?: string
  onCapture: (dataUrl: string) => void
  onClose: () => void
}

interface CameraDevice {
  id: string
  label: string
}

const MAX_DIMENSION = 1280
const JPEG_QUALITY = 0.7

export const PhotoCaptureCamera: React.FC<PhotoCaptureCameraProps> = ({
  title,
  subtitle,
  onCapture,
  onClose,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)

  const [cameras, setCameras] = useState<CameraDevice[]>([])
  const [selectedCameraId, setSelectedCameraId] = useState<string>("")
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false)
  const [isInitializing, setIsInitializing] = useState<boolean>(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment")
  const [isTorchSupported, setIsTorchSupported] = useState<boolean>(false)
  const [isTorchOn, setIsTorchOn] = useState<boolean>(false)
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null)

  const stopAllMediaTracks = useCallback(() => {
    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      } catch {
      }
      mediaStreamRef.current = null
    }

    if (videoRef.current && videoRef.current.srcObject) {
      try {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach((track) => track.stop())
        videoRef.current.srcObject = null
      } catch {
      }
    }

    setIsCameraActive(false)
    setIsTorchOn(false)
  }, [])

  const isMountedRef = useRef<boolean>(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      stopAllMediaTracks()
    }
  }, [stopAllMediaTracks])

  const startCamera = useCallback(async () => {
    if (!isMountedRef.current) return
    setCameraError(null)
    setIsInitializing(true)
    stopAllMediaTracks()

    try {
      const constraints: MediaStreamConstraints = {
        video: selectedCameraId
          ? { deviceId: { exact: selectedCameraId } }
          : { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const capabilities = track.getCapabilities() as any
        setIsTorchSupported(Boolean(capabilities?.torch))
      }

      setIsCameraActive(true)
    } catch (err: unknown) {
      console.error("Camera stream error:", err)
      setIsCameraActive(false)
      const errorObj = err as { name?: string; message?: string }
      let msg: string
      if (errorObj?.name === "NotAllowedError") {
        msg = "Camera access permission was denied. Please allow camera access in browser settings."
      } else if (errorObj?.name === "NotFoundError") {
        msg = "No camera hardware detected on this device."
      } else if (errorObj?.name === "NotReadableError") {
        msg = "Camera is currently being used by another application."
      } else {
        msg = errorObj?.message || "Failed to initialize camera."
      }
      setCameraError(msg)
    } finally {
      setIsInitializing(false)
    }
  }, [facingMode, selectedCameraId, stopAllMediaTracks])

  useEffect(() => {
    let isMounted = true

    if (navigator.mediaDevices?.enumerateDevices) {
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          if (!isMounted) return
          const videoDevices = devices
            .filter((d) => d.kind === "videoinput")
            .map((d, index) => ({ id: d.deviceId, label: d.label || `Camera ${index + 1}` }))
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
      stopAllMediaTracks()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const handlePageHide = () => stopAllMediaTracks()
    const handleVisibilityChange = () => {
      if (document.hidden) handlePageHide()
    }

    window.addEventListener("pagehide", handlePageHide)
    window.addEventListener("beforeunload", handlePageHide)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      window.removeEventListener("pagehide", handlePageHide)
      window.removeEventListener("beforeunload", handlePageHide)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      stopAllMediaTracks()
    }
  }, [stopAllMediaTracks])

  useEffect(() => {
    let ignore = false
    void Promise.resolve().then(async () => {
      if (ignore) return
      await startCamera()
    })
    return () => {
      ignore = true
      stopAllMediaTracks()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCameraId, facingMode])

  const toggleFacingMode = () => {
    const nextMode = facingMode === "environment" ? "user" : "environment"
    setFacingMode(nextMode)
    if (cameras.length > 1) {
      const match = cameras.find((c) => {
        const lbl = c.label.toLowerCase()
        if (nextMode === "environment") {
          return lbl.includes("back") || lbl.includes("environment") || lbl.includes("rear")
        } else {
          return lbl.includes("front") || lbl.includes("user") || lbl.includes("selfie") || lbl.includes("facetime")
        }
      })
      setSelectedCameraId(match ? match.id : (cameras.find((c) => c.id !== selectedCameraId)?.id || ""))
    } else {
      setSelectedCameraId("")
    }
  }

  const toggleTorch = async () => {
    if (!isTorchSupported || !mediaStreamRef.current) return
    try {
      const nextState = !isTorchOn
      const track = mediaStreamRef.current.getVideoTracks()[0] as
        | (MediaStreamTrack & {
            applyConstraints?: (constraints: MediaTrackConstraints) => Promise<void>
          })
        | undefined
      if (track?.applyConstraints) {
        await track.applyConstraints({
          advanced: [{ torch: nextState } as unknown as MediaTrackConstraintSet],
        })
        setIsTorchOn(nextState)
      }
    } catch (err) {
      console.error("Failed to toggle torch:", err)
      toast.error("Torch control is not supported by your camera hardware")
    }
  }

  const handleShutter = () => {
    const video = videoRef.current
    if (!video || !video.videoWidth || !video.videoHeight) return

    let width = video.videoWidth
    let height = video.videoHeight
    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      if (width > height) {
        height = Math.round((height * MAX_DIMENSION) / width)
        width = MAX_DIMENSION
      } else {
        width = Math.round((width * MAX_DIMENSION) / height)
        height = MAX_DIMENSION
      }
    }

    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      toast.error("Failed to capture photo")
      return
    }

    ctx.save()
    ctx.scale(-1, 1)
    ctx.drawImage(video, -width, 0, width, height)
    ctx.restore()

    setPreviewDataUrl(canvas.toDataURL("image/jpeg", JPEG_QUALITY))
  }

  const handleRetake = () => setPreviewDataUrl(null)

  const handleUsePhoto = () => {
    if (!previewDataUrl) return
    onCapture(previewDataUrl)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-card text-card-foreground border border-border rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-foreground">
              {title}
            </h3>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5">
          <div className="relative aspect-[4/3] rounded-2xl bg-black overflow-hidden flex flex-col items-center justify-center shadow-lg">
            {previewDataUrl ? (
              <img
                src={previewDataUrl}
                alt="Captured preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover -scale-x-100"
              />
            )}

            {isCameraActive && !cameraError && !previewDataUrl && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10 overflow-hidden">
                <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-3xl flex items-center justify-center shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-2xl drop-shadow-md" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-2xl drop-shadow-md" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-2xl drop-shadow-md" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-2xl drop-shadow-md" />
                </div>
              </div>
            )}

            {!previewDataUrl && (
              <div className="absolute top-3 right-3 flex items-center gap-2 z-20">
                {isTorchSupported && (
                  <button
                    type="button"
                    onClick={toggleTorch}
                    className="p-2.5 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-all border border-white/10 cursor-pointer"
                    title="Toggle flash"
                  >
                    {isTorchOn ? (
                      <Zap className="h-4 w-4 text-amber-300 fill-amber-300" />
                    ) : (
                      <ZapOff className="h-4 w-4 opacity-60" />
                    )}
                  </button>
                )}
                <button
                  type="button"
                  onClick={toggleFacingMode}
                  className="p-2.5 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-all border border-white/10 cursor-pointer"
                  title="Switch camera"
                >
                  <SwitchCamera className="h-4 w-4" />
                </button>
              </div>
            )}

            {(isInitializing) && !previewDataUrl && (
              <div className="absolute inset-0 z-30 bg-black/70 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-3 p-6 text-center">
                <RefreshCw className="h-8 w-8 text-primary animate-spin" />
                <p className="text-xs font-semibold text-white/90">Opening camera...</p>
              </div>
            )}

            {cameraError && (
              <div className="absolute inset-0 z-30 bg-black p-6 flex flex-col items-center justify-center text-center space-y-3">
                <div className="h-10 w-10 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <p className="text-xs text-slate-300 max-w-xs">{cameraError}</p>
                <button
                  type="button"
                  onClick={() => startCamera()}
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Retry Camera
                </button>
              </div>
            )}
          </div>

          <div className="pt-5 flex items-center justify-center gap-3">
            {previewDataUrl ? (
              <>
                <button
                  type="button"
                  onClick={handleRetake}
                  className="px-5 py-3 rounded-2xl bg-muted hover:bg-muted/80 text-foreground font-bold text-sm transition-colors border border-border cursor-pointer flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" /> Retake
                </button>
                <button
                  type="button"
                  onClick={handleUsePhoto}
                  className="px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-extrabold text-sm hover:opacity-90 transition-all shadow-md cursor-pointer flex items-center gap-2"
                >
                  <Check className="h-4 w-4" /> Use Photo
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleShutter}
                disabled={!isCameraActive || isInitializing}
                className="h-16 w-16 rounded-full bg-primary text-primary-foreground shadow-lg hover:opacity-90 disabled:opacity-40 transition-all cursor-pointer flex items-center justify-center border-4 border-primary/30"
                title="Take photo"
              >
                <Camera className="h-6 w-6" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PhotoCaptureCamera
