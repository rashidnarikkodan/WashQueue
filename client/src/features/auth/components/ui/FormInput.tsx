import { useState } from "react";
import type { ChangeEvent } from "react";
import { Eye, EyeOff } from "lucide-react";

interface FormInputProps {
  label: string;
  type: string;
  placeholder: string;
  name?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  autoComplete?: string;
  required?: boolean;
  id?: string;
}

export default function FormInput({
  label,
  type,
  placeholder,
  name,
  value,
  onChange,
  error,
  autoComplete,
  required,
  id
}: FormInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="flex flex-col gap-1.5 w-full relative">
      <label htmlFor={id} className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          required={required}
          className={`w-full bg-slate-950/40 text-foreground border rounded-xl pl-4 pr-11 py-3 text-sm placeholder-slate-500/80 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/80 transition-all duration-200 ${
            error ? "border-red-500/80 focus:ring-red-500/20 focus:border-red-500" : "border-border/80 hover:border-border"
          }`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1 cursor-pointer"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && (
        <span className="text-[11px] text-red-400 font-medium pl-1 animate-in fade-in slide-in-from-top-1 duration-200">
          {error}
        </span>
      )}
    </div>
  );
}
