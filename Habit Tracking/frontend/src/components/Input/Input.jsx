import './input.css'
export default function Input({ placeholder, type = "text", value, onChange, className = '', style = {} }) {
  return (
    <input
      className={`system-input ${className}`}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      style={style}
    />
  );
}
