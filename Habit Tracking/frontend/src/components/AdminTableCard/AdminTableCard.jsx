import Card from "../Card/Card";
import Button from "../Button/Button";
import "./adminTableCard.css";

export default function AdminTableCard({
    title,
    columns,
    rows,
    onAdd,
    onEdit,
    onDelete,
    extraAction,
    className = '',
    style = {},
}) {
    return (
        <Card className={className} style={style}>
            <div className="admin-card-header">
                <h3>{title}</h3> <Button variant="ghost" size="sm" onClick={onAdd}>
                    + ADD
                </Button>
            </div>
            <div className="admin-table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            {columns.map((col) => (
                                <th key={col}>{col}</th>
                            ))}
                            <th>Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {rows.map((row, idx) => (
                            <tr key={idx}>
                                {columns.map((col) => (
                                    <td key={col}>{row[col]}</td>
                                ))}

                                <td className="admin-actions">
                                    {extraAction && (
                                        <button onClick={() => extraAction.onClick(row)}>
                                            {extraAction.label}
                                        </button>
                                    )}

                                    <button onClick={() => onEdit(row)}>Edit</button>

                                    <button
                                        className="danger"
                                        onClick={() => onDelete(row)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}
