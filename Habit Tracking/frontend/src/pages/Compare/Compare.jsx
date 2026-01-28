
import { useState } from "react";
import DateRangePicker from "../../components/DateRangePicker/DateRangePicker";
import ComparisonTable from "../../components/ComparisonTable/ComparisonTable";
import ComparisonBar from "../../components/ComparisonBar/ComparisonBar";
import Card from "../../components/Card/Card";
import "./compare.css";

export default function Compare() {
    const today = (new Date()).toISOString().slice(0, 10);
    
    const [range, setRange] = useState({ from: today, to: today });

    const users = [
        { id: 1, name: "HUNTER AK", level: 20, xp: 600, tasksCompleted: 18, tasksFailed: 2, punishmentsAssigned: 3, punishmentsFailed: 1 },
        { id: 2, name: "HUNTER DJ", level: 17, xp: 420, tasksCompleted: 14, tasksFailed: 5, punishmentsAssigned: 4, punishmentsFailed: 2 },
    ];

    return (
        <div className="compare-page">
            <h2 className="compare-title">SYSTEM COMPARISON</h2>


            <Card className="compare-controls">
                <DateRangePicker value={range} onChange={setRange} />

                <div className="quick-ranges">
                    <RangeButton days={1} label="1D" setRange={setRange} />
                    <RangeButton days={2} label="2D" setRange={setRange} />
                    <RangeButton days={7} label="7D" setRange={setRange} />
                    <RangeButton days={14} label="14D" setRange={setRange} />
                    <RangeButton days={30} label="30D" setRange={setRange} />
                </div>
            </Card>

            <Card className="compare-table-card">
                <ComparisonTable users={users} />
            </Card>


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