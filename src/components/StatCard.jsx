import "../styles/matdash-theme.css";

const StatCard = ({ icon, label, value, trend, trendValue, color = "primary", progress }) => {
    return (
        <div className="stat-card">
            <div className={`stat-icon ${color}`}>
                <i className={`bi ${icon}`}></i>
            </div>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>

            {trend && (
                <span className={`stat-trend ${trend}`}>
                    <i className={`bi bi-arrow-${trend === 'up' ? 'up' : 'down'}`}></i>
                    {trendValue}
                </span>
            )}

            {progress !== undefined && (
                <div className="matdash-progress">
                    <div
                        className={`matdash-progress-bar ${color}`}
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            )}
        </div>
    );
};

export default StatCard;
