import type { ReactNode } from "react"
import { Droplets } from "lucide-react"

interface SplitAuthLayoutProps {
  side: "left" | "right"
  title: string
  description: string
  promptText?: string
  buttonText?: string
  onRedirectClick?: () => void
  footerElement?: ReactNode
  showLogo?: boolean
  centerBranding?: boolean
  children: ReactNode
}

export default function SplitAuthLayout({
  side,
  title,
  description,
  promptText,
  buttonText,
  onRedirectClick,
  footerElement,
  showLogo = true,
  centerBranding = false,
  children,
}: SplitAuthLayoutProps) {
  const isBlueOnLeft = side === "left"

  const brandingPanel = (
    <div
      className={`flex flex-col justify-between p-8 md:p-16 bg-primary text-primary-foreground shadow-xl relative overflow-hidden h-[300px] md:h-full min-h-[300px] md:min-h-screen ${
        isBlueOnLeft
          ? "md:rounded-r-[100px] rounded-b-[40px] md:rounded-bl-none order-1 md:order-1"
          : "md:rounded-l-[100px] rounded-b-[40px] md:rounded-br-none order-1 md:order-2"
      }`}
    >
      {/* Background Decor Glow */}
      <div className="absolute right-[-50px] top-[-50px] h-[300px] w-[300px] rounded-full bg-primary-foreground/10 filter blur-3xl"></div>

      {/* Brand Header */}
      {showLogo ? (
        <div className="flex items-center gap-2 z-10">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground text-primary font-bold shadow-lg">
            <Droplets className="h-5 w-5" />
          </div>
          <span className="text-2xl font-bold italic tracking-tight">WashQueue</span>
        </div>
      ) : (
        <div />
      )}

      {/* Central Message */}
      <div
        className={`my-auto space-y-4 max-w-lg z-10 ${
          centerBranding ? "text-center mx-auto flex flex-col items-center justify-center" : ""
        }`}
      >
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
          {title}
        </h1>
        <p className="text-base md:text-lg opacity-90 font-light">{description}</p>
      </div>

      {/* Bottom Footer or Redirect Button */}
      {(footerElement || (buttonText && onRedirectClick)) && (
        <div
          className={`flex flex-col gap-3 md:gap-4 z-10 pt-4 border-t border-primary-foreground/20 ${
            centerBranding ? "items-center text-center justify-center" : ""
          }`}
        >
          {footerElement ? (
            footerElement
          ) : (
            <>
              {promptText && (
                <span className="text-xs md:text-sm font-medium opacity-80">{promptText}</span>
              )}
              <button
                onClick={onRedirectClick}
                className="w-full md:w-56 py-3 px-6 bg-muted hover:bg-muted/80 text-foreground font-bold rounded-xl transition-all duration-200 shadow-md text-sm cursor-pointer"
              >
                {buttonText}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )

  const formPanel = (
    <div
      className={`flex flex-col justify-center items-center p-8 md:p-16 bg-background min-h-screen ${
        isBlueOnLeft ? "order-2 md:order-2" : "order-2 md:order-1"
      }`}
    >
      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
        {children}
      </div>
    </div>
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 w-full min-h-screen bg-background overflow-x-hidden">
      {isBlueOnLeft ? (
        <>
          {brandingPanel}
          {formPanel}
        </>
      ) : (
        <>
          {formPanel}
          {brandingPanel}
        </>
      )}
    </div>
  )
}
