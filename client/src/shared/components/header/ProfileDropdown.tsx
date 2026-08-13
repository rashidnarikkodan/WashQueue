import { useState, useRef, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import {
  User,
  Car,
  Calendar,
  CreditCard,
  Wrench,
  Headphones,
  LogOut,
  ChevronRight,
} from "lucide-react"
import { useAuthStore } from "../../../features/auth/store/auth.store"
import { ROLE, VIEW_MODE } from "../../constants/role.const"

interface ProfileDropdownProps {
  currentRole: "admin" | "manager" | "owner" | "customer"
}

export default function ProfileDropdown({ currentRole }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { user, logout, setActiveViewMode } = useAuthStore()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  if (!user) return null

  const getRoleLabel = () => {
    switch (currentRole) {
      case ROLE.ADMIN:
        return "System Admin"
      case ROLE.MANAGER:
        return "Station Manager"
      case ROLE.OWNER:
        return "Verified Owner"
      case ROLE.CUSTOMER:
        return "Verified User"
      default:
        return "User Access"
    }
  }

  const getCtaContent = () => {
    if (user.role === ROLE.OWNER) {
      if (currentRole === VIEW_MODE.CUSTOMER) {
        return {
          title: "Switch to Owner Mode",
          desc: "Manage station operations & bays",
        }
      }
      if (currentRole === VIEW_MODE.OWNER) {
        return {
          title: "Switch to Customer Mode",
          desc: "Browse stations & book a wash",
        }
      }
    }

    if (user.role === ROLE.MANAGER) {
      if (currentRole === VIEW_MODE.CUSTOMER) {
        return {
          title: "Switch to Manager Mode",
          desc: "Manage arrival desk & queue board",
        }
      }
      if (currentRole === VIEW_MODE.MANAGER) {
        return {
          title: "Switch to Customer Mode",
          desc: "Browse stations & book a wash",
        }
      }
    }

    switch (currentRole) {
      case ROLE.ADMIN:
        return {
          title: "System Analytics",
          desc: "Monitor platform performance",
        }
      case ROLE.MANAGER:
        return {
          title: "Walk-in Queue",
          desc: "Add new walk-in wash",
        }
      default:
        return {
          title: "Become an Owner",
          desc: "List your service and earn",
        }
    }
  }

  const cta = getCtaContent()

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    : "U"

  const handleRoleSwitch = () => {
    setIsOpen(false)
    if (user.role === ROLE.OWNER) {
      if (currentRole === VIEW_MODE.CUSTOMER) {
        setActiveViewMode(VIEW_MODE.OWNER)
        navigate("/owner")
      } else {
        setActiveViewMode(VIEW_MODE.CUSTOMER)
        navigate("/")
      }
    } else if (user.role === ROLE.MANAGER) {
      if (currentRole === VIEW_MODE.CUSTOMER) {
        setActiveViewMode(VIEW_MODE.MANAGER)
        navigate("/manager/queue")
      } else {
        setActiveViewMode(VIEW_MODE.CUSTOMER)
        navigate("/")
      }
    } else {
      navigate(
        currentRole === VIEW_MODE.CUSTOMER
          ? "/owner/onboarding"
          : `/${currentRole}/dashboard`
      )
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      {/* Avatar Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity shadow-sm ring-2 ring-background ring-offset-2 ring-offset-primary cursor-pointer"
        aria-label="User Profile"
      >
        {initials}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-96 rounded-3xl border border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-card-foreground">
          {/* 1. Profile Header */}
          <div className="p-5 border-b border-border/50 bg-muted/30">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-base font-extrabold shadow-md shadow-primary/20">
                {initials}
              </div>

              <div className="flex flex-col overflow-hidden">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-foreground text-sm truncate">{user.name}</h3>
                  <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                    {getRoleLabel()}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{user.email}</p>
              </div>
            </div>
          </div>

          {/* 2. Role Switcher Banner (Owner / Manager) */}
          {(user.role === ROLE.OWNER || user.role === ROLE.MANAGER) && (
            <div className="p-3 border-b border-border/40 bg-primary/5">
              <button
                type="button"
                onClick={handleRoleSwitch}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                    <Wrench className="h-4.5 w-4.5" />
                  </div>
                  <div className="text-left">
                    <span className="block text-xs font-extrabold text-foreground">{cta.title}</span>
                    <span className="block text-[11px] text-muted-foreground">{cta.desc}</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}

          {/* 3. Vertical Navigation List (Pure vertical list, no grid!) */}
          <div className="p-2 space-y-1">
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-3 rounded-2xl hover:bg-muted/60 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <User className="h-4.5 w-4.5" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-foreground">My Profile</span>
                  <span className="block text-[11px] text-muted-foreground">Account details & settings</span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-3 rounded-2xl hover:bg-muted/60 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <Car className="h-4.5 w-4.5" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-foreground">My Garage</span>
                  <span className="block text-[11px] text-muted-foreground">Manage saved vehicles</span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              to={currentRole === "customer" ? "/bookings" : `/${currentRole}/bookings`}
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-3 rounded-2xl hover:bg-muted/60 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <Calendar className="h-4.5 w-4.5" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-foreground">My Bookings</span>
                  <span className="block text-[11px] text-muted-foreground">Track wash history & queue</span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              to="/wallet"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-3 rounded-2xl hover:bg-muted/60 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <CreditCard className="h-4.5 w-4.5" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-foreground">Wallet & Refunds</span>
                  <span className="block text-[11px] text-muted-foreground">Balance & transaction logs</span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
            </Link>

            <div
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-3 rounded-2xl hover:bg-muted/60 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <Headphones className="h-4.5 w-4.5" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-foreground">Help & Support</span>
                  <span className="block text-[11px] text-muted-foreground">Customer support center</span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>

          {/* 4. Footer Section */}
          <div className="p-3 border-t border-border/40 bg-muted/20 flex justify-end">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false)
                logout()
                navigate("/login")
              }}
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-2xl border border-red-500/30 bg-red-500/5 hover:bg-red-500/10 text-red-500 text-xs font-extrabold transition-all cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
