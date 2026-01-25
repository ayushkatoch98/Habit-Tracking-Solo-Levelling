import { useAuth } from "../../context/AuthProvider";
import "./xpBar.css";

export default function XPBar({
    currentXP,
    requiredXP,
    level,
    className = "",
    style = {},
}) {
    const percentage = Math.min(
        (currentXP / requiredXP) * 100,
        100
    );

    const { user } = useAuth();

    return (
        <div className={`xp-bar-container ${className}`} style={style}>
            <div className="level-badge">
                <span className="level-label">Welcome Player, {user?.fullname}</span>
            </div>
            <div className="level-badge">
                <span className="level-label">LEVEL</span>
                <div className="level-circle">
                    <span className="level-value">{level}</span>
                </div>
            </div>

            <div className="xp-bar">
                <div
                    className="xp-fill"
                    style={{ width: `${percentage}%` }}
                />
            </div>

            <div className="xp-text">
                {currentXP} / {requiredXP} XP
            </div>
        </div>
    );
}
