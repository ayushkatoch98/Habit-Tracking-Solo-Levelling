export function Section({ title, children }) {
  return (
    <div className="quest-section">
      {title && <h3>{title}</h3>}
      {children}
    </div>
  );
}
