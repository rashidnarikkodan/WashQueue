import { useNavigate, useLocation } from "react-router-dom";
import LoginForm from "../components/ui/LoginForm";
import RegisterForm from "../components/ui/RegisterForm";

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Detect whether we are in sign-up mode based on pathname
  const isRegister = location.pathname.startsWith("/register");

  return (
    <div className="w-full min-h-screen bg-background text-foreground">
      {/* 1. DESKTOP VIEW WITH DOUBLE SLIDING ANIMATION */}
      <div className="relative w-full min-h-screen bg-background overflow-hidden hidden md:flex items-stretch">
        
        {/* Left Column (Hosts Register Form) */}
        <div className="w-1/2 flex items-center justify-center p-8 md:p-16 z-10">
          <div
            className={`w-full max-w-md transition-all duration-700 ease-in-out ${
              isRegister
                ? "opacity-100 translate-x-0 scale-100 pointer-events-auto"
                : "opacity-0 -translate-x-12 scale-95 pointer-events-none"
            }`}
          >
            <RegisterForm />
          </div>
        </div>

        {/* Right Column (Hosts Login Form) */}
        <div className="w-1/2 flex items-center justify-center p-8 md:p-16 z-10">
          <div
            className={`w-full max-w-md transition-all duration-700 ease-in-out ${
              !isRegister
                ? "opacity-100 translate-x-0 scale-100 pointer-events-auto"
                : "opacity-0 translate-x-12 scale-95 pointer-events-none"
            }`}
          >
            <LoginForm />
          </div>
        </div>

        {/* Absolutely Positioned Sliding Blue Card */}
        <div
          className={`absolute top-0 bottom-0 left-0 w-1/2 h-full bg-primary text-primary-foreground shadow-2xl z-20 transition-all duration-700 ease-in-out flex flex-col justify-center items-center p-8 md:p-16 overflow-hidden ${
            isRegister
              ? "translate-x-full rounded-l-[100px]"
              : "translate-x-0 rounded-r-[100px]"
          }`}
        >
          {/* Centered Switch Panel */}
          <div className="relative w-full max-w-md h-[320px] flex items-center justify-center z-10">
            {/* View shown during Register state (shows Login redirect) */}
            <div
              className={`absolute inset-0 flex flex-col items-center justify-center text-center space-y-5 transition-all duration-500 ease-in-out ${
                isRegister
                  ? "opacity-100 scale-100 pointer-events-auto delay-200"
                  : "opacity-0 scale-95 pointer-events-none"
              }`}
            >
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Welcome to WashQueue
              </h1>
              <p className="text-sm md:text-base opacity-90 max-w-xs leading-relaxed">
                Book nearby vehicle washes without waiting in line.
              </p>
              <div className="flex flex-col items-center space-y-3 pt-2">
                <span className="text-xs md:text-sm font-medium opacity-85">
                  Already have an account?
                </span>
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="w-48 py-3 bg-muted hover:bg-muted/80 text-foreground font-bold rounded-xl transition-all duration-200 shadow-md text-sm cursor-pointer"
                >
                  Login
                </button>
              </div>
            </div>

            {/* View shown during Login state (shows SignUp redirect) */}
            <div
              className={`absolute inset-0 flex flex-col items-center justify-center text-center space-y-5 transition-all duration-500 ease-in-out ${
                !isRegister
                  ? "opacity-100 scale-100 pointer-events-auto delay-200"
                  : "opacity-0 scale-95 pointer-events-none"
              }`}
            >
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Welcome Back
              </h1>
              <p className="text-sm md:text-base opacity-90 max-w-xs leading-relaxed">
                Book nearby vehicle washes without waiting in line.
              </p>
              <div className="flex flex-col items-center space-y-3 pt-2">
                <span className="text-xs md:text-sm font-medium opacity-85">
                  Don’t you have an Account?
                </span>
                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  className="w-48 py-3 bg-muted hover:bg-muted/80 text-foreground font-bold rounded-xl transition-all duration-200 shadow-md text-sm cursor-pointer"
                >
                  SignUp
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MOBILE VIEW WITH CLEAN SWITCHING TRANSITION */}
      <div className="flex flex-col min-h-screen bg-background md:hidden">
        {/* Static Header Panel */}
        <div className="h-[280px] bg-gradient-to-tr from-primary to-primary/80 text-primary-foreground rounded-b-[40px] p-8 flex flex-col justify-between relative overflow-hidden shadow-lg shrink-0">
          {/* Background Decor Glow */}
          <div className="absolute right-[-50px] top-[-50px] h-[200px] w-[200px] rounded-full bg-white/10 filter blur-2xl"></div>


          {/* Message Area */}
          <div className="relative h-40 text-center w-full z-10">
            {/* Login Card Content */}
            <div
              className={`absolute inset-0 flex flex-col justify-center space-y-1 transition-all duration-500 ease-in-out ${
                isRegister ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100 pointer-events-auto"
              }`}
            >
              <h1 className="text-2xl font-extrabold tracking-tight">Welcome Back</h1>
              <p className="text-xs opacity-90 font-light">
                Book nearby vehicle washes without waiting in line.
              </p>
            </div>

            {/* Register Card Content */}
            <div
              className={`absolute inset-0 flex flex-col justify-center space-y-1 transition-all duration-500 ease-in-out ${
                isRegister ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"
              }`}
            >
              <h1 className="text-2xl font-extrabold tracking-tight">Welcome to WashQueue</h1>
              <p className="text-xs opacity-90 font-light">
                Book nearby vehicle washes without waiting in line.
              </p>
            </div>
          </div>

          {/* Switch Prompt */}
          <div className="relative h-12 w-full border-t border-primary-foreground/20 pt-2 z-10 flex items-center justify-between">
            <div
              className={`absolute inset-x-0 bottom-0 flex items-center justify-between transition-all duration-500 ${
                isRegister ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"
              }`}
            >
              <span className="text-xs font-medium opacity-85">Don't have an account?</span>
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="py-1.5 px-4 bg-primary-foreground/15 hover:bg-primary-foreground/25 text-primary-foreground font-bold rounded-lg text-xs cursor-pointer"
              >
                SignUp
              </button>
            </div>

            <div
              className={`absolute inset-x-0 bottom-0 flex items-center justify-between transition-all duration-500 ${
                isRegister ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
              }`}
            >
              <span className="text-xs font-medium opacity-85">Already have an account?</span>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="py-1.5 px-4 bg-primary-foreground/15 hover:bg-primary-foreground/25 text-primary-foreground font-bold rounded-lg text-xs cursor-pointer"
              >
                Login
              </button>
            </div>
          </div>
        </div>

        {/* Content Panel */}
        <div className="flex-1 p-6 flex items-start justify-center overflow-y-auto">
          <div className="relative w-full max-w-md pt-4">
            {/* Login form block */}
            <div
              className={`w-full transition-all duration-500 ease-in-out ${
                !isRegister
                  ? "opacity-100 translate-y-0 pointer-events-auto relative"
                  : "opacity-0 -translate-y-4 pointer-events-none absolute inset-x-0 top-0"
              }`}
            >
              <LoginForm />
            </div>

            {/* Register form block */}
            <div
              className={`w-full transition-all duration-500 ease-in-out ${
                isRegister
                  ? "opacity-100 translate-y-0 pointer-events-auto relative"
                  : "opacity-0 translate-y-4 pointer-events-none absolute inset-x-0 top-0"
              }`}
            >
              <RegisterForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
