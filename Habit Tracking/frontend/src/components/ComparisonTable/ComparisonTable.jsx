
import "./comparisonTable.css";
export default function ComparisonTable({ users }) {
    return (
        <table className="system-compare-table">
            <thead>
                <tr>
                    <th className="metric-col">METRIC</th>
                    {users.map(u => (
                        <th key={u.id} className="user-col">{u.name}</th>
                    ))}
                </tr>
            </thead>

            <tbody>
                <CompareRow label="Level" users={users} field="level" />
                <CompareRow label="XP" users={users} field="xp" />
                <CompareRow label="Tasks Completed" users={users} field="tasksCompleted" />
                <CompareRow label="Tasks Failed" users={users} field="tasksFailed" invert />
                <CompareRow label="Punishments Assigned" users={users} field="punishmentsAssigned" invert />
                <CompareRow label="Punishments Failed" users={users} field="punishmentsFailed" invert danger />
                <CompareRow
                    label="Completion %"
                    users={users}
                    compute={(u) =>
                        Math.round(
                            (u.tasksCompleted /
                                (u.tasksCompleted + u.tasksFailed)) *
                            100
                        )
                    }
                />
            </tbody>
        </table>
    );
}

function CompareRow({ label, users, field, compute, invert, danger }) {
    const values = users.map(u =>
        compute ? compute(u) : u[field]
    );

    const best = invert
        ? Math.min(...values)
        : Math.max(...values);

    return (
        <tr className={`compare-row ${danger ? "danger" : ""}`}>
            <td className="metric-cell">{label}</td>

            {users.map((u) => {
                const value = compute ? compute(u) : u[field];
                const isBest = value === best;

                return (
                    <td
                        key={u.id}
                        className={`value-cell ${isBest ? "best" : "worse"}`}
                    >
                        {value}
                    </td>
                );
            })}
        </tr>
    );
}
