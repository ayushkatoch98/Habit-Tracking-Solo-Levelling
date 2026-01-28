import { Calendar } from "lucide-react";
import "./dateRangePicker.css";

export default function DateRangePicker({ value, onChange }) {
  return (
    <div className="system-date-range">
      <DateInput
        value={value.from}
        onChange={(v) => onChange({ ...value, from: v })}
      />

      <span className="date-separator">→</span>

      <DateInput
        value={value.to}
        onChange={(v) => onChange({ ...value, to: v })}
      />
    </div>
  );
}

function DateInput({ value, onChange }) {
  return (
    <div className="date-input-wrapper">
      <Calendar size={14} />
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
