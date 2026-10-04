import React from "react"
import { useAIChat } from "../hooks/useAIChat"
import { AIEmptyHero } from "../components/AIEmptyHero"
import { AIPromptInput } from "../components/AIPromptInput"
import { AISuggestionChips } from "../components/AISuggestionChips"
import { AIMessageList } from "../components/AIMessageList"
import { PenBoxIcon } from "lucide-react"

export const AIAssistantPage: React.FC = () => {
  const {
    messages,
    isLoading,
    activePrompt,
    setActivePrompt,
    sendMessage,
    retryLastMessage,
    clearMessages,
  } = useAIChat()

  const hasMessages = messages.length > 0

  return (
    <div className="flex-1 min-h-0 w-full flex flex-col bg-background text-foreground overflow-hidden">
      <div className="shrink-0 z-10 bg-background/90 backdrop-blur-md">
        <div className="max-w-3xl sm:max-w-4xl mx-auto w-full px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Left: Branding & Status */}
          <div className="flex items-center gap-3">
            <img
              src="/QynAi.png"
              alt="Qyn"
              className="w-9 h-9 sm:w-10 sm:h-10 object-contain shrink-0"
              draggable={false}
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-bold tracking-tight text-foreground">
                  Qyn
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-muted-foreground hidden sm:block font-normal">
                WashQueue AI Assistant & Support
              </p>
            </div>
          </div>

          {/* Right: Curved, sleek New Chat button like ChatGPT / Gemini */}
          <button
            type="button"
            onClick={clearMessages}
            disabled={!hasMessages && !activePrompt}
            className={`h-9 sm:h-10 px-4 sm:px-5 rounded-xl border text-xs sm:text-sm font-semibold tracking-wide transition-all duration-150 flex items-center gap-2 select-none shadow-xs ${
              hasMessages || activePrompt
                ? "border-border/80 hover:border-primary/50 bg-card hover:bg-muted text-foreground cursor-pointer active:scale-[0.98]"
                : "border-border/40 bg-muted/30 text-muted-foreground/40 cursor-not-allowed opacity-50"
            }`}
            title="Start a new chat session"
          >
            <PenBoxIcon className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* ── Main Content Area ──────────────────────────────────────────────── */}
      {!hasMessages ? (
        // Empty state view
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center px-4 sm:px-6 py-6 overflow-y-auto">
          <div className="w-full max-w-3xl sm:max-w-4xl flex flex-col items-center my-auto">
            <AIEmptyHero />

            {/* Composer in empty state */}
            <div className="w-full mt-6 sm:mt-8">
              <AIPromptInput
                value={activePrompt}
                onChange={setActivePrompt}
                onSubmit={() => sendMessage()}
                isLoading={isLoading}
                isCentered
              />
            </div>

            {/* Suggestion cards */}
            <div className="w-full mt-4">
              <AISuggestionChips onSelect={(prompt) => sendMessage(prompt)} disabled={isLoading} />
            </div>
          </div>
        </div>
      ) : (
        // Conversation state view
        <div className="flex-1 min-h-0 flex flex-col w-full overflow-hidden">
          {/* Message stream */}
          <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 scroll-smooth">
            <div className="max-w-3xl sm:max-w-4xl mx-auto w-full pt-2 pb-6">
              <AIMessageList messages={messages} onRetry={retryLastMessage} />
            </div>
          </div>

          {/* Sticky Docked Composer at bottom without awkward gradient overlays */}
          <div className="shrink-0 bg-background/95 backdrop-blur-md pb-4 sm:pb-5 pt-2 px-4 sm:px-6">
            <div className="max-w-3xl sm:max-w-4xl mx-auto w-full">
              <AIPromptInput
                value={activePrompt}
                onChange={setActivePrompt}
                onSubmit={() => sendMessage()}
                isLoading={isLoading}
                placeholder="Ask Qyn anything about wait times, bookings, packages, or policies..."
              />
              <p className="text-[11px] sm:text-xs text-muted-foreground/50 text-center mt-2 font-normal select-none">
                Qyn is an AI assistant and may make mistakes. Verify critical booking and service
                details.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AIAssistantPage
