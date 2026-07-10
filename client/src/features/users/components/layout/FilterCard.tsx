import { Search } from "lucide-react";
import { ROLE } from "../../../../shared/constants/role.const";
import { FILTER_STATUS } from "../../../../shared/constants/status.const";

interface FilterCardProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  roleFilter: string;
  setRoleFilter: (r: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  activeTab: "all" | "customer" | "owner";
  setActiveTab: (tab: "all" | "customer" | "owner") => void;
  highCancellation: boolean;
  setHighCancellation: (val: boolean) => void;
  fraudFlag: boolean;
  setFraudFlag: (val: boolean) => void;
}

const FilterCard = ({
  searchQuery,
  setSearchQuery,
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter,
  activeTab,
  setActiveTab,
  highCancellation,
  setHighCancellation,
  fraudFlag,
  setFraudFlag
}: FilterCardProps) => {

  const handleTabChange = (tab: "all" | "customer" | "owner") => {
    setActiveTab(tab);
    if (tab === "all") {
      setRoleFilter("all");
    } else {
      setRoleFilter(tab);
    }
  };

  return (
    <div className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-md overflow-hidden flex flex-col gap-4 p-1 shadow-md">
      {/* Tabs list */}
      <div className="border-b border-border/30 w-full flex gap-6 px-5 pt-3">
        <button
          onClick={() => handleTabChange("all")}
          className={`pb-3.5 text-sm font-semibold border-b-2 transition-all cursor-pointer relative ${
            activeTab === "all"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          All Users
        </button>
        <button
          onClick={() => handleTabChange("customer")}
          className={`pb-3.5 text-sm font-semibold border-b-2 transition-all cursor-pointer relative ${
            activeTab === "customer"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Customers
        </button>
        <button
          onClick={() => handleTabChange("owner")}
          className={`pb-3.5 text-sm font-semibold border-b-2 transition-all cursor-pointer relative ${
            activeTab === "owner"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Owners
        </button>
      </div>

      {/* Grid Filters section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-5 px-5 pb-5 pt-2 items-end">
        {/* Search Users Input */}
        <div className="md:col-span-2 space-y-2">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">
            Search Users
          </span>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              type="text"
              placeholder="Name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-muted border border-transparent rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/75"
            />
          </div>
        </div>

        {/* Role Select Dropdown */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">
            sort By
          </span>
          <select
            value={roleFilter}
            onChange={(e) => {
              const val = e.target.value;
              setRoleFilter(val);
              if (val === "customer" || val === "owner") {
                setActiveTab(val as "customer" | "owner");
              } else if (val === "all") {
                setActiveTab("all");
              }
            }}
            className="w-full bg-muted border border-transparent rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value={ROLE.ADMIN}>Admin</option>
            <option value={ROLE.MANAGER}>Manager</option>
            <option value={ROLE.OWNER}>Owner</option>
            <option value={ROLE.CUSTOMER}>Customer</option>
          </select>
        </div>

        {/* Status Select Dropdown */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">
            Status
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-muted border border-transparent rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold cursor-pointer"
          >
            <option value={FILTER_STATUS.ALL}>Any Status</option>
            <option value={FILTER_STATUS.ACTIVE}>Active</option>
            <option value={FILTER_STATUS.BLOCKED}>Blocked</option>
          </select>
        </div>

        {/* Toggles switches Container */}
        <div className="md:col-span-2 flex flex-row items-center gap-5 pb-1 select-none">
          {/* High Cancellation Toggle Switch */}
          <div 
            onClick={() => setHighCancellation(!highCancellation)}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 flex items-center ${
              highCancellation ? "bg-primary/25 border border-primary/30" : "bg-muted"
            }`}>
              <div className={`w-4 h-4 rounded-full shadow transition-transform duration-200 ${
                highCancellation ? "translate-x-4 bg-primary" : "bg-muted-foreground"
              }`} />
            </div>
            <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              High Cancellation
            </span>
          </div>

          {/* Fraud Flag Toggle Switch */}
          <div 
            onClick={() => setFraudFlag(!fraudFlag)}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 flex items-center ${
              fraudFlag ? "bg-rose-500/25 border border-rose-500/30" : "bg-muted"
            }`}>
              <div className={`w-4 h-4 rounded-full shadow transition-transform duration-200 ${
                fraudFlag ? "translate-x-4 bg-rose-400" : "bg-muted-foreground"
              }`} />
            </div>
            <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              Fraud Flag
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterCard;
