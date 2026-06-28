import { Outlet } from "react-router-dom"
import Header from "../../shared/components/layouts/Header"
import Footer from "../../shared/components/layouts/Footer"

import { ROLE } from "../../shared/constants/role.const"

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header role={ROLE.CUSTOMER} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default MainLayout