import AdminTableCard from "../../components/AdminTableCard/AdminTableCard";
import { useEffect, useState } from "react";
import "./admin.css";
import AdminPopup from "../../components/AdminPopup/AdminPopup";
import instance from "../../../axisInstance";
import Card from "../../components/Card/Card";

export default function Admin() {

    const [users, setUsers] = useState([]);

    // const [users, setUsers] = useState([]);
    const [quests, setQuests] = useState([]);
    const [schema, setSchema] = useState({});
    const [sqlQuery, setSqlQuery] = useState("SELECT * FROM quests LIMIT 10");
    const [sqlResult, setSqlResult] = useState({ rows: [], rowCount: 0 });
    const [sqlError, setSqlError] = useState("");


    useEffect(() => {

        instance.get("/quests").then(res => {
            console.log(res);
            setQuests([...res.data])
        }).catch(err => {
            console.log("Error", err)
            alert(err.response.data.message)
        })

        instance.get("/auth/").then(res => {
            console.log("users", res);
            setUsers([...res.data])
        }).catch(err => {
            console.log("Error", err)
            alert(err.response.data.message)
        })

        instance.get("/admin/schema").then(res => {
            setSchema(res.data.tables || {})
        }).catch(err => {
            console.log("Error", err)
            alert(err.response.data.message)
        })
    }, [])



    const [popup, setPopup] = useState({
        open: false,
        mode: null,
        entity: null,
        data: null,
    });


    const openCreate = (entity) =>
        setPopup({ open: true, mode: "create", entity, data: null });

    const closePopup = () =>
        setPopup({ open: false, mode: null, entity: null, data: null });

    const handleSubmit = (formData, type, isEdit) => {

        if (type == "QUEST") {
            if (!isEdit) {
                // Creating
                instance.post("/quests/", formData).then(res => {
                    console.log("success", res.data)
                    setQuests([...quests, { ...res.data }]);

                }).catch(err => {
                    console.log("Error", err)
                    alert(err.response.data.message)
                })
            }
            else {
                // Updating
                instance.put(`/quests/${formData.id}`, formData).then(res => {
                    console.log("success", res.data)
                    setQuests([...quests, { ...res.data }]);
                }).catch(err => {
                    console.log("Error", err)
                    alert(err.response.data.message)
                })
            }
        }

        closePopup();
    };

    const runSql = () => {
        setSqlError("");
        instance.post("/admin/sql", { query: sqlQuery }).then(res => {
            setSqlResult({
                rows: res.data.rows || [],
                rowCount: res.data.rowCount || 0
            });
        }).catch(err => {
            const msg = err.response?.data?.message || "Query failed";
            setSqlError(msg);
        })
    };

    const insertSnippet = (snippet) => {
        setSqlQuery(snippet);
    };

    const getRequiredColumns = (table) => {
        const cols = schema?.[table] || [];
        return cols
            .filter(c => c.nullable === false && !c.default)
            .map(c => c.name);
    };

    const insertForTable = (type, table) => {
        const required = getRequiredColumns(table);
        const suggested = {
            quests: ["user_id", "quest_type", "title", "description", "quest_duration", "quest_xp", "failed_xp"],
            users: ["username", "email", "password"],
            quest_logs: ["user_id", "quest_id", "status", "assigned_at", "complete_by"]
        };
        const columns = required.length > 0 ? required : (suggested[table] || ["column1", "column2"]);
        const values = columns.map((_, idx) => `'value${idx + 1}'`);

        const examples = {
            SELECT: `SELECT * FROM ${table} LIMIT 20`,
            UPDATE: `UPDATE ${table} SET column = 'value' WHERE id = 'UUID'`,
            DELETE: `DELETE FROM ${table} WHERE id = 'UUID'`,
            INSERT: `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${values.join(", ")})`
        };
        insertSnippet(examples[type]);
    };

    const handleSqlKeyDown = (e) => {
        if (e.key === "Tab") {
            e.preventDefault();
            const target = e.target;
            const start = target.selectionStart;
            const end = target.selectionEnd;
            const updated = sqlQuery.substring(0, start) + "  " + sqlQuery.substring(end);
            setSqlQuery(updated);
            requestAnimationFrame(() => {
                target.selectionStart = target.selectionEnd = start + 2;
            });
        }
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
            e.preventDefault();
            runSql();
        }
    };
    return (
        <div className="page admin-page">
            <div className="page-header">
                <div>
                    <div className="page-kicker">CONTROL</div>
                    <h1 className="page-title">SYSTEM ADMIN PANEL</h1>
                    <p className="page-subtitle">Manage users, quests, and database operations.</p>
                </div>
            </div>

            <div className="admin-grid">
                <AdminTableCard
                    title="USERS"
                    columns={users.length > 0 ? Object.keys(users[0]) : []}
                    rows={users}
                    onAdd={() => {}}
                    tableType="users"
                />

                <AdminTableCard
                    title="QUESTS"
                    columns={quests.length > 0 ? Object.keys(quests[0]) : []}
                    rows={quests}
                    onAdd={() => openCreate("QUEST")}
                />
            </div>

            <div className="admin-grid admin-grid-wide">
                <Card className="admin-sql-card">
                    <h3 className="admin-section-title">SQL CONSOLE</h3>
                    <p className="admin-subtitle">Allowed: SELECT, UPDATE, DELETE, INSERT (single statement)</p>
                    <div className="sql-toolbar">
                        <div className="sql-group">
                            <span className="sql-label">QUESTS</span>
                            <div className="sql-buttons">
                                <button className="system-btn ghost sm" onClick={() => insertForTable("SELECT", "quests")}>SELECT</button>
                                <button className="system-btn ghost sm" onClick={() => insertForTable("UPDATE", "quests")}>UPDATE</button>
                                <button className="system-btn ghost sm" onClick={() => insertForTable("DELETE", "quests")}>DELETE</button>
                                <button className="system-btn ghost sm" onClick={() => insertForTable("INSERT", "quests")}>INSERT</button>
                            </div>
                        </div>
                        <div className="sql-group">
                            <span className="sql-label">USERS</span>
                            <div className="sql-buttons">
                                <button className="system-btn ghost sm" onClick={() => insertForTable("SELECT", "users")}>SELECT</button>
                                <button className="system-btn ghost sm" onClick={() => insertForTable("UPDATE", "users")}>UPDATE</button>
                                <button className="system-btn ghost sm" onClick={() => insertForTable("DELETE", "users")}>DELETE</button>
                                <button className="system-btn ghost sm" onClick={() => insertForTable("INSERT", "users")}>INSERT</button>
                            </div>
                        </div>
                        <div className="sql-group">
                            <span className="sql-label">QUEST LOGS</span>
                            <div className="sql-buttons">
                                <button className="system-btn ghost sm" onClick={() => insertForTable("SELECT", "quest_logs")}>SELECT</button>
                                <button className="system-btn ghost sm" onClick={() => insertForTable("UPDATE", "quest_logs")}>UPDATE</button>
                                <button className="system-btn ghost sm" onClick={() => insertForTable("DELETE", "quest_logs")}>DELETE</button>
                                <button className="system-btn ghost sm" onClick={() => insertForTable("INSERT", "quest_logs")}>INSERT</button>
                            </div>
                        </div>
                        <button className="system-btn ghost sm" onClick={() => setSqlQuery("")}>Clear</button>
                    </div>
                    <textarea
                        className="system-textarea admin-sql-input"
                        rows={6}
                        value={sqlQuery}
                        onChange={(e) => setSqlQuery(e.target.value)}
                        onKeyDown={handleSqlKeyDown}
                        placeholder="Write SQL here... (Ctrl+Enter to run)"
                    />
                    <div className="admin-sql-actions">
                        <button className="system-btn primary sm" onClick={runSql}>Run Query</button>
                        <span className="admin-sql-meta">Rows: {sqlResult.rowCount || 0}</span>
                    </div>
                    {sqlError && <div className="admin-sql-error">{sqlError}</div>}
                    {sqlResult.rows && sqlResult.rows.length > 0 && (
                        <div className="admin-sql-result admin-table-wrapper">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        {Object.keys(sqlResult.rows[0]).map((col) => (
                                            <th key={col}>{col.toUpperCase().replaceAll("_", " ")}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {sqlResult.rows.map((row, idx) => (
                                        <tr key={idx}>
                                            {Object.keys(sqlResult.rows[0]).map((col) => (
                                                <td key={col}>{String(row[col])}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>

                <Card className="admin-schema-card">
                    <h3 className="admin-section-title">DB SCHEMA</h3>
                    <div className="admin-schema">
                        {Object.keys(schema).length === 0 && (
                            <div className="admin-subtitle">No schema data</div>
                        )}
                        {Object.keys(schema).map((table) => (
                            <div key={table} className="admin-schema-table">
                                <div className="admin-schema-title">{table}</div>
                                <div className="admin-table-wrapper">
                                    <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Column</th>
                                            <th>Type</th>
                                            <th>Nullable</th>
                                            <th>Default</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {schema[table].map((col, idx) => (
                                            <tr key={idx}>
                                                <td>{col.name}</td>
                                                <td>{col.type}</td>
                                                <td>{col.nullable ? "YES" : "NO"}</td>
                                                <td>{col.default || "-"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>


            <AdminPopup
                open={popup.open}
                mode={popup.mode}
                entity={popup.entity}
                data={popup.data}
                onClose={closePopup}
                onSubmit={handleSubmit}
            />

            <br></br>
            <br></br>
        </div>
    );
}
