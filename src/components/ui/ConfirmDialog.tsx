import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { AlertTriangle, Trash2, X } from "lucide-react";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: React.ReactNode;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "primary";
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmar acción",
  message,
  description = "Esta acción desactivará el registro mediante baja lógica en el sistema.",
  confirmText = "Dar de baja",
  cancelText = "Cancelar",
  variant = "danger",
  isLoading = false,
}: ConfirmDialogProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, isLoading]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-150"
    >
      {/* Backdrop with frosted glass effect */}
      <div
        className="fixed inset-0 bg-black/65 backdrop-blur-[2px] transition-opacity duration-150"
        onClick={() => {
          if (!isLoading) onClose();
        }}
      />

      {/* Dialog box with tactile spring physics */}
      <div
        className={cn(
          "relative w-full max-w-md rounded-panel border border-border bg-surface shadow-[0_12px_40px_rgba(0,0,0,0.45)] z-10 overflow-hidden",
          "transform transition-all duration-200 ease-out animate-in zoom-in-95"
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-4 pb-0">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shrink-0 border",
                variant === "danger"
                  ? "bg-danger/10 text-danger border-danger/25 shadow-[0_0_12px_rgba(239,68,68,0.15)]"
                  : variant === "warning"
                  ? "bg-warn/10 text-warn border-warn/25 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
                  : "bg-accent/10 text-accent border-accent/25"
              )}
            >
              {variant === "danger" ? (
                <Trash2 className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-text tracking-tight">{title}</h3>
              <p className="text-[11px] text-text-faint font-mono uppercase tracking-wider mt-0.5">
                Verificación de seguridad
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isLoading}
            title="Cerrar (Esc)"
            className="p-1 rounded text-text-muted hover:text-text hover:bg-surface-hover transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body content */}
        <div className="p-4 pt-3 space-y-2">
          <div className="text-[13px] text-text font-medium leading-relaxed bg-surface-hover/50 p-3 rounded-control border border-border/60">
            {message}
          </div>
          {description && (
            <p className="text-[12px] text-text-muted leading-relaxed px-1">
              {description}
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-2 p-3.5 bg-surface-hover/30 border-t border-border">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
            className="active:scale-[0.97]"
          >
            {cancelText}
          </Button>

          <Button
            type="button"
            variant={variant === "danger" ? "danger" : "primary"}
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
            className={cn(
              "active:scale-[0.97]",
              variant === "danger" && "bg-danger hover:bg-danger/90 text-white border-transparent shadow-sm shadow-danger/20"
            )}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
