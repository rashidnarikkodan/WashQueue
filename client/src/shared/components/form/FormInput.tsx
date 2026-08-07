import { useState } from "react"
import type { ChangeEvent, ReactNode } from "react"
import { Eye, EyeOff } from "lucide-react"

interface FormInputProps {
  label?: string
  type: string
  placeholder?: string
  name?: string
  value?: string | number
  defaultValue?: string
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void
  error?: string
  autoComplete?: string
  required?: boolean
  disabled?: boolean
  id?: string
  prefix?: ReactNode
  leftIcon?: ReactNode
  onlyNumbers?: boolean
  maxLength?: number
}

export default function FormInput({
  label,
  type,
  placeholder = "",
  name,
  value,
  defaultValue,
  onChange,
  error,
  autoComplete,
  required,
  disabled,
  id,
  prefix,
  leftIcon,
  onlyNumbers,
  maxLength,
}: FormInputProps) {
  const [showPassword, setShowPassword] = useState(false)

  const isPassword = type === "password"
  const inputType = isPassword ? (showPassword ? "text" : "password") : type
  const isNumericOnly = type === "tel" || onlyNumbers

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isNumericOnly) {
      const isControlKey =
        [
          "Backspace",
          "Delete",
          "Tab",
          "Escape",
          "Enter",
          "ArrowLeft",
          "ArrowRight",
          "ArrowUp",
          "ArrowDown",
          "Home",
          "End",
        ].includes(e.key) ||
        e.ctrlKey ||
        e.metaKey

      if (!isControlKey && !/^\d$/.test(e.key)) {
        e.preventDefault()
      }
    }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (isNumericOnly) {
      const rawValue = e.target.value
      const sanitized = rawValue.replace(/\D/g, "")
      if (sanitized !== rawValue) {
        e.target.value = sanitized
      }
    }
    onChange?.(e)
  }

  const prefixPadding = typeof prefix === "string" && prefix.length <= 3 ? "pl-12" : "pl-24"

  return (
    <div className="flex flex-col gap-1.5 w-full relative">
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1 text-left"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {prefix && (
          <div className="absolute left-0 top-0 bottom-0 flex items-center px-3 border-r border-border/80 bg-muted/50 text-muted-foreground text-xs font-bold rounded-l-xl select-none z-10">
            {prefix}
          </div>
        )}
        {leftIcon && !prefix && (
          <div className="absolute left-3.5 text-muted-foreground z-10 flex items-center pointer-events-none">
            {leftIcon}
          </div>
        )}
        <input
          id={id}
          name={name}
          type={inputType}
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          onKeyDown={handleKeyDown}
          onChange={handleChange}
          autoComplete={autoComplete}
          required={required}
          disabled={disabled}
          maxLength={maxLength}
          className={`w-full bg-muted/90 text-foreground border rounded-xl pr-4 py-2.5 text-sm placeholder-muted-foreground/80 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/80 transition-all duration-200 ${
            prefix ? prefixPadding : leftIcon ? "pl-11" : "pl-4"
          } ${
            error
              ? "border-red-500/80 focus:ring-red-500/20 focus:border-red-500"
              : "border-border/80 hover:border-border"
          }`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 cursor-pointer z-10"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && (
        <span className="text-[11px] text-red-400 font-medium pl-1 animate-in fade-in slide-in-from-top-1 duration-200 text-left">
          {error}
        </span>
      )}
    </div>
  )
}
