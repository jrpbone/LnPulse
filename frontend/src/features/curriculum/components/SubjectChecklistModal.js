import { modalContentStyle, modalOverlayStyle } from "./AddSubjectModal";

function SubjectChecklistModal({
  open,
  subjects,
  selectedSubjects,
  onSelectionChange,
  onClose,
  onSubmit,
}) {
  if (!open) return null;
  const allSelected = subjects.length > 0 && selectedSubjects.length === subjects.length;

  return (
    <div style={modalOverlayStyle} role="dialog" aria-modal="true">
      <div style={modalContentStyle}>
        {subjects.length === 0 ? (
          <>
            <p>All subjects are already loaded.</p>
            <div style={{ display: "flex", justifyContent: "flex-end" }}><button onClick={onClose}>OK</button></div>
          </>
        ) : (
          <>
            <h3>Load all these subjects?</h3>
            <div style={{ marginBottom: 10 }}>
              <label>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(event) =>
                    onSelectionChange(event.target.checked ? subjects.map((subject) => subject.value) : [])
                  }
                />
                Select All
              </label>
            </div>
            <div style={{ maxHeight: 300, overflowY: "auto", marginBottom: 10 }}>
              {subjects.map((subject) => (
                <div key={subject.value}>
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedSubjects.includes(subject.value)}
                      onChange={() =>
                        onSelectionChange(
                          selectedSubjects.includes(subject.value)
                            ? selectedSubjects.filter((id) => id !== subject.value)
                            : [...selectedSubjects, subject.value]
                        )
                      }
                    />
                    {subject.label}
                  </label>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button onClick={onClose}>Cancel</button>
              <button onClick={onSubmit} disabled={selectedSubjects.length === 0}>Add Selected</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default SubjectChecklistModal;
