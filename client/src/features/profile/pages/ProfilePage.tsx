import { useEffect } from "react"
import { useNavigate, Navigate } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { useProfileStore } from "../store/profile.store"
import { useAuthStore } from "@/features/auth/store/auth.store"
import ProfileHeader from "../components/ProfileHeader"
import ProfileActivityStats from "../components/ProfileActivityStats"
import PersonalDetailsCard from "../components/PersonalDetailsCard"
import BusinessDetailsCard from "../components/BusinessDetailsCard"
import AccountDetailsCard from "../components/AccountDetailsCard"
import ProfileFooterActions from "../components/ProfileFooterActions"
import EditProfileModal from "../components/EditProfileModal"
import ChangePasswordModal from "../components/ChangePasswordModal"

export default function ProfilePage() {
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuthStore()

  const {
    profile,
    stats,
    isLoading,
    isUpdating,
    isEditModalOpen,
    isChangePasswordModalOpen,
    setEditModalOpen,
    setChangePasswordModalOpen,
    loadProfile,
    updateProfile,
  } = useProfileStore()

  useEffect(() => {
    if (isAuthenticated) {
      loadProfile()
    }
  }, [isAuthenticated, loadProfile])

  const handleSignOut = () => {
    logout()
    navigate("/login")
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center gap-4 pt-24 pb-16">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-medium">Loading profile information...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans pt-10 pb-16 transition-colors duration-300">
      <div className="max-w-360 mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <ProfileHeader profile={profile} onEditClick={() => setEditModalOpen(true)} />

        <ProfileActivityStats stats={stats} />

        {profile.role === "owner" || profile.role === "admin" || profile.role === "manager" ? (
          <div className="space-y-8">
            <div className="w-full">
              <BusinessDetailsCard profile={profile} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
              <PersonalDetailsCard profile={profile} />
              <AccountDetailsCard profile={profile} />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            <PersonalDetailsCard profile={profile} />

            <AccountDetailsCard profile={profile} />
          </div>
        )}

        <ProfileFooterActions
          onChangePasswordClick={() => setChangePasswordModalOpen(true)}
          onSignOutClick={handleSignOut}
          isLocal={profile.authProvider === "local"}
        />
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
        profile={profile}
        onSubmit={updateProfile}
        isSubmitting={isUpdating}
      />

      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setChangePasswordModalOpen(false)}
      />
    </div>
  )
}
