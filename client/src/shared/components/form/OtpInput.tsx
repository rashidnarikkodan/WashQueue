import { useRef, useEffect } from "react"
import type { KeyboardEvent, ClipboardEvent } from "react"
import { toast } from "sonner"

interface OtpInputProps {
  value: string[]
  onChange: (value: string[]) => void
  disabled?: boolean
}

export default function OtpInput({ value, onChange, disabled = false }: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Focus the first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const handleDigitChange = (index: number, val: string) => {
    const lastChar = val.slice(-1)
    if (/^[0-9]$/.test(lastChar) || lastChar === "") {
      const nextDigits = [...value]
      nextDigits[index] = lastChar
      onChange(nextDigits)

      if (lastChar !== "" && index < 5) {
        inputRefs.current[index + 1]?.focus()
      }
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (value[index] === "" && index > 0) {
        const nextDigits = [...value]
        nextDigits[index - 1] = ""
        onChange(nextDigits)
        inputRefs.current[index - 1]?.focus()
        e.preventDefault()
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus()
      e.preventDefault()
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus()
      e.preventDefault()
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasteData = e.clipboardData.getData("text").trim()
    if (/^\d{6}$/.test(pasteData)) {
      const newDigits = pasteData.split("")
      onChange(newDigits)
      inputRefs.current[5]?.focus()
      toast.success("Code pasted successfully!")
    } else {
      toast.error("Please paste a valid 6-digit code")
    }
  }

  return (
    <div className="flex justify-start gap-2.5 md:gap-3">
      {value.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            inputRefs.current[i] = el
          }}
          type="text"
          value={digit}
          onChange={(e) => handleDigitChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          inputMode="numeric"
          pattern="[0-9]*"
          className="w-12 h-12 sm:w-14 sm:h-14 md:w-12 md:h-12 lg:w-14 lg:h-14 bg-muted/20 border border-border rounded-xl text-center font-extrabold text-foreground text-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
          autoFocus={i === 0}
          disabled={disabled}
        />
      ))}
    </div>
  )
}
