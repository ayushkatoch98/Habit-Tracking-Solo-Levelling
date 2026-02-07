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
    const [profile, setProfile] = useState(null);

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


    const fetchProfile = async () => {
        try {
            const res = await instance.get("/auth/me");
            setProfile(res.data);
        } catch (err) {
            console.log("Profile Error", err);
        }
    };

    useEffect(() => {
        Promise.all([
            instance.get("/quest-logs/dashboard"),
            instance.get("/auth/me")
        ])
            .then(([questRes, profileRes]) => {
                setQuests([...questRes.data]);
                setProfile(profileRes.data);
            })
            .catch(err => {
                console.log("Error", err)
                alert(err.response?.data?.message || "Failed to load dashboard data")
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
            await fetchProfile();
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

    const onQuestExpire = (quest) => {
        if (!quest) return;
        if (quest.status !== QUEST_STATUS.PENDING) return;
        if (quest.complete_by && new Date(quest.complete_by) > Date.now()) return;
        onQuestClick(quest, QUEST_STATUS.FAILED);
    };

    const deadline = getNextResetTimestamp(
        profile?.reset_hour_utc,
        profile?.reset_minute_utc
    );


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
                    <SystemTimer deadline={deadline} />
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="dashboard-left">
                    <Card className="panel-card">
                        <div className="panel-title">LEVEL & XP</div>
                        <XPBar
                            level={profile?.level || 1}
                            currentXP={profile?.xp || 0}
                            requiredXP={profile?.max_xp || 100}
                        />
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
                                    onExpire={onQuestExpire}
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
                                    onExpire={onQuestExpire}
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
                                    onExpire={onQuestExpire}
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
                message=""
                confirmText="Mark Completed"
                danger={false}
                secondaryText="Mark Failed"
                secondaryDanger={true}
                onSecondary={() => onQuestClick(showConfirm.quest, QUEST_STATUS.FAILED)}
                onConfirm={() => onQuestClick(showConfirm.quest, QUEST_STATUS.COMPLETED)}
                onCancel={() => setShowConfirm({ isOpen: false, quest: {} })}
            >
                <div className="confirm-quest">
                    <div className="confirm-quest-header">
                        <div className="confirm-quest-title">{showConfirm.quest?.title}</div>
                        <div className="confirm-quest-type">{showConfirm.quest?.quest_type}</div>
                    </div>
                    {showConfirm.quest?.description && (
                        <div className="confirm-quest-desc">{showConfirm.quest.description}</div>
                    )}
                    <div className="confirm-quest-meta">
                        {typeof showConfirm.quest?.quest_xp === "number" && (
                            <div className="detail-pill">+{showConfirm.quest.quest_xp} XP</div>
                        )}
                        {typeof showConfirm.quest?.failed_xp === "number" && (
                            <div className="detail-pill fail">-{Math.abs(showConfirm.quest.failed_xp)} XP</div>
                        )}
                        {showConfirm.quest?.assigned_at && (
                            <div className="detail-pill">Assigned: {formatDateTime(showConfirm.quest.assigned_at)}</div>
                        )}
                        {showConfirm.quest?.complete_by && (
                            <div className="detail-pill">Complete By: {formatDateTime(showConfirm.quest.complete_by)}</div>
                        )}
                    </div>
                </div>
            </ConfirmPopup>
        </div>
    )

}

function formatDateTime(date) {
    const d = new Date(date);
    return d.toLocaleString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function getNextResetTimestamp(resetHourUtc = 18, resetMinuteUtc = 30) {
    const now = new Date();
    const next = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        resetHourUtc,
        resetMinuteUtc,
        0,
        0
    ));

    if (next.getTime() <= now.getTime()) {
        next.setUTCDate(next.getUTCDate() + 1);
    }
    return next.getTime();
}
