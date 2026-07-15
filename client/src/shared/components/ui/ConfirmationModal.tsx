import { useEffect, useRef, useState } from "react";
import { AlertTriangle, AlertCircle, CheckCircle, Info, Loader2, X } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "primary" | "danger" | "warning" | "success";
  isLoading?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone. Please confirm to proceed.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "primary",
  isLoading = false,
}: ConfirmationModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync native dialog state with isOpen prop
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
        // Prevent background scrolling
        document.body.style.overflow = "hidden";
      }
    } else {
      if (dialog.open) {
        dialog.close();
        document.body.style.overflow = "";
      }
    }
  }, [isOpen]);

  // Clean up overflow styling on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleCancel = () => {
    if (isLoading || isSubmitting) return;
    onClose();
  };

  const handleConfirm = async () => {
    if (isLoading || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close when native ESC is pressed
  const handleCancelClick = (e: React.SyntheticEvent) => {
    e.preventDefault();
    handleCancel();
  };

  // Icon based on variant
  const getIcon = () => {
    const iconSize = 22;
    switch (confirmVariant) {
      case "danger":
        return <AlertTriangle size={iconSize} className="text-red-400" />;
      case "warning":
        return <AlertCircle size={iconSize} className="text-amber-500" />;
      case "success":
        return <CheckCircle size={iconSize} className="text-emerald-400" />;
      default:
        return <Info size={iconSize} className="text-blue-400" />;
    }
  };

  // Button styles based on variant
  const getConfirmButtonClasses = () => {
    const base =
      "flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-md select-none shrink-0";
    if (isLoading || isSubmitting) {
      return `${base} bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700`;
    }
    switch (confirmVariant) {
      case "danger":
        return `${base} bg-red-600 hover:bg-red-500 text-white hover:shadow-red-950/20 border border-red-500/20`;
      case "warning":
        return `${base} bg-amber-500 hover:bg-amber-400 text-slate-950 hover:shadow-amber-500/20 border border-amber-400/20`;
      case "success":
        return `${base} bg-emerald-600 hover:bg-emerald-500 text-white hover:shadow-emerald-950/20 border border-emerald-500/20`;
      default:
        return `${base} bg-gradient-to-r from-primary to-blue-600 hover:from-sky-400 hover:to-blue-500 text-foreground hover:shadow-primary/20 border border-primary/20`;
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onCancel={handleCancelClick}
      className="m-auto w-full max-w-md rounded-2xl border border-slate-800/80 bg-card p-0 shadow-2xl backdrop:bg-slate-950/60 backdrop:backdrop-blur-md overflow-hidden outline-none animate-in fade-in zoom-in-95 duration-200"
    >
      <div className="flex flex-col p-6 space-y-4">
        {/* Header Grid */}
        <div className="flex items-start gap-4">
          <div className={`p-2.5 rounded-xl border shrink-0 ${
            confirmVariant === "danger"
              ? "bg-red-500/10 border-red-500/20"
              : confirmVariant === "warning"
              ? "bg-amber-500/10 border-amber-500/20"
              : confirmVariant === "success"
              ? "bg-emerald-500/10 border-emerald-500/20"
              : "bg-blue-500/10 border-blue-500/20"
          }`}>
            {getIcon()}
          </div>
          
          <div className="space-y-1.5 grow min-w-0 text-left">
            <h3 className="text-lg font-bold text-slate-100 leading-snug">{title}</h3>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">{message}</p>
          </div>

          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading || isSubmitting}
            className="text-slate-500 hover:text-slate-300 p-1 hover:bg-slate-800/40 rounded-lg transition-colors cursor-pointer disabled:opacity-50 shrink-0"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading || isSubmitting}
            className="px-5 py-2.5 rounded-xl border border-slate-800 bg-slate-950/30 hover:bg-slate-900/60 text-slate-400 hover:text-slate-200 text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed select-none"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading || isSubmitting}
            className={getConfirmButtonClasses()}
          >
            {(isLoading || isSubmitting) && (
              <Loader2 size={13} className="animate-spin text-slate-500" />
            )}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </dialog>
  );
}
