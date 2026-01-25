import Card from "../Card/Card";
import Button from "../Button/Button";
import { Plus, Pencil, Trash2 } from "lucide-react";
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
                    <Plus size={14} />
                    <span>Add</span>
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
                                        <button
                                            className="icon-btn"
                                            title={extraAction.label}
                                            onClick={() => extraAction.onClick(row)}
                                        >
                                            <Plus size={14} />
                                        </button>
                                    )}

                                    <button
                                        className="icon-btn"
                                        title="Edit"
                                        onClick={() => onEdit(row)}
                                    >
                                        <Pencil size={14} />
                                    </button>

                                    <button
                                        className="icon-btn danger"
                                        title="Delete"
                                        onClick={() => onDelete(row)}
                                    >
                                        <Trash2 size={14} />
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
