import {
  useState,
  useRef,
  useEffect,
  useId,
  useCallback,
  useMemo,
  type ReactNode,
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from "react"
import { ChevronDown, Check, X, Search } from "lucide-react"

export interface SelectOption<T extends string | number = string> {
  value: T
  label: string
  disabled?: boolean
  icon?: ReactNode
  description?: string
}

export interface SelectInputProps<T extends string | number = string> {
  options: SelectOption<T>[]
  value?: T
  defaultValue?: T
  onChange?: (value: T, option: SelectOption<T>) => void
  placeholder?: string
  label?: string
  labelRight?: ReactNode
  error?: string
  disabled?: boolean
  required?: boolean
  id?: string
  name?: string
  leftIcon?: ReactNode
  className?: string
  dropdownClassName?: string
  optionClassName?: string
  clearable?: boolean
  searchable?: boolean
  searchPlaceholder?: string
  noOptionsMessage?: string
}

export default function SelectInput<T extends string | number = string>({
  options,
  value,
  defaultValue,
  onChange,
  placeholder = "Select an option...",
  label,
  labelRight,
  error,
  disabled = false,
  required = false,
  id: customId,
  name,
  leftIcon,
  className = "",
  dropdownClassName = "",
  optionClassName = "",
  clearable = false,
  searchable = false,
  searchPlaceholder = "Search options...",
  noOptionsMessage = "No options found",
}: SelectInputProps<T>) {
  const generatedId = useId()
  const fieldId = customId || `select-input-${generatedId}`
  const listboxId = `listbox-${fieldId}`

  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const listboxRef = useRef<HTMLUListElement>(null)
  const optionRefs = useRef<Map<number, HTMLLIElement>>(new Map())

  const [internalValue, setInternalValue] = useState<T | undefined>(
    value !== undefined ? value : defaultValue
  )
  const [isOpen, setIsOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState<number>(-1)
  const [searchQuery, setSearchQuery] = useState("")

  const selectedValue = value !== undefined ? value : internalValue

  const selectedOption = useMemo(() => {
    return options.find((opt) => opt.value === selectedValue)
  }, [options, selectedValue])

  const filteredOptions = useMemo(() => {
    if (!searchable || !searchQuery.trim()) return options
    const q = searchQuery.toLowerCase().trim()
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        (opt.description && opt.description.toLowerCase().includes(q))
    )
  }, [options, searchable, searchQuery])

  const selectedIndexInFiltered = useMemo(() => {
    if (selectedValue === undefined) return -1
    return filteredOptions.findIndex((opt) => opt.value === selectedValue)
  }, [filteredOptions, selectedValue])

  const handleOpen = useCallback(() => {
    if (disabled) return
    setIsOpen(true)
    setSearchQuery("")
    const initIdx = selectedIndexInFiltered >= 0 ? selectedIndexInFiltered : 0
    setFocusedIndex(initIdx)
  }, [disabled, selectedIndexInFiltered])

  const handleClose = useCallback(() => {
    setIsOpen(false)
    setFocusedIndex(-1)
    setSearchQuery("")
    triggerRef.current?.focus()
  }, [])

  const handleToggle = useCallback(() => {
    if (isOpen) {
      handleClose()
    } else {
      handleOpen()
    }
  }, [isOpen, handleClose, handleOpen])

  const handleSelectOption = useCallback(
    (option: SelectOption<T>) => {
      if (option.disabled) return
      if (value === undefined) {
        setInternalValue(option.value)
      }
      onChange?.(option.value, option)
      handleClose()
    },
    [value, onChange, handleClose]
  )

  const handleClear = useCallback(
    (e: ReactMouseEvent) => {
      e.stopPropagation()
      if (disabled) return
      if (value === undefined) {
        setInternalValue(undefined)
      }
      onChange?.(undefined as unknown as T, undefined as unknown as SelectOption<T>)
    },
    [disabled, value, onChange]
  )

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setFocusedIndex(-1)
        setSearchQuery("")
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("touchstart", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("touchstart", handleClickOutside)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && searchable) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 50)
    }
  }, [isOpen, searchable])

  useEffect(() => {
    if (isOpen && focusedIndex >= 0) {
      const el = optionRefs.current.get(focusedIndex)
      if (el) {
        el.scrollIntoView({ block: "nearest", behavior: "smooth" })
      }
    }
  }, [focusedIndex, isOpen])

  const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (disabled) return

    switch (e.key) {
      case "ArrowDown": {
        e.preventDefault()
        if (!isOpen) {
          handleOpen()
          return
        }
        let nextIdx = focusedIndex + 1
        while (nextIdx < filteredOptions.length && filteredOptions[nextIdx]?.disabled) {
          nextIdx++
        }
        if (nextIdx < filteredOptions.length) {
          setFocusedIndex(nextIdx)
        }
        break
      }

      case "ArrowUp": {
        e.preventDefault()
        if (!isOpen) {
          handleOpen()
          return
        }
        let prevIdx = focusedIndex - 1
        while (prevIdx >= 0 && filteredOptions[prevIdx]?.disabled) {
          prevIdx--
        }
        if (prevIdx >= 0) {
          setFocusedIndex(prevIdx)
        }
        break
      }

      case "Enter":
      case " ": {
        if (!isOpen) {
          e.preventDefault()
          handleOpen()
          return
        }
        if (e.key === " " && searchable && document.activeElement === searchInputRef.current) {
          return
        }
        e.preventDefault()
        if (focusedIndex >= 0 && filteredOptions[focusedIndex]) {
          handleSelectOption(filteredOptions[focusedIndex])
        }
        break
      }

      case "Escape": {
        if (isOpen) {
          e.preventDefault()
          handleClose()
        }
        break
      }

      case "Tab": {
        if (isOpen) {
          setIsOpen(false)
          setFocusedIndex(-1)
          setSearchQuery("")
        }
        break
      }

      case "Home": {
        if (isOpen && filteredOptions.length > 0) {
          e.preventDefault()
          let firstIdx = 0
          while (firstIdx < filteredOptions.length && filteredOptions[firstIdx]?.disabled) {
            firstIdx++
          }
          if (firstIdx < filteredOptions.length) setFocusedIndex(firstIdx)
        }
        break
      }

      case "End": {
        if (isOpen && filteredOptions.length > 0) {
          e.preventDefault()
          let lastIdx = filteredOptions.length - 1
          while (lastIdx >= 0 && filteredOptions[lastIdx]?.disabled) {
            lastIdx--
          }
          if (lastIdx >= 0) setFocusedIndex(lastIdx)
        }
        break
      }
    }
  }

  return (
    <div ref={containerRef} className="flex flex-col gap-1.5 w-full relative">
      {name && (
        <input
          type="hidden"
          name={name}
          value={selectedValue !== undefined ? String(selectedValue) : ""}
        />
      )}

      {(label || labelRight) && (
        <div className="flex items-center justify-between">
          {label && (
            <label
              htmlFor={fieldId}
              className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1 text-left flex items-center gap-1"
            >
              <span>{label}</span>
              {required && <span className="text-destructive">*</span>}
            </label>
          )}
          {labelRight}
        </div>
      )}

      <div className="relative flex items-center w-full">
        {leftIcon && (
          <div className="absolute left-3.5 text-muted-foreground z-10 flex items-center pointer-events-none">
            {leftIcon}
          </div>
        )}

        <button
          ref={triggerRef}
          id={fieldId}
          type="button"
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls={listboxId}
          aria-label={label || placeholder}
          aria-required={required}
          aria-invalid={!!error}
          disabled={disabled}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          className={`w-full bg-muted/90 text-foreground border rounded-xl py-2.5 text-sm font-semibold flex items-center justify-between transition-all duration-200 outline-none select-none ${
            leftIcon ? "pl-11" : "pl-4"
          } ${clearable && selectedOption ? "pr-16" : "pr-10"} ${
            isOpen
              ? "border-primary ring-2 ring-primary/20"
              : error
                ? "border-destructive/80 focus:ring-2 focus:ring-destructive/20 focus:border-destructive"
                : "border-border/80 hover:border-border focus:ring-2 focus:ring-primary/20 focus:border-primary/80"
          } ${
            disabled ? "opacity-50 cursor-not-allowed bg-muted/40" : "cursor-pointer"
          } ${className}`}
        >
          <div className="flex items-center gap-2 truncate">
            {selectedOption ? (
              <>
                {selectedOption.icon && (
                  <span className="shrink-0 text-muted-foreground">{selectedOption.icon}</span>
                )}
                <span className="truncate text-foreground font-semibold">
                  {selectedOption.label}
                </span>
              </>
            ) : (
              <span className="text-muted-foreground/80 font-normal truncate">{placeholder}</span>
            )}
          </div>

          <div className="absolute right-3 flex items-center gap-1.5 text-muted-foreground pointer-events-none">
            {clearable && selectedOption && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                tabIndex={-1}
                className="pointer-events-auto p-1 rounded-md hover:bg-muted-foreground/15 hover:text-foreground transition-colors"
                aria-label="Clear selection"
              >
                <X size={14} />
              </button>
            )}
            <ChevronDown
              size={16}
              className={`transition-transform duration-200 ${
                isOpen ? "rotate-180 text-primary" : ""
              }`}
            />
          </div>
        </button>
      </div>

      {error && (
        <span className="text-[11px] text-destructive font-medium pl-1 animate-in fade-in slide-in-from-top-1 duration-200 text-left">
          {error}
        </span>
      )}

      {isOpen && (
        <div
          className={`absolute z-50 left-0 right-0 top-full mt-1.5 bg-card/95 backdrop-blur-xl border border-border/80 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 ${dropdownClassName}`}
        >
          {searchable && (
            <div className="p-2 border-b border-border/60 relative flex items-center">
              <Search
                size={14}
                className="absolute left-4 text-muted-foreground pointer-events-none"
              />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setFocusedIndex(0)
                }}
                onKeyDown={handleKeyDown}
                placeholder={searchPlaceholder}
                className="w-full bg-muted/60 text-foreground text-xs font-medium rounded-lg pl-8 pr-3 py-2 outline-none border border-border/50 focus:border-primary/60 placeholder:text-muted-foreground/70"
              />
            </div>
          )}

          <ul
            ref={listboxRef}
            id={listboxId}
            role="listbox"
            tabIndex={-1}
            aria-label={label || placeholder}
            className="max-h-60 overflow-y-auto p-1.5 pr-2 space-y-1 custom-scrollbar"
          >
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-4 text-xs font-medium text-center text-muted-foreground select-none">
                {noOptionsMessage}
              </li>
            ) : (
              filteredOptions.map((opt, idx) => {
                const isSelected = opt.value === selectedValue
                const isFocused = idx === focusedIndex

                return (
                  <li
                    key={String(opt.value)}
                    ref={(el) => {
                      if (el) optionRefs.current.set(idx, el)
                      else optionRefs.current.delete(idx)
                    }}
                    id={`${fieldId}-option-${idx}`}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={opt.disabled}
                    onClick={() => handleSelectOption(opt)}
                    onMouseEnter={() => !opt.disabled && setFocusedIndex(idx)}
                    className={`px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-between transition-colors select-none ${
                      opt.disabled
                        ? "opacity-40 cursor-not-allowed text-muted-foreground"
                        : "cursor-pointer"
                    } ${
                      isSelected
                        ? "bg-primary/15 text-primary dark:text-cyan-400"
                        : isFocused
                          ? "bg-secondary text-foreground"
                          : "text-foreground hover:bg-secondary/60"
                    } ${optionClassName}`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      {opt.icon && (
                        <span className="shrink-0 text-muted-foreground">{opt.icon}</span>
                      )}
                      <div className="flex flex-col text-left truncate">
                        <span className="truncate">{opt.label}</span>
                        {opt.description && (
                          <span className="text-[11px] font-normal text-muted-foreground truncate">
                            {opt.description}
                          </span>
                        )}
                      </div>
                    </div>

                    {isSelected && <Check size={16} className="shrink-0 text-primary ml-2" />}
                  </li>
                )
              })
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
