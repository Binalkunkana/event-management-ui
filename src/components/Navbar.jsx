import { Link, useNavigate } from "react-router-dom";
import "../index.css";

const Navbar = () => {
    const navigate = useNavigate();
    const role = localStorage.getItem("role")?.toLowerCase();
    const isLoggedIn = !!localStorage.getItem("token");

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    return (
        <nav className="navbar navbar-expand-lg fixed-top bg-white border-bottom border-light py-3 animate-ef shadow-sm">
            <div className="container">
                {/* Logo */}
                <Link className="navbar-brand d-flex align-items-center" to="/">
                    <div className="bg-dark text-white rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '32px', height: '32px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>polymer</span>
                    </div>
                    <span className="eventflow-brand d-flex align-items-center h4 mb-0">
                        EventFlow<span className="eventflow-dot ms-1" style={{ color: 'var(--ef-accent-teal)' }}>●</span>
                    </span>
                </Link>

                {/* Mobile Toggle */}
                <button
                    className="navbar-toggler border-0 shadow-none"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                >
                    <span className="material-symbols-outlined">menu</span>
                </button>

                {/* Links */}
                <div className="collapse navbar-collapse justify-content-center" id="navbarNav">
                    <ul className="navbar-nav gap-lg-4 align-items-center">
                        <li className="nav-item">
                            <Link className="nav-link ef-label text-dark mb-0 py-1" style={{ fontSize: '0.85rem' }} to="/">Overview</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link ef-label text-dark mb-0 py-1" style={{ fontSize: '0.85rem' }} to="/events">Experiences</Link>
                        </li>
                        {isLoggedIn && (
                            <li className="nav-item">
                                <Link className="nav-link ef-label text-dark mb-0 py-1" style={{ fontSize: '0.85rem' }} to="/userdashboard">Dashboard</Link>
                            </li>
                        )}
                        <li className="nav-item">
                            <Link className="nav-link ef-label text-dark mb-0 py-1" style={{ fontSize: '0.85rem' }} to="/about">Our Story</Link>
                        </li>
                    </ul>
                </div>

                {/* CTA Button */}
                <div className="d-none d-lg-block">
                    {isLoggedIn ? (
                        <div className="d-flex align-items-center gap-3">
                            <div className="bg-light rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                <span className="material-symbols-outlined text-dark">person</span>
                            </div>
                            <button onClick={handleLogout} className="btn-pill btn-outline py-2 px-3 small border-0 bg-transparent text-secondary">
                                <span className="material-symbols-outlined align-middle" style={{ fontSize: '20px' }}>logout</span>
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="btn-pill btn-primary py-2 px-5 shadow-sm">
                            Sign In
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
