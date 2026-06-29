import { useState } from "react";
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Shield, 
  Calendar, 
  Activity, 
  Settings as SettingsIcon, 
  Clock, 
  CheckCircle2, 
  MapPin,
  Save,
  UserCheck,
  UserX,
  FileText
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { ROLE, type RoleType } from "../../../shared/constants/role.const";
import Breadcrumbs from "../../../shared/components/ui/Breadcrumbs";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: RoleType;
  status: "ACTIVE" | "BLOCKED";
  joinedDate: string;
  lastActive: string;
  bio: string;
  address: string;
}

const MOCK_USERS_DETAILS: Record<string, UserProfile> = {
  "1": {
    id: "1",
    name: "Alex Rivera",
    email: "alex.rivera@washqueue.com",
    phone: "+1 (555) 019-2834",
    role: "admin",
    status: "ACTIVE",
    joinedDate: "2026-01-15",
    lastActive: "2026-06-29 12:45 PM",
    bio: "Lead system administrator overseeing operational queues, provider assignments, and platform configurations.",
    address: "742 Evergreen Terrace, Springfield"
  },
  "2": {
    id: "2",
    name: "Marcus Chen",
    email: "marcus.chen@washqueue.com",
    phone: "+1 (555) 014-9821",
    role: "manager",
    status: "ACTIVE",
    joinedDate: "2026-02-10",
    lastActive: "2026-06-28 09:30 AM",
    bio: "Operations manager in charge of facility listings, service scheduling, and customer service resolution.",
    address: "10880 Malibu Point, California"
  },
  "3": {
    id: "3",
    name: "Sarah Jenkins",
    email: "sarah.j@washqueue.com",
    phone: "+1 (555) 018-7732",
    role: "provider",
    status: "ACTIVE",
    joinedDate: "2026-03-01",
    lastActive: "2026-06-29 11:15 AM",
    bio: "Service provider specializing in eco-friendly steam washes and interior detailing.",
    address: "123 Elm Street, Metropolis"
  }
};

const DEFAULT_PROFILE: UserProfile = {
  id: "4",
  name: "Elena Rostova",
  email: "elena.r@washqueue.com",
  phone: "+1 (555) 013-8844",
  role: "customer",
  status: "ACTIVE",
  joinedDate: "2026-03-12",
  lastActive: "2026-06-29 08:05 AM",
  bio: "Regular customer who prefers premium exterior detailing services.",
  address: "221B Baker Street, London"
};

const UserDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const initialProfile = (id && MOCK_USERS_DETAILS[id]) || DEFAULT_PROFILE;
  
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [activeTab, setActiveTab] = useState<"overview" | "activity" | "settings">("overview");
  const [editForm, setEditForm] = useState({ ...profile });
  const [isSavedMessageVisible, setIsSavedMessageVisible] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const handleToggleStatus = () => {
    const updatedStatus = profile.status === "ACTIVE" ? "BLOCKED" : "ACTIVE";
    setProfile(prev => ({ ...prev, status: updatedStatus }));
    setEditForm(prev => ({ ...prev, status: updatedStatus }));
  };

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile({ ...editForm });
    setIsSavedMessageVisible(true);
    setTimeout(() => setIsSavedMessageVisible(false), 3000);
  };

  const getRoleBadgeStyle = (role: RoleType) => {
    switch (role) {
      case ROLE.ADMIN:
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case ROLE.MANAGER:
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case ROLE.PROVIDER:
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      default:
        return "bg-green-500/10 text-green-500 border-green-500/20";
    }
  };

  // Mock Bookings
  const mockBookings = [
    { id: "WQ-8924", service: "Premium Express Wash", date: "2026-06-25", price: "$45.00", status: "COMPLETED" },
    { id: "WQ-8812", service: "Eco Steam Detail", date: "2026-06-12", price: "$120.00", status: "COMPLETED" },
    { id: "WQ-8740", service: "Full Interior Detailing", date: "2026-05-28", price: "$180.00", status: "COMPLETED" },
  ];

  // Mock Logs
  const mockLogs = [
    { action: "Profile Updated", details: "Changed contact phone number", time: "June 29, 2026 at 11:20 AM", icon: Clock },
    { action: "Service Booking", details: "Booked Premium Express Wash #WQ-8924", time: "June 25, 2026 at 02:40 PM", icon: FileText },
    { action: "Account Security", details: "Password changed successfully", time: "June 10, 2026 at 09:12 AM", icon: Shield },
    { action: "System Log", details: "Account registration confirmed", time: "January 15, 2026 at 10:00 AM", icon: Calendar },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <Breadcrumbs items={[
        { label: "Admin", path: "/admin/dashboard" },
        { label: "Users", path: "/admin/users" },
        { label: profile.name }
      ]} />

      {/* Back Button & Action Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <button
          onClick={() => navigate("/admin/users")}
          className="group flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Users List</span>
        </button>

        {isSavedMessageVisible && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
            <CheckCircle2 size={14} />
            <span>Profile changes saved successfully!</span>
          </div>
        )}
      </div>

      {/* User Hero Panel */}
      <div className="border border-border/80 bg-card/60 backdrop-blur-sm rounded-3xl p-6 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 text-primary font-extrabold flex items-center justify-center text-3xl border border-primary/10 shadow-inner">
            {getInitials(profile.name)}
          </div>
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight">{profile.name}</h1>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold border ${getRoleBadgeStyle(profile.role)}`}>
                <Shield size={11} />
                {profile.role}
              </span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold border ${
                profile.status === "ACTIVE" 
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                  : "bg-rose-500/10 text-rose-500 border-rose-500/20"
              }`}>
                {profile.status}
              </span>
            </div>
            <p className="text-muted-foreground text-sm flex items-center gap-2">
              <Mail size={14} />
              {profile.email}
            </p>
            <p className="text-xs text-muted-foreground">
              Last active: {profile.lastActive}
            </p>
          </div>
        </div>

        <button
          onClick={handleToggleStatus}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
            profile.status === "ACTIVE"
              ? "border-rose-500/20 text-rose-500 bg-rose-500/5 hover:bg-rose-500 hover:text-white"
              : "border-emerald-500/20 text-emerald-500 bg-emerald-500/5 hover:bg-emerald-500 hover:text-white"
          }`}
        >
          {profile.status === "ACTIVE" ? (
            <>
              <UserX size={15} />
              <span>Suspend Account</span>
            </>
          ) : (
            <>
              <UserCheck size={15} />
              <span>Activate Account</span>
            </>
          )}
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-border/80 flex gap-6">
        <button
          onClick={() => setActiveTab("overview")}
          className={`pb-3 text-sm font-bold border-b-2 transition-all relative ${
            activeTab === "overview"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <div className="flex items-center gap-2">
            <Activity size={16} />
            <span>Overview</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab("activity")}
          className={`pb-3 text-sm font-bold border-b-2 transition-all relative ${
            activeTab === "activity"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <div className="flex items-center gap-2">
            <Clock size={16} />
            <span>Activity Logs</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`pb-3 text-sm font-bold border-b-2 transition-all relative ${
            activeTab === "settings"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <div className="flex items-center gap-2">
            <SettingsIcon size={16} />
            <span>Edit Profile</span>
          </div>
        </button>
      </div>

      {/* Tab Content Panel */}
      <div className="space-y-6">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Contact details */}
            <div className="md:col-span-1 border border-border/80 bg-card/60 backdrop-blur-sm rounded-3xl p-5 space-y-4">
              <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">Contact Profile</h3>
              <div className="space-y-3.5 text-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg text-muted-foreground">
                    <Mail size={15} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-semibold">{profile.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg text-muted-foreground">
                    <Phone size={15} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="font-semibold">{profile.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg text-muted-foreground">
                    <MapPin size={15} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="font-semibold">{profile.address}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg text-muted-foreground">
                    <Calendar size={15} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Registered On</p>
                    <p className="font-semibold">{profile.joinedDate}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main info & Booking History */}
            <div className="md:col-span-2 space-y-6">
              {/* Bio summary */}
              <div className="border border-border/80 bg-card/60 backdrop-blur-sm rounded-3xl p-5 space-y-2">
                <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">Biography</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{profile.bio}</p>
              </div>

              {/* Bookings */}
              <div className="border border-border/80 bg-card/60 backdrop-blur-sm rounded-3xl p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">Recent Booking Orders</h3>
                  <div className="p-1.5 bg-primary/10 text-primary rounded-lg text-xs font-bold">
                    3 Total
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground font-semibold py-2">
                        <th className="pb-2">Order ID</th>
                        <th className="pb-2">Wash Service</th>
                        <th className="pb-2">Date</th>
                        <th className="pb-2">Amount</th>
                        <th className="pb-2 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {mockBookings.map((b) => (
                        <tr key={b.id} className="hover:bg-muted/10">
                          <td className="py-2.5 font-bold text-primary">{b.id}</td>
                          <td className="py-2.5 font-semibold">{b.service}</td>
                          <td className="py-2.5 text-muted-foreground">{b.date}</td>
                          <td className="py-2.5 font-bold">{b.price}</td>
                          <td className="py-2.5 text-right">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20 text-[10px]">
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "activity" && (
          <div className="border border-border/80 bg-card/60 backdrop-blur-sm rounded-3xl p-6">
            <h3 className="font-bold text-sm text-foreground uppercase tracking-wider mb-6">User Activity Timeline</h3>
            <div className="relative border-l border-border pl-6 ml-3 space-y-6">
              {mockLogs.map((log, idx) => {
                const Icon = log.icon;
                return (
                  <div key={idx} className="relative">
                    {/* Circle marker */}
                    <div className="absolute -left-[35px] top-0.5 w-6 h-6 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground shadow-sm">
                      <Icon size={12} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-foreground">{log.action}</p>
                      <p className="text-xs text-muted-foreground">{log.details}</p>
                      <p className="text-[10px] text-muted-foreground/80 font-medium">{log.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="border border-border/80 bg-card/60 backdrop-blur-sm rounded-3xl p-6">
            <h3 className="font-bold text-sm text-foreground uppercase tracking-wider mb-4">Edit Profile details</h3>
            <form onSubmit={handleSaveChanges} className="space-y-4 max-w-xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-muted/40 border border-border/80 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">System Role</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value as RoleType }))}
                    className="w-full bg-muted/40 border border-border/80 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold"
                  >
                    <option value={ROLE.ADMIN}>Admin</option>
                    <option value={ROLE.MANAGER}>Manager</option>
                    <option value={ROLE.PROVIDER}>Provider</option>
                    <option value={ROLE.CUSTOMER}>Customer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-muted/40 border border-border/80 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Phone Number</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full bg-muted/40 border border-border/80 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Location Address</label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full bg-muted/40 border border-border/80 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Biography</label>
                <textarea
                  rows={3}
                  value={editForm.bio}
                  onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                  className="w-full bg-muted/40 border border-border/80 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                className="flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-all shadow-md shadow-primary/10"
              >
                <Save size={16} />
                <span>Save Profile Changes</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetails;
