export function AIEmptyHero() {
  return (
    <div className="flex flex-col items-center text-center px-4 pb-2 animate-in fade-in duration-200">
      {/* Standalone large Qyn logo */}
      <div className="mb-5 flex items-center justify-center">
        <img
          src="/QynAi.png"
          alt="Qyn"
          className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-lg"
          draggable={false}
        />
      </div>

      {/* Title with Gemini/ChatGPT style gradient accent */}
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground leading-tight">
        <span className="bg-linear-to-r from-blue-500 via-blue-600 to-blue-800 bg-clip-text text-transparent font-bold">
          Hello!
        </span>
        <br />
        <span className="text-foreground/90 font-medium">How can I help you today?</span>
      </h1>

      {/* Subtitle */}
      <p className="mt-3 text-xs sm:text-sm text-muted-foreground/80 max-w-md leading-relaxed font-normal">
        Ask about live wash queues, bay status, service packages, station locations, or booking
        policies.
      </p>
    </div>
  )
}

export default AIEmptyHero
