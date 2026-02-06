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


    const { completedQuests, pendingQuests, punishmentQuests, weeklyQuests, failedQuests } = useMemo(() => {
        const result = {
            completedQuests: [],
            pendingQuests: [],
            punishmentQuests: [],
            weeklyQuests: [],
            failedQuests: [],
        };

        quests.forEach((quest) => {
            if (quest.quest_type === QUEST_TYPE.PENALTY) {
                if (quest.status === QUEST_STATUS.FAILED) {
                    result.failedQuests.push(quest);
                } else {
                    result.punishmentQuests.push(quest);
                }
            } else if (quest.quest_type === QUEST_TYPE.WEEKLY_QUEST) {
                if (quest.status === QUEST_STATUS.FAILED) {
                    result.failedQuests.push(quest);
                } else {
                    result.weeklyQuests.push(quest);
                }
            } else if (quest.status == QUEST_STATUS.FAILED) {
                result.failedQuests.push(quest);
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


    const onQuestClick = async (quest, newStatus) => {

        if (quest.status === QUEST_STATUS.COMPLETED || quest.status === QUEST_STATUS.FAILED) {
            return;
        }

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
            await instance.put(`quest-logs/${quest.id}`, { status: newStatus });
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
                onSelect={(quest) => {
                    if (quest.status === QUEST_STATUS.PENDING) {
                        setShowConfirm({ isOpen: true, quest: { ...quest } })
                    }
                }}
            />

            <br />

            <QuestList
                title="Weekly Quests"
                items={weeklyQuests}
                onSelect={(quest) => {
                    if (quest.status === QUEST_STATUS.PENDING && new Date(quest.complete_by) > Date.now()) {
                        setShowConfirm({ isOpen: true, quest: { ...quest } })
                    }
                }}
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

            <br />

            <QuestList
                title="Failed"
                items={failedQuests}
                onSelect={() => {}}
            />

            <ConfirmPopup
                open={showConfirm.isOpen}
                title="UPDATE QUEST STATUS"
                message="Choose to complete or fail this quest. This action cannot be undone."
                confirmText="Mark Completed"
                dangerous={false}
                secondaryText="Mark Failed"
                secondaryDanger={true}
                onSecondary={() => onQuestClick(showConfirm.quest, QUEST_STATUS.FAILED)}
                onConfirm={() => onQuestClick(showConfirm.quest, QUEST_STATUS.COMPLETED)}
                onCancel={() => setShowConfirm({ isOpen: false, quest: {} })}
            />
            <br />
            <br />
        </>
    )

}
