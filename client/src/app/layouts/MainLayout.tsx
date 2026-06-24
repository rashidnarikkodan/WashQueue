import { Outlet } from "react-router-dom"
import Header from "../../shared/components/layouts/Header"
const MainLayout = () => {
  return (
    <div>
      <Header />
      <Outlet />
    </div>
  )
}

export default MainLayout