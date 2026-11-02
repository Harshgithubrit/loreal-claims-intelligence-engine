
function StatCard({ title, value, description, icon: Icon }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{title}</span>
        <Icon size={21} />
      </div>

      <h2>{value}</h2>
      <p>{description}</p>
    </div>
  );
}

export default StatCard;
