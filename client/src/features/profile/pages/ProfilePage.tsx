import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
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
  const { logout } = useAuthStore()

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
    loadProfile()
  }, [loadProfile])

  const handleSignOut = () => {
    logout()
    navigate("/login")
  }

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen bg-[#020617] text-[#F8FAFC] flex flex-col justify-center items-center gap-4 pt-24 pb-16">
        <Loader2 className="w-10 h-10 animate-spin text-[#ADC6FF]" />
        <p className="text-sm text-[#94A3B8] font-medium">Loading profile information...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#020617] text-[#F8FAFC] font-sans pt-24 pb-16 transition-colors duration-300">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Section */}
        <ProfileHeader
          profile={profile}
          onEditClick={() => setEditModalOpen(true)}
        />

        {/* Activity Stats Quick Glance */}
        <ProfileActivityStats stats={stats} />

        {/* Main Split Panels */}
        {profile.role === "owner" || profile.role === "admin" || profile.role === "manager" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Panel: Personal Details */}
            <div className="lg:col-span-5 h-full">
              <PersonalDetailsCard profile={profile} />
            </div>

            {/* Right Panel: Business & Account Information */}
            <div className="lg:col-span-7 space-y-8">
              <BusinessDetailsCard profile={profile} />
              <AccountDetailsCard profile={profile} />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Panel: Personal Details */}
            <div className="lg:col-span-6 h-full">
              <PersonalDetailsCard profile={profile} />
            </div>

            {/* Right Panel: Account Information */}
            <div className="lg:col-span-6 h-full">
              <AccountDetailsCard profile={profile} />
            </div>
          </div>
        )}

        {/* Footer Action Section */}
        <ProfileFooterActions
          onUpdateSettingsClick={() => setEditModalOpen(true)}
          onChangePasswordClick={() => setChangePasswordModalOpen(true)}
          onSignOutClick={handleSignOut}
          isLocal={profile.authProvider === 'local'}
        />
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
        profile={profile}
        onSubmit={updateProfile}
        isSubmitting={isUpdating}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setChangePasswordModalOpen(false)}
      />
    </div>
  )
}
