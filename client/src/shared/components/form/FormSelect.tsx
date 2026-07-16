import type { ReactNode } from "react"

interface Option {
  value: string
  label: string
}

interface FormSelectProps {
  label: string
  name?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
  options: Option[]
  placeholder?: string
  error?: string
  id?: string
  leftIcon?: ReactNode
}

export default function FormSelect({
  label,
  name,
  value,
  onChange,
  options,
  placeholder,
  error,
  id,
  leftIcon,
}: FormSelectProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full relative">
      <label
        htmlFor={id}
        className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1 text-left"
      >
        {label}
      </label>
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3.5 text-muted-foreground z-10 flex items-center pointer-events-none">
            {leftIcon}
          </div>
        )}
        <select
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full bg-muted border rounded-xl pr-10 py-3 text-sm text-foreground outline-none transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary/85 font-semibold cursor-pointer ${
            leftIcon ? "pl-11" : "pl-3.5"
          } ${
            error
              ? "border-red-500/80 focus:ring-red-500/20"
              : "border-border/80 hover:border-border"
          }`}
        >
          {placeholder && (
            <option value="" className="text-slate-600">
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <span className="text-[11px] text-red-400 font-medium pl-1 animate-in fade-in slide-in-from-top-1 duration-200 text-left">
          {error}
        </span>
      )}
    </div>
  )
}
