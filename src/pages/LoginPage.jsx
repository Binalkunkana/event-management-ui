import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { loginUser } from "../api/authApi";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const decodeToken = (token) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (e) {
            return null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const data = await loginUser({ email, password });

            const { token } = data; // Backend returns { token }

            localStorage.setItem("token", token);

            const decoded = decodeToken(token);
            if (decoded) {
                // ASP.NET Core often uses these long schema URLs for claims
                const role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || decoded.role || decoded.Role;
                const userEmail = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || decoded.unique_name || decoded.sub || email;
                const userId = decoded.UserId || decoded.userid || decoded.id;

                localStorage.setItem("role", role);
                localStorage.setItem("email", userEmail);
                if (userId) localStorage.setItem("userId", userId);

                // 🎯 ROLE BASED REDIRECT
                const lowerRole = role?.toLowerCase();
                const destination = location.state?.from;

                if (destination) {
                    navigate(destination);
                } else if (lowerRole === "admin" || lowerRole === "manager") {
                    navigate("/admin");
                } else if (lowerRole === "organizer") {
                    navigate("/organizer");
                } else {
                    navigate("/dashboard");
                }
            } else {
                const destination = location.state?.from;
                navigate(destination || "/dashboard");
            }

        } catch (err) {
            setError(err.response?.data?.message || "Invalid email or password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center position-relative overflow-hidden" style={{ backgroundColor: 'var(--ef-bg-primary)' }}>
            {/* Background Blurs */}
            <div className="ef-hero-bg-blur blur-teal position-absolute" style={{ top: '-10%', left: '-10%', opacity: '0.4' }}></div>
            <div className="ef-hero-bg-blur blur-lavender position-absolute" style={{ bottom: '-10%', right: '-10%', opacity: '0.4' }}></div>

            <div className="ef-card p-5 shadow-xl animate-ef position-relative z-1" style={{ width: "100%", maxWidth: "450px" }}>
                <div className="text-center mb-5">
                    <div className="bg-dark text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3 shadow" style={{ width: '48px', height: '48px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>polymer</span>
                    </div>
                    <h2 className="fw-800 mb-1" style={{ letterSpacing: '-1px' }}>Welcome Back</h2>
                    <p className="ef-label text-secondary">Sign in to your EventFlow account</p>
                </div>

                {error && (
                    <div className="animate-ef mb-4">
                        <div className="bg-danger-subtle text-danger p-3 rounded-4 small d-flex align-items-center gap-2">
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>error</span>
                            <span className="fw-700">{error}</span>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="ef-label">Professional Email</label>
                        <div className="position-relative">
                            <span className="position-absolute start-0 top-50 translate-middle-y ms-3 text-secondary material-symbols-outlined" style={{ fontSize: '20px' }}>mail</span>
                            <input
                                type="email"
                                className="ef-input ps-5"
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-5">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                            <label className="ef-label mb-0">Secure Password</label>
                            <a href="#" className="small ef-label text-secondary text-decoration-none">Forgot?</a>
                        </div>
                        <div className="position-relative">
                            <span className="position-absolute start-0 top-50 translate-middle-y ms-3 text-secondary material-symbols-outlined" style={{ fontSize: '20px' }}>lock</span>
                            <input
                                type="password"
                                className="ef-input ps-5"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn-pill btn-primary w-100 py-3 shadow-lg"
                        disabled={loading}
                    >
                        {loading ? (
                            <div className="d-flex align-items-center justify-content-center gap-2">
                                <span className="spinner-border spinner-border-sm"></span>
                                <span>Authenticating...</span>
                            </div>
                        ) : "Institutional Login"}
                    </button>
                </form>

                <div className="text-center mt-5">
                    <p className="ef-label text-secondary mb-0">
                        Don't have an account? <a href="#" className="text-dark fw-800 text-decoration-none">Contact Administrator</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
