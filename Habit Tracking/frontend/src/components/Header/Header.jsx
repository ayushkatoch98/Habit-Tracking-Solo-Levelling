import './header.css'

export default function Header({ title, subtitle, className = '', style = {} }) {
  return (
    <div className={`system-header ${className}`} style={style}>
      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
}
