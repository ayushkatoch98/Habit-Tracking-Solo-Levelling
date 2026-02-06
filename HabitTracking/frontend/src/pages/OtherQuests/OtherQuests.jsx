import { useState, useEffect } from "react";
import QuestList from "../../components/QuestList/QuestList";
import instance from "../../../axisInstance";
import { QUEST_STATUS, QUEST_TYPE } from "../../../../backend/src/constant";
import ConfirmPopup from "../../components/ConfirmPopup/ConfirmPopup";
import Card from "../../components/Card/Card";
import "./otherQuests.css";

export default function OtherQuests() {

    const [quests, setQuests] = useState({})

    useEffect(() => {

        instance.get("/quest-logs/others").then(res => {
            console.log(res.data);
            setQuests({...res.data})
        }).catch(err => {
            console.log("Error", err)
            alert(err.response.data.message)
        })

    }, [])


    return (
        <div className="page other-page">
            <div className="page-header">
                <div>
                    <div className="page-kicker">ARCHIVE</div>
                    <h1 className="page-title">OTHER QUESTS</h1>
                    <p className="page-subtitle">Daily record of assigned quests.</p>
                </div>
            </div>

            <div className="other-grid">
                {Object.keys(quests).map((dateKey, index) => (
                    <Card key={`other-quests-${index}`} className="panel-card">
                        <QuestList
                            title={`Quests for ${dateKey}`}
                            items={quests[dateKey]}
                            onSelect={() => { }}
                        />
                    </Card>
                ))}
            </div>
        </div>
    )

}
