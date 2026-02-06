import './button.css'

export default function Button({
    children,
    variant = "primary",
    size = "full",
    className = "",
    onClick,
}) {
    return (
        <button
            className={`system-btn ${variant} ${size} ${className}`}
            onClick={onClick}
        >
            {children}
        </button>
    );
}
