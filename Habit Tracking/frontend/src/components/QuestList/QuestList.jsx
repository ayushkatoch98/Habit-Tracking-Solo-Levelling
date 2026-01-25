import Card from "../Card/Card";
import { Section } from "../QuestListSection/QuestListSection";
import "./questList.css";

export default function QuestList({ title, items, onSelect, className = '', style = {} }) {
  return (
    <div>
      <Section title={title}>
        {items.map((quest) => (
          <QuestItem
            key={quest.id}
            quest={quest}
            onClick={() => onSelect(quest)}
          />
        ))}
      </Section>

    </div>
  );
}

function QuestItem({ quest, onClick }) {
  return (
    <div
      className={`quest-item ${quest.completed ? "completed" : ""}`}
      onClick={onClick}
    >
      <div className="quest-text">
        <span className="quest-title">{quest.name}</span>

        <span className="quest-subtitle">
          {quest.type || "Daily Quest"}
        </span>

        {quest.description && (
          <span className="quest-description">
            {quest.description}
          </span>
        )}
      </div>

      <div className="quest-checkbox">
        {quest.completed && <span className="checkmark" />}
      </div>
    </div>
  );
}
