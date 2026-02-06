import "./bottomNav.css";

export default function BottomNav({ items, onClick, active }) {
    return (
        <nav className="bottom-nav">
            {
                items.map(item => {
                    return (

                        <NavItem key={item.key}
                            label={item.label}
                            isActive={active === item.key}
                            Icon={item.icon}
                            onClick={() => onClick(item.key)}
                        />
                    )
                })
            }
        </nav>
    );
}

function NavItem({ label, isActive, onClick, Icon }) {
    return (
        <button
            className={`nav-item ${isActive ? "active" : ""}`}
            onClick={onClick}
            aria-label={label}
            title={label}
        >
            {Icon && <Icon size={18} className="nav-icon" />}
        </button>
    );
}
