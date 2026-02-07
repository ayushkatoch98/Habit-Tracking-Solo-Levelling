import Popup from "../Popup/Popup";
import Button from "../Button/Button";
import "./confirmPopup.css";

export default function ConfirmPopup({
  open,
  title = "CONFIRM ACTION",
  message,
  children,
  confirmText = "Confirm",
  onConfirm,
  secondaryText,
  onSecondary,
  secondaryDanger = true,
  cancelText = "Cancel",
  onCancel,
  danger = true,
}) {
  if (!open) return null;

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Popup
      open={open}
      title={title}
      onClose={onCancel}
    >
      <div className="confirm-popup-content">
        {children ? children : <p>{message}</p>}

        <div className="confirm-popup-actions">
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              {cancelText}
            </Button>
          )}
          {onSecondary && secondaryText && (
            <Button
              variant={secondaryDanger ? "danger" : "primary"}
              size="sm"
              onClick={onSecondary}
            >
              {secondaryText}
            </Button>
          )}
          <Button
            variant={danger ? "danger" : "primary"}
            size="sm"
            onClick={handleConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Popup>
  );
}
