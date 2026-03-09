const StatCard = ({ icon, label, value, trend, trendValue, color = "primary" }) => {
    return (
        <div className="card shadow-sm border-0 h-100">
            <div className="card-body p-4">
                <div className="d-flex align-items-center mb-3">
                    <div className={`bg-${color} bg-opacity-10 p-3 rounded-3 me-3 text-${color}`}>
                        <i className={`bi ${icon}`} style={{ fontSize: '24px' }}></i>
                    </div>
                    <div>
                        <div className="text-muted small fw-bold text-uppercase" style={{ letterSpacing: '0.5px' }}>{label}</div>
                        <h3 className="mb-0 fw-bold">{value}</h3>
                    </div>
                </div>
                {trend && (
                    <div className="d-flex align-items-center mt-2">
                        <span className={`badge ${trend === 'up' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'} me-2 d-flex align-items-center gap-1`}>
                            <i className={`bi bi-arrow-${trend}`}></i>
                            {trendValue}
                        </span>
                        <span className="text-muted small">from last month</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatCard;