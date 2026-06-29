import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Search, Heart } from "lucide-react";
import ThemeToggle from "../ui/header/ThemeToggle";
import LocationSelector from "../ui/header/LocationSelector";
import SearchPill from "../ui/header/SearchPill";
import NotificationDropdown from "../ui/header/NotificationDropdown";
import ProfileDropdown from "../ui/header/ProfileDropdown";
import { useAuthStore } from "../../../features/auth/store/authStore";

export default function Header({ role }: { role?: string }) {
  const location = useLocation();
  const pathname = location.pathname;
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const currentRole = (role?.toLowerCase() as "admin" | "manager" | "provider" | "customer") || "customer";

  const isCustomer = currentRole === "customer";

  // Interactive States
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchExpanded(false);
  }, [pathname]);

  // Dynamic Navigation Configurations
  const navLinks = {
    admin: [],
    manager: [],
    provider: [],
    customer: [
      { name: "Home", path: "/" },
      { name: "Stations", path: "/stations" },
    ],
  };

  const activeLinks = navLinks[currentRole as keyof typeof navLinks] || [];

  // Role Badge Styling
  const roleBadges = {
    admin: {
      label: "Admin",
      className: "bg-primary/10 text-primary border border-primary/20"
    },
    manager: {
      label: "Manager",
      className: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
    },
    provider: {
      label: "Provider",
      className: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
    },
    customer: null,
  };

  const activeBadge = roleBadges[currentRole as keyof typeof roleBadges];

  return (
    <header className="fixed top-1 z-40 w-full rounded-[3rem] border-b border-x border-border bg-card/90 backdrop-blur-md transition-all duration-300 shadow-md">
      <div className="mx-auto w-full px-6 py-3.5 grid grid-cols-3 items-center">
        
        {/* Left Side: Brand Logo & Role Badge */}
        <div className="col-span-1 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-xl font-bold italic tracking-tight text-primary">
              WashQueue
            </span>
          </Link>

          {activeBadge && (
            <span className={`hidden lg:inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide transition-all duration-300 ${activeBadge.className}`}>
              {activeBadge.label}
            </span>
          )}
        </div>

        {/* Center Section: Navigation Links OR Toggleable Search Box */}
        <div className="col-span-1 flex justify-center max-w-lg mx-auto w-full">
          {isSearchExpanded ? (
            <SearchPill onClose={() => setIsSearchExpanded(false)} />
          ) : (
            activeLinks.length > 0 && (
              <nav className="hidden md:flex items-center gap-6">
                {activeLinks.map((link) => {
                  const isActive = pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`text-sm font-medium transition-colors hover:text-foreground relative py-1.5 ${
                        isActive ? "text-foreground font-semibold" : "text-muted-foreground"
                      }`}
                    >
                      {link.name}
                      {isActive && (
                        <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-primary" />
                      )}
                    </Link>
                  );
                })}
              </nav>
            )
          )}
        </div>

        {/* Right Side: Utilities, Profile & Hamburger Menu */}
        <div className="col-span-1 flex justify-end items-center gap-3">
          
          {/* Location Selector (Consumer-only) */}
          {!isSearchExpanded && isCustomer && (
            <LocationSelector className="hidden lg:flex" />
          )}

          {/* Search Trigger Button (Consumer-only) */}
          {!isSearchExpanded && isCustomer && (
            <button
              onClick={() => setIsSearchExpanded(true)}
              className="text-muted-foreground hover:text-foreground p-2 hover:bg-muted/50 rounded-full transition-all cursor-pointer"
              aria-label="Toggle Search"
            >
              <Search className="h-4.5 w-4.5" />
            </button>
          )}

          {/* Favorites Heart Icon (Consumer-only & Authenticated) */}
          {isAuthenticated && isCustomer && (
            <Link
              to="/favorites"
              className="text-muted-foreground hover:text-foreground p-2 hover:bg-muted/50 rounded-full transition-colors cursor-pointer"
              aria-label="View Favorites"
            >
              <Heart className="h-4.5 w-4.5" />
            </Link>
          )}

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications Dropdown */}
          {isAuthenticated && (
            <NotificationDropdown />
          )}

          {/* User Profile / Login trigger */}
          {isAuthenticated ? (
            <ProfileDropdown currentRole={currentRole} />

          ) : (
            <button
              onClick={() => navigate("/login")}
              className="flex items-center justify-center px-5 py-2.5 bg-gradient-to-r from-[#60A5FA] to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold rounded-full transition-all duration-200 cursor-pointer shadow-md text-xs"
            >
              Login
            </button>
          )}

          {/* Mobile Menu Toggle Button */}
          {activeLinks.length > 0 && !isSearchExpanded && (
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card hover:bg-muted/50 transition-colors md:hidden text-muted-foreground hover:text-foreground cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
            </button>
          )}

        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && activeLinks.length > 0 && (
        <div className="md:hidden border-t border-border bg-card/95 rounded-b-[3rem] backdrop-blur-md p-4 shadow-xl animate-in slide-in-from-top-4 duration-200">
          <div className="space-y-1.5 px-2">
            {activeLinks.map((link) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
