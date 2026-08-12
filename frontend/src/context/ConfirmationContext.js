import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import ConfirmationModal from "../components/ConfirmationModal";

const ConfirmationContext = createContext(null);

export function ConfirmationProvider({ children }) {
  const [request, setRequest] = useState(null);
  const resolver = useRef(null);

  const confirm = useCallback((options = {}) => new Promise((resolve) => {
    resolver.current = resolve;
    setRequest({
      title: "Are you sure?",
      message: "Please confirm that you want to continue.",
      confirmLabel: "Confirm",
      cancelLabel: "Cancel",
      variant: "warning",
      ...options,
    });
  }), []);

  const finish = (result) => {
    setRequest(null);
    resolver.current?.(result);
    resolver.current = null;
  };

  return (
    <ConfirmationContext.Provider value={confirm}>
      {children}
      <ConfirmationModal
        isOpen={Boolean(request)}
        title={request?.title || "Are you sure?"}
        message={request?.message}
        confirmLabel={request?.confirmLabel}
        cancelLabel={request?.cancelLabel}
        variant={request?.variant}
        onConfirm={() => finish(true)}
        onCancel={() => finish(false)}
      />
    </ConfirmationContext.Provider>
  );
}

export function useConfirmation() {
  const context = useContext(ConfirmationContext);
  if (!context) throw new Error("useConfirmation must be used within ConfirmationProvider");
  return context;
}
