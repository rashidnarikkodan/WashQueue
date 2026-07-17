"use client"

import { useFormStatus } from "react-dom"

interface SubmitButtonProps {
  text?: string
  pendingText?: string
  className?: string
}

export default function Submit({
  text = "Submit",
  pendingText = "Submitting...",
  className = "",
}: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className={`
        w-full bg-primary hover:bg-primary/90
        disabled:opacity-50 disabled:cursor-not-allowed
        text-primary-foreground font-bold py-3.5 px-6
        rounded-xl transition-all duration-200
        shadow-lg shadow-primary/10
        cursor-pointer text-sm
        flex items-center justify-center gap-2 mt-4
        ${className}
      `}
    >
      {pending ? pendingText : text}
    </button>
  )
}