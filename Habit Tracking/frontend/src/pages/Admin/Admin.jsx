import AdminTableCard from "../../components/AdminTableCard/AdminTableCard";
import "./admin.css";

export default function Admin() {
    const users = [
        { username: "hunter1", level: 12, status: "Active" },
        { username: "hunter2", level: 7, status: "Banned" },
    ];
    const habits = [
        { name: "10K Steps", xp: 50, frequency: "Daily" },
        { name: "Meditation", xp: 30, frequency: "Daily" },
    ];
    const punishments = [
        { name: "Cold Shower", severity: "Medium", duration: "2 min" },
        { name: "No Sugar", severity: "Low", duration: "24 hrs" },
    ];
    return (
        <div className="admin-page">
            <h2 className="admin-title">SYSTEM ADMIN PANEL</h2>

            {/* USERS */}
            <AdminTableCard
                title="USERS"
                columns={["username", "level", "status"]}
                rows={users}
                onAdd={() => console.log("ADD USER")}
                onEdit={(row) => console.log("EDIT USER", row)}
                onDelete={(row) => console.log("DELETE USER", row)}
                extraAction={{
                    label: "Reset XP",
                    onClick: (row) => console.log("RESET XP", row),
                }}
            />

            {/* HABITS */}
            <AdminTableCard
                title="HABITS"
                columns={["name", "xp", "frequency"]}
                rows={habits}
                onAdd={() => console.log("ADD HABIT")}
                onEdit={(row) => console.log("EDIT HABIT", row)}
                onDelete={(row) => console.log("DELETE HABIT", row)}
            />

            {/* PUNISHMENTS */}
            <AdminTableCard
                title="PUNISHMENTS"
                columns={["name", "severity", "duration"]}
                rows={punishments}
                onAdd={() => console.log("ADD PUNISHMENT")}
                onEdit={(row) => console.log("EDIT PUNISHMENT", row)}
                onDelete={(row) => console.log("DELETE PUNISHMENT", row)}
            />
        </div>
    );
}
