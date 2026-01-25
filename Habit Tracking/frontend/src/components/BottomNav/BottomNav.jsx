import "./bottomNav.css";

export default function BottomNav({ items, onClick }) {
    return (
        <nav className="bottom-nav">
            {
                items.map(item => {
                    return (

                        <NavItem key={item.key}
                            label={item.label}
                            isActive={item.isActive}
                            onClick={() => onClick(item.key)}
                        />
                    )
                })
            }
        </nav>
    );
}

function NavItem({ label, isActive, onClick }) {
    return (
        <button
            className={`nav-item ${isActive ? "active" : ""}`}
            onClick={onClick}
        >
            <span className="nav-label">{label}</span>
        </button>
    );
}
