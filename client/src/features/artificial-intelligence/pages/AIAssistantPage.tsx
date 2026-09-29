import React from "react"
import { useAIChat } from "../hooks/useAIChat"
import { AIEmptyHero } from "../components/AIEmptyHero"
import { AIPromptInput } from "../components/AIPromptInput"
import { AISuggestionChips } from "../components/AISuggestionChips"
import { AIMessageList } from "../components/AIMessageList"
import { PlusCircle, Sparkles } from "lucide-react"

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
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-blue-500/10 via-indigo-500/10 to-purple-500/5 rounded-full blur-3xl opacity-60" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {!hasMessages ? (
          // ================= CENTERED VIEW (Initial Prompt Mode) =================
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
          // ================= CONVERSATION VIEW (Active Messages) =================
          <div className="flex-1 flex flex-col justify-between max-w-4xl mx-auto w-full">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-border/60">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold tracking-tight text-foreground">
                  AI Knowledge Assistant
                </span>
              </div>

              <button
                type="button"
                onClick={clearMessages}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-border/80 hover:border-primary/50 text-xs font-semibold text-foreground hover:text-primary transition-all duration-200 cursor-pointer shadow-xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>New Question</span>
              </button>
            </div>

            {/* Scrollable Messages Stream */}
            <AIMessageList messages={messages} onClear={clearMessages} onRetry={retryLastMessage} />

            {/* Bottom Docked Input */}
            <div className="sticky bottom-4 z-20 pt-2 pb-1 bg-background/80 backdrop-blur-md">
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
