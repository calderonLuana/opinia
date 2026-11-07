import { ArrowUp, ArrowDown } from 'lucide-react';

function StatCard({ icon: Icon, value, label, trend, color }) {
  const sube = trend >= 0;

  return (
    <div className="stat-card" style={{ '--stat-color': color }}>
      <Icon size={26} className="stat-icon" />
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      <div className={`stat-trend ${sube ? 'up' : 'down'}`}>
        {sube ? <ArrowUp size={13} /> : <ArrowDown size={13} />}
        {sube ? '+' : ''}
        {trend}%
      </div>
    </div>
  );
}

export default StatCard;