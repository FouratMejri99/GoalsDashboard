export default function Panel({ title, actions, children, className = "", style }) {
  return (
    <div className={`panel ${className}`} style={style}>
      {title && (
        <p className="panel-title">
          <span>{title}</span>
          {actions}
        </p>
      )}
      {children}
    </div>
  );
}
