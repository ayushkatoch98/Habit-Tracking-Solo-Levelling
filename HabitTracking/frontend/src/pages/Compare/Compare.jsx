
import { useEffect, useState } from "react";
import DateRangePicker from "../../components/DateRangePicker/DateRangePicker";
import ComparisonTable from "../../components/ComparisonTable/ComparisonTable";
import Card from "../../components/Card/Card";
import "./compare.css";
import instance from "../../../axisInstance";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    CartesianGrid,
    LineChart,
    Line
} from "recharts";

export default function Compare() {


    const today = (new Date()).toISOString().split("T")[0];

    const [range, setRange] = useState({ from: today, to: today });
    const [compareData, setCompareData] = useState({
        users: [
            {
                "username": "ak",
                "stats": {
                    "daily_completed": 0,
                    "daily_failed": 0,
                    "daily_pending": 0,
                    "weekly_completed": 0,
                    "weekly_failed": 0,
                    "weekly_pending": 0,
                    "penalty_assigned": 0,
                    "penalty_completed": 0,
                    "penalty_failed": 0,
                    "xp_gained": 0,
                    "xp_lost": 0,
                    "net_xp": 0,
                    "failure_rate": 0
                }
            },
            {
                "username": "bk",
                "stats": {
                    "daily_completed": 0,
                    "daily_failed": 0,
                    "daily_pending": 0,
                    "weekly_completed": 0,
                    "weekly_failed": 0,
                    "weekly_pending": 0,
                    "penalty_assigned": 0,
                    "penalty_completed": 0,
                    "penalty_failed": 0,
                    "xp_gained": 0,
                    "xp_lost": 0,
                    "net_xp": 0,
                    "failure_rate": 0
                }
            }
        ], winner: null, timeline: []
    });

    //     {
    //     "range": {},
    //     "users": [
    //         {
    //             "username": "ak",
    //             "stats": {
    //                 "daily_completed": 21,
    //                 "daily_failed": 155,
    //                 "daily_pending": 4,
    //                 "penalty_assigned": 22,
    //                 "penalty_completed": 3,
    //                 "penalty_failed": 19,
    //                 "xp_gained": 1040,
    //                 "xp_lost": 6755,
    //                 "net_xp": -5715,
    //                 "failure_rate": 86.1
    //             }
    //         },

    //         {
    //             "username": "bk",
    //             "stats": {
    //                 "daily_completed": 21,
    //                 "daily_failed": 155,
    //                 "daily_pending": 4,
    //                 "penalty_assigned": 22,
    //                 "penalty_completed": 3,
    //                 "penalty_failed": 19,
    //                 "xp_gained": 1040,
    //                 "xp_lost": 6755,
    //                 "net_xp": -5715,
    //                 "failure_rate": 86.1
    //             }
    //         }
    //     ],
    //     "winner": null
    // }

    // useEffect(() =>{
    //     instance.get("/quest-logs/compare").then(res => {
    //         console.log(res.data);
    //         setCompareData({
    //             users: res.data.users,
    //             winner: res.data.winner
    //         });
    //     }).catch(err => {
    //         console.log("Error", err)
    //         alert(err.response.data.message)
    //     });
    // }, [])

    useEffect(() => {
        // Fetch comparison data whenever the date range changes
        const startDate = range.from;
        const endDate = range.to;
        instance.get(`/quest-logs/compare?startDate=${startDate}&endDate=${endDate}`).then(res => {
            console.log(res.data);
            setCompareData({
                users: res.data.users,
                winner: res.data.winner,
                timeline: res.data.timeline || []
            });
        }).catch(err => {
            console.log("Error", err)
            alert(err.response.data.message)
        });
    }, [range])

    const statRows = compareData.users.map(u => {
        const s = u.stats;
        const dailyTotal = s.daily_completed + s.daily_failed + s.daily_pending;
        const weeklyTotal = s.weekly_completed + s.weekly_failed + s.weekly_pending;
        const completionRate = dailyTotal > 0 ? Math.round((s.daily_completed / dailyTotal) * 100) : 0;
        const weeklyCompletionRate = weeklyTotal > 0 ? Math.round((s.weekly_completed / weeklyTotal) * 100) : 0;
        const penaltyTotal = s.penalty_assigned;
        const totalCompleted = s.daily_completed + s.weekly_completed + s.penalty_completed;
        const totalAssigned = dailyTotal + weeklyTotal;
        const penaltyRatio = totalAssigned > 0 ? Math.round((penaltyTotal / totalAssigned) * 100) : 0;
        const avgXp = totalCompleted > 0 ? Math.round(s.xp_gained / totalCompleted) : 0;
        const disciplineScore = Math.round(
            (s.xp_gained - s.xp_lost) + (completionRate * 2) - (s.daily_failed * 3)
        );

        return {
            name: u.username,
            daily_completed: s.daily_completed,
            daily_failed: s.daily_failed,
            daily_pending: s.daily_pending,
            weekly_completed: s.weekly_completed,
            weekly_failed: s.weekly_failed,
            weekly_pending: s.weekly_pending,
            xp_gained: s.xp_gained,
            xp_lost: s.xp_lost,
            net_xp: s.net_xp,
            failure_rate: s.failure_rate,
            completion_rate: completionRate,
            weekly_completion_rate: weeklyCompletionRate,
            penalty_assigned: penaltyTotal,
            penalty_ratio: penaltyRatio,
            avg_xp: avgXp,
            discipline_score: disciplineScore
        };
    });

    const chartBars = statRows.map(r => ({
        name: r.name.toUpperCase(),
        Daily: r.daily_completed,
        Weekly: r.weekly_completed,
        Penalty: r.penalty_assigned
    }));

    const chartXP = statRows.map(r => ({
        name: r.name.toUpperCase(),
        Gained: r.xp_gained,
        Lost: r.xp_lost,
        Net: r.net_xp
    }));

    const timelineRows = compareData.timeline || [];
    const dateKeys = [];
    if (range.from && range.to) {
        const d1 = new Date(range.from);
        const d2 = new Date(range.to);
        for (let d = new Date(d1); d <= d2; d.setDate(d.getDate() + 1)) {
            dateKeys.push(d.toISOString().slice(0, 10));
        }
    }
    const timelineMap = {};
    timelineRows.forEach(r => {
        const date = r.date;
        if (!timelineMap[date]) timelineMap[date] = {};
        timelineMap[date][r.username] = r;
    });
    const timelineChart = dateKeys.map(date => {
        const row = { date };
        statRows.forEach(u => {
            const rec = timelineMap[date]?.[u.name];
            row[`${u.name}_net`] = rec ? rec.net_xp : 0;
            row[`${u.name}_fail`] = rec ? rec.daily_failed + rec.weekly_failed : 0;
        });
        return row;
    });

    const calcStreaks = (username) => {
        let current = 0;
        let best = 0;
        let running = 0;
        for (const date of dateKeys) {
            const rec = timelineMap[date]?.[username];
            const completed = rec ? (rec.daily_completed + rec.weekly_completed) : 0;
            const failed = rec ? (rec.daily_failed + rec.weekly_failed) : 0;
            const success = completed > 0 && failed === 0;
            if (success) {
                running += 1;
                best = Math.max(best, running);
            } else {
                running = 0;
            }
        }
        // current streak from end
        current = 0;
        for (let i = dateKeys.length - 1; i >= 0; i -= 1) {
            const rec = timelineMap[dateKeys[i]]?.[username];
            const completed = rec ? (rec.daily_completed + rec.weekly_completed) : 0;
            const failed = rec ? (rec.daily_failed + rec.weekly_failed) : 0;
            const success = completed > 0 && failed === 0;
            if (success) current += 1;
            else break;
        }
        return { current, best };
    };

    return (
        <div className="page compare-page">
            <div className="page-header">
                <div>
                    <div className="page-kicker">DUEL</div>
                    <h1 className="page-title">DISCIPLINE COMPARISON</h1>
                    <p className="page-subtitle">Measure dominance, failure rate, and XP flow.</p>
                </div>
                <div className="page-meta">
                    <div className="meta-label">Range</div>
                    <DateRangePicker value={range} onChange={setRange} />
                </div>
            </div>

            <Card className="compare-controls">
                <div className="quick-ranges">
                    <RangeButton days={1} label="1D" setRange={setRange} />
                    <RangeButton days={2} label="2D" setRange={setRange} />
                    <RangeButton days={7} label="7D" setRange={setRange} />
                    <RangeButton days={14} label="2W" setRange={setRange} />
                    <RangeButton days={21} label="3W" setRange={setRange} />
                    <RangeButton days={30} label="1M" setRange={setRange} />
                    <RangeButton days={60} label="2M" setRange={setRange} />
                    <RangeButton days={90} label="3M" setRange={setRange} />
                    <RangeButton days={180} label="6M" setRange={setRange} />
                </div>
            </Card>

            {compareData.users.length === 0 && (
                <div className="empty-state">
                    No data available for the selected date range.
                </div>
            )}

            <Card className="compare-summary">
                <div className="compare-summary-grid">
                    {statRows.map((row) => (
                        <div key={row.name} className="summary-card">
                            <div className="summary-title">{row.name.toUpperCase()}</div>
                            <div className="summary-row">
                                <span>Completion Rate</span>
                                <span>{row.completion_rate}%</span>
                            </div>
                            <div className="summary-row">
                                <span>Weekly Completion</span>
                                <span>{row.weekly_completion_rate}%</span>
                            </div>
                            <div className="summary-row">
                                <span>Failure Rate</span>
                                <span>{row.failure_rate}%</span>
                            </div>
                            <div className="summary-row">
                                <span>Penalty Ratio</span>
                                <span>{row.penalty_ratio}%</span>
                            </div>
                            <div className="summary-row">
                                <span>Avg XP / Quest</span>
                                <span>{row.avg_xp}</span>
                            </div>
                            <div className="summary-row">
                                <span>Net XP</span>
                                <span>{row.net_xp}</span>
                            </div>
                            <div className="summary-row">
                                <span>Current Streak</span>
                                <span>{calcStreaks(row.name).current}d</span>
                            </div>
                            <div className="summary-row">
                                <span>Best Streak</span>
                                <span>{calcStreaks(row.name).best}d</span>
                            </div>
                            <div className="summary-row">
                                <span>Discipline Score</span>
                                <span>{row.discipline_score}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            <Card className="compare-charts">
                <h3 className="compare-section-title">QUEST OUTPUT</h3>
                <div className="chart-block">
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={chartBars}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(110,170,200,0.2)" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="Daily" fill="#4de0ff" radius={[6, 6, 0, 0]} />
                            <Bar dataKey="Weekly" fill="#2b7bff" radius={[6, 6, 0, 0]} />
                            <Bar dataKey="Penalty" fill="#ff4b6e" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            <Card className="compare-charts">
                <h3 className="compare-section-title">XP FLOW</h3>
                <div className="chart-block">
                    <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={chartXP}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(110,170,200,0.2)" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="Gained" stroke="#4de0ff" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="Lost" stroke="#ff4b6e" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="Net" stroke="#6bffb3" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            <Card className="compare-charts">
                <h3 className="compare-section-title">DAILY NET XP TIMELINE</h3>
                <div className="chart-block">
                    <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={timelineChart}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(110,170,200,0.2)" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            {statRows.map((u, idx) => (
                                <Line
                                    key={u.name}
                                    type="monotone"
                                    dataKey={`${u.name}_net`}
                                    name={`${u.name.toUpperCase()} Net XP`}
                                    stroke={idx % 2 === 0 ? "#6aa9ff" : "#6f5bff"}
                                    strokeWidth={2}
                                    dot={false}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            <Card className="compare-table-card">
                <ComparisonTable users={compareData.users} />
            </Card>

        </div>
    );
}
function WinnerBanner({ winner, users }) {
    if (!winner) {
        return (
            <div className="bg-yellow-900/30 border border-yellow-700 text-yellow-300 p-4 rounded text-center">
                No winner yet. Everyone is equally disappointing 😐
            </div>
        );
    }

    return (
        <div className="bg-green-900/30 border border-green-700 text-green-300 p-4 rounded text-center">
            🏆 <span className="font-bold">{winner}</span> is winning.
            {users.length === 1 && " (By default 😅)"}
        </div>
    );
}

function UserStatsCard({ user }) {
    const s = user.stats;
    const netXpColor =
        s.net_xp >= 0 ? "text-green-400" : "text-red-400";

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 space-y-3">
            <h2 className="text-xl font-semibold text-center">
                {user.username.toUpperCase()}
            </h2>

            <Stat label="Daily Completed" value={s.daily_completed} />
            <Stat label="Daily Failed" value={s.daily_failed} />
            <Stat label="Daily Pending" value={s.daily_pending} />

            <hr className="border-gray-700" />

            <Stat label="Penalty Assigned" value={s.penalty_assigned} />
            <Stat label="Penalty Completed" value={s.penalty_completed} />
            <Stat label="Penalty Failed" value={s.penalty_failed} />

            <hr className="border-gray-700" />

            <Stat label="XP Gained" value={s.xp_gained} />
            <Stat label="XP Lost" value={s.xp_lost} />

            <div className="flex justify-between font-semibold">
                <span>Net XP</span>
                <span className={netXpColor}>{s.net_xp}</span>
            </div>

            <FailureRateBar rate={s.failure_rate} />
        </div>
    );
}

function FailureRateBar({ rate }) {
    const color =
        rate < 30
            ? "bg-green-500"
            : rate < 60
                ? "bg-yellow-500"
                : "bg-red-600";

    return (
        <div>
            <div className="flex justify-between text-sm mb-1">
                <span>Failure Rate</span>
                <span>{rate}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded h-3">
                <div
                    className={`${color} h-3 rounded`}
                    style={{ width: `${Math.min(rate, 100)}%` }}
                />
            </div>
        </div>
    );
}

function Stat({ label, value }) {
    return (
        <div className="flex justify-between text-sm">
            <span className="text-gray-400">{label}</span>
            <span>{value}</span>
        </div>
    );
}
function RangeButton({ days, label, setRange }) {
    const handleClick = () => {
        const to = new Date();
        const from = new Date();
        from.setDate(to.getDate() - (days - 1));

        setRange({
            from: from.toISOString().slice(0, 10),
            to: to.toISOString().slice(0, 10),
        });
    };

    return (
        <button className="range-btn" onClick={handleClick}>
            {label}
        </button>
    );
}
