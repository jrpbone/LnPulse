import React from "react";
import "./WorkspacePageHeader.css";

function WorkspacePageHeader({ eyebrow, title, count, description, actions }) {
  return (
    <header className="workspace-page-header">
      <div className="workspace-page-heading">
        {eyebrow && <p className="workspace-page-eyebrow">{eyebrow}</p>}
        <div className="workspace-page-title-row">
          <h1>{title}</h1>
          {count !== undefined && count !== null && (
            <span className="workspace-page-count">{count}</span>
          )}
        </div>
        {description && <p className="workspace-page-description">{description}</p>}
      </div>
      {actions && <div className="workspace-page-actions">{actions}</div>}
    </header>
  );
}

export default WorkspacePageHeader;
