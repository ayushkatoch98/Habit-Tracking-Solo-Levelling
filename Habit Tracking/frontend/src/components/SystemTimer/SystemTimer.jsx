import { useEffect, useState } from "react";
import "./systemTimer.css";

export default function SystemTimer({
    deadline,          // Date or timestamp (ms)
    onExpire,
    className = "",
    style = {},
}) {
    const [timeLeft, setTimeLeft] = useState(
        Math.max(0, deadline - Date.now())
    );

    useEffect(() => {
        if (timeLeft <= 0) return;

        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                const next = Math.max(0, deadline - Date.now());
                return next;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [deadline, timeLeft]);

    useEffect(() => {
        if (timeLeft === 0 && onExpire) {
            onExpire();
        }
    }, [timeLeft, onExpire]);

    const { hours, minutes, seconds } = formatTime(timeLeft);

    const danger =
        timeLeft <= 5 * 60 * 1000; // last 5 minutes
    return (
        <div
            className={`system-timer dramatic ${danger ? "danger" : ""} ${className}`}
            style={style}
        >
            <span className={`timer-label ${danger ? "danger" : ""}`}>SYSTEM LOCK IN</span>

            <div className="timer-core">
                <div className="timer-ring" />
                <div className="timer-value">
                    {hours > 0 && <span>{pad(hours)}:</span>}
                    <span>{pad(minutes)}:</span>
                    <span>{pad(seconds)}</span>
                </div>
            </div>

            {timeLeft === 0 && (
                <span className="timer-locked">PUNISHMENT ASSIGNED</span>
            )}
        </div>
    );

}

/* helpers */
function formatTime(ms) {
    const total = Math.floor(ms / 1000);
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;

    return { hours, minutes, seconds };
}

function pad(n) {
    return String(n).padStart(2, "0");
}
