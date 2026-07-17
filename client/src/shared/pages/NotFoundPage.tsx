import { useNavigate } from "react-router-dom";
import { Compass, Home as HomeIcon, ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 relative overflow-hidden select-none">
      
      {/* Ambient background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[350px] h-[350px] rounded-full bg-primary/5 filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-primary/5 filter blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg bg-card/60 border border-border rounded-3xl p-8 md:p-10 space-y-8 shadow-2xl backdrop-blur-md text-center z-10 animate-in zoom-in-95 duration-300">
        
        {/* Animated Compass Icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20 shadow-lg shadow-primary/5">
          <Compass className="h-10 w-10 stroke-[1.5] animate-spin-[spin_8s_linear_infinite]" />
        </div>

        {/* Text Header */}
        <div className="space-y-3">
          <span className="px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-xs font-bold uppercase tracking-wider text-primary">
            404 Not Found
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
            Lost in the Wash?
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            The page you are looking for doesn't exist or has been relocated in our system. Let's get you back on track.
          </p>
        </div>

        {/* Action Triggers */}
        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <button
            onClick={() => navigate("/")}
            className="flex-1 bg-primary text-primary-foreground hover:opacity-90 font-bold py-3.5 px-6 rounded-xl transition-all duration-200 text-sm cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
          >
            <HomeIcon className="h-4 w-4" />
            Go back Home
          </button>
          <button
            onClick={() => navigate(-1)}
            className="flex-1 border border-border hover:bg-muted text-foreground font-bold py-3.5 px-6 rounded-xl transition-all duration-200 text-sm cursor-pointer flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>

      </div>
    </div>
  );
}
