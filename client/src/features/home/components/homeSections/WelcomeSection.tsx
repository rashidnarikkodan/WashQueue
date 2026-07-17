import { useAuthStore } from "@/features/auth/store/authStore";
import { MOCK_DASHBOARD_DATA } from "../../mock/dashboard.mock";
import { getGreeting } from "@/shared/utils/greeting";

export default function WelcomeSection() {
  const { user } = useAuthStore();
  const data = MOCK_DASHBOARD_DATA;

  return (
    <div className="space-y-2 mb-12 animate-in fade-in slide-in-from-top-4 duration-500 text-left">
      <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight leading-none">
        {getGreeting()}, <span className="text-primary">{user?.name || data.user.name}</span>
      </h1>
      <p className="text-base md:text-lg text-muted-foreground font-medium">
        Ready for a fresh wash today?
      </p>
    </div>
  );
}
