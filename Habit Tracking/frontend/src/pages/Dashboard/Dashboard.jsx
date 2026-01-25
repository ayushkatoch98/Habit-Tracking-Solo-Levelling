import PlanChecklist from "../../components/PlanChecklist/PlanChecklist";
import { useState, useMemo } from "react";
import QuestList from "../../components/QuestList/QuestList";
import XPBar from "../../components/XPBar/XPBar";
import SystemTimer from "../../components/SystemTimer/SystemTimer";
export default function Dashboard() {

    const [quests, setQuests] = useState([
        {
            id: 1,
            name: "Sit-ups",
            progress: 50,
            total: 100,
            description: "Strengthen your core muscles.",
            type: "Daily Quest",
            completed: false
        },
        {
            id: 2,
            name: "Squats",
            progress: 50,
            total: 100,
            description: "Build lower body strength.",
            type: "Daily Quest",
            completed: false
        },
        {
            id: 3,
            name: "Running",
            progress: 5,
            total: "5km",
            description: "Maintain cardiovascular stamina.",
            type: "Daily Quest",
            completed: false
        },
        {
            id: 4,
            name: "Meditation",
            progress: 5,
            total: 10,
            description: "Calm the mind and improve focus.",
            type: "Daily Quest",
            completed: false
        },
        {
            id: 101,
            name: "Push-ups",
            progress: 100,
            total: 100,
            description: "Upper body endurance training.",
            type: "Daily Quest",
            completed: true
        },
        {
            id: 102,
            name: "Diamond Push-ups",
            progress: 100,
            total: 100,
            description: "Advanced chest and triceps workout.",
            type: "Daily Quest",
            completed: true
        },
        {
            id: 103,
            name: "Drink Water",
            progress: 4,
            total: "4L",
            description: "Stay hydrated throughout the day.",
            type: "Daily Quest",
            completed: true
        },
        {
            id: 201,
            name: "Cold Shower",
            progress: 0,
            total: 1,
            description: "Endure a 2-minute cold shower.",
            type: "Penalty",
            completed: true
        },
        {
            id: 202,
            name: "No Sugar",
            progress: 0,
            total: 24,
            description: "Avoid all sugar for the next 24 hours.",
            type: "Penalty",
            completed: false
        },
        {
            id: 203,
            name: "Extra Run",
            progress: 0,
            total: "2km",
            description: "Additional running as punishment.",
            type: "Penalty",
            completed: false
        },
    ])

    const { completedQuests, pendingQuests, punishmentQuests } = useMemo(() => {
        const result = {
            completedQuests: [],
            pendingQuests: [],
            punishmentQuests: [],
        };

        quests.forEach((quest) => {
            if (quest.type?.toLowerCase() === "penalty") {
                result.punishmentQuests.push(quest);
            } else if (quest.completed) {
                result.completedQuests.push(quest);
            } else {
                result.pendingQuests.push(quest);
            }
        });

        return result;

    }, [quests]);


    const onQuestClick = (quest) => {

        setQuests(prev => {

            return prev.map(item => {
                if (item.id == quest.id) {
                    return { ...item, completed: !item.completed }
                }
                return item;

            });

        })

    }

    const deadline = new Date();
    deadline.setSeconds(deadline.getSeconds() + 301);


    return (
        <>

            <XPBar level={20} currentXP={600} requiredXP={1000} />
            <br />

            <SystemTimer
                deadline={deadline.getTime()}
                onExpire={() => {
                    console.log("LOCKED → APPLY PUNISHMENTS");
                }}
            />
            <br />

            <QuestList
                title="Plan"
                items={pendingQuests}
                onSelect={onQuestClick}
            />

            <br />

            <QuestList
                title="Completed"
                items={completedQuests}
                onSelect={onQuestClick}
            />

            <br />
            <QuestList
                title="Punishments"
                items={punishmentQuests}
                onSelect={onQuestClick}
            />

            <br />
            <br />
        </>
    )

}