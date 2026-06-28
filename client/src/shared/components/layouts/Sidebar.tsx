// Sidebar.tsx

import { NavLink } from "react-router-dom";
import type { SidebarItem } from "../../config/sidebar.config";


type Props = {
  items: SidebarItem[];
};

const Sidebar = ({ items }: Props) => {
  return (
    <aside
      className="
        group
        fixed
        left-4
        top-4
        z-50
        flex
        h-[95vh]
        w-[88px]
        flex-col
        rounded-[40px]
        bg-[#06133A]
        p-4
        transition-all
        duration-300
        hover:w-[340px]
      "
    >
      <nav className="flex flex-col gap-3">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `
                flex
                items-center
                gap-4
                overflow-hidden
                rounded-full
                px-5
                py-4
                transition-all
                duration-300

                ${isActive
                  ? "bg-[#AFC3FF] text-[#0B2B68]"
                  : "text-[#C7CEE2] hover:bg-[#13224D]"
                }
              `
              }
            >
              <div className="min-w-7">
                <Icon
                  size={28} />
              </div>

              <span
                className={`
                  whitespace-nowrap
                  text-[18px]
                  font-medium
                  opacity-0
                  transition-all
                  duration-300
                  group-hover:opacity-100
                  }
                `}
              >
                {item.name}
              </span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
