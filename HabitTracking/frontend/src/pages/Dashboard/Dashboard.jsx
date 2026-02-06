import { useState, useMemo, useEffect } from "react";
import QuestList from "../../components/QuestList/QuestList";
import XPBar from "../../components/XPBar/XPBar";
import SystemTimer from "../../components/SystemTimer/SystemTimer";
import instance from "../../../axisInstance";
import { QUEST_STATUS, QUEST_TYPE } from "../../../../backend/src/constant";
import ConfirmPopup from "../../components/ConfirmPopup/ConfirmPopup";
import Card from "../../components/Card/Card";
import "./Dashboard.css";

export default function Dashboard() {

    const [quests, setQuests] = useState([])

    const [showConfirm, setShowConfirm] = useState({
        isOpen: false,
        quest: {}
    });

    const [visibleSections, setVisibleSections] = useState({
        daily: true,
        weekly: true,
        penalties: true,
        completed: true,
        failed: true
    });
    const [collapsed, setCollapsed] = useState({
        daily: false,
        weekly: false,
        penalties: false,
        completed: false,
        failed: false
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

        setShowConfirm({ isOpen: false, quest: {} });

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

        }
    };

    const deadline = new Date();
    deadline.setHours(23, 59, 59, 999);


    return (
        <div className="page dashboard-page">
            <div className="page-header">
                <div>
                    <div className="page-kicker">SYSTEM</div>
                    <h1 className="page-title">HUNTER DASHBOARD</h1>
                    <p className="page-subtitle">Daily directives, weekly trials, and penalties.</p>
                </div>
                <div className="page-meta">
                    <div className="meta-label">Reset</div>
                    <SystemTimer deadline={deadline.getTime()} />
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="dashboard-left">
                    <Card className="panel-card">
                        <div className="panel-title">LEVEL & XP</div>
                        <XPBar level={20} currentXP={600} requiredXP={1000} />
                    </Card>

                    <Card className="panel-card">
                        <div className="panel-title">OVERVIEW</div>
                        <div className="stat-grid">
                            <div className="stat-card">
                                <div className="stat-label">Pending</div>
                                <div className="stat-value">{pendingQuests.length}</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-label">Weekly</div>
                                <div className="stat-value">{weeklyQuests.length}</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-label">Penalties</div>
                                <div className="stat-value">{punishmentQuests.length}</div>
                            </div>
                            <div className="stat-card danger">
                                <div className="stat-label">Failed</div>
                                <div className="stat-value">{failedQuests.length}</div>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="dashboard-right">

                    {visibleSections.daily && (
                        <Card className="panel-card">
                            <div className="section-header">
                                <div className="section-title">Daily Directives</div>
                                <button className="section-toggle" onClick={() => setCollapsed(c => ({...c, daily: !c.daily}))}>
                                    {collapsed.daily ? "Expand" : "Collapse"}
                                </button>
                            </div>
                            {!collapsed.daily && (
                                <QuestList
                                    title=""
                                    items={pendingQuests}
                                    onSelect={(quest) => {
                                        if (quest.status === QUEST_STATUS.PENDING) {
                                            setShowConfirm({ isOpen: true, quest: { ...quest } })
                                        }
                                    }}
                                />
                            )}
                        </Card>
                    )}

                    {visibleSections.weekly && (
                        <Card className="panel-card">
                            <div className="section-header">
                                <div className="section-title">Weekly Trials</div>
                                <button className="section-toggle" onClick={() => setCollapsed(c => ({...c, weekly: !c.weekly}))}>
                                    {collapsed.weekly ? "Expand" : "Collapse"}
                                </button>
                            </div>
                            {!collapsed.weekly && (
                                <QuestList
                                    title=""
                                    items={weeklyQuests}
                                    onSelect={(quest) => {
                                        if (quest.status === QUEST_STATUS.PENDING && new Date(quest.complete_by) > Date.now()) {
                                            setShowConfirm({ isOpen: true, quest: { ...quest } })
                                        }
                                    }}
                                />
                            )}
                        </Card>
                    )}

                    {visibleSections.penalties && (
                        <Card className="panel-card">
                            <div className="section-header">
                                <div className="section-title">Penalties</div>
                                <button className="section-toggle" onClick={() => setCollapsed(c => ({...c, penalties: !c.penalties}))}>
                                    {collapsed.penalties ? "Expand" : "Collapse"}
                                </button>
                            </div>
                            {!collapsed.penalties && (
                                <QuestList
                                    title=""
                                    items={punishmentQuests}
                                    onSelect={(quest) => {
                                        if (quest.status === QUEST_STATUS.PENDING && new Date(quest.complete_by) > Date.now()) setShowConfirm({ isOpen: true, quest: {...quest} })
                                    }}
                                />
                            )}
                        </Card>
                    )}

                    {(visibleSections.completed || visibleSections.failed) && (
                        <div className="split-row">
                            {visibleSections.completed && (
                                <Card className="panel-card">
                                    <div className="section-header">
                                        <div className="section-title">Completed</div>
                                        <button className="section-toggle" onClick={() => setCollapsed(c => ({...c, completed: !c.completed}))}>
                                            {collapsed.completed ? "Expand" : "Collapse"}
                                        </button>
                                    </div>
                                    {!collapsed.completed && (
                                        <QuestList
                                            title=""
                                            items={completedQuests}
                                            onSelect={() => {}}
                                        />
                                    )}
                                </Card>
                            )}
                            {visibleSections.failed && (
                                <Card className="panel-card">
                                    <div className="section-header">
                                        <div className="section-title">Failed</div>
                                        <button className="section-toggle" onClick={() => setCollapsed(c => ({...c, failed: !c.failed}))}>
                                            {collapsed.failed ? "Expand" : "Collapse"}
                                        </button>
                                    </div>
                                    {!collapsed.failed && (
                                        <QuestList
                                            title=""
                                            items={failedQuests}
                                            onSelect={() => {}}
                                        />
                                    )}
                                </Card>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <ConfirmPopup
                open={showConfirm.isOpen}
                title="UPDATE QUEST STATUS"
                message="Choose to complete or fail this quest. This action cannot be undone."
                confirmText="Mark Completed"
                danger={false}
                secondaryText="Mark Failed"
                secondaryDanger={true}
                onSecondary={() => onQuestClick(showConfirm.quest, QUEST_STATUS.FAILED)}
                onConfirm={() => onQuestClick(showConfirm.quest, QUEST_STATUS.COMPLETED)}
                onCancel={() => setShowConfirm({ isOpen: false, quest: {} })}
            />
        </div>
    )

}
