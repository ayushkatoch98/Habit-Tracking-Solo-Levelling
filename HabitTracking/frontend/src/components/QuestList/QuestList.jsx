import { QUEST_STATUS, QUEST_TYPE } from "../../../../backend/src/constant";
import Card from "../Card/Card";
import { Section } from "../QuestListSection/QuestListSection";
import SystemTimer from "../SystemTimer/SystemTimer";
import { useState, useEffect } from "react";
import "./questList.css";
import "./questTimer.css"


export default function QuestList({ title, items, onSelect, className = '', style = {} }) {
    return (
        <div>
            <Section title={title} className={className} style={style} >
                {items.map((quest) => (
                    <QuestItem
                        key={quest.id}
                        quest={quest}
                        onClick={() => onSelect(quest)}
                    />
                ))}
            </Section>
        </div>
    );
}


function QuestItem({ quest, completed, onClick }) {
    return (
        <div
            className={`quest-item ${completed ? "completed" : ""}`}
            onClick={onClick}
        >
            <div className="quest-text">
                <span className="quest-title">{quest.title}</span>
                <span className="quest-subtitle">{quest.quest_type}</span>

                {quest.description && (
                    <span className="quest-description">
                        {quest.description}
                    </span>
                )}

                {/* ASSIGNED DATE */}
                {quest.assigned_at && (
                    <span className="quest-assigned">
                        Assigned: {formatDate(quest.assigned_at)}
                    </span>
                )}
            </div>

            <div className="quest-right">
                {
                
                    <QuestTimer completeBy={quest.complete_by} isFailed={quest.status == QUEST_STATUS.FAILED} isCompleted={quest.status == QUEST_STATUS.COMPLETED} />
                
                }
            </div>
        </div>
    );
}


function QuestTimer({ completeBy, isFailed, isCompleted }) {
    const [timeLeft, setTimeLeft] = useState(
        Math.max(0, new Date(completeBy) - Date.now())
    );

    useEffect(() => {
        // ⛔ Stop timer if completed
        if (isCompleted) return;

        const interval = setInterval(() => {
            setTimeLeft(Math.max(0, new Date(completeBy) - Date.now()));
        }, 1000);

        return () => clearInterval(interval);
    }, [completeBy, isCompleted]);

    if (!completeBy) return null;

    // ✅ COMPLETED STATE (TOP PRIORITY)
    if (isCompleted) {
        return <div className="quest-timer completed">COMPLETED</div>;
    }
    if (isFailed) {
        return <div className="quest-timer failed">FAILED</div>;
    }

    const danger = timeLeft <= 15 * 60 * 1000;
    const expired = timeLeft <= 0;

    return (
        <div
            className={`quest-timer ${danger ? "danger" : ""} ${expired ? "expired" : ""
                }`}
        >
            {expired ? "TIME UP" : formatTime(timeLeft)}
        </div>
    );
}

/* helpers */
function formatTime(ms) {
    const total = Math.floor(ms / 1000);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;

    if (h > 0) return `${h}h ${m}m`;
    return `${m}m ${s}s`;
}

function formatDate(date) {
    const d = new Date(date);

    return d.toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}