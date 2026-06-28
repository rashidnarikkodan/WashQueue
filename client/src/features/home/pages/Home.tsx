import { useAuthStore } from "../../auth/store/authStore";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Compass, 
  Car, 
  Clock, 
  History, 
  Sparkles, 
  ChevronRight, 
  Calendar
} from "lucide-react";

export default function Home() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Mock data representing a premium authenticated customer dashboard
  const upcomingBookings = [
    {
      id: "b1",
      stationName: "Elite Detailing",
      service: "SUV Pro Polish",
      time: "10:30 AM Today",
      estimatedWait: "12 min wait",
      status: "Confirmed",
      bay: "Bay 1"
    }
  ];

  const recentActivity = [
    {
      id: "a1",
      stationName: "South Bay Detailing",
      service: "Deep Wash & Polish",
      date: "June 24, 2026",
      price: "$38.00"
    },
    {
      id: "a2",
      stationName: "Metro Wash Center",
      service: "Quick Rinse",
      date: "June 12, 2026",
      price: "$18.00"
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-8 border-b border-border">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Welcome back, <span className="text-primary">{user?.name || "Customer"}</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              Monitor your active queue slots and find premium detailing stations.
            </p>
          </div>
          
          {/* Quick Stats/Info */}
          <div className="flex items-center gap-4 bg-card/45 border border-border px-5 py-3.5 rounded-2xl backdrop-blur-sm">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Car className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Registered Garage</p>
              <p className="text-xs font-bold text-foreground">Tesla Model 3 • SUV Coupe</p>
            </div>
          </div>
        </div>

        {/* Core Layout: Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Quick Actions & Search (8 Cols) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Find Detailing Station Search Box */}
            <div className="p-6 md:p-8 rounded-3xl border border-border bg-gradient-to-br from-slate-900 to-slate-950 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="space-y-4 max-w-xl relative z-10">
                <h2 className="text-xl font-bold text-white">Find a Wash Station</h2>
                <p className="text-xs text-muted-foreground">
                  Check live queue sizes, active telemetries, and secure slot bookings around your current coordinate space.
                </p>
                
                {/* Simulated Search bar */}
                <div className="flex items-center gap-3 bg-slate-950/60 border border-border/80 rounded-2xl p-2 pl-4 focus-within:border-primary/80 transition-colors">
                  <Search className="h-5 w-5 text-muted-foreground shrink-0" />
                  <input 
                    type="text" 
                    placeholder="Enter city, zipcode, or station name..." 
                    className="w-full bg-transparent border-0 outline-0 text-sm text-foreground placeholder:text-muted-foreground/60 py-2.5"
                  />
                  <button 
                    onClick={() => navigate("/login")} // In production, search results or map view
                    className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/95 transition-all shadow-md shrink-0 cursor-pointer"
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Navigation Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Explore Map */}
              <div className="p-6 rounded-3xl border border-border bg-card/45 backdrop-blur-sm hover:border-primary/45 transition-colors duration-300 flex flex-col justify-between h-[180px]">
                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary w-fit">
                    <Compass className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-foreground text-sm">Explore Stations Map</h3>
                  <p className="text-xs text-muted-foreground">
                    Locate detailing centers with interactive queue-wait estimates.
                  </p>
                </div>
                <div className="text-xs font-bold text-primary flex items-center gap-1 hover:underline cursor-pointer">
                  <span>Open Interactive Map</span>
                  <ChevronRight className="h-4.5 w-4.5" />
                </div>
              </div>

              {/* Add Vehicle */}
              <div className="p-6 rounded-3xl border border-border bg-card/45 backdrop-blur-sm hover:border-primary/45 transition-colors duration-300 flex flex-col justify-between h-[180px]">
                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary w-fit">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-foreground text-sm">Garage Management</h3>
                  <p className="text-xs text-muted-foreground">
                    Register new vehicles to calculate tailor-fitted pricing model.
                  </p>
                </div>
                <div className="text-xs font-bold text-primary flex items-center gap-1 hover:underline cursor-pointer">
                  <span>Manage Vehicles</span>
                  <ChevronRight className="h-4.5 w-4.5" />
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Upcoming Slots & Activity (4 Cols) */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Active/Upcoming Bookings */}
            <div className="p-6 rounded-3xl border border-border bg-card/45 backdrop-blur-sm space-y-4">
              <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                <Clock className="h-4.5 w-4.5 text-primary" />
                Upcoming Slots
              </h3>
              
              {upcomingBookings.length > 0 ? (
                upcomingBookings.map((booking) => (
                  <div key={booking.id} className="p-4 rounded-2xl bg-slate-950/20 border border-border/60 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-foreground text-sm">{booking.stationName}</h4>
                        <p className="text-[10px] text-muted-foreground">{booking.service}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-primary/10 text-primary border border-primary/20">
                        {booking.status}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs border-t border-border/40 pt-2 text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {booking.time}
                      </span>
                      <span className="font-bold text-emerald-400">
                        {booking.estimatedWait}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">No active booking slots.</p>
              )}
            </div>

            {/* Recent Completed Activities */}
            <div className="p-6 rounded-3xl border border-border bg-card/45 backdrop-blur-sm space-y-4">
              <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                <History className="h-4.5 w-4.5 text-primary" />
                Recent Detailing
              </h3>
              
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex justify-between items-center text-xs pb-3 border-b border-border/40 last:border-0 last:pb-0">
                    <div>
                      <p className="font-bold text-foreground">{activity.stationName}</p>
                      <p className="text-[10px] text-muted-foreground">{activity.service} • {activity.date}</p>
                    </div>
                    <span className="font-bold text-foreground">{activity.price}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
