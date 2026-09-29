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
    <div className="min-h-[calc(100vh-5rem)] flex flex-col bg-background text-foreground transition-colors duration-300">
      <div className="relative z-10 flex-1 flex flex-col w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {!hasMessages ? (
          // ================= EMPTY STATE (Initial Prompt Mode) =================
          <div className="flex-1 flex flex-col items-center justify-center my-auto py-8">
            <AIEmptyHero />

            <div className="w-full mt-6">
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
          // ================= CONVERSATION VIEW =================
          <div className="flex-1 flex flex-col justify-between w-full h-full">
            {/* Minimal Header */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-border/50">
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

            {/* Messages Feed */}
            <AIMessageList messages={messages} onRetry={retryLastMessage} />

            {/* Bottom Docked Input */}
            <div className="sticky bottom-4 z-20 pt-3 pb-1 bg-gradient-to-t from-background via-background/95 to-transparent">
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
