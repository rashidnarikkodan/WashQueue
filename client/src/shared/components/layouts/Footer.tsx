import { Link } from "react-router-dom"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-background/60 dark:bg-card/25 py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand & Copyright */}
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-center md:text-left">
          <span className="text-xl font-bold italic tracking-tight text-primary">WashQueue</span>
          <span className="text-[10px] sm:text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            © {currentYear} WASHQUEUE. ENGINEERED FOR FLUIDITY.
          </span>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest">
          <Link to="/privacy" className="hover:text-foreground transition-colors">
            Privacy
          </Link>
          <Link to="/terms" className="hover:text-foreground transition-colors">
            Terms
          </Link>
          <Link to="/security" className="hover:text-foreground transition-colors">
            Security
          </Link>
          <Link to="/status" className="hover:text-foreground transition-colors">
            Status
          </Link>
        </div>
      </div>
    </footer>
  )
}
