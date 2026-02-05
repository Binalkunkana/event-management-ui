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
        <nav className="navbar navbar-expand-lg fixed-top manup-navbar">
            <div className="container">
                {/* Logo */}
                <Link className="navbar-brand d-flex align-items-center" to="/">
                    <span className="me-2 text-danger fs-3">
                        <i className="bi bi-mic-fill"></i> {/* Using mic icon as closest match to Manup logo */}
                    </span>
                    <span className="fw-bold fs-3 text-dark">Manup</span>
                </Link>

                {/* Mobile Toggle */}
                <button
                    className="navbar-toggler border-0"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* Links */}
                <div className="collapse navbar-collapse justify-content-center" id="navbarNav">
                    <ul className="navbar-nav gap-4">
                        <li className="nav-item">
                            <Link className="nav-link text-uppercase fw-bold text-dark" to="/user">Home</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link text-uppercase fw-bold text-dark" to="/events">Events</Link>
                        </li>
                        {isLoggedIn && (
                            <li className="nav-item">
                                <Link className="nav-link text-uppercase fw-bold text-dark" to="/dashboard">My Schedule</Link>
                            </li>
                        )}
                        {(role === "admin" || role === "organizer" || role === "manager") && (
                            <li className="nav-item">
                                <Link className="nav-link text-uppercase fw-bold text-danger" to="/admin">Admin Panel</Link>
                            </li>
                        )}
                        <li className="nav-item">
                            <a className="nav-link text-uppercase fw-bold text-dark" href="#">Contacts</a>
                        </li>
                    </ul>
                </div>

                {/* CTA Button */}
                <div className="d-none d-lg-block">
                    {isLoggedIn ? (
                        <button onClick={handleLogout} className="btn btn-outline-danger rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-2">
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span> Logout
                        </button>
                    ) : (
                        <Link to="/login" className="btn btn-ticket rounded-pill px-4 py-2 fw-bold text-white">
                            <i className="bi bi-person-fill me-2"></i> Login
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
