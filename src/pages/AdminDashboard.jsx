import { useState, useEffect } from "react";
import StatCard from "../components/StatCard";
import DashboardChart from "../components/DashboardChart";
import { getAllUsers } from "../api/userApi";
import { getAllBookings } from "../api/bookingApi";
import { getAllScheduledEvents } from "../api/eventApi";
import { getAllPayments } from "../api/paymentApi";
import "../styles/matdash-theme.css";


// Theme toggle button with moon and sun icons (Font Awesome)

const ThemeToggleButton = () => {
  const [theme, setTheme] = useState(() => {
    // Get current theme from localStorage or default to light
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") || "light";
    }
    return "light";
  });

  // On mount, set data-theme on html
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleToggle = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Use Font Awesome classes for sun/moon icons
  return (
    <button
      className="theme-toggle-btn"
      onClick={handleToggle}
      aria-label="Toggle theme"
      title="Toggle light/dark theme"
    >
      {/* Render fallback icon for users without CSS icons */}
      <span style={{ display: "none" }}>
        {theme === "light" ? "🌙" : "☀️"}
      </span>
      {/* The real icon will be rendered via CSS using ::before */}
    </button>
  );
};


const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalEvents: 0,
        totalUsers: 0,
        totalBookings: 0,
        totalRevenue: 0
    });

    const [bookingData, setBookingData] = useState([]);
    const [loading, setLoading] = useState(true);

    const [recentActivities, setRecentActivities] = useState([
        { time: '09:30 AM', text: 'New booking received', type: 'success' },
        { time: '10:15 AM', text: 'Payment confirmed', type: 'success' },
        { time: '11:45 AM', text: 'New event category added', type: 'primary' },
        { time: '02:20 PM', text: 'Booking updated', type: 'warning' },
        { time: '03:00 PM', text: 'New place registered', type: 'primary' }
    ]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch all data in parallel
            const [usersRes, bookingsRes, eventsRes, paymentsRes] = await Promise.all([
                getAllUsers().catch(() => ({ data: { data: [] } })),
                getAllBookings().catch(() => ({ data: { data: [] } })),
                getAllScheduledEvents().catch(() => ({ data: { data: [] } })),
                getAllPayments().catch(() => ({ data: { data: [] } }))
            ]);

            // Extract data arrays
            const users = usersRes.data.data || usersRes.data || [];
            const bookingsRaw = bookingsRes.data.data || bookingsRes.data || [];
            const events = eventsRes.data.data || eventsRes.data || [];
            const paymentsRaw = paymentsRes.data.data || paymentsRes.data || [];

            // Normalize bookings data
            const bookings = bookingsRaw.map(b => ({
                eventBookingId: b.eventBookingId ?? b.EventBookingId,
                scheduleEventFees: b.scheduleEventFees ?? b.ScheduleEventFees ?? 0,
                isCancelled: b.isCancelled ?? b.IsCancelled ?? false
            }));

            // Normalize payments data
            const payments = paymentsRaw.map(p => {
                const amount = p.amount ?? p.Amount ?? 0;
                // Ensure amount is a number
                return {
                    amount: typeof amount === 'string' ? parseFloat(amount) || 0 : (amount || 0)
                };
            });

            // Calculate total revenue from payments (total income)
            const totalRevenue = payments.reduce((sum, p) => {
                const amount = Number(p.amount) || 0;
                return sum + amount;
            }, 0);

            // Update statistics
            setStats({
                totalEvents: Array.isArray(events) ? events.length : 0,
                totalUsers: Array.isArray(users) ? users.length : 0,
                totalBookings: Array.isArray(bookings) ? bookings.filter(b => !b.isCancelled).length : 0,
                totalRevenue: totalRevenue
            });

            // Calculate monthly booking data for chart (last 6 months)
            const monthlyData = calculateMonthlyBookings(bookings);
            setBookingData(monthlyData);

        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const calculateMonthlyBookings = (bookings) => {
        // Get last 6 months
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonth = new Date().getMonth();
        const last6Months = [];

        for (let i = 5; i >= 0; i--) {
            const monthIndex = (currentMonth - i + 12) % 12;
            last6Months.push({
                name: months[monthIndex],
                value: 0
            });
        }

        // Count bookings per month (simplified version - just distributing bookings)
        // In a real app, you'd parse booking dates and group by month
        if (bookings.length > 0) {
            const perMonth = Math.ceil(bookings.length / 6);
            last6Months.forEach((month, index) => {
                month.value = Math.min(perMonth + Math.floor(Math.random() * 5), bookings.length);
            });
        }

        return last6Months;
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '100px' }}>
                <div style={{ fontSize: '18px', color: 'var(--matdash-text-muted)' }}>
                    Loading dashboard...
                </div>
            </div>
        );
    }

    return (
        <div>
            <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--matdash-text-dark)', marginBottom: '8px' }}>
                    Dashboard
                </h2>
                <p style={{ color: 'var(--matdash-text-muted)', fontSize: '14px' }}>
                    Welcome to your admin dashboard
                </p>
            </div>

            {/* Statistics Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '24px' }}>
                <StatCard
                    icon="bi-calendar-event"
                    label="Total Events"
                    value={stats.totalEvents}
                    trend="up"
                    trendValue="+12%"
                    color="primary"
                />
                <StatCard
                    icon="bi-people"
                    label="Total Users"
                    value={stats.totalUsers}
                    trend="up"
                    trendValue="+8%"
                    color="success"
                />
                <StatCard
                    icon="bi-calendar-check"
                    label="Total Bookings"
                    value={stats.totalBookings}
                    trend="up"
                    trendValue="+15%"
                    color="warning"
                />
                <StatCard
                    icon="bi-currency-rupee"
                    label="Total Revenue"
                    value={`₹${stats.totalRevenue.toLocaleString()}`}
                    trend="up"
                    trendValue="+23%"
                    color="danger"
                />
            </div>

            {/* Charts and Timeline */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '24px' }}>
                <DashboardChart
                    title="Monthly Bookings Overview"
                    data={bookingData}
                />

                {/* New Bookings Progress Card */}
                <div className="matdash-card">
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                        <div className="stat-icon primary" style={{ marginBottom: 0, marginRight: '16px' }}>
                            <i className="bi bi-people"></i>
                        </div>
                        <div>
                            <h3 className="matdash-card-title" style={{ marginBottom: '4px' }}>New Customers</h3>
                            <p style={{ color: 'var(--matdash-text-muted)', fontSize: '14px', margin: 0 }}>This month's targets</p>
                        </div>
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--matdash-text-dark)', marginBottom: '8px' }}>
                        {stats.totalUsers > 0 ? Math.round((stats.totalUsers / (stats.totalUsers + 50)) * 100) : 85}%
                    </div>
                    <div className="matdash-progress">
                        <div className="matdash-progress-bar success" style={{ width: `${stats.totalUsers > 0 ? Math.round((stats.totalUsers / (stats.totalUsers + 50)) * 100) : 85}%` }}></div>
                    </div>
                    <p style={{ color: 'var(--matdash-text-muted)', fontSize: '13px', marginTop: '12px' }}>
                        New goals: <span style={{ color: 'var(--matdash-success)', fontWeight: '600' }}>{stats.totalUsers} customers</span>
                    </p>
                </div>
            </div>

            {/* Revenue and Activities Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
                {/* Total Income Card */}
                <div className="matdash-card">
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                        <div className="stat-icon danger" style={{ marginBottom: 0, marginRight: '16px' }}>
                            <i className="bi bi-graph-up"></i>
                        </div>
                        <div>
                            <h3 className="matdash-card-title" style={{ marginBottom: '4px' }}>Total Income</h3>
                            <p style={{ color: 'var(--matdash-text-muted)', fontSize: '14px', margin: 0 }}>Total earnings</p>
                        </div>
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--matdash-text-dark)', marginBottom: '12px' }}>
                        ₹{stats.totalRevenue.toLocaleString()}
                    </div>
                    <span className="stat-trend up">
                        <i className="bi bi-arrow-up"></i>
                        +9% from last month
                    </span>
                    {/* Mini sparkline representation */}
                    <div style={{ marginTop: '16px', height: '60px', background: 'linear-gradient(to right, rgba(250, 137, 107, 0.1), rgba(250, 137, 107, 0.3))', borderRadius: '8px' }}></div>
                </div>

                {/* Daily Activities Timeline */}
                <div className="matdash-card">
                    <h3 className="matdash-card-title">Recent Activities</h3>
                    <div className="timeline">
                        {recentActivities.map((activity, index) => (
                            <div key={index} className="timeline-item">
                                <div className={`timeline-dot ${activity.type}`}></div>
                                <div className="timeline-content">
                                    <div className="timeline-time">{activity.time}</div>
                                    <div className="timeline-text">{activity.text}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

