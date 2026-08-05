import React, { useEffect, useState } from "react"
import { useSearchParams, useNavigate, Link } from "react-router-dom"
import { managerApi, type ManagerInvitationItem } from "@/shared/apis/manager.api"
import FormInput from "@/shared/components/form/FormInput"
import { toast } from "sonner"
import {
  ShieldCheck,
  Building2,
  Mail,
  AlertTriangle,
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

    if (password && password.length < 6) {
      toast.error("Password must be at least 6 characters long")
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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-950 text-slate-100">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
          <p className="text-slate-400 text-sm">Verifying manager invitation...</p>
        </div>
      </div>
    )
  }

  if (errorMsg || !invitation) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-950 text-slate-100">
        <div className="max-w-md w-full p-8 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl text-center shadow-2xl">
          <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-100 mb-2">Invitation Invalid or Expired</h2>
          <p className="text-slate-400 text-sm mb-6">{errorMsg || "This invitation link is no longer valid."}</p>
          <Link to={APP_ROUTES.AUTH.LOGIN}>
            <button className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-2.5 rounded-xl font-medium cursor-pointer transition-all">
              Return to Login
            </button>
          </Link>
        </div>
      </div>
    )
  }

  if (isAccepted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-950 text-slate-100">
        <div className="max-w-md w-full p-8 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl text-center shadow-2xl">
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-slate-100 mb-2">Welcome Aboard! 🎉</h2>
          <p className="text-slate-300 text-sm mb-6">
            You are now registered as manager for <strong>{invitation.stationName || "your station"}</strong>.
          </p>
          <button
            onClick={() => navigate(APP_ROUTES.AUTH.LOGIN)}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium py-2.5 rounded-xl shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <span>Proceed to Login</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Background glow decorations */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full p-8 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-2xl relative z-10">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Station Manager Invitation</h1>
          <p className="text-slate-400 text-xs mt-1">Accept your invitation to manage station operations</p>
        </div>

        {/* Station details card */}
        <div className="mb-6 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col gap-2">
          <div className="flex items-center gap-2.5 text-slate-200 font-semibold text-sm">
            <Building2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="truncate">{invitation.stationName || "Station Invitation"}</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-400 text-xs">
            <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate">{invitation.email}</span>
          </div>
          {invitation.permissions && invitation.permissions.length > 0 && (
            <div className="mt-2 pt-2 border-t border-slate-900 flex flex-wrap gap-1">
              {invitation.permissions.map((perm) => (
                <span
                  key={perm}
                  className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                >
                  {perm.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            id="manager-name"
            label="Full Name"
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
          />

          <FormInput
            id="manager-phone"
            label="Phone Number (Optional)"
            type="tel"
            placeholder="Enter contact number"
            value={phone}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
          />

          <FormInput
            id="manager-password"
            label="Account Password"
            type="password"
            placeholder="Create account password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            required
          />

          <FormInput
            id="manager-confirm-password"
            label="Confirm Password"
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium py-2.5 rounded-xl shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Accepting...</span>
              </>
            ) : (
              <>
                <span>Accept & Join Station</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
