import { useEffect } from "react";
import Card from "../Card/Card";
import "./popup.css";

export default function Popup({
  open,
  title,
  children,
  onClose,
  actions,
  width = 380,
}) {
  // Close on ESC
  useEffect(() => {
    if (!open) return;

    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div
        className="popup-container"
        style={{ width }}
        onClick={(e) => e.stopPropagation()}
      >
        <Card>
          {title && <h3 className="popup-title">{title}</h3>}

          <div className="popup-content">
            {children}
          </div>

          {actions && (
            <div className="popup-actions">
              {actions}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
