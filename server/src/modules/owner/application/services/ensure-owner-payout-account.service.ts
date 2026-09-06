import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { IPayoutProvider } from "@/core/application/interfaces/payout-provider.interface"
import { Owner } from "../../domain/entities/Owner"

export async function ensureOwnerPayoutAccount(
  owner: Owner,
  payoutProvider: IPayoutProvider,
  fallbackName?: string,
  fallbackEmail?: string,
  fallbackPhone?: string
): Promise<void> {
  if (owner.razorpayFundAccountId) {
    return
  }

  const legalName = owner.legalFullName?.trim() || fallbackName?.trim()
  const email = (owner.businessEmail || fallbackEmail)?.trim()
  const phone = (owner.phone || fallbackPhone)?.trim()
  const accountNumber = owner.accountNumber?.trim()
  const ifscCode = owner.ifscCode?.trim()
  const accountHolderName = owner.accountHolderName?.trim() || legalName

  if (!legalName) {
    throw new AppError(
      "Owner full name is required to create payout account",
      HTTP_STATUS.BAD_REQUEST
    )
  }
  if (!email) {
    throw new AppError("Owner email is required to create payout account", HTTP_STATUS.BAD_REQUEST)
  }
  if (!phone) {
    throw new AppError("Owner phone is required to create payout account", HTTP_STATUS.BAD_REQUEST)
  }
  if (!accountNumber || !ifscCode) {
    throw new AppError(
      "Owner bank account details are required to create payout account",
      HTTP_STATUS.BAD_REQUEST
    )
  }

  const destination = await payoutProvider.ensurePayoutDestination({
    id: owner.id || String(owner.userId),
    legalFullName: legalName,
    businessName: owner.businessName,
    accountHolderName,
    businessEmail: email,
    phone,
    accountNumber,
    ifscCode,
    razorpayContactId: owner.razorpayContactId,
    razorpayFundAccountId: owner.razorpayFundAccountId,
  })

  owner.setRazorpayContactId(destination.contactId)
  owner.setRazorpayFundAccountId(destination.fundAccountId)
}
