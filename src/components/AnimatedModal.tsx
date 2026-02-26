"use client";

import { useState, useCallback } from "react";

interface AnimatedModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode | ((requestClose: () => void) => React.ReactNode);
  className?: string;
  contentClassName?: string;
  maxWidth?: "sm" | "md" | "lg";
}

/**
 * Wrapper that provides smooth enter/exit animations for modals.
 * Keeps modal mounted during exit animation, then calls onClose.
 */
export default function AnimatedModal({
  isOpen,
  onClose,
  children,
  className = "",
  contentClassName = "",
  maxWidth = "md",
}: AnimatedModalProps) {
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = useCallback(() => {
    if (isExiting) return;
    setIsExiting(true);
  }, [isExiting]);

  const handleExitAnimationEnd = useCallback(
    (e: React.AnimationEvent) => {
      if (e.target !== e.currentTarget) return;
      if (e.animationName === "fadeOut") {
        setIsExiting(false);
        onClose();
      }
    },
    [onClose]
  );

  if (!isOpen) return null;

  const maxWidthClass =
    maxWidth === "sm" ? "max-w-sm" : maxWidth === "lg" ? "max-w-lg" : "max-w-md";

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 p-6 bg-[var(--bg-modal-overlay)] backdrop-blur-md ${
        isExiting ? "animate-fade-out" : "animate-fade-in"
      } ${className}`}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
      onAnimationEnd={isExiting ? handleExitAnimationEnd : undefined}
    >
      <div
        className={`w-full ${maxWidthClass} rounded-[var(--radius-card)] glass border border-white/[0.1] shadow-[var(--glass-shadow)] ${
          isExiting ? "animate-scale-out" : "animate-scale-in"
        } ${contentClassName}`}
        onClick={(e) => e.stopPropagation()}
      >
        {typeof children === "function"
          ? children(handleClose)
          : children}
      </div>
    </div>
  );
}
