import { useNavigate } from "react-router-dom"
import { Smartphone, Globe } from "lucide-react"

export default function CTASection() {
  const navigate = useNavigate()

  return (
    <section className="py-20 md:py-28 max-w-5xl mx-auto px-6">
      <div className="p-8 sm:p-16 rounded-[2.5rem] bg-gradient-to-tr from-sky-400 to-blue-600 dark:from-primary/95 dark:to-blue-600 text-foreground shadow-2xl relative overflow-hidden text-center flex flex-col items-center space-y-6">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-background/20 rounded-full blur-3xl pointer-events-none" />

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight max-w-2xl leading-none">
          Stop Waiting in Line.
          <br />
          Start Booking Smart.
        </h2>

        <p className="text-base sm:text-lg opacity-90 max-w-xl font-medium leading-relaxed">
          Join thousands of premium car owners who have reclaimed their time with the WashQueue
          network.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full sm:w-auto">
          <button
            onClick={() => navigate("/login")}
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-background text-foreground font-bold hover:bg-slate-900 transition-colors shadow-lg cursor-pointer"
          >
            <Smartphone className="mr-2 h-5 w-5" />
            Download for iOS
          </button>
          <button
            onClick={() => navigate("/login")}
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl border border-white/30 bg-white/10 hover:bg-white/20 text-foreground font-bold transition-colors cursor-pointer"
          >
            <Globe className="mr-2 h-5 w-5" />
            Get Access for Web
          </button>
        </div>
      </div>
    </section>
  )
}
