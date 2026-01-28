import Card from "../Card/Card";
import Header from "../Header/Header";
import "./planChecklist.css";

export default function PlanChecklist({ items, onToggle, className = '', style = {} }) {

    return (
        <>
        <Header title="Planned" subtitle="Planned activites for today"></Header>
        <Card className={className} style={style}>
            <div className="checklist-section">

                {items.length === 0 && (
                    <p className="empty-text">No planned items.</p>
                )}

                {items.map((item) => (
                    <label key={item.id} className={`checklist-item ${item.completed ? "completed" : ""}`}>
                        <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={() => onToggle(item.id)}
                        />

                        <span className="custom-checkbox" />

                        <span className="item-label">{item.label}</span>
                    </label>
                ))}
            </div>

        </Card>
      
        </>
    );
}
