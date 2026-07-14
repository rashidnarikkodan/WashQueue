import multer from "multer"
import path from "path"
import fs from "fs"

// Ensure uploads directory exists
const uploadsDir = path.resolve("uploads/onboarding")
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    const ext = path.extname(file.originalname)
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`)
  },
})

const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "application/pdf"]
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error("Only JPEG, PNG and PDF files are allowed"))
  }
}

export const onboardingUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
}).fields([
  { name: "idProofFile", maxCount: 1 },
  { name: "businessLicenseFile", maxCount: 1 },
  { name: "gstCertificateFile", maxCount: 1 },
  { name: "bankProofFile", maxCount: 1 },
])
