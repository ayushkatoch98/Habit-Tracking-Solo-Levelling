import Card from "../Card/Card";
import Button from "../Button/Button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import "./adminTableCard.css";

export default function AdminTableCard({
    title,
    columns,
    rows,
    onAdd,
    tableType,
    className = '',
    style = {}
}) {
    return (
        <Card className={className} style={style}>
            <div className="admin-card-header">
                <h3>{title}</h3> { tableType !== "users" && <Button variant="ghost" size="sm" onClick={onAdd}>
                    <Plus size={14} />
                    <span>Add</span>
                </Button>}
            </div>
            <div className="admin-table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            {columns.map((col) => (
                                <th key={col}>{col.toUpperCase().replaceAll("_", " ")}</th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {rows.map((row, idx) => (
                            <tr key={idx}>
                                {columns.map((col) => {
                                    if (col == "id") {
                                        return <td key={col}>{row[col].substring(0, 5)}</td>
                                    }
                                    else return <td key={col}>{row[col]}</td>
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}
