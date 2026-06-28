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
        left-0
        top-[96px]
        z-50
        flex
        h-auto
        w-[76px]
        flex-col
        rounded-r-[2rem]
        border
        border-border/80
        bg-card/90
        backdrop-blur-md
        p-3
        transition-all
        duration-300
        hover:w-[280px]
        shadow-xl
      "
    >
      <nav className="flex flex-col gap-1.5 overflow-y-auto max-h-full scrollbar-none">
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
                justify-center
                group-hover:justify-start
                overflow-hidden
                rounded-2xl
                p-3
                group-hover:px-4
                transition-all
                duration-200
                border

                ${isActive
                  ? "bg-primary/10 text-primary border-primary/20"
                  : "text-muted-foreground border-transparent hover:bg-muted/40 hover:text-foreground"
                }
              `
              }
            >
              <div className="w-7 h-7 min-w-7 flex items-center justify-center">
                <Icon size={20} />
              </div>

              <span
                className="
                  whitespace-nowrap
                  text-sm
                  font-semibold
                  max-w-0
                  opacity-0
                  overflow-hidden
                  transition-all
                  duration-200
                  group-hover:max-w-xs
                  group-hover:opacity-100
                  group-hover:ml-4
                "
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
