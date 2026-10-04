import type { ReactNode } from "react"
import SelectInput from "./SelectInput"

interface Option {
  value: string
  label: string
}

interface FormSelectProps {
  label?: string
  labelRight?: ReactNode
  name?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
  options: Option[]
  placeholder?: string
  error?: string
  id?: string
  leftIcon?: ReactNode
  disabled?: boolean
  required?: boolean
  className?: string
}

export default function FormSelect({
  label,
  labelRight,
  name,
  value,
  onChange,
  options,
  placeholder,
  error,
  id,
  leftIcon,
  disabled,
  required,
  className = "",
}: FormSelectProps) {
  return (
    <SelectInput
      id={id}
      name={name}
      label={label}
      labelRight={labelRight}
      value={value}
      onChange={(val) => {
        if (onChange) {
          const syntheticEvent = {
            target: { value: val, name },
          } as React.ChangeEvent<HTMLSelectElement>
          onChange(syntheticEvent)
        }
      }}
      options={options}
      placeholder={placeholder}
      error={error}
      leftIcon={leftIcon}
      disabled={disabled}
      required={required}
      className={className}
    />
  )
}
