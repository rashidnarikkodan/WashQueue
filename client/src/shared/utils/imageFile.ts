const MAX_DIMENSION = 1280
const JPEG_QUALITY = 0.7

export function readImageFileAsResizedDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const img = new Image()

    img.onload = () => {
      let width = img.naturalWidth
      let height = img.naturalHeight

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
      URL.revokeObjectURL(objectUrl)

      if (!ctx) {
        reject(new Error("Failed to process the selected image"))
        return
      }

      ctx.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY))
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error("Failed to load the selected image"))
    }

    img.src = objectUrl
  })
}
