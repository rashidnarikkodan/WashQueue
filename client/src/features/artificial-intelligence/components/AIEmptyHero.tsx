import React from "react"

export const AIEmptyHero: React.FC = () => {
  return (
    <div className="flex flex-col items-center text-center px-4 pb-2">
      {/* Logo mark */}
      <div className="relative mb-6">
        <div
          className="w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center"
          style={{
            boxShadow:
              "0 0 0 6px rgb(var(--primary) / 0.06), 0 8px 24px rgb(var(--primary) / 0.15)",
          }}
        >
          <img
            src="/qyn-logo.svg"
            alt="Qyn"
            className="w-8 h-8"
            style={{ filter: "drop-shadow(0 0 8px rgb(var(--primary) / 0.7))" }}
            draggable={false}
          />
        </div>
      </div>

      {/* Title */}
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
        Hi, I&apos;m <span className="text-primary">Qyn</span>
      </h1>

      {/* Subtitle */}
      <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-xs leading-relaxed">
        Ask me anything about WashQueue — packages, wait times, locations, or bookings.
      </p>
    </div>
  )
}
