import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ErrorBoundary from "./components/ErrorBoundary";
import UserList from "./components/UserList";
import UserForm from "./components/UserForm";
import UserDashboard from "./pages/UserDashboard";
import LoginPage from "./pages/LoginPage";
import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/HomePage";
import EventListing from "./pages/EventListing";
import EventDetails from "./pages/EventDetails";
import BookingPage from "./pages/BookingPage";
import PaymentPage from "./pages/PaymentPage";
import ReceiptPage from "./pages/ReceiptPage";
import Navbar from "./components/Navbar";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLayout from "./components/AdminLayout";
import BookingList from "./components/BookingList";
import PaymentList from "./components/PaymentList";
import CategoryList from "./components/CategoryList";
import PlaceList from "./components/PlaceList";
import ScheduleEventList from "./components/ScheduleEventList";

import BookingForm from "./components/BookingForm";
import PaymentForm from "./components/PaymentForm";
import CategoryForm from "./components/CategoryForm";
import PlaceForm from "./components/PlaceForm";
import ScheduleEventForm from "./components/ScheduleEventForm";
import OrganizerLayout from "./components/OrganizerLayout";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import OrganizerScheduleEventList from "./pages/OrganizerScheduleEventList";

import NotFound from "./pages/errors/NotFound";
import ServerError from "./pages/errors/ServerError";
import Unauthorized from "./pages/errors/Unauthorized";
import ProtectedRoute from "./components/ProtectedRoute";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import UserProfile from "./pages/UserProfile";

import "./App.css";

// Layout component to handle conditional Navbar rendering
const Layout = ({ children }) => {
  const location = useLocation();
  const hideNavbar = location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/organizer") ||
    location.pathname.startsWith("/users") ||
    location.pathname === "/login";

  return (
    <>
      {!hideNavbar && <Navbar />}
      <div className={hideNavbar ? "container mt-4" : "public-content-wrapper"}>
        {children}
      </div>
    </>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#f8fafc',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
          },
          error: {
            iconTheme: {
              primary: '#ff4d4d',
              secondary: '#fff',
            },
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
        }}
      />
      <Router>
        <Routes>
          {/* Public Routes with Layout */}
          <Route path="/" element={<Layout><HomePage /></Layout>} />
          <Route path="/user" element={<Layout><LandingPage /></Layout>} />
          <Route path="/events" element={<Layout><EventListing /></Layout>} />
          <Route path="/events/:id" element={<Layout><EventDetails /></Layout>} />
          <Route path="/booking/:id" element={<Layout><BookingPage /></Layout>} />
          <Route path="/payment/:bookingId" element={<Layout><PaymentPage /></Layout>} />
          <Route path="/receipt/:bookingId" element={<Layout><ReceiptPage /></Layout>} />
          <Route path="/dashboard" element={<Layout><UserDashboard /></Layout>} />
          <Route path="/my-bookings" element={<Layout><UserDashboard /></Layout>} />
          <Route path="/about-us" element={<Layout><AboutUs /></Layout>} />
          <Route path="/contact-us" element={<Layout><ContactUs /></Layout>} />
          <Route path="/profile" element={<Layout><UserProfile /></Layout>} />
          <Route path="/login" element={<Layout><LoginPage /></Layout>} />

          {/* Admin Routes with AdminLayout */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminLayout><AdminDashboard /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/login" element={<LoginPage />} />
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminLayout><UserList /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/bookings" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminLayout><BookingList /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/bookings/add" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminLayout><BookingForm /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/bookings/edit/:id" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminLayout><BookingForm /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/payments" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminLayout><PaymentList /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/payments/add" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminLayout><PaymentForm /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/payments/edit/:id" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminLayout><PaymentForm /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/categories" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminLayout><CategoryList /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/categories/add" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminLayout><CategoryForm /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/categories/edit/:id" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminLayout><CategoryForm /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/places" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminLayout><PlaceList /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/places/add" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminLayout><PlaceForm /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/places/edit/:id" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminLayout><PlaceForm /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/events-list" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminLayout><ScheduleEventList /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/events/add" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminLayout><ScheduleEventForm /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/events/edit/:id" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminLayout><ScheduleEventForm /></AdminLayout>
            </ProtectedRoute>
          } />

          {/* Organizer Routes */}
          <Route path="/organizer" element={
            <ProtectedRoute allowedRoles={['Organizer', 'Admin']}>
              <OrganizerLayout><OrganizerDashboard /></OrganizerLayout>
            </ProtectedRoute>
          } />
          <Route path="/organizer/events" element={
            <ProtectedRoute allowedRoles={['Organizer', 'Admin']}>
              <OrganizerLayout><OrganizerScheduleEventList /></OrganizerLayout>
            </ProtectedRoute>
          } />

          {/* User Management */}
          <Route path="/users/edit/:id" element={<UserForm />} />

          {/* Error Routes */}
          <Route path="/404" element={<NotFound />} />
          <Route path="/500" element={<ServerError />} />
          <Route path="/403" element={<Unauthorized />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;