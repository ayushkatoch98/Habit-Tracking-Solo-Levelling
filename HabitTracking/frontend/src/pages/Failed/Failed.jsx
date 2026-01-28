import PlanChecklist from "../../components/PlanChecklist/PlanChecklist";
import { useState, useEffect } from "react";
import QuestList from "../../components/QuestList/QuestList";
import XPBar from "../../components/XPBar/XPBar";
import SystemTimer from "../../components/SystemTimer/SystemTimer";
import instance from "../../../axisInstance";
import { QUEST_STATUS, QUEST_TYPE } from "../../../../backend/src/constant";
import ConfirmPopup from "../../components/ConfirmPopup/ConfirmPopup";

export default function Failed() {

    const [quests, setQuests] = useState([])

    useEffect(() => {

        instance.get("/quest-logs/failed").then(res => {
            console.log(res.data);
            setQuests([...res.data])
        }).catch(err => {
            console.log("Error", err)
            alert(err.response.data.message)
        })

    }, [])


    return (
        <>

            <br />

            <QuestList
                title="Failed Quests"
                items={quests}
                onSelect={() => {}}
            />

           <br />
           <br />
        </>
    )

}