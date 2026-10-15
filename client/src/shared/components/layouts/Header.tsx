import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Menu, X, Heart } from "lucide-react"
import { NotificationDropdown } from "@/features/notification"
import ProfileDropdown from "../header/ProfileDropdown"
import { useAuthStore } from "../../../features/auth/store/auth.store"
import { APP_ROUTES } from "../../constants/appRoutes.const"
import ThemeToggle from "../header/ThemeToggle"

export default function Header({ role }: { role?: string }) {
  const location = useLocation()
  const pathname = location.pathname
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  const currentRole =
    (role?.toLowerCase() as "admin" | "manager" | "owner" | "customer") || "customer"

  const isCustomer = currentRole === "customer"

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMobileMenuOpen(false)
  }, [pathname])

  const navLinks = {
    admin: [],
    manager: [],
    owner: [],
    customer: [
      { name: "Home", path: APP_ROUTES.HOME },
      { name: "Stations", path: "/stations" },
    ],
  }

  const activeLinks = navLinks[currentRole as keyof typeof navLinks] || []

  const roleBadges = {
    admin: {
      label: "Admin",
      className: "bg-primary/10 text-primary border border-primary/20",
    },
    manager: {
      label: "Manager",
      className: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
    },
    owner: {
      label: "Owner",
      className: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    },
    customer: null,
  }

  const activeBadge = roleBadges[currentRole as keyof typeof roleBadges]

  return (
    <header className="fixed top-0 sm:top-1 z-[100] w-full sm:w-[calc(100%-1rem)] sm:left-1/2 sm:-translate-x-1/2 rounded-none sm:rounded-[3rem] border-b sm:border border-border bg-card/95 sm:bg-card/90 backdrop-blur-md transition-all duration-300 shadow-xs sm:shadow-md">
      <div className="mx-auto w-full px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link to="/" className="flex items-center gap-1.5 sm:gap-2 group">
            <span className="text-lg sm:text-xl font-bold italic tracking-tight text-primary">
              WashQueue
            </span>
          </Link>

          {activeBadge && (
            <span
              className={`hidden lg:inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide transition-all duration-300 ${activeBadge.className}`}
            >
              {activeBadge.label}
            </span>
          )}
        </div>

        <div className="hidden md:flex justify-center max-w-lg mx-auto flex-1">
          <nav className="flex items-center gap-6">
            {activeLinks.map((link) => {
              const isActive = pathname === link.path
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium transition-colors hover:text-foreground relative py-1.5 flex items-center gap-1.5 ${
                    isActive ? "text-foreground font-semibold" : "text-muted-foreground"
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-primary" />
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex justify-end items-center gap-1.5 sm:gap-3 shrink-0">
          {!isAuthenticated && <ThemeToggle />}
          {isAuthenticated && isCustomer && (
            <Link
              to={APP_ROUTES.BOOKMARKS}
              className="text-muted-foreground hover:text-foreground p-1.5 sm:p-2 hover:bg-muted/50 rounded-full transition-colors cursor-pointer"
              aria-label="View Bookmarks"
            >
              <Heart className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
            </Link>
          )}

          {isAuthenticated && <NotificationDropdown />}

          {isAuthenticated ? (
            <ProfileDropdown currentRole={currentRole} />
          ) : (
            <button
              onClick={() => navigate(APP_ROUTES.AUTH.LOGIN)}
              className="flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-[#60A5FA] to-blue-600 hover:from-sky-400 hover:to-blue-500 text-foreground font-bold rounded-full transition-all duration-200 cursor-pointer shadow-md text-xs"
            >
              Login
            </button>
          )}

          {activeLinks.length > 0 && (
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-border bg-card hover:bg-muted/50 transition-colors md:hidden text-muted-foreground hover:text-foreground cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>

      {isMobileMenuOpen && activeLinks.length > 0 && (
        <div className="md:hidden border-t border-border bg-card/95 rounded-b-xl sm:rounded-b-[3rem] backdrop-blur-md p-3 sm:p-4 shadow-xl animate-in slide-in-from-top-4 duration-200">
          <div className="space-y-1 px-1">
            {activeLinks.map((link) => {
              const isActive = pathname === link.path
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  <span>{link.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </header>
  )
}
