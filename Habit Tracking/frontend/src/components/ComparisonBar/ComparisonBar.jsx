
import "./comparisonBar.css"
export default function ComparisonBar({ label, values, danger }) {
  const max = Math.max(...values.map(v => v.value));

  return (
    <div className={`duel-bar ${danger ? "danger" : ""}`}>
      <span className="duel-label">{label}</span>

      <div className="duel-track">
        {values.map((v) => {
          const isWinner = v.value === max;

          return (
            <div key={v.name} className="duel-row">
              <span className="duel-name">{v.name}</span>

              <div className="duel-meter">
                <div
                  className={`duel-fill ${isWinner ? "winner" : "loser"}`}
                  style={{ width: `${(v.value / max) * 100}%` }}
                />
              </div>

              <span
                className={`duel-value ${isWinner ? "winner" : "loser"}`}
              >
                {v.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
