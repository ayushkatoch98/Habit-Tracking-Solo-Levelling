import PlanChecklist from "../../components/PlanChecklist/PlanChecklist";
import { useState, useMemo, useEffect } from "react";
import QuestList from "../../components/QuestList/QuestList";
import XPBar from "../../components/XPBar/XPBar";
import SystemTimer from "../../components/SystemTimer/SystemTimer";
import instance from "../../../axisInstance";
import { QUEST_STATUS, QUEST_TYPE } from "../../../../backend/src/constant";
import ConfirmPopup from "../../components/ConfirmPopup/ConfirmPopup";

export default function Dashboard() {

    const [quests, setQuests] = useState([])

    const [showConfirm, setShowConfirm] = useState({
        isOpen: false,
        quest: {}
    });


    const { completedQuests, pendingQuests, punishmentQuests } = useMemo(() => {
        const result = {
            completedQuests: [],
            pendingQuests: [],
            punishmentQuests: [],
        };

        quests.forEach((quest) => {
            if (quest.quest_type === QUEST_TYPE.PENALTY) {
                result.punishmentQuests.push(quest);
            } else if (quest.status == QUEST_STATUS.COMPLETED) {
                result.completedQuests.push(quest);
            } else {
                result.pendingQuests.push(quest);
            }
        });

        return result;

    }, [quests]);


    useEffect(() => {

        instance.get("/quest-logs/dashboard").then(res => {
            console.log(res.data);
            setQuests([...res.data])
        }).catch(err => {
            console.log("Error", err)
            alert(err.response.data.message)
        })

    }, [])


    const onQuestClick = async (quest) => {

        if (quest.status === QUEST_STATUS.COMPLETED) {
            return;
        }

       
        const newStatus = QUEST_STATUS.COMPLETED

        // 1️⃣ Optimistic UI update
        setQuests(prev =>
            prev.map(item =>
                item.id === quest.id
                    ? { ...item, status: newStatus }
                    : item
            )
        );

        // 2️⃣ API call
        try {
            await instance.put(`quest-logs/${quest.id}`, {
                status: newStatus,
            });
            setShowConfirm({ isOpen: false, quest: {} })
        } catch (err) {
            console.error("Error", err);
            alert(err.response?.data?.message || "Something went wrong");

            // 3️⃣ Rollback on failure
            setQuests(prev =>
                prev.map(item =>
                    item.id === quest.id
                        ? { ...item, status: quest.status }
                        : item
                )
            );

            setShowConfirm({ isOpen: false, quest: {} })
        }
    };

    const deadline = new Date();
    deadline.setSeconds(deadline.getSeconds() + 301);


    return (
        <>

            <XPBar level={20} currentXP={600} requiredXP={1000} />
            <br />

 

            <QuestList
                title="Plan"
                items={pendingQuests}
                onSelect={(quest) => setShowConfirm({ isOpen: true, quest: {...quest} })}
            />

            <br />
            
            <QuestList
                title="Punishments"
                items={punishmentQuests}
                onSelect={(quest) => {
                    if (quest.status === QUEST_STATUS.PENDING && new Date(quest.complete_by) > Date.now()) setShowConfirm({ isOpen: true, quest: {...quest} })
                }}
            />

            <br />

            <QuestList
                title="Completed"
                items={completedQuests}
                onSelect={() => {}}
            />

            <ConfirmPopup
                open={showConfirm.isOpen}
                title="MARK QUEST AS COMPLETED?"
                message="This action cannot be undone."
                confirmText="Confirm"
                dangerous={true}
                onConfirm={() => onQuestClick(showConfirm.quest)}
                onCancel={() => setShowConfirm({ isOpen: false, quest: {} })}
            />
            <br />
            <br />
        </>
    )

}