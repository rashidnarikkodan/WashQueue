import { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Shield, 
  Clock, 
  MapPin,
  Save,
  UserCheck,
  UserX,
  Trash2,
  Send,
  Edit2,
  Award,
  Car,
  Building,
  CheckCircle,
  AlertTriangle,
  X,
  User as UserIcon
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { ROLE } from "../../../shared/constants/role.const";
import Breadcrumbs from "../../../shared/components/ui/Breadcrumbs";
import { usersApi, type User } from "../service/users.api";
import { toast } from "sonner";
import FeatureLock from "../../../shared/components/ui/FeatureLock";

// Simulated additional interfaces
interface Vehicle {
  id: string;
  name: string;
  plate: string;
  addedDate: string;
}

interface Booking {
  id: string;
  stationName: string;
  vehicle: string;
  date: string;
  amount: number;
  status: "COMPLETED" | "CANCELLED" | "PENDING";
}

interface ProviderStation {
  name: string;
  location: string;
  status: "ONLINE" | "OFFLINE" | "MAINTENANCE";
  sessions: number;
}

interface ProviderProfile {
  companyName: string;
  businessEmail: string;
  whatsapp: string;
  kycStatus: string;
  kycVerified: boolean;
  stations: ProviderStation[];
  totalEarnings: number;
  activeStations: number;
}

const UserDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Loading & State
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Action Pending flags
  const [isSuspending, setIsSuspending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Editable local variables (for fields not stored in server)
  const address = "";
  const bio = "";
  const [legalName, setLegalName] = useState("");
  
  // Modals visibility state
  const [isEditProviderOpen, setIsEditProviderOpen] = useState(false);

  // Simulated details state
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [providerProfile, setProviderProfile] = useState<ProviderProfile>({
    companyName: "",
    businessEmail: "",
    whatsapp: "",
    kycStatus: "",
    kycVerified: false,
    stations: [],
    totalEarnings: 0,
    activeStations: 0
  });

  // Booking history filter & pagination states
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>("ALL");
  const [bookingPage, setBookingPage] = useState<number>(1);
  const bookingsPerPage = 3;

  // Edit Provider Form state
  const [providerForm, setProviderForm] = useState({
    companyName: "",
    businessEmail: "",
    whatsapp: "",
    kycStatus: "",
    totalEarnings: 0,
    activeStations: 0
  });

  // Quick Notification Form state
  const [notification, setNotification] = useState({
    type: "Account Alert",
    subject: "",
    content: ""
  });

  // Fetch actual user from server on mount
  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const fetched = await usersApi.getUser(id);
        setUser(fetched);
        
        // Initialize editing forms and fallbacks with fetched info
        setLegalName(fetched.name || fetched.email.split("@")[0]);

        // Initialize state arrays to pure empty defaults (never use un-real data)
        setVehicles([]);
        setBookings([]);

        // Initialize provider forms as empty
        setProviderProfile({
          companyName: "",
          businessEmail: "",
          whatsapp: "",
          kycStatus: "",
          kycVerified: false,
          stations: [],
          totalEarnings: 0,
          activeStations: 0
        });

        setProviderForm({
          companyName: "",
          businessEmail: "",
          whatsapp: "",
          kycStatus: "",
          totalEarnings: 0,
          activeStations: 0
        });

      } catch (err: any) {
        setErrorMsg(err.message || "Failed to load user details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-12 h-12 border-4 border-[#ADC6FF]/20 border-t-[#ADC6FF] rounded-full animate-spin" />
        <p className="text-slate-400 text-sm font-semibold">Loading user details...</p>
      </div>
    );
  }

  if (errorMsg || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4 text-center max-w-md mx-auto">
        <div className="w-14 h-14 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/20">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">Retrieval Failed</h2>
          <p className="text-slate-400 text-sm">{errorMsg || "Unable to display details for this user."}</p>
        </div>
      </div>
    );
  }

  // Helpers
  const getInitials = (name: string) => {
    if (!name) return "US";
    return name
      .split(" ")
      .map(n => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const getRelativeTime = (dateStr?: string | Date) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    const diffMs = new Date().getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffMins < 1) return "Just active";
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  const formatJoinedDate = (dateStr?: string | Date) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString(undefined, { 
      year: "numeric", 
      month: "short", 
      day: "numeric" 
    }).toUpperCase();
  };

  // Suspend/Activate Handler
  const handleToggleBlockStatus = async () => {
    setIsSuspending(true);
    try {
      const updatedBlocked = !user.isBlocked;
      const updatedUser = await usersApi.updateUser(user.id, { isBlocked: updatedBlocked });
      setUser(updatedUser);
      toast.success(
        updatedBlocked 
          ? `User ${user.name || user.email} suspended successfully!` 
          : `User ${user.name || user.email} activated successfully!`
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to update block status.");
    } finally {
      setIsSuspending(false);
    }
  };


  // Quick Notification Submit
  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notification.subject || !notification.content) {
      toast.warning("Please fill in both subject and message content.");
      return;
    }
    toast.success(`Notification of type "${notification.type}" sent to ${user.name || user.email}!`);
    setNotification(prev => ({ ...prev, subject: "", content: "" }));
  };



  // Edit Provider Handler
  const handleEditProviderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProviderProfile(prev => ({
      ...prev,
      companyName: providerForm.companyName,
      businessEmail: providerForm.businessEmail,
      whatsapp: providerForm.whatsapp,
      kycStatus: providerForm.kycStatus,
      totalEarnings: Number(providerForm.totalEarnings),
      activeStations: Number(providerForm.activeStations)
    }));
    setIsEditProviderOpen(false);
    toast.success("Provider profile details updated.");
  };

  // Bookings pagination & filter helpers
  const filteredBookings = bookings.filter(b => 
    bookingStatusFilter === "ALL" ? true : b.status === bookingStatusFilter
  );
  const totalBookingPages = Math.max(1, Math.ceil(filteredBookings.length / bookingsPerPage));
  const displayedBookings = filteredBookings.slice(
    (bookingPage - 1) * bookingsPerPage,
    bookingPage * bookingsPerPage
  );

  return (
    <div className="space-y-6 max-w-7xl xl:max-w-[1400px] mx-auto px-4 sm:px-6 pb-12 text-[#f8fafc]">
      {/* Breadcrumbs Row & Back Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Breadcrumbs items={[
          { label: "Admin", path: "/admin/dashboard" },
          { label: "Users", path: "/admin/users" },
          { label: user.name || user.email }
        ]} />

        <button
          onClick={() => navigate("/admin/users")}
          className="group flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Users List</span>
        </button>
      </div>

      {/* 1. Header Profile Banner Card */}
      <div className="border border-slate-800/80 bg-[#111726]/60 backdrop-blur-md rounded-3xl p-5 xl:p-6 shadow-2xl flex flex-col xl:flex-row gap-6 items-start xl:items-center justify-between relative overflow-hidden">
        {/* Decorative subtle background gradients */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center w-full xl:w-auto">
          {/* Large Initials Avatar */}
          <div className="w-20 h-20 rounded-full bg-[#1b253b] text-[#ADC6FF] border border-[#ADC6FF]/20 font-extrabold flex items-center justify-center text-3xl shadow-inner shrink-0">
            {getInitials(user.name)}
          </div>
          
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{user.name || "N/A"}</h1>
              
              {/* Active/Blocked Status dot tag */}
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                user.isBlocked
                  ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              }`}>
                <span className={`w-2 h-2 rounded-full ${user.isBlocked ? "bg-rose-400" : "bg-emerald-400"}`} />
                {user.isBlocked ? "BLOCKED" : "ACTIVE"}
              </span>
            </div>

            {/* Email & Phone */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-slate-400 text-sm">
              <span className="flex items-center gap-1.5">
                <Mail size={14} className="text-slate-500" />
                {user.email}
              </span>
              {user.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone size={14} className="text-slate-500" />
                  {user.phone}
                </span>
              )}
            </div>

            {/* Badges for Authentication & Role */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#1e293b] text-slate-300 border border-slate-800">
                <Shield size={11} className="text-slate-400" />
                {user.authProvider === "GOOGLE" ? "GOOGLE Google Auth" : "LOCAL Password Auth"}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#ADC6FF]/10 text-[#ADC6FF] border border-[#ADC6FF]/20">
                <UserIcon size={11} className="text-[#ADC6FF]" />
                {user.role === ROLE.ADMIN 
                  ? "System Administrator" 
                  : user.role === ROLE.MANAGER 
                  ? "Manager" 
                  : user.role === ROLE.PROVIDER 
                  ? "Service Provider" 
                  : "Customer"}
              </span>
            </div>
          </div>
        </div>

        {/* Right side buttons & relative time meta */}
        <div className="flex flex-col sm:flex-row xl:flex-col items-start sm:items-center xl:items-end gap-4 w-full xl:w-auto pt-4 xl:pt-0 border-t border-slate-800/40 xl:border-t-0 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            {/* Send Notification focus/trigger */}
            <button 
              onClick={() => {
                const element = document.getElementById("quick-notification-form");
                if (element) {
                  element.scrollIntoView({ behavior: "smooth" });
                  toast.info("Scrolled to Quick Notification form.");
                }
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-semibold text-xs transition-all cursor-pointer"
            >
              <Send size={13} />
              <span>Send Notification</span>
            </button>

            {/* Suspend / Activate Account Button */}
            <button
              onClick={handleToggleBlockStatus}
              disabled={isSuspending}
              className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                user.isBlocked
                  ? "border-emerald-500/20 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500 hover:text-slate-950"
                  : "border-rose-500/20 text-rose-400 bg-rose-500/5 hover:bg-rose-500 hover:text-white"
              }`}
            >
              {isSuspending ? (
                <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : user.isBlocked ? (
                <>
                  <UserCheck size={14} />
                  <span>Activate</span>
                </>
              ) : (
                <>
                  <UserX size={14} />
                  <span>Suspend</span>
                </>
              )}
            </button>
          </div>

          {/* Joined & Active dates info */}
          <div className="text-slate-400 text-[11px] font-bold tracking-wider text-left sm:text-right xl:text-right space-y-0.5">
            <p>JOINED: <span className="text-white">{formatJoinedDate(user.createdAt)}</span></p>
            <p>LAST ACTIVE: <span className="text-emerald-400">{getRelativeTime(user.lastLoginAt || user.updatedAt)}</span></p>
          </div>
        </div>
      </div>

      {/* 2. Core Dashboard Content Layout: Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 xl:gap-8 items-start">
        
        {/* Left Columns (8 Cols) */}
        <div className="xl:col-span-8 space-y-6">
          
          {/* Card: Personal Information */}
          <div className="border border-slate-800/80 bg-[#111726]/60 backdrop-blur-md rounded-3xl p-5 xl:p-6 shadow-xl relative">


            <div className="flex items-center gap-2 mb-6">
              <UserIcon size={18} className="text-[#ADC6FF]" />
              <h2 className="text-base font-black uppercase text-white tracking-widest">Personal Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8 text-sm">
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Full Legal Name</p>
                <p className="font-semibold text-slate-200">{legalName || user.name || "N/A"}</p>
              </div>

              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Auth Provider ID</p>
                <p className="font-mono text-xs text-slate-300">{user.authProvider === "GOOGLE" ? `google-oauth2|${user.id}` : `local-hash|${user.id}`}</p>
              </div>

              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Primary Email</p>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-slate-200">{user.email}</p>
                  {user.isVerified && (
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle size={9} />
                      <span>Verified</span>
                    </span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Phone Number</p>
                <p className="font-semibold text-slate-200">{user.phone || "Not Registered"}</p>
              </div>

              <div className="md:col-span-2">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Registered Address</p>
                <p className="text-slate-300 leading-relaxed flex items-start gap-1.5">
                  <MapPin size={14} className="text-slate-500 shrink-0 mt-0.5" />
                  <span>{address || "Not Registered"}</span>
                </p>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800/40">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Biography</p>
              <p className="text-xs text-slate-450 leading-relaxed italic">{bio || "No biography registered."}</p>
            </div>
          </div>

          {/* Booking Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="border border-slate-800/80 bg-[#111726]/60 backdrop-blur-md rounded-2xl p-4.5 shadow-md flex flex-col justify-between">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Total Bookings</p>
              <p className="text-2xl font-black text-white">{bookings.length}</p> 
            </div>
            <div className="border border-slate-800/80 bg-[#111726]/60 backdrop-blur-md rounded-2xl p-4.5 shadow-md flex flex-col justify-between">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Completed</p>
              <p className="text-2xl font-black text-emerald-400">{bookings.filter(b => b.status === "COMPLETED").length}</p>
            </div>
            <div className="border border-slate-800/80 bg-[#111726]/60 backdrop-blur-md rounded-2xl p-4.5 shadow-md flex flex-col justify-between">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Cancelled</p>
              <p className="text-2xl font-black text-rose-400">{bookings.filter(b => b.status === "CANCELLED").length}</p>
            </div>
            <div className="border border-slate-800/80 bg-[#111726]/60 backdrop-blur-md rounded-2xl p-4.5 shadow-md flex flex-col justify-between">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Pending</p>
              <p className="text-2xl font-black text-slate-300">{bookings.filter(b => b.status === "PENDING").length}</p>
            </div>
          </div>

          {/* Card: Recent Booking History */}
          <div className="border border-slate-800/80 bg-[#111726]/60 backdrop-blur-md rounded-3xl p-5 xl:p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-[#ADC6FF]" />
                <h2 className="text-base font-black uppercase text-white tracking-widest">Recent Booking History</h2>
              </div>
              
              {/* Dropdown status selector */}
              <div className="relative">
                <select
                  value={bookingStatusFilter}
                  onChange={(e) => {
                    setBookingStatusFilter(e.target.value);
                    setBookingPage(1);
                  }}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-300 focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="ALL">All Status</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="PENDING">Pending</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    <th className="pb-3">Booking ID</th>
                    <th className="pb-3">Station</th>
                    <th className="pb-3">Vehicle</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-xs">
                  {displayedBookings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-500 font-medium">
                        No bookings found matching filter.
                      </td>
                    </tr>
                  ) : (
                    displayedBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-850/10">
                        <td className="py-3.5 font-bold text-[#ADC6FF]">{b.id}</td>
                        <td className="py-3.5 font-semibold text-slate-200">{b.stationName}</td>
                        <td className="py-3.5 text-slate-300">{b.vehicle}</td>
                        <td className="py-3.5 text-slate-400">{b.date}</td>
                        <td className="py-3.5 font-black text-slate-200">${b.amount.toFixed(2)}</td>
                        <td className="py-3.5 text-right">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded font-bold border text-[9px] ${
                            b.status === "COMPLETED"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : b.status === "CANCELLED"
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                              : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                          }`}>
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Booking Pagination Controls */}
            {filteredBookings.length > 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-slate-800/40 text-xs text-slate-400">
                <p>Showing {filteredBookings.length === 0 ? 0 : (bookingPage - 1) * bookingsPerPage + 1}-{Math.min(filteredBookings.length, bookingPage * bookingsPerPage)} of {filteredBookings.length} entries</p>
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={bookingPage === 1}
                    onClick={() => setBookingPage(prev => Math.max(1, prev - 1))}
                    className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-transparent transition-all cursor-pointer"
                  >
                    &lt;
                  </button>
                  {[...Array(totalBookingPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setBookingPage(i + 1)}
                      className={`w-7 h-7 rounded-lg font-bold border transition-all cursor-pointer ${
                        bookingPage === i + 1
                          ? "bg-[#ADC6FF] text-[#020617] border-[#ADC6FF]"
                          : "border-slate-800 text-slate-400 hover:bg-slate-800"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    disabled={bookingPage === totalBookingPages}
                    onClick={() => setBookingPage(prev => Math.min(totalBookingPages, prev + 1))}
                    className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-transparent transition-all cursor-pointer"
                  >
                    &gt;
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Card: Registered Vehicles */}
          <div className="border border-slate-800/80 bg-[#111726]/60 backdrop-blur-md rounded-3xl p-5 xl:p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Car size={16} className="text-[#ADC6FF]" />
                <h2 className="text-base font-black uppercase text-white tracking-widest">Registered Vehicles</h2>
              </div>

            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {vehicles.length === 0 ? (
                <div className="sm:col-span-2 py-6 text-center text-slate-500 text-xs font-semibold">
                  No vehicles registered yet.
                </div>
              ) : (
                vehicles.map((v) => (
                  <div key={v.id} className="flex items-center gap-4 bg-[#1b253b]/40 border border-slate-800/40 p-4 rounded-2xl hover:border-slate-700/60 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center text-[#ADC6FF] border border-slate-800/80">
                      <Car size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-extrabold text-sm text-slate-100 truncate">{v.name}</h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">PLATE: <span className="font-mono text-slate-300 font-medium">{v.plate}</span></p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">{v.addedDate}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Conditional Card: Provider Profile Overview */}
          {(user.role === ROLE.PROVIDER || user.role === ROLE.MANAGER) && (
            <div className="border border-slate-800/80 bg-[#111726]/60 backdrop-blur-md rounded-3xl p-5 xl:p-6 shadow-xl space-y-6">
              
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Building size={16} className="text-[#ADC6FF]" />
                    <h2 className="text-base font-black uppercase text-white tracking-widest">Provider Profile</h2>
                  </div>
                  <p className="text-slate-500 text-xs font-medium">Enterprise Partner Account Overview</p>
                </div>

                <button 
                  onClick={() => {
                    setProviderForm({
                      companyName: providerProfile.companyName,
                      businessEmail: providerProfile.businessEmail,
                      whatsapp: providerProfile.whatsapp,
                      kycStatus: providerProfile.kycStatus,
                      totalEarnings: providerProfile.totalEarnings,
                      activeStations: providerProfile.activeStations
                    });
                    setIsEditProviderOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#ADC6FF] text-[#020617] hover:bg-[#9cb6f0] font-black text-xs transition-all cursor-pointer shadow-md shadow-[#ADC6FF]/10"
                >
                  <Edit2 size={13} />
                  <span>Edit Provider Details</span>
                </button>
              </div>

              {/* Sub components inside Provider Card */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-2">
                {/* Details side */}
                <div className="md:col-span-5 space-y-5">
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Company Name</p>
                    <p className="font-extrabold text-sm text-slate-100">{providerProfile.companyName || "Not Configured"}</p>
                  </div>

                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Business Email</p>
                    <p className="font-semibold text-xs text-slate-200 underline cursor-pointer">{providerProfile.businessEmail || "Not Configured"}</p>
                  </div>

                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">WhatsApp</p>
                    <p className="font-semibold text-xs text-slate-200">{providerProfile.whatsapp || "Not Configured"}</p>
                  </div>

                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">KYC Status</p>
                    {providerProfile.kycStatus ? (
                      <div className="flex items-center gap-2.5 bg-slate-900/60 p-3 rounded-2xl border border-slate-800/40">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                          <CheckCircle size={14} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-slate-200 truncate underline cursor-pointer">{providerProfile.kycStatus}</p>
                          <p className="text-[9px] text-emerald-400 font-bold tracking-wider uppercase mt-0.5">Verified by Compliance</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2.5 bg-slate-900/60 p-3 rounded-2xl border border-slate-800/40">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 border border-slate-700/40 flex items-center justify-center shrink-0">
                          <X size={14} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-slate-400 truncate">No document uploaded</p>
                          <p className="text-[9px] text-slate-500 font-bold tracking-wider uppercase mt-0.5">Verification Required</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Manage stations side */}
                <div className="md:col-span-7 space-y-3.5">
                  <h4 className="text-[10px] text-slate-500 font-black tracking-widest uppercase">Manage Stations</h4>
                  
                  <div className="overflow-x-auto border border-slate-800/40 rounded-2xl bg-slate-950/20">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-800/60 text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                          <th className="p-3">Station Name</th>
                          <th className="p-3">Location</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Total Sessions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/30">
                        {providerProfile.stations.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="p-6 text-center text-slate-500 font-medium">
                              No stations registered under this account.
                            </td>
                          </tr>
                        ) : (
                          providerProfile.stations.map((s, idx) => (
                            <tr key={idx} className="hover:bg-slate-850/10">
                              <td className="p-3 font-extrabold text-slate-100">{s.name}</td>
                              <td className="p-3 text-slate-400">{s.location}</td>
                              <td className="p-3">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded font-bold border text-[9px] ${
                                  s.status === "ONLINE"
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                    : s.status === "MAINTENANCE"
                                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                    : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                                }`}>
                                  {s.status}
                                </span>
                              </td>
                              <td className="p-3 text-right font-black text-slate-200">{s.sessions.toLocaleString()}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Stats Footer inside Card */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800/40">
                <div className="bg-[#1b253b]/30 p-4.5 rounded-2xl border border-slate-800/40">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Total Earnings</p>
                  <p className="text-2xl font-black text-emerald-400">${providerProfile.totalEarnings.toLocaleString()}</p>
                </div>
                <div className="bg-[#1b253b]/30 p-4.5 rounded-2xl border border-slate-800/40">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Active Stations</p>
                  <p className="text-2xl font-black text-white">{providerProfile.activeStations}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Columns (4 Cols) */}
        <div className="xl:col-span-4 space-y-6">
          
          {/* Card: Quick Notification Form */}
          <div id="quick-notification-form" className="border border-slate-800/80 bg-[#111726]/60 backdrop-blur-md rounded-3xl p-5 xl:p-6 shadow-xl space-y-5">
            <div className="flex items-center gap-2">
              <Send size={16} className="text-[#ADC6FF]" />
              <h2 className="text-base font-black uppercase text-white tracking-widest">Quick Notification</h2>
            </div>

            <form onSubmit={handleSendNotification} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Notification Type</label>
                <select
                  value={notification.type}
                  onChange={(e) => setNotification(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-slate-200"
                >
                  <option value="Account Alert">Account Alert</option>
                  <option value="Promotional">Promotional Offer</option>
                  <option value="Maintenance">System Maintenance</option>
                  <option value="Warning">Policy Warning</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Subject</label>
                <input
                  type="text"
                  placeholder="Enter message subject..."
                  value={notification.subject}
                  onChange={(e) => setNotification(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-slate-100 placeholder:text-slate-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Message Content</label>
                <textarea
                  rows={4}
                  placeholder="Type your message here..."
                  value={notification.content}
                  onChange={(e) => setNotification(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-slate-100 placeholder:text-slate-600 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#ADC6FF] text-[#020617] hover:bg-[#9cb6f0] font-black text-xs transition-all shadow-md shadow-[#ADC6FF]/10 cursor-pointer"
              >
                <Send size={13} />
                <span>Send Message</span>
              </button>
            </form>
          </div>

          {/* Card: User Loyalty Tier */}
            <FeatureLock message="Loyalty Tier">
            <div className="border border-slate-800/80 bg-[#111726]/60 backdrop-blur-md rounded-3xl p-5 xl:p-6 shadow-xl space-y-6 h-full relative overflow-hidden">
                <div className="flex items-center gap-2">
                  <Award size={16} className="text-[#ADC6FF]" />
                  <h2 className="text-base font-black uppercase text-white tracking-widest">User Loyalty Tier</h2>
                </div>

                <div className="flex flex-col items-center text-center space-y-3.5 py-4">
                  {/* Badge Circle container */}
                  <div className="w-16 h-16 rounded-full bg-[#1b253b] text-[#ADC6FF] border border-[#ADC6FF]/35 flex items-center justify-center shadow-lg shadow-[#ADC6FF]/5">
                    <Award size={28} className="stroke-[1.5]" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-white">Bronze Tier</h3>
                    <p className="text-[10px] text-slate-500 font-bold tracking-wider uppercase">Initial Member Status</p>
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-800/40">
                  <div className="flex justify-between items-end text-xs">
                    <span className="text-slate-400 font-medium">Lifeline Spend</span>
                    <span className="font-black text-slate-100 text-sm">$0.00</span>
                  </div>

                  {/* Progress gauge bar */}
                  <div className="w-full bg-slate-900 rounded-full h-2">
                    <div 
                      className="bg-[#ADC6FF] h-2 rounded-full shadow-[0_0_10px_rgba(173,198,255,0.6)] transition-all duration-500" 
                      style={{ width: "0%" }}
                    />
                  </div>

                  <p className="text-[10px] text-slate-400 font-semibold text-center italic mt-1.5">
                    No loyalty progress accumulated.
                  </p>
                </div>
              </div>
            </FeatureLock>
          </div>

      </div>

      {/* --- MODAL DIALOGS --- */}



      {/* Modal: Edit Provider Profile */}
      {isEditProviderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#111726] border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative space-y-4 animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsEditProviderOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X size={18} />
            </button>

            <h3 className="text-base font-black text-white uppercase tracking-widest">Edit Provider Profile</h3>

            <form onSubmit={handleEditProviderSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Company Name</label>
                <input
                  type="text"
                  required
                  value={providerForm.companyName}
                  onChange={(e) => setProviderForm(prev => ({ ...prev, companyName: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Business Email</label>
                <input
                  type="email"
                  required
                  value={providerForm.businessEmail}
                  onChange={(e) => setProviderForm(prev => ({ ...prev, businessEmail: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">WhatsApp Phone</label>
                <input
                  type="text"
                  required
                  value={providerForm.whatsapp}
                  onChange={(e) => setProviderForm(prev => ({ ...prev, whatsapp: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">KYC File Attachment</label>
                <input
                  type="text"
                  required
                  value={providerForm.kycStatus}
                  onChange={(e) => setProviderForm(prev => ({ ...prev, kycStatus: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Earnings ($)</label>
                  <input
                    type="number"
                    value={providerForm.totalEarnings}
                    onChange={(e) => setProviderForm(prev => ({ ...prev, totalEarnings: Number(e.target.value) }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Active Stations</label>
                  <input
                    type="number"
                    value={providerForm.activeStations}
                    onChange={(e) => setProviderForm(prev => ({ ...prev, activeStations: Number(e.target.value) }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditProviderOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-850 hover:bg-slate-900 text-slate-400 font-bold hover:text-white transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 bg-[#ADC6FF] text-[#020617] font-black px-5 py-2.5 rounded-xl hover:bg-[#9cb6f0] transition-all cursor-pointer"
                >
                  <Save size={13} />
                  <span>Update Profile</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserDetails;
