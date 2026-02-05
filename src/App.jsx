import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import UserList from "./components/UserList";
import UserForm from "./components/UserForm";
import UserDashboard from "./pages/UserDashboard";
import LoginPage from "./pages/LoginPage";
import LandingPage from "./pages/LandingPage";
import EventListing from "./pages/EventListing";
import EventDetails from "./pages/EventDetails";
import BookingPage from "./pages/BookingPage";
import PaymentPage from "./pages/PaymentPage";
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

import "./App.css";

// Layout component to handle conditional Navbar rendering
const Layout = ({ children }) => {
  const location = useLocation();
  const hideNavbar = location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/users") ||
    location.pathname === "/login" ||
    location.pathname === "/";

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
    <Router>
      <Routes>
        {/* Public Routes with Layout */}
        <Route path="/" element={<Layout><LoginPage /></Layout>} />
        <Route path="/user" element={<Layout><LandingPage /></Layout>} />
        <Route path="/events" element={<Layout><EventListing /></Layout>} />
        <Route path="/events/:id" element={<Layout><EventDetails /></Layout>} />
        <Route path="/booking/:id" element={<Layout><BookingPage /></Layout>} />
        <Route path="/payment/:bookingId" element={<Layout><PaymentPage /></Layout>} />
        <Route path="/dashboard" element={<Layout><UserDashboard /></Layout>} />
        <Route path="/login" element={<Layout><LoginPage /></Layout>} />

        {/* Admin Routes with AdminLayout */}
        <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/admin/users" element={<AdminLayout><UserList /></AdminLayout>} />
        <Route path="/admin/bookings" element={<AdminLayout><BookingList /></AdminLayout>} />
        <Route path="/admin/bookings/add" element={<AdminLayout><BookingForm /></AdminLayout>} />
        <Route path="/admin/bookings/edit/:id" element={<AdminLayout><BookingForm /></AdminLayout>} />
        <Route path="/admin/payments" element={<AdminLayout><PaymentList /></AdminLayout>} />
        <Route path="/admin/payments/add" element={<AdminLayout><PaymentForm /></AdminLayout>} />
        <Route path="/admin/payments/edit/:id" element={<AdminLayout><PaymentForm /></AdminLayout>} />
        <Route path="/admin/categories" element={<AdminLayout><CategoryList /></AdminLayout>} />
        <Route path="/admin/categories/add" element={<AdminLayout><CategoryForm /></AdminLayout>} />
        <Route path="/admin/categories/edit/:id" element={<AdminLayout><CategoryForm /></AdminLayout>} />
        <Route path="/admin/places" element={<AdminLayout><PlaceList /></AdminLayout>} />
        <Route path="/admin/places/add" element={<AdminLayout><PlaceForm /></AdminLayout>} />
        <Route path="/admin/places/edit/:id" element={<AdminLayout><PlaceForm /></AdminLayout>} />
        <Route path="/admin/events-list" element={<AdminLayout><ScheduleEventList /></AdminLayout>} />
        <Route path="/admin/events/add" element={<AdminLayout><ScheduleEventForm /></AdminLayout>} />
        <Route path="/admin/events/edit/:id" element={<AdminLayout><ScheduleEventForm /></AdminLayout>} />

        {/* User Management */}
        <Route path="/users/add" element={<UserForm />} />
        <Route path="/users/edit/:id" element={<UserForm />} />
      </Routes>
    </Router>
  );
}

export default App;

