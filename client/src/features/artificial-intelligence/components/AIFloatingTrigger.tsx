import React, { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useAuthStore } from "@/features/auth/store/auth.store"
import { APP_ROUTES } from "@/shared/constants/appRoutes.const"
import AuthRequiredModal from "@/shared/components/ui/AuthRequiredModal"
import { AIRainEffect } from "./AIRainEffect"

export const AIFloatingTrigger: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  if (location.pathname.startsWith(APP_ROUTES.AI_ASSISTANT)) {
    return null
  }

  const handleClick = () => {
    setIsHovered(false)
    if (!isAuthenticated) {
      setIsAuthModalOpen(true)
      return
    }
    navigate(APP_ROUTES.AI_ASSISTANT)
  }

  return (
    <>
      <AIRainEffect active={isHovered} />

      <div
        className="fixed bottom-6 right-6 z-40 select-none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <button
          type="button"
          onClick={handleClick}
          aria-label="Open Qyn AI Assistant"
          title="Open Qyn AI Assistant"
          className="p-0 border-0 bg-transparent shadow-none outline-none focus:outline-none cursor-pointer transition-transform duration-300 hover:scale-110 active:scale-95 flex items-center justify-center"
        >
          <img
            src="/QynAi.png"
            alt="Qyn AI"
            className="w-14 h-14 sm:w-16 sm:h-16 object-contain drop-shadow-2xl"
            draggable={false}
          />
        </button>
      </div>

      <AuthRequiredModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        title="Sign in for Qyn"
        message="You need to be signed in to your WashQueue account to chat with Qyn."
        actionName="access Qyn"
      />
    </>
  )
}

export default AIFloatingTrigger
