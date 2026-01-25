import AdminTableCard from "../../components/AdminTableCard/AdminTableCard";
import { useEffect, useState } from "react";
import "./admin.css";
import AdminPopup from "../../components/AdminPopup/AdminPopup";
import instance from "../../../axisInstance";

export default function Admin() {

    const users = [
        { username: "hunter1", level: 12, status: "Active" },
        { username: "hunter2", level: 7, status: "Banned" },
    ];

    // const [users, setUsers] = useState([]);
    const [quests, setQuests] = useState([]);





    useEffect(() => {

        instance.get("/quests").then(res => {
            console.log(res);
            setQuests([...res.data])
        }).catch(err => {
            console.log("Error", err)
            alert(err.response.data.message)
        })


        // instance.get("/users").then(res => {
        //     console.log(res);
        //     setUsers([...res.data])
        // }).catch(err => {
        //     console.log("Error", err)
        //     alert(err.response.data.message)
        // })
    }, [])



    const [popup, setPopup] = useState({
        open: false,
        mode: null,
        entity: null,
        data: null,
    });


    const openCreate = (entity) =>
        setPopup({ open: true, mode: "create", entity, data: null });

    const openEdit = (entity, data) =>
        setPopup({ open: true, mode: "edit", entity, data });

    const closePopup = () =>
        setPopup({ open: false, mode: null, entity: null, data: null });

    const handleSubmit = (formData, type, isEdit) => {
        console.log("ALL SUBMIT DATA", formData, type, isEdit);

        if (type == "quest") {
            formData.xp_reward = parseInt(formData.xp_reward);
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

        else if (type == "user"){
            if (!isEdit){
                // Creating
                instance.post("/auth/register", formData).then(res => {
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
    return (
        <div className="admin-page">
            <h2 className="admin-title">SYSTEM ADMIN PANEL</h2>

            {/* USERS */}
            <AdminTableCard
                title="USERS"
                columns={["username", "level", "status"]}
                rows={users}
                onAdd={() => openCreate("user")}
                onEdit={(row) => openEdit("user", row)}
                onDelete={(row) => console.log("DELETE USER", row)}
                extraAction={{
                    label: "Reset XP",
                    onClick: (row) => console.log("RESET XP", row),
                }}
            />

            {/* QUESTS */}
            <AdminTableCard
                title="QUESTS"
                columns={["id", "title", "description", "xp_reward", "quest_type"]}
                rows={quests}
                onAdd={() => openCreate("quest")}
                onEdit={(row) => openEdit("quest", row)}
                onDelete={(row) => console.log("DELETE QUEST", row)}
            />


            <AdminPopup
                open={popup.open}
                mode={popup.mode}
                entity={popup.entity}
                data={popup.data}
                onClose={closePopup}
                onSubmit={handleSubmit}
            />
        </div>
    );
}
