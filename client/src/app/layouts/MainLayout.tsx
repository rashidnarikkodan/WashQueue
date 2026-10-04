import { Suspense } from "react"
import { Outlet, useLocation } from "react-router-dom"
import Header from "../../shared/components/layouts/Header"
import Footer from "../../shared/components/layouts/Footer"
import Loading from "../../shared/components/ui/Loading"
import { AIFloatingTrigger } from "../../features/artificial-intelligence/components/AIFloatingTrigger"

import { ROLE } from "../../shared/constants/role.const"

const MainLayout = () => {
  const location = useLocation()
  const isAIAssistant = location.pathname.startsWith("/ai-assistant")

  return (
    <div
      className={`flex flex-col ${isAIAssistant ? "h-[100dvh] max-h-[100dvh] overflow-hidden" : "min-h-screen"} bg-background`}
    >
      <Header role={ROLE.CUSTOMER} />
      <main
        className={`flex-1 min-h-0 ${isAIAssistant ? "pt-20 overflow-hidden flex flex-col" : "pt-20"}`}
      >
        <Suspense fallback={<Loading text="Loading..." />}>
          <Outlet />
        </Suspense>
      </main>
      {!isAIAssistant && <Footer />}
      <AIFloatingTrigger />
    </div>
  )
}

export default MainLayout
