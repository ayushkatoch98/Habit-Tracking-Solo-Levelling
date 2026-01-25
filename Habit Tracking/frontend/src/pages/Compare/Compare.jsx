
import { useState } from "react";
import DateRangePicker from "../../components/DateRangePicker/DateRangePicker";
import ComparisonTable from "../../components/ComparisonTable/ComparisonTable";
import ComparisonBar from "../../components/ComparisonBar/ComparisonBar";
import Card from "../../components/Card/Card";
import "./compare.css";

export default function Compare() {
    const [range, setRange] = useState({ from: "2026-01-01", to: "2026-01-07" });

    const users = [
        { id: 1, name: "Hunter A", level: 20, xp: 600, tasksCompleted: 18, tasksFailed: 2, punishmentsAssigned: 3, punishmentsFailed: 1 },
        { id: 2, name: "Hunter B", level: 17, xp: 420, tasksCompleted: 14, tasksFailed: 5, punishmentsAssigned: 4, punishmentsFailed: 2 },
    ];

    return (
        <div className="compare-page">
            <h2 className="compare-title">SYSTEM COMPARISON</h2>

            <Card className="compare-controls">
                <DateRangePicker value={range} onChange={setRange} />
            </Card>

            <Card className="compare-table-card">
                <ComparisonTable users={users} />
            </Card>

            <Card className="compare-bars-card">
                <ComparisonBar
                    label="Tasks Completed"
                    values={users.map(u => ({ name: u.name, value: u.tasksCompleted }))}
                />

                <ComparisonBar
                    label="Punishments Failed"
                    danger
                    values={users.map(u => ({ name: u.name, value: u.punishmentsFailed }))}
                />
            </Card>
        </div>
    );
}
