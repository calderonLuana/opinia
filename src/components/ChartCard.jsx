function ChartCard({ title, icon: Icon, action, children, className = '' }) {
  return (
    <section className={`chart-card ${className}`}>
      <header className="chart-card-header">
        <h2>
          {Icon && <Icon size={16} />}
          {title}
        </h2>
        {action}
      </header>
      {children}
    </section>
  );
}

export default ChartCard;