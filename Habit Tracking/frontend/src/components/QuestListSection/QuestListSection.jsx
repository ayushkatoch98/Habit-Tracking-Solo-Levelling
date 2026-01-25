export function Section({ title, children }) {
  return (
    <div className="quest-section">
      <h3>{title}</h3>
      {children}
    </div>
  );
}