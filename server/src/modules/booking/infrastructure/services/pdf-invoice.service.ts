import PDFDocument from "pdfkit"
import { Types } from "mongoose"
import { BookingResponseDTO } from "../../application/dtos/booking-response.dto"
import { VehicleCategoryModel } from "../../../vehicle-catelog/infrastructure/models/category.model"
import { VehicleClassModel } from "../../../vehicle-catelog/infrastructure/models/class.model"
import { IPDFInvoiceService } from "../../application/interfaces/pdf-invoice.interface"

export class PDFInvoiceService implements IPDFInvoiceService {
  async generateInvoicePdf(booking: BookingResponseDTO): Promise<Buffer> {
    // Dynamically resolve Vehicle Category & Class names by ID if present
    let categoryName = "Standard"
    let className = "Standard Vehicle"

    const categoryId =
      booking.vehicleSnapshot?.vehicleCategoryId || booking.walkInVehicle?.categoryId
    const classId = booking.vehicleSnapshot?.vehicleClassId || booking.walkInVehicle?.classId

    if (categoryId && Types.ObjectId.isValid(categoryId)) {
      try {
        const catDoc = await VehicleCategoryModel.findById(categoryId).lean()
        if (catDoc && catDoc.name) categoryName = catDoc.name
      } catch {
        // Ignore lookup errors gracefully
      }
    }

    if (classId && Types.ObjectId.isValid(classId)) {
      try {
        const clsDoc = await VehicleClassModel.findById(classId).lean()
        if (clsDoc && clsDoc.name) className = clsDoc.name
      } catch {
        // Ignore lookup errors gracefully
      }
    }

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 40, size: "A4" })
        const buffers: Buffer[] = []

        doc.on("data", (chunk) => buffers.push(chunk))
        doc.on("end", () => resolve(Buffer.concat(buffers)))
        doc.on("error", (err) => reject(err))

        // Color Palette
        const primaryColor = "#0f172a" // Slate 900
        const accentColor = "#0284c7" // Sky 600
        const textDark = "#1e293b" // Slate 800
        const textMuted = "#64748b" // Slate 500
        const bgLight = "#f8fafc" // Slate 50
        const borderColor = "#cbd5e1" // Slate 300

        // Header Background Banner
        doc.rect(0, 0, doc.page.width, 95).fill(primaryColor)

        // Header Title & Subtitle
        doc.fillColor("#ffffff").fontSize(22).font("Helvetica-Bold").text("WashQueue", 40, 28)
        doc.fontSize(9.5).font("Helvetica").text("Automated Wash Station Management System", 40, 56)

        doc
          .fillColor("#ffffff")
          .fontSize(18)
          .font("Helvetica-Bold")
          .text("TAX INVOICE", 380, 28, { align: "right" })
        doc
          .fontSize(9.5)
          .font("Helvetica")
          .text(`Invoice #: INV-${booking.bookingNumber}`, 380, 56, { align: "right" })

        let y = 110

        // Section 1 & Section 2 Grid (Customer & Vehicle Info)
        const boxWidth = 250
        const boxHeight = 125

        // Left Box: Customer Essential Details
        doc.rect(40, y, boxWidth, boxHeight).fillAndStroke(bgLight, borderColor)
        doc
          .fillColor(textMuted)
          .fontSize(8.5)
          .font("Helvetica-Bold")
          .text("CUSTOMER DETAILS", 52, y + 10)

        const customerName =
          booking.customerDetails?.name || booking.walkInCustomer?.name || "Customer"
        const customerPhone =
          booking.customerDetails?.phone || booking.walkInCustomer?.phone || "N/A"
        const customerEmail = booking.customerDetails?.email || "N/A"
        const customerType = booking.isWalkIn ? "Walk-In Customer" : "Registered Member"

        doc
          .fillColor(textDark)
          .fontSize(10.5)
          .font("Helvetica-Bold")
          .text(customerName, 52, y + 26)
        doc.fontSize(8.5).font("Helvetica").fillColor(textMuted)
        doc.text(`Phone: ${customerPhone}`, 52, y + 44)
        doc.text(`Email: ${customerEmail}`, 52, y + 58)
        doc.text(`Account Type: ${customerType}`, 52, y + 72)
        doc.text(`Booking #: ${booking.bookingNumber}`, 52, y + 86)

        // Right Box: Vehicle Specifications & Category/Class Info
        doc.rect(305, y, boxWidth, boxHeight).fillAndStroke(bgLight, borderColor)
        doc
          .fillColor(textMuted)
          .fontSize(8.5)
          .font("Helvetica-Bold")
          .text("VEHICLE & CLASSIFICATION", 317, y + 10)

        const vehicleBrandModel = booking.vehicleDetails
          ? `${booking.vehicleDetails.brand || ""} ${booking.vehicleDetails.model || ""}`.trim() ||
            "Vehicle"
          : "Vehicle"
        const nickname = booking.vehicleDetails?.nickname
          ? `"${booking.vehicleDetails.nickname}"`
          : ""
        const plateStr =
          booking.vehicleDetails?.registrationNumber ||
          booking.walkInVehicle?.registrationNumber ||
          "N/A"

        doc
          .fillColor(textDark)
          .fontSize(10.5)
          .font("Helvetica-Bold")
          .text(`${vehicleBrandModel} ${nickname}`.trim(), 317, y + 26)
        doc.fontSize(8.5).font("Helvetica").fillColor(textMuted)
        doc.text(`Registration / Plate #: ${plateStr}`, 317, y + 44)
        doc
          .fillColor(textDark)
          .font("Helvetica-Bold")
          .text(`Category: ${categoryName}`, 317, y + 62)
        doc.text(`Vehicle Class: ${className}`, 317, y + 78)

        y += boxHeight + 15

        // Section 3: Station & Time Window Info Bar
        doc.rect(40, y, 515, 65).fillAndStroke(bgLight, borderColor)
        doc
          .fillColor(textMuted)
          .fontSize(8.5)
          .font("Helvetica-Bold")
          .text("STATION & SCHEDULED TIME WINDOW", 52, y + 10)

        const stationName = booking.stationDetails?.name || "Wash Station"
        const stationCity = booking.stationDetails?.city || ""
        const stationPhone = booking.stationDetails?.phone || ""
        const windowStartStr = booking.scheduling?.windowStart
          ? new Date(booking.scheduling.windowStart).toLocaleString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "Scheduled Window"

        doc
          .fillColor(textDark)
          .fontSize(10)
          .font("Helvetica-Bold")
          .text(stationName, 52, y + 26)
        doc
          .fontSize(8.5)
          .font("Helvetica")
          .fillColor(textMuted)
          .text(`Location: ${stationCity} | Contact: ${stationPhone}`, 52, y + 42)

        doc
          .fillColor(textDark)
          .fontSize(9.5)
          .font("Helvetica-Bold")
          .text(`Window: ${windowStartStr}`, 317, y + 26)
        doc
          .fontSize(8.5)
          .font("Helvetica")
          .fillColor(textMuted)
          .text(`Payment Method: ${booking.paymentType}`, 317, y + 42)

        y += 80

        // Service Table Header
        doc.rect(40, y, 515, 24).fill(accentColor)
        doc.fillColor("#ffffff").fontSize(9).font("Helvetica-Bold")
        doc.text("SERVICE DESCRIPTION", 52, y + 7)
        doc.text("TYPE & CLASS", 330, y + 7)
        doc.text("AMOUNT", 470, y + 7)

        y += 24

        // Items Helper
        const formatCurrency = (amt: number) => `₹${amt.toFixed(2)}`

        // Base Service Item
        const serviceName =
          booking.serviceType === "FULL" ? "Full Wash Service" : "Express Half Wash Service"
        doc.rect(40, y, 515, 28).strokeColor(borderColor).stroke()
        doc
          .fillColor(textDark)
          .fontSize(9.5)
          .font("Helvetica-Bold")
          .text(serviceName, 52, y + 8)
        doc
          .fillColor(textMuted)
          .fontSize(8.5)
          .font("Helvetica")
          .text(`${booking.serviceType} (${className})`, 330, y + 8)
        doc
          .fillColor(textDark)
          .fontSize(9.5)
          .font("Helvetica-Bold")
          .text(formatCurrency(booking.pricingSnapshot.basePrice), 470, y + 8)

        y += 28

        // Extra Services Items
        if (booking.extraServices && booking.extraServices.length > 0) {
          for (const extra of booking.extraServices) {
            doc.rect(40, y, 515, 28).strokeColor(borderColor).stroke()
            doc
              .fillColor(textDark)
              .fontSize(9.5)
              .font("Helvetica")
              .text(`Extra Service: ${extra.name}`, 52, y + 8)
            doc
              .fillColor(textMuted)
              .fontSize(8.5)
              .text("ADD-ON SERVICE", 330, y + 8)
            doc
              .fillColor(textDark)
              .fontSize(9.5)
              .font("Helvetica-Bold")
              .text(formatCurrency(extra.price), 470, y + 8)
            y += 28
          }
        }

        y += 15

        // Totals Box
        const totalBoxWidth = 230
        const totalBoxX = 325

        doc
          .fillColor(textMuted)
          .fontSize(9.5)
          .font("Helvetica")
          .text("Subtotal Amount:", totalBoxX, y)
        doc
          .fillColor(textDark)
          .font("Helvetica-Bold")
          .text(formatCurrency(booking.pricingSnapshot.totalPrice), 470, y)
        y += 18

        if (booking.depositAmount > 0) {
          doc
            .fillColor(textMuted)
            .fontSize(9.5)
            .font("Helvetica")
            .text("Deposit Paid Online:", totalBoxX, y)
          doc
            .fillColor(textDark)
            .font("Helvetica-Bold")
            .text(formatCurrency(booking.depositAmount), 470, y)
          y += 18

          if (booking.cashAmount > 0) {
            doc
              .fillColor(textMuted)
              .fontSize(9.5)
              .font("Helvetica")
              .text("Balance Due at Station:", totalBoxX, y)
            doc
              .fillColor(textDark)
              .font("Helvetica-Bold")
              .text(formatCurrency(booking.cashAmount), 470, y)
            y += 18
          }
        }

        // Final Total Highlight Bar
        doc.rect(totalBoxX - 10, y + 4, totalBoxWidth + 15, 32).fill(primaryColor)
        doc
          .fillColor("#ffffff")
          .fontSize(10.5)
          .font("Helvetica-Bold")
          .text("TOTAL INVOICE AMOUNT:", totalBoxX, y + 14)
        doc.fontSize(12).text(formatCurrency(booking.pricingSnapshot.totalPrice), 470, y + 13)

        // Footer Section
        const footerY = doc.page.height - 65
        doc.moveTo(40, footerY).lineTo(555, footerY).strokeColor(borderColor).stroke()

        doc.fillColor(textMuted).fontSize(8).font("Helvetica")
        doc.text("Thank you for choosing WashQueue!", 40, footerY + 10, { align: "center" })
        doc.text(
          "This is an official computer-generated tax invoice and requires no physical signature.",
          40,
          footerY + 22,
          { align: "center" }
        )
        doc.text("For support & inquiries, contact support@washqueue.com", 40, footerY + 34, {
          align: "center",
        })

        doc.end()
      } catch (err) {
        reject(err)
      }
    })
  }
}
