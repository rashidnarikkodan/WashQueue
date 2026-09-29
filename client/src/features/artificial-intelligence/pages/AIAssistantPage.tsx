import React from "react"
import { useAIChat } from "../hooks/useAIChat"
import { AIEmptyHero } from "../components/AIEmptyHero"
import { AIPromptInput } from "../components/AIPromptInput"
import { AISuggestionChips } from "../components/AISuggestionChips"
import { AIMessageList } from "../components/AIMessageList"
import { SquarePen } from "lucide-react"

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
    <div className="h-full flex-1 flex flex-col bg-background text-foreground overflow-hidden">
      {!hasMessages ? (
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 overflow-y-auto">
          <div className="w-full max-w-2xl flex flex-col items-center gap-0">
            <AIEmptyHero />

            {/* Composer */}
            <div className="w-full mt-8">
              <AIPromptInput
                value={activePrompt}
                onChange={setActivePrompt}
                onSubmit={() => sendMessage()}
                isLoading={isLoading}
                isCentered
              />
            </div>

            {/* Suggestion cards */}
            <div className="w-full">
              <AISuggestionChips onSelect={(prompt) => sendMessage(prompt)} disabled={isLoading} />
            </div>
          </div>
        </div>
      ) : (
        // ── CONVERSATION STATE ─────────────────────────────────────────────
        <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden">
          {/* Session header */}
          <div className="shrink-0 border-b border-border">
            <div className="max-w-2xl mx-auto w-full px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-lg bg-card border border-border flex items-center justify-center"
                  style={{ boxShadow: "0 2px 8px rgb(var(--primary) / 0.12)" }}
                >
                  <img src="/qyn-logo.svg" alt="" aria-hidden className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold text-foreground">Qyn</span>
                <span className="hidden sm:inline text-xs text-muted-foreground/50">
                  · WashQueue Assistant
                </span>
              </div>

              <button
                type="button"
                onClick={clearMessages}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-transparent hover:border-border transition-all duration-150 cursor-pointer"
                title="New conversation"
              >
                <SquarePen className="w-3.5 h-3.5" />
                <span>New chat</span>
              </button>
            </div>
          </div>

          {/* Message stream */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="max-w-2xl mx-auto w-full px-4 py-4">
              <AIMessageList messages={messages} onRetry={retryLastMessage} />
            </div>
          </div>

          {/* Docked composer */}
          <div className="shrink-0 border-t border-border bg-background">
            <div className="max-w-2xl mx-auto w-full px-4 py-4">
              <AIPromptInput
                value={activePrompt}
                onChange={setActivePrompt}
                onSubmit={() => sendMessage()}
                isLoading={isLoading}
                placeholder="Follow up with Qyn..."
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AIAssistantPage
