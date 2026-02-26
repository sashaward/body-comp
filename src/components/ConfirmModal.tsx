"use client";

import AnimatedModal from "./AnimatedModal";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmLabel?: string;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete data",
  message,
  confirmLabel = "Delete data",
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const handleConfirm = (requestClose: () => void) => {
    onConfirm();
    requestClose();
  };

  return (
    <AnimatedModal isOpen={isOpen} onClose={onClose} maxWidth="sm">
      {(requestClose) => (
        <div className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            {title}
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">{message}</p>
          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={requestClose}
              className="px-4 py-2.5 rounded-[var(--radius-button)] font-medium text-sm text-[var(--text-secondary)] hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleConfirm(requestClose)}
              className="px-4 py-2.5 rounded-[var(--radius-button)] font-semibold text-sm bg-[var(--delta-negative)] text-white hover:brightness-110 transition-all border border-[var(--delta-negative)]/30"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      )}
    </AnimatedModal>
  );
}
