import React, { useEffect, useState } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { managerApi, type ManagerInvitationItem } from "@/shared/apis/manager.api"
import FormInput from "@/shared/components/form/FormInput"
import PasswordStrength from "@/shared/components/ui/PasswordStrength"
import SplitAuthLayout from "../components/layouts/SplitAuthLayout"
import { toast } from "sonner"
import {
  ShieldCheck,
  Building2,
  Mail,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Loader2,
} from "lucide-react"
import { APP_ROUTES } from "@/shared/constants/appRoutes.const"

export default function AcceptInvitationPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token") || ""
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [invitation, setInvitation] = useState<ManagerInvitationItem | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Form State
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [isAccepted, setIsAccepted] = useState(false)

  useEffect(() => {
    if (!token) {
      setErrorMsg("Invalid invitation link. No token provided.")
      setLoading(false)
      return
    }

    const verify = async () => {
      try {
        setLoading(true)
        const inv = await managerApi.verifyInvitationToken(token)
        setInvitation(inv)
        if (inv.name) setName(inv.name)
      } catch (err: any) {
        setErrorMsg(
          err.response?.data?.message || "Invalid or expired manager invitation link."
        )
      } finally {
        setLoading(false)
      }
    }

    verify()
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password && password.length < 8) {
      toast.error("Password must be at least 8 characters long")
      return
    }

    if (password && password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    try {
      setSubmitting(true)
      await managerApi.acceptInvitation({
        token,
        password: password || undefined,
        name: name.trim() || undefined,
        phone: phone.trim() || undefined,
      })

      setIsAccepted(true)
      toast.success("Invitation accepted successfully!")
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to accept invitation.")
    } finally {
      setSubmitting(false)
    }
  }

  // Common Split Layout wrapper
  const renderLayout = (children: React.ReactNode) => (
    <SplitAuthLayout
      side="left"
      title="Manager Invitation"
      description="Join WashQueue to oversee vehicle wash station queues, operations, and bookings."
      promptText="Already registered or have an account?"
      buttonText="Login"
      onRedirectClick={() => navigate(APP_ROUTES.AUTH.LOGIN)}
    >
      {children}
    </SplitAuthLayout>
  )

  // 1. Loading State
  if (loading) {
    return renderLayout(
      <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground text-sm font-medium">
          Verifying manager invitation token...
        </p>
      </div>
    )
  }

  // 2. Error / Invalid Invitation State
  if (errorMsg || !invitation) {
    return renderLayout(
      <div className="space-y-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="w-16 h-16 rounded-full bg-destructive/10 border border-destructive/20 text-destructive flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
            Invitation Invalid or Expired
          </h2>
          <p className="text-sm text-muted-foreground">
            {errorMsg || "This invitation link is no longer valid or has already been used."}
          </p>
        </div>
        <button
          onClick={() => navigate(APP_ROUTES.AUTH.LOGIN)}
          className="w-full py-3.5 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl transition-all shadow-md text-sm cursor-pointer"
        >
          Return to Login
        </button>
      </div>
    )
  }

  // 3. Accepted / Success State
  if (isAccepted) {
    return renderLayout(
      <div className="space-y-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
            Welcome Aboard! 🎉
          </h2>
          <p className="text-sm text-muted-foreground">
            You are now registered as manager for{" "}
            <strong className="text-foreground">{invitation.stationName || "your station"}</strong>.
          </p>
        </div>
        <button
          onClick={() => navigate(APP_ROUTES.AUTH.LOGIN)}
          className="w-full py-3.5 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl transition-all shadow-md text-sm cursor-pointer flex items-center justify-center gap-2"
        >
          <span>Proceed to Login</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    )
  }

  // 4. Main Invitation Acceptance Form
  return renderLayout(
    <div className="space-y-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Form Header */}
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/50 bg-clip-text text-transparent">
          Accept Manager Role
        </h1>
        <p className="text-sm text-muted-foreground font-medium">
          Set up your manager account credentials to access your assigned station.
        </p>
      </div>

      {/* Station Details Invitation Card */}
      <div className="p-4.5 rounded-2xl bg-card border border-border/80 shadow-sm space-y-3">
        <div className="flex items-center gap-2.5 text-foreground font-bold text-sm">
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Building2 className="w-4.5 h-4.5" />
          </div>
          <span className="truncate">{invitation.stationName || "Station Manager Invitation"}</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Mail className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
          <span className="truncate">{invitation.email}</span>
        </div>

        {invitation.permissions && invitation.permissions.length > 0 && (
          <div className="pt-2 border-t border-border/60 flex flex-wrap gap-1.5">
            {invitation.permissions.map((perm) => (
              <span
                key={perm}
                className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20"
              >
                {perm.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Acceptance Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          id="manager-name-input"
          label="Full Name"
          type="text"
          name="name"
          placeholder="Enter your full name"
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
          required
        />

        <FormInput
          id="manager-phone-input"
          label="Phone Number (Optional)"
          type="tel"
          name="phone"
          placeholder="Enter contact phone number"
          value={phone}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
        />

        <FormInput
          id="manager-password-input"
          label="Account Password"
          type="password"
          name="password"
          placeholder="••••••••"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          autoComplete="new-password"
          required
        />

        <PasswordStrength password={password} />

        <FormInput
          id="manager-confirm-password-input"
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          required
        />

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl transition-all shadow-md text-sm cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4.5 h-4.5 animate-spin" />
              <span>Accepting Invitation...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4.5 h-4.5" />
              <span>Accept & Join Station</span>
            </>
          )}
        </button>
      </form>
    </div>
  )
}
