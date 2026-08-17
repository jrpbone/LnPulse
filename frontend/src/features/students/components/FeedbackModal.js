function FeedbackModal({ feedback, onClose }) {
  if (!feedback) return null;

  const isError = feedback.variant === "error";
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div
        className="modal-content"
        style={isError ? { border: "2px solid #dc3545" } : undefined}
      >
        <div
          className="modal-header"
          style={isError ? { backgroundColor: "#dc3545", color: "white" } : undefined}
        >
          <h3>{feedback.title || (isError ? "Error" : "Success")}</h3>
        </div>
        <div className="modal-body">
          <p style={isError ? { color: "#dc3545" } : undefined}>{feedback.message}</p>
        </div>
        <div className="modal-footer">
          <button className="modal-button" onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

export default FeedbackModal;
