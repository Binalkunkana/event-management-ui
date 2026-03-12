import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserById } from "../api/userApi";
import { getAllScheduledEvents } from '../api/eventApi';
import { getAllCategories } from '../api/categoryApi';
import { getAllPlaces } from '../api/placeApi';
import { getAllBookings, updateBooking } from '../api/bookingApi';
import { getAllPayments } from '../api/paymentApi';
import "../index.css";

const UserProfile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [events, setEvents] = useState([]);
    const [categories, setCategories] = useState([]);
    const [places, setPlaces] = useState([]);
    const [myBookings, setMyBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'past' | 'bookings'
    
    const userId = localStorage.getItem("userId");
    const currentUserEmail = localStorage.getItem("email")?.toLowerCase();

    useEffect(() => {
        if (!userId) {
            setError("User session not found. Please log in again.");
            setLoading(false);
            return;
        }
        fetchData();
    }, [userId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const extractArray = (res) => {
                if (!res) return [];
                if (Array.isArray(res)) return res;
                if (Array.isArray(res.data)) return res.data;
                let data = res.data?.data !== undefined ? res.data.data : res.data?.Data;
                if (data === undefined) data = res.data;
                if (Array.isArray(data)) return data;
                if (data && typeof data === 'object' && data.$values && Array.isArray(data.$values)) {
                    return data.$values;
                }
                return [];
            };

            const [userRes, eventRes, catRes, placeRes, bookingRes, paymentRes] = await Promise.all([
                getUserById(userId).catch(() => ({ data: { data: null } })),
                getAllScheduledEvents().catch(() => ({ data: { data: [] } })),
                getAllCategories().catch(() => ({ data: { data: [] } })),
                getAllPlaces().catch(() => ({ data: { data: [] } })),
                getAllBookings().catch(() => ({ data: { data: [] } })),
                getAllPayments().catch(() => ({ data: { data: [] } }))
            ]);

            // User Info
            setUser(userRes.data?.data || userRes.data || null);

            // Events, Categories, Places
            const rawEvents = extractArray(eventRes);
            const normalizedEvents = rawEvents.map(e => ({
                ...e,
                scheduleEventId: e.scheduleEventId || e.ScheduleEventId || e.id || e.Id,
                details: e.details || e.Details || e.title || e.Title || "Untitled Event",
                startDate: e.startDate || e.StartDate || e.eventDate || e.EventDate || (e.startTime?.includes('T') ? e.startTime.split('T')[0] : e.startTime || ""),
                fees: e.fees || e.Fees || 0,
                placeName: e.placeName || e.PlaceName,
                eventCategoryName: e.eventCategoryName || e.EventCategoryName,
                imagePath: e.imagePath || e.ImagePath
            }));
            setEvents(normalizedEvents);
            setCategories(extractArray(catRes));
            setPlaces(extractArray(placeRes));

            // Bookings Filtering
            const rawBookings = extractArray(bookingRes);
            const paidBookingIds = new Set(
                extractArray(paymentRes)
                    .filter(p => (p.paymentStatus || p.PaymentStatus || "").toLowerCase() === 'success')
                    .map(p => String(p.eventBookingId || p.EventBookingId))
            );

            const filteredBookings = rawBookings
                .filter(b => (b.email || b.Email || "").toLowerCase() === currentUserEmail)
                .map(b => {
                    const bId = String(b.eventBookingId || b.EventBookingId || b.id || b.Id);
                    return {
                        ...b,
                        eventBookingId: bId,
                        isCancelled: b.isCancelled === true || b.IsCancelled === true,
                        isPaid: paidBookingIds.has(bId) || Number(b.scheduleEventFees || b.ScheduleEventFees || 0) === 0
                    };
                });
            setMyBookings(filteredBookings);

        } catch (err) {
            console.error("Profile Data Fetch Error:", err);
            setError("Could not load complete profile data.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancelBooking = async (booking) => {
        if (!window.confirm("Cancel this booking?")) return;
        try {
            const formData = new FormData();
            formData.append('Name', booking.name || booking.Name);
            formData.append('Email', booking.email || booking.Email);
            formData.append('Phone', booking.phone || booking.Phone);
            formData.append('ScheduleEventId', booking.scheduleEventId || booking.ScheduleEventId);
            formData.append('IsCancelled', "true");
            formData.append('CancellationDateTime', new Date().toISOString());

            await updateBooking(booking.eventBookingId, formData);
            alert("Booking cancelled.");
            fetchData();
        } catch (err) {
            alert("Cancellation failed.");
        }
    };

    const filteredEvents = events.filter(evt => {
        const eventDate = new Date(evt.startDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const isUpcoming = eventDate >= today;
        return activeTab === 'upcoming' ? isUpcoming : !isUpcoming;
    });

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border text-dark" role="status"></div>
                <p className="mt-3 ef-label">Syncing Profile Activity...</p>
            </div>
        );
    }

    return (
        <div className="profile-page py-5" style={{ backgroundColor: 'var(--ef-bg-primary)', minHeight: '100vh' }}>
            <div className="container">
                {/* Profile Header */}
                <div className="row justify-content-center mb-5 mt-4">
                    <div className="col-lg-10">
                        <div className="ef-card p-4 shadow-sm border-0 animate-ef" style={{ background: 'linear-gradient(135deg, #fff 0%, #fdfdfd 100%)' }}>
                            <div className="row align-items-center">
                                <div className="col-auto">
                                    <div className="bg-dark text-white rounded-circle d-flex align-items-center justify-content-center shadow-lg" style={{ width: '100px', height: '100px', border: '4px solid white' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '48px' }}>person</span>
                                    </div>
                                </div>
                                <div className="col">
                                    <h1 className="fw-800 mb-1">{user?.name || localStorage.getItem("email")?.split('@')[0]}</h1>
                                    <div className="d-flex flex-wrap gap-3">
                                        <span className="ef-badge bg-light text-dark shadow-none border">
                                            <span className="material-symbols-outlined align-middle me-1" style={{ fontSize: '14px' }}>mail</span>
                                            {localStorage.getItem("email")}
                                        </span>
                                        <span className="ef-badge shadow-none" style={{ backgroundColor: 'rgba(77, 182, 172, 0.1)', color: 'var(--ef-accent-teal)' }}>
                                            <span className="material-symbols-outlined align-middle me-1" style={{ fontSize: '14px' }}>verified</span>
                                            {localStorage.getItem("role")}
                                        </span>
                                    </div>
                                </div>
                                <div className="col-lg-auto mt-3 mt-lg-0">
                                    <button className="btn-pill btn-outline py-2 px-4 shadow-none" onClick={() => navigate('/login')}>
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs Section */}
                <div className="row justify-content-center">
                    <div className="col-lg-10">
                        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
                            <div className="d-flex gap-2 p-1 bg-white rounded-pill border border-light shadow-sm animate-ef">
                                <button
                                    className={`btn-pill border-0 px-4 py-2 ${activeTab === 'upcoming' ? 'btn-primary shadow' : 'bg-transparent text-secondary'}`}
                                    onClick={() => setActiveTab('upcoming')}
                                    style={{ fontSize: '0.85rem' }}
                                >
                                    Upcoming
                                </button>
                                <button
                                    className={`btn-pill border-0 px-4 py-2 ${activeTab === 'past' ? 'btn-primary shadow' : 'bg-transparent text-secondary'}`}
                                    onClick={() => setActiveTab('past')}
                                    style={{ fontSize: '0.85rem' }}
                                >
                                    Past
                                </button>
                                <button
                                    className={`btn-pill border-0 px-4 py-2 ${activeTab === 'bookings' ? 'btn-primary shadow' : 'bg-transparent text-secondary'}`}
                                    onClick={() => setActiveTab('bookings')}
                                    style={{ fontSize: '0.85rem' }}
                                >
                                    My Bookings
                                </button>
                            </div>
                        </div>

                        {/* Content Grid */}
                        <div className="row g-4 animate-ef" style={{ animationDelay: '0.1s' }}>
                            {activeTab === 'bookings' ? (
                                myBookings.length > 0 ? (
                                    myBookings.map((bk) => {
                                        const event = events.find(e => String(e.scheduleEventId) === String(bk.scheduleEventId));
                                        return (
                                            <div key={bk.eventBookingId} className="col-12 col-md-6">
                                                <div className="ef-card h-100 p-0 overflow-hidden d-flex flex-column border-0 shadow-sm">
                                                    <div className="p-4 d-flex flex-column flex-grow-1">
                                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                                            <span className="ef-label mb-0" style={{ color: 'var(--ef-accent-teal)' }}>
                                                                {event?.eventCategoryName || "Ticket"}
                                                            </span>
                                                            <span className={`ef-badge ${bk.isCancelled ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'} border-0`}>
                                                                {bk.isCancelled ? 'Cancelled' : 'Active'}
                                                            </span>
                                                        </div>
                                                        <h5 className="fw-800 mb-3">{event?.details || "Event Booking"}</h5>
                                                        
                                                        <div className="mt-auto pt-3 border-top border-light d-flex flex-wrap gap-2">
                                                            {!bk.isCancelled && bk.isPaid && (
                                                                <button className="btn-pill btn-outline py-1 px-3 small" onClick={() => navigate(`/receipt/${bk.eventBookingId}`)}>Receipt</button>
                                                            )}
                                                            {!bk.isCancelled && !bk.isPaid && (
                                                                <button className="btn-pill btn-primary py-1 px-3 small" onClick={() => navigate(`/payment/${bk.eventBookingId}`)}>Pay ₹{bk.scheduleEventFees || event?.fees}</button>
                                                            )}
                                                            {!bk.isCancelled && (
                                                                <button className="btn-pill btn-outline py-1 px-3 small text-danger" onClick={() => handleCancelBooking(bk)}>Cancel</button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="col-12 text-center py-5">
                                        <p className="text-secondary">No active bookings found.</p>
                                    </div>
                                )
                            ) : (
                                filteredEvents.length > 0 ? (
                                    filteredEvents.map((evt) => (
                                        <div key={evt.scheduleEventId} className="col-12 col-md-6">
                                            <div className="ef-card h-100 p-0 overflow-hidden d-flex flex-column border-0 shadow-sm">
                                                <div className="position-relative" style={{ height: '160px' }}>
                                                    {evt.imagePath ? (
                                                        <img
                                                            src={`https://localhost:7187/EventImages/${evt.imagePath}`}
                                                            alt={evt.details}
                                                            className="w-100 h-100 object-fit-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-100 h-100 bg-light d-flex align-items-center justify-content-center">
                                                            <span className="material-symbols-outlined text-muted" style={{ fontSize: '40px' }}>event</span>
                                                        </div>
                                                    )}
                                                    <div className="position-absolute bottom-0 start-0 m-3">
                                                        <span className="ef-badge bg-white shadow-sm h6 mb-0">
                                                            {Number(evt.fees || 0) === 0 ? "FREE" : `₹${evt.fees}`}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="p-4 d-flex flex-column flex-grow-1">
                                                    <span className="ef-label mb-2" style={{ color: 'var(--ef-accent-teal)' }}>{evt.eventCategoryName}</span>
                                                    <h5 className="fw-800 mb-3">{evt.details}</h5>
                                                    <div className="mt-auto">
                                                        {activeTab === 'upcoming' ? (
                                                            <button className="btn-pill btn-primary w-100" onClick={() => navigate(`/booking/${evt.scheduleEventId}`)}>
                                                                Book Now
                                                            </button>
                                                        ) : (
                                                            <button className="btn-pill btn-outline w-100 opacity-50" disabled>Event Ended</button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-12 text-center py-5">
                                        <p className="text-secondary">No events found for this category.</p>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
