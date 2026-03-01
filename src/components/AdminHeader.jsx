import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import "../styles/matdash-theme.css";

const AdminHeader = () => {
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    return (
        <header className="admin-header">
            <div className="admin-header-content">
                <div style={{ flex: 1 }}></div>
                <div className="admin-header-actions" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button
                        className="theme-toggle-btn"
                        onClick={toggleTheme}
                        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                    </button>

                    <button
                        className="btn btn-outline-danger btn-sm d-flex align-items-center gap-2"
                        onClick={handleLogout}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;
