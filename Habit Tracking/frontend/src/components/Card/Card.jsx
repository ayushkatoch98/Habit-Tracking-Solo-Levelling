import './card.css';

export default function Card({ children, className = '', style = {} }) {
  return <div className={`system-card ${className}`} style={style}>{children}</div>;
}
