import type { ChangeEvent } from "react"

interface FormSwitchProps {
  label?: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  id?: string
  name?: string
  description?: string
  className?: string
}

export default function FormSwitch({
  label,
  checked,
  onChange,
  disabled,
  id,
  name,
  description,
  className = "",
}: FormSwitchProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked)
  }

  const widthClass = className.includes("w-") ? "" : "w-full"

  return (
    <div className={`flex flex-col gap-1.5 ${widthClass} ${className}`}>
      <div className="flex items-center gap-3 select-none">
        <label className="inline-flex items-center gap-3 cursor-pointer select-none">
          <input
            id={id}
            name={name}
            type="checkbox"
            checked={checked}
            onChange={handleChange}
            disabled={disabled}
            className="sr-only peer"
          />
          <div className="relative w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary peer-checked:after:bg-foreground disabled:opacity-50"></div>
          {label && <span className="text-sm font-semibold text-slate-300">{label}</span>}
        </label>
      </div>
      {description && (
        <span className="text-[11px] text-muted-foreground pl-12 text-left">{description}</span>
      )}
    </div>
  )
}
