import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  Search,
  Heart
} from "lucide-react";
import ThemeToggle from "../ui/ThemeToggle";
import LocationSelector from "../ui/LocationSelector";
import SearchPill from "../ui/SearchPill";
import NotificationDropdown from "../ui/NotificationDropdown";
import ProfileDropdown from "../ui/ProfileDropdown";
import { useAuthStore } from "../../../features/auth/store/authStore";

const Header = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const { user, isAuthenticated } = useAuthStore();

  // Detect current role/context from AuthContext or URL path
  let currentRole: "admin" | "manager" | "provider" | "customer" | "guest" = "guest";
  
  if (isAuthenticated && user) {
    currentRole = user.role;
  } else {
    currentRole = "guest";
  }

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
    manager: [
      { name: "Dashboard", path: "/manager/dashboard" },
      { name: "Queue Board", path: "/manager/queue" },
      { name: "Walk-ins", path: "/manager/walk-ins" },
    ],
    provider: [
      { name: "Dashboard", path: "/provider/dashboard" },
      { name: "Stations", path: "/provider/stations" },
      { name: "Bookings", path: "/provider/bookings" },
    ],
    customer: [
      { name: "Home", path: "/" },
      { name: "About", path: "/about" },
    ],
    guest: [
      { name: "Home", path: "/" },
    ]
  };

  const activeLinks = navLinks[currentRole];

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
    customer: {
      label: "Customer",
      className: "bg-primary/10 text-primary border border-primary/20"
    },
    guest: null
  };

  const activeBadge = roleBadges[currentRole];

  return (
    <header className="fixed top-1 z-40 w-full rounded-[3rem] border-b border-x border-border bg-card/90 backdrop-blur-md transition-all duration-300 shadow-md">
      <div className="mx-auto w-full px-6 py-3.5 flex items-center justify-between">
        
        {/* Left Side: Brand Logo & Role Badge */}
        <div className="flex items-center gap-3">
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
        <div className="flex-1 max-w-lg mx-6 flex justify-center">
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
        <div className="flex items-center gap-3">
          
          {/* Location Selector */}
          {!isSearchExpanded && (
            <LocationSelector className="hidden lg:flex" />
          )}

          {/* Search Trigger Button */}
          {!isSearchExpanded && (
            <button
              onClick={() => setIsSearchExpanded(true)}
              className="text-muted-foreground hover:text-foreground p-2 hover:bg-muted/50 rounded-full transition-all"
              aria-label="Toggle Search"
            >
              <Search className="h-4.5 w-4.5" />
            </button>
          )}

          {/* Favorites Heart Icon */}
          <button
            className="text-muted-foreground hover:text-foreground p-2 hover:bg-muted/50 rounded-full transition-colors"
            aria-label="View Favorites"
          >
            <Heart className="h-4.5 w-4.5" />
          </button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications Dropdown */}
          {currentRole !== "guest" && (
            <NotificationDropdown />
          )}

          {/* User Profile / Access Dropdown */}
          <ProfileDropdown currentRole={currentRole} />

          {/* Mobile Menu Toggle Button */}
          {activeLinks.length > 0 && !isSearchExpanded && (
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card hover:bg-muted/50 transition-colors md:hidden text-muted-foreground hover:text-foreground"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
            </button>
          )}

        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && activeLinks.length > 0 && (
        <div className="md:hidden border-t border-border bg-card/95 backdrop-blur-md p-4 shadow-xl animate-in slide-in-from-top-4 duration-200">
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
};

export default Header;