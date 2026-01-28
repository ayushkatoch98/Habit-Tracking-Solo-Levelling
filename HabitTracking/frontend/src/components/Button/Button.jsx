import './button.css'

export default function Button({
    children,
    variant = "primary",
    size = "full",
    onClick,
}) {
    return (
        <button
            className={`system-btn ${variant} ${size}`}
            onClick={onClick}
        >
            {children}
        </button>
    );
}
