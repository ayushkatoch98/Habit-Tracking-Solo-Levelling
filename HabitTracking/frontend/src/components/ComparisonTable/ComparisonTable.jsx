
import "./comparisonTable.css";
export default function ComparisonTable({ users }) {
    if (users.length === 0) return null;

    const rows = [
        { label: "Daily Completed", key: "daily_completed", better: "high" },
        { label: "Daily Failed", key: "daily_failed", better: "low", danger: true },
        { label: "Daily Pending", key: "daily_pending", better: "low" },

        { label: "Penalty Assigned", key: "penalty_assigned", better: "low" },
        { label: "Penalty Completed", key: "penalty_completed", better: "high" },
        { label: "Penalty Failed", key: "penalty_failed", better: "low", danger: true },

        { label: "XP Gained", key: "xp_gained", better: "high" },
        { label: "XP Lost", key: "xp_lost", better: "low", danger: true },
        { label: "Net XP", key: "net_xp", better: "high" },

        { label: "Failure Rate (%)", key: "failure_rate", better: "low", danger: true }
    ];

    return (
        <table className="system-compare-table">
            <thead>
                <tr>
                    <th className="metric-col">METRIC</th>
                    {users.map(u => (
                        <th key={u.username} className="user-col">
                            {u.username.toUpperCase()}
                        </th>
                    ))}
                </tr>
            </thead>

            <tbody>
                {rows.map(row => (
                    <CompareRow key={row.key} row={row} users={users} />
                ))}
            </tbody>
        </table>
    );
}
function CompareRow({ row, users }) {
    const values = users.map(u => u.stats[row.key]);

    const bestValue =
        row.better === "high"
            ? Math.max(...values)
            : Math.min(...values);

    return (
        <tr className={`compare-row ${row.danger ? "danger" : ""}`}>
            <td className="metric-cell">{row.label}</td>

            {users.map((u, idx) => {
                const value = u.stats[row.key];
                const isBest = value === bestValue;

                return (
                    <td
                        key={idx}
                        className={`value-cell ${isBest ? "best" : "worse"}`}
                    >
                        {value}
                    </td>
                );
            })}
        </tr>
    );
}