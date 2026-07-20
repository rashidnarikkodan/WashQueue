import multer from "multer"

const storage = multer.memoryStorage()

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

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
})

export const onboardingUpload = upload.fields([
  { name: "idProofFile", maxCount: 1 },
  { name: "businessLicenseFile", maxCount: 1 },
  { name: "gstCertificateFile", maxCount: 1 },
  { name: "bankProofFile", maxCount: 1 },
])

export const stationUpload = upload.array("images", 10)
