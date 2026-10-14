import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "720";
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "720",
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxW = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "720": "max-w-[720px]",
  }[maxWidth] || "max-w-[720px]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200 print:static print:p-0 print:block print:overflow-visible">
      {/* Backdrop with subtle blur */}
      <div
        className="fixed inset-0 bg-black/65 backdrop-blur-[2px] transition-opacity duration-200 print:hidden"
        onClick={onClose}
      />

      {/* Dialog content with entry physics */}
      <div
        className={cn(
          "relative w-full rounded-panel border border-border bg-surface shadow-[0_8px_32px_rgba(0,0,0,0.5)] z-10 overflow-hidden",
          "transform transition-all duration-200 ease-out animate-in zoom-in-95",
          maxW,
          "print:static print:w-full print:max-w-none print:border-none print:shadow-none print:p-0 print:m-0 print:bg-white print:text-black"
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface print:hidden">
          <div>
            <h3 className="text-[15px] font-semibold text-text tracking-tight">{title}</h3>
            {description && <p className="text-[12px] text-text-muted mt-0.5">{description}</p>}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="hidden sm:inline-block text-[10px] text-text-faint px-1.5 py-0.5 rounded border border-border bg-bg/50">
              ESC
            </span>
            <button
              onClick={onClose}
              title="Cerrar modal (Esc)"
              className="p-1 rounded text-text-muted hover:text-text hover:bg-surface-hover hover:rotate-90 transition-all duration-150 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="p-4 max-h-[80vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-0">{children}</div>
      </div>
    </div>
  );
}
