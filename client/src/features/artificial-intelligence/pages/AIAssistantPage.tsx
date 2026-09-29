import React from "react"
import { useAIChat } from "../hooks/useAIChat"
import { AIEmptyHero } from "../components/AIEmptyHero"
import { AIPromptInput } from "../components/AIPromptInput"
import { AISuggestionChips } from "../components/AISuggestionChips"
import { AIMessageList } from "../components/AIMessageList"
import { Plus } from "lucide-react"

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
    <div className="h-full flex-1 flex flex-col bg-background text-foreground transition-colors duration-300 overflow-hidden">
      <div className="relative z-10 flex-1 flex flex-col w-full max-w-3xl mx-auto px-4 sm:px-6 h-full min-h-0 overflow-hidden">
        {!hasMessages ? (
          // ================= EMPTY STATE (Strictly locked to viewport, zero Y-scroll) =================
          <div className="flex-1 flex flex-col items-center justify-center my-auto py-2 overflow-hidden select-none">
            <AIEmptyHero />

            <div className="w-full mt-4 sm:mt-6">
              <AIPromptInput
                value={activePrompt}
                onChange={setActivePrompt}
                onSubmit={() => sendMessage()}
                isLoading={isLoading}
                isCentered
              />
            </div>

            <AISuggestionChips onSelect={(prompt) => sendMessage(prompt)} disabled={isLoading} />
          </div>
        ) : (
          // ================= CONVERSATION VIEW (Middle feed scrolls, input docked) =================
          <div className="flex-1 flex flex-col justify-between w-full h-full min-h-0 overflow-hidden">
            {/* Minimal Session Header */}
            <div className="shrink-0 flex items-center justify-between pb-3 pt-2 mb-1 border-b border-border/50">
              <span className="text-sm font-semibold tracking-tight text-foreground/80">
                WashQueue Assistant
              </span>

              <button
                type="button"
                onClick={clearMessages}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
                title="Start a new chat"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Chat</span>
              </button>
            </div>

            {/* Scrollable Conversation Stream */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-2 min-h-0">
              <AIMessageList messages={messages} onRetry={retryLastMessage} />
            </div>

            {/* Bottom Docked Input */}
            <div className="shrink-0 pt-2 pb-4 bg-gradient-to-t from-background via-background/95 to-transparent">
              <AIPromptInput
                value={activePrompt}
                onChange={setActivePrompt}
                onSubmit={() => sendMessage()}
                isLoading={isLoading}
                placeholder="Ask a follow-up question..."
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AIAssistantPage
