interface LoadingProps {
  fullScreen?: boolean;
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

export default function Loading({
  fullScreen = false,
  size = "md",
  text,
  className = ""
}: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-[3px]",
    lg: "h-12 w-12 border-4"
  };

  const containerClasses = fullScreen
    ? "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3"
    : `flex flex-col items-center justify-center gap-2 ${className}`;

  return (
    <div className={containerClasses}>
      <div className={`animate-spin rounded-full border-muted-foreground/20 border-t-primary ${sizeClasses[size]}`}></div>
      {text && (
        <span className={`text-muted-foreground font-semibold tracking-wide ${size === "sm" ? "text-xs" : "text-sm"}`}>
          {text}
        </span>
      )}
    </div>
  );
}
