import { NavLink } from "react-router-dom";
import { useState } from "react";
import "../styles/matdash-theme.css";

const AdminSidebar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => setIsOpen(!isOpen);

    return (
        <>
            <button className="sidebar-toggle" onClick={toggleSidebar}>
                <i className="bi bi-list"></i>
            </button>

            <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <NavLink to="/admin" className="sidebar-logo">
                        <i className="bi bi-grid-1x2-fill"></i>
                        <span>Admin</span>
                    </NavLink>
                </div>

                <nav className="sidebar-nav">
                    <div style={{ flex: 1 }}>
                        <div className="sidebar-section">
                            <h6 className="sidebar-section-title">Home</h6>
                            <ul className="sidebar-menu">
                                <li className="sidebar-menu-item">
                                    <NavLink
                                        to="/admin"
                                        end
                                        className={({ isActive }) =>
                                            `sidebar-menu-link ${isActive ? 'active' : ''}`
                                        }
                                    >
                                        <i className="bi bi-speedometer2"></i>
                                        <span>Dashboard</span>
                                    </NavLink>
                                </li>
                            </ul>
                        </div>

                        <div className="sidebar-section">
                            <h6 className="sidebar-section-title">Management</h6>
                            <ul className="sidebar-menu">
                                <li className="sidebar-menu-item">
                                    <NavLink
                                        to="/admin/users"
                                        className={({ isActive }) =>
                                            `sidebar-menu-link ${isActive ? 'active' : ''}`
                                        }
                                    >
                                        <i className="bi bi-people"></i>
                                        <span>Manage Users</span>
                                    </NavLink>
                                </li>
                                <li className="sidebar-menu-item">
                                    <NavLink
                                        to="/admin/categories"
                                        className={({ isActive }) =>
                                            `sidebar-menu-link ${isActive ? 'active' : ''}`
                                        }
                                    >
                                        <i className="bi bi-tags"></i>
                                        <span>Event Categories</span>
                                    </NavLink>
                                </li>
                                <li className="sidebar-menu-item">
                                    <NavLink
                                        to="/admin/bookings"
                                        className={({ isActive }) =>
                                            `sidebar-menu-link ${isActive ? 'active' : ''}`
                                        }
                                    >
                                        <i className="bi bi-calendar-check"></i>
                                        <span>Event Bookings</span>
                                    </NavLink>
                                </li>
                                <li className="sidebar-menu-item">
                                    <NavLink
                                        to="/admin/events-list"
                                        className={({ isActive }) =>
                                            `sidebar-menu-link ${isActive ? 'active' : ''}`
                                        }
                                    >
                                        <i className="bi bi-calendar-event"></i>
                                        <span>Schedule Events</span>
                                    </NavLink>
                                </li>
                                <li className="sidebar-menu-item">
                                    <NavLink
                                        to="/admin/places"
                                        className={({ isActive }) =>
                                            `sidebar-menu-link ${isActive ? 'active' : ''}`
                                        }
                                    >
                                        <i className="bi bi-geo-alt"></i>
                                        <span>Places</span>
                                    </NavLink>
                                </li>
                                <li className="sidebar-menu-item">
                                    <NavLink
                                        to="/admin/payments"
                                        className={({ isActive }) =>
                                            `sidebar-menu-link ${isActive ? 'active' : ''}`
                                        }
                                    >
                                        <i className="bi bi-credit-card"></i>
                                        <span>Payments</span>
                                    </NavLink>
                                </li>
                            </ul>
                        </div>
                    </div>
                </nav>
            </aside>
        </>
    );
};

export default AdminSidebar;
