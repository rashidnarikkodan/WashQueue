export const TOASTER = {
  POSITION: "top-right",
  THEME: "system",
  DURATION: 2500,
  CLASS_NAMES: {
    toast:
      "group-[.toaster]:bg-white/90 dark:group-[.toaster]:bg-[#151B2D]/85 group-[.toaster]:text-slate-900 dark:group-[.toaster]:text-[#DCE1FB] group-[.toaster]:border-slate-200/80 dark:group-[.toaster]:border-slate-800/80 group-[.toaster]:shadow-2xl group-[.toaster]:rounded-2xl group-[.toaster]:border group-[.toaster]:p-4 group-[.toaster]:font-sans group-[.toaster]:backdrop-blur-md transition-all duration-200",
    title: "group-[.toast]:font-bold group-[.toast]:text-sm",
    description:
      "group-[.toast]:text-xs group-[.toast]:text-slate-500 dark:group-[.toast]:text-slate-400",
    success:
      "!bg-emerald-50/95 dark:!bg-emerald-950/90 !border-emerald-500/30 !text-emerald-700 dark:!text-emerald-400",
    error: "!bg-red-50/95 dark:!bg-red-950/90 !border-red-500/30 !text-red-700 dark:!text-red-400",
    warning:
      "!bg-amber-50/95 dark:!bg-amber-950/90 !border-amber-500/30 !text-amber-700 dark:!text-amber-400",
    info: "!bg-sky-50/95 dark:!bg-sky-950/90 !border-sky-500/30 !text-sky-700 dark:!text-sky-400",
  },
} as const
