import AdminTableCard from "../../components/AdminTableCard/AdminTableCard";
import { useEffect, useState } from "react";
import "./admin.css";
import AdminPopup from "../../components/AdminPopup/AdminPopup";
import instance from "../../../axisInstance";

export default function Admin() {

    const [users, setUsers] = useState([]);

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

        instance.get("/auth/").then(res => {
            console.log("users", res);
            setUsers([...res.data])
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
    return (
        <div className="admin-page">
            <h2 className="admin-title">SYSTEM ADMIN PANEL</h2>

            {/* USERS */}
            <AdminTableCard
                title="USERS"
                columns={users.length > 0 ? Object.keys(users[0]) : []}
                rows={users}
                onAdd={() => {}}
                tableType="users"
            />

            {/* QUESTS */}
            <AdminTableCard
                title="QUESTS"
                columns={quests.length > 0 ? Object.keys(quests[0]) : []}
                rows={quests}
                onAdd={() => openCreate("QUEST")}
            />


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
