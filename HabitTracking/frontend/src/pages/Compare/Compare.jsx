
import { useEffect, useState } from "react";
import DateRangePicker from "../../components/DateRangePicker/DateRangePicker";
import ComparisonTable from "../../components/ComparisonTable/ComparisonTable";
import ComparisonBar from "../../components/ComparisonBar/ComparisonBar";
import Card from "../../components/Card/Card";
import "./compare.css";
import instance from "../../../axisInstance";

export default function Compare() {

    
    const today = (new Date()).toISOString().split("T")[0];
    
    const [range, setRange] = useState({ from: today, to: today });
    const [compareData, setCompareData] = useState({ users: [
        {
            "username": "ak",
            "stats": {
                "daily_completed": 21,
                "daily_failed": 155,
                "daily_pending": 4,
                "penalty_assigned": 22,
                "penalty_completed": 3,
                "penalty_failed": 19,
                "xp_gained": 1040,
                "xp_lost": 6755,
                "net_xp": -5715,
                "failure_rate": 86.1
            }
        },
        {
            "username": "bk",
            "stats": {
                "daily_completed": 45,
                "daily_failed": 155,
                "daily_pending": 4,
                "penalty_assigned": 22,
                "penalty_completed": 3,
                "penalty_failed": 19,
                "xp_gained": 1040,
                "xp_lost": 6755,
                "net_xp": -5715,
                "failure_rate": 86.1
            }
        }
    ], winner: null });
    
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
                winner: res.data.winner
            });
        }).catch(err => {
            console.log("Error", err)
            alert(err.response.data.message)
        });
    }, [range])

  

    return (
        <div className="max-w-5xl mx-auto compare-page">

            {/* Header */}
            <h1 className="text-2xl font-bold text-center">
                Discipline Comparison
            </h1>

            <Card className="compare-controls">
                <DateRangePicker value={range} onChange={setRange} />

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

            {
                compareData.users.length === 0 && (
                    <div className="text-center text-gray-400">
                        No data available for the selected date range.
                    </div> 
                )
            }

       
            <ComparisonTable users={compareData.users} />
            
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