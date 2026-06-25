import { Outlet } from "react-router-dom"
import Header from "../../shared/components/layouts/Header"

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout