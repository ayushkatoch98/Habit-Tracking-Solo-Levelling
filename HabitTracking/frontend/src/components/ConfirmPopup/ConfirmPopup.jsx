import Popup from "../Popup/Popup";
import Button from "../Button/Button";
import "./confirmPopup.css";

export default function ConfirmPopup({
  open,
  title = "CONFIRM ACTION",
  message,
  confirmText = "Confirm",
  onConfirm,
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
        <p>{message}</p>

        <div className="confirm-popup-actions">
  
          <Button
            className={danger ? "danger" : ""}
            onClick={handleConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Popup>
  );
}