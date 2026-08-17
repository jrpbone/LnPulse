import React from "react";
import { FiAlertTriangle, FiCheck, FiHelpCircle, FiShield, FiX } from "react-icons/fi";
import "./ConfirmationModal.css";

const variantIcons = {
  danger: FiAlertTriangle,
  success: FiCheck,
  primary: FiShield,
  warning: FiHelpCircle,
};

function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "primary",
  onConfirm,
  onCancel,
  children,
}) {
  if (!isOpen) return null;

  const Icon = variantIcons[variant] || FiShield;
  const titleId = `confirmation-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <div className="confirmation-overlay" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div className={`confirmation-modal ${variant}`}>
        <div className="confirmation-icon"><Icon aria-hidden="true" /></div>
        <button type="button" className="confirmation-close" onClick={onCancel} aria-label="Close confirmation">
          <FiX aria-hidden="true" />
        </button>
        <h3 id={titleId}>{title}</h3>
        {message && <p className="confirmation-message">{message}</p>}
        {children && <div className="confirmation-body">{children}</div>}
        <div className="confirmation-actions">
          <button type="button" className="confirmation-cancel" onClick={onCancel}>{cancelLabel}</button>
          <button type="button" className="confirmation-confirm" onClick={onConfirm}>
            <Icon aria-hidden="true" />
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;
