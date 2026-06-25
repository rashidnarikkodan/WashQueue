import { Outlet } from "react-router-dom"
import PublicHeader from "../../shared/components/layouts/PublicHeader"

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <PublicHeader />
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout