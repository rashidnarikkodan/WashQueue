import { beforeEach, describe, expect, it, vi } from "vitest"

const mockEnv = vi.hoisted(() => ({
  GEMINI_API_KEY: "test-api-key",
  GEMINI_BASE_URL: "https://generativelanguage.googleapis.com/",
  GEMINI_MODEL: "gemini-test",
}))

vi.mock("@/configs/env.config", () => ({ default: mockEnv }))

import { GeminiProvider } from "../gemini.llm"

describe("GeminiProvider", () => {
  const provider = new GeminiProvider()

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it("sends the prompt and generation options and returns generated content", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          candidates: [{ content: { parts: [{ text: "  Generated " }, { text: "answer  " }] } }],
        }),
        { status: 200 }
      )
    )
    vi.stubGlobal("fetch", fetchMock)

    await expect(
      provider.generate({
        prompt: "User prompt",
        systemPrompt: "System prompt",
        temperature: 0.7,
        maxTokens: 128,
      })
    ).resolves.toEqual({ content: "Generated answer" })

    expect(fetchMock).toHaveBeenCalledWith(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-test:generateContent",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": "test-api-key",
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: "User prompt" }] }],
          systemInstruction: { parts: [{ text: "System prompt" }] },
          generationConfig: { maxOutputTokens: 128, temperature: 0.7 },
        }),
      })
    )
  })

  it("includes the Gemini API error when the request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ error: { message: "Invalid API key" } }), { status: 401 })
        )
    )

    await expect(provider.generate({ prompt: "User prompt" })).rejects.toThrow(
      "Gemini request failed: Invalid API key"
    )
  })

  it("falls back to status text when error body is not valid JSON", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response("Gateway Timeout", { status: 504, statusText: "Gateway Timeout" })
        )
    )

    await expect(provider.generate({ prompt: "User prompt" })).rejects.toThrow(
      "Gemini request failed: 504 Gateway Timeout"
    )
  })

  it("throws AppError on request timeout", async () => {
    const timeoutError = new Error("The operation was aborted due to timeout")
    timeoutError.name = "TimeoutError"

    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(timeoutError))

    await expect(provider.generate({ prompt: "User prompt" })).rejects.toThrow(
      "AI generation timed out after 45s."
    )
  })
})
