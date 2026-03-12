import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * ProtectedRoute Component
 * @param {Array} allowedRoles - List of roles permitted to access the route
 * @param {React.Component} children - Component to render if authorized
 */
const ProtectedRoute = ({ allowedRoles, children }) => {
    const location = useLocation();

    // Get auth data from localStorage
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');

    // 1. Not logged in -> Redirect to login
    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 2. Logged in but role not allowed -> Redirect to 403 Unauthorized
    if (allowedRoles && !allowedRoles.includes(userRole)) {
        return <Navigate to="/403" replace />;
    }

    // 3. Authorized -> Render children
    return children;
};

export default ProtectedRoute;
