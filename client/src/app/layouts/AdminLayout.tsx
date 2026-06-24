import { Outlet } from "react-router-dom"
import Sidebar from "../../shared/components/layouts/Sidebar"
import { adminSideBarItems } from "../../shared/config/adminSidebar.config"

const AdminLayout = () => {
  return (
    <div className="flex">
        <Sidebar items={adminSideBarItems}/>
        <Outlet />
    </div>
  )
}

export default AdminLayout