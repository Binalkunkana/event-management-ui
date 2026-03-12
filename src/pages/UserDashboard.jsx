import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAllScheduledEvents } from '../api/eventApi';
import { getAllCategories } from '../api/categoryApi';
import { getAllPlaces } from '../api/placeApi';
import { getAllBookings, getMyBookings, updateBooking } from '../api/bookingApi';
import { getAllPayments } from '../api/paymentApi';

const UserDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [events, setEvents] = useState([]);
    const [categories, setCategories] = useState([]);
    const [places, setPlaces] = useState([]);
    const [myBookings, setMyBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'upcoming'); // 'upcoming' | 'past' | 'bookings'

    // Input state (what user sees/types in the sidebar)
    const [filters, setFilters] = useState({
        location: '',
        name: '',
        category: '',
        priceType: 'All' // 'All' | 'Paid Event' | 'Free Event'
    });

    // Applied state (what actually controls the filtering of the grid)
    const [appliedFilters, setAppliedFilters] = useState({
        location: '',
        name: '',
        category: '',
        priceType: 'All'
    });

    useEffect(() => {
        fetchData();
    }, [location.pathname, activeTab]);

    useEffect(() => {
        const hasToken = !!localStorage.getItem("token");
        if (location.pathname === '/my-bookings') {
            if (!hasToken) {
                navigate('/login', { state: { from: location.pathname } });
            } else {
                setActiveTab('bookings');
            }
        } else if (activeTab === 'bookings' && !hasToken) {
            setActiveTab('upcoming');
        }

        // Reset to 'upcoming' when clicking Home/Dashboard without specific tab state
        if ((location.pathname === '/' || location.pathname === '/dashboard') && !location.state?.activeTab) {
            setActiveTab('upcoming');
        }
    }, [location.pathname, location.state, navigate, activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const extractArray = (res) => {
                if (!res) return [];
                // Handle cases where res is already the array (from retry or simplified API)
                if (Array.isArray(res)) return res;
                if (Array.isArray(res.data)) return res.data;

                // Handle ApiResponse<T> structure from BaseController
                let data = res.data?.data !== undefined ? res.data.data : res.data?.Data;
                if (data === undefined) data = res.data;

                if (Array.isArray(data)) return data;
                if (data && typeof data === 'object' && data.$values && Array.isArray(data.$values)) {
                    return data.$values;
                }
                return [];
            };

            const isLoggedIn = !!localStorage.getItem("token");

            // 2. Fetch public data with individual error handling and AUTO-RETRY on 401
            const fetchPublic = async (apiCall, label) => {
                try {
                    const res = await apiCall();
                    return res;
                } catch (err) {
                    if (err.response?.status === 401) {
                        console.warn(`[UserDashboard] ${label} unauthorized (401). Clearing token and retrying as guest...`);
                        localStorage.removeItem("token");
                        localStorage.removeItem("role");
                        localStorage.removeItem("email");

                        try {
                            // Explicitly retry without token by ensuring interceptor sees null
                            const retryRes = await apiCall();
                            return retryRes;
                        } catch (retryErr) {
                            console.error(`[UserDashboard] Guest retry failed for ${label}:`, retryErr.message);
                            return { data: { data: [] } };
                        }
                    }
                    console.error(`[UserDashboard] Failed to fetch ${label}:`, err.message);
                    return { data: { data: [] } };
                }
            };

            const [eventRes, catRes, placeRes, bookingRes, paymentRes] = await Promise.all([
                fetchPublic(getAllScheduledEvents, 'Events'),
                fetchPublic(getAllCategories, 'Categories'),
                fetchPublic(getAllPlaces, 'Places'),
                isLoggedIn ? getAllBookings().catch(err => {
                    console.error("All Bookings Fetch Error:", err);
                    return { data: { data: [] } };
                }) : Promise.resolve({ data: { data: [] } }),
                isLoggedIn ? getAllPayments().catch(() => ({ data: { data: [] } })) : Promise.resolve({ data: { data: [] } })
            ]);

            const rawEvents = extractArray(eventRes);
            const rawCategories = extractArray(catRes);
            const rawPlaces = extractArray(placeRes);

            const normalizedEvents = rawEvents.map(e => {
                const sDate = e.startDate || e.StartDate || e.eventDate || e.EventDate || (e.startTime && e.startTime.includes('T') ? e.startTime.split('T')[0] : (e.startTime || ""));
                return {
                    ...e,
                    scheduleEventId: e.scheduleEventId || e.ScheduleEventId || e.id || e.Id,
                    details: e.details || e.Details || e.title || e.Title || "Untitled Event",
                    startDate: sDate,
                    startTimePart: e.startTimePart || e.StartTimePart || (e.startTime && e.startTime.includes('T') ? e.startTime.split('T')[1].slice(0, 5) : (e.startTime ? e.startTime.slice(0, 5) : '')),
                    fees: e.fees || e.Fees || 0,
                    placeId: e.placeId || e.PlaceId,
                    placeName: e.placeName || e.PlaceName,
                    eventCategoryId: e.eventCategoryId || e.EventCategoryId,
                    eventCategoryName: e.eventCategoryName || e.EventCategoryName,
                    imagePath: e.imagePath || e.ImagePath
                };
            });

            const normalizedCategories = rawCategories.map(c => ({
                id: c.eventCategoryId || c.EventCategoryId || c.id || c.Id,
                name: c.eventCategoryName || c.EventCategoryName || c.name || c.Name || "Unknown Category"
            }));

            const normalizedPlaces = rawPlaces.map(p => ({
                id: p.placeId || p.PlaceId || p.id || p.Id,
                name: p.placeName || p.PlaceName || p.name || p.Name || "Unknown Location"
            }));

            setEvents(normalizedEvents);
            setCategories(normalizedCategories);
            setPlaces(normalizedPlaces);

            console.log(`[Dashboard v2.2] Loaded: ${normalizedEvents.length} events, ${normalizedCategories.length} categories, ${normalizedPlaces.length} places`);

            const userBookingsRaw = extractArray(bookingRes);
            const allPayments = extractArray(paymentRes);

            const paidBookingIds = new Set(
                allPayments
                    .filter(p => {
                        const status = (p.paymentStatus || p.PaymentStatus || "").toLowerCase();
                        return status === 'success' || status === 'successful';
                    })
                    .map(p => String(p.eventBookingId || p.EventBookingId))
            );

            const getRootEmail = (email) => {
                if (!email || !email.includes('@')) return (email || "").toLowerCase();
                const [local, domain] = email.split('@');
                const rootLocal = local.split('+')[0];
                return `${rootLocal}@${domain}`.toLowerCase();
            };

            const currentUserEmail = getRootEmail(localStorage.getItem("email"));

            const userBookings = userBookingsRaw
                .filter(b => {
                    if (!currentUserEmail) return false;
                    const bookingEmail = (b.email || b.Email || "").toLowerCase();
                    return getRootEmail(bookingEmail) === currentUserEmail;
                })
                .map(b => {
                    const bId = String(b.eventBookingId || b.EventBookingId || b.id || b.Id);
                    return {
                        ...b,
                        eventBookingId: bId,
                        scheduleEventId: b.scheduleEventId || b.ScheduleEventId,
                        name: b.name || b.Name,
                        email: b.email || b.Email,
                        phone: b.phone || b.Phone,
                        address: b.address || b.Address,
                        city: b.city || b.City,
                        state: b.state || b.State,
                        country: b.country || b.Country,
                        scheduleEventDetails: b.scheduleEventDetails || b.ScheduleEventDetails,
                        scheduleEventFees: b.scheduleEventFees || b.ScheduleEventFees,
                        idProofDocumentPath: b.idProofDocumentPath || b.IdProofDocumentPath,
                        isCancelled: b.isCancelled === true || b.IsCancelled === true,
                        cancellationDateTime: b.cancellationDateTime || b.CancellationDateTime,
                        isPaid: paidBookingIds.has(bId) || Number(b.scheduleEventFees || b.ScheduleEventFees || 0) === 0
                    };
                });

            setMyBookings(userBookings);
            console.log(`[Dashboard] Fetched ${userBookings.length} bookings for ${currentUserEmail}`);
        } catch (err) {
            console.error("Dashboard Fetch Error:", err);
            if (err.response?.status === 401) {
                console.log("Session expired. Redirecting to login...");
                localStorage.clear();
                navigate('/login', { state: { from: location.pathname } });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => {
            const newState = { ...prev, [name]: value };
            // Instant filtering: update appliedFilters on change
            setAppliedFilters(newState);
            return newState;
        });
    };

    const handleApplyFilters = () => {
        setAppliedFilters({ ...filters });
    };

    const handleResetFilters = () => {
        const resetState = { location: '', name: '', category: '', priceType: 'All' };
        setFilters(resetState);
        setAppliedFilters(resetState);
    };

    const handleCancelBooking = async (booking) => {
        if (!window.confirm("Are you sure you want to cancel this booking?")) return;

        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('Name', booking.name || booking.Name);
            formData.append('Email', booking.email || booking.Email);
            formData.append('Phone', booking.phone || booking.Phone);
            formData.append('Address', booking.address || booking.Address || "");
            formData.append('City', booking.city || booking.City || "");
            formData.append('State', booking.state || booking.State || "");
            formData.append('Country', booking.country || booking.Country || "");
            formData.append('ScheduleEventId', booking.scheduleEventId || booking.ScheduleEventId);
            formData.append('IsCancelled', "true");
            formData.append('CancellationDateTime', new Date().toISOString());

            await updateBooking(booking.eventBookingId, formData);
            alert("Booking cancelled successfully.");
            fetchData();
        } catch (err) {
            console.error("Cancellation Error:", err);
            alert("Failed to cancel booking.");
        } finally {
            setLoading(false);
        }
    };

    // Derived filtering logic
    const filteredEvents = (Array.isArray(events) ? events : []).filter(evt => {
        if (!evt) return false;

        // Note: Booked events are no longer excluded here so consumers can see all upcoming events.
        // We handle the visual indicator in the render loop.

        // 1. Tab Filtering (Upcoming vs Past)
        const eventDateStr = evt.startDate;
        if (!eventDateStr) return false;

        const eventDate = new Date(eventDateStr);
        if (isNaN(eventDate.getTime())) return false;

        // Compare dates without time to show today's events in "Upcoming"
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const compareDate = new Date(eventDate);
        compareDate.setHours(0, 0, 0, 0);

        const isUpcoming = compareDate >= today;

        if (activeTab === 'upcoming' && !isUpcoming) return false;
        if (activeTab === 'past' && isUpcoming) return false;
        if (activeTab === 'bookings') return false; // Bookings handled in a different map below

        // 2. Applied Filters (Applied only when button is clicked)

        // Location Filter
        const evtPlaceId = evt.placeId;
        if (appliedFilters.location && evtPlaceId != appliedFilters.location) return false;

        // Name Filter
        const details = evt.details || "";
        if (appliedFilters.name && !details.toLowerCase().includes(appliedFilters.name.toLowerCase())) return false;

        // Category Filter
        const evtCatId = evt.eventCategoryId;
        if (appliedFilters.category && evtCatId != appliedFilters.category) return false;

        // Price Type Filter
        if (appliedFilters.priceType !== 'All') {
            const isFree = Number(evt.fees || 0) === 0;
            if (appliedFilters.priceType === 'Free Event' && !isFree) return false;
            if (appliedFilters.priceType === 'Paid Event' && isFree) return false;
        }

        return true;
    });

    const formatDate = (dateStr) => {
        if (!dateStr) return "TBD";
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;
            return d.toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        } catch (e) {
            return dateStr;
        }
    };

    return (
        <div className="container-fluid py-5" style={{ backgroundColor: 'var(--ef-bg-primary)', minHeight: '100vh' }}>
            <div className="container">
                <div className="row g-4">
                    {/* Sidebar Filters */}
                    <div className="col-lg-3">
                        <div className="dashboard-sidebar animate-ef">
                            <h5 className="fw-800 mb-4">Filters</h5>

                            <div className="mb-4">
                                <label className="ef-label">Location</label>
                                <select
                                    className="ef-input"
                                    name="location"
                                    value={filters.location}
                                    onChange={handleFilterChange}
                                >
                                    <option value="">All Locations</option>
                                    {Array.isArray(places) && places.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-4">
                                <label className="ef-label">Search</label>
                                <input
                                    type="text"
                                    className="ef-input"
                                    placeholder="Event name..."
                                    name="name"
                                    value={filters.name}
                                    onChange={handleFilterChange}
                                />
                            </div>

                            <div className="mb-4">
                                <label className="ef-label">Category</label>
                                <select
                                    className="ef-input"
                                    name="category"
                                    value={filters.category}
                                    onChange={handleFilterChange}
                                >
                                    <option value="">All Categories</option>
                                    {Array.isArray(categories) && categories.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-4">
                                <label className="ef-label">Access</label>
                                <select
                                    className="ef-input"
                                    name="priceType"
                                    value={filters.priceType}
                                    onChange={handleFilterChange}
                                >
                                    <option value="All">All Events</option>
                                    <option value="Paid Event">Paid</option>
                                    <option value="Free Event">Free</option>
                                </select>
                            </div>

                            <div className="d-flex flex-column gap-2">
                                <button className="btn-pill btn-primary w-100 py-2" onClick={handleApplyFilters}>
                                    Apply
                                </button>
                                <button className="btn-pill btn-outline w-100 py-2" onClick={handleResetFilters}>
                                    Reset
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="col-lg-9">
                        {/* Tabs */}
                        <div className="d-flex flex-wrap justify-content-between align-items-center mb-5 gap-3 animate-ef">
                            <div className="d-flex gap-2 p-1 bg-white rounded-pill border border-light shadow-sm">
                                <button
                                    className={`btn-pill border-0 px-4 py-2 ${activeTab === 'upcoming' ? 'btn-primary' : 'bg-transparent text-secondary'}`}
                                    onClick={() => setActiveTab('upcoming')}
                                    style={{ fontSize: '0.85rem' }}
                                >
                                    Upcoming
                                </button>
                                <button
                                    className={`btn-pill border-0 px-4 py-2 ${activeTab === 'past' ? 'btn-primary' : 'bg-transparent text-secondary'}`}
                                    onClick={() => setActiveTab('past')}
                                    style={{ fontSize: '0.85rem' }}
                                >
                                    Past
                                </button>
                                <button
                                    className={`btn-pill border-0 px-4 py-2 ${activeTab === 'bookings' ? 'btn-primary' : 'bg-transparent text-secondary'}`}
                                    onClick={() => {
                                        if (!localStorage.getItem("token")) {
                                            navigate('/login', { state: { from: '/my-bookings' } });
                                        } else {
                                            setActiveTab('bookings');
                                        }
                                    }}
                                    style={{ fontSize: '0.85rem' }}
                                >
                                    My Bookings
                                </button>
                            </div>

                            <button className="btn-pill btn-outline py-2 px-3" onClick={fetchData}>
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>refresh</span>
                            </button>
                        </div>

                        {/* Grid */}
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-dark" role="status"></div>
                                <p className="mt-3 ef-label">Loading EventFlow...</p>
                            </div>
                        ) : (
                            <div className="row g-4 animate-ef" style={{ animationDelay: '0.1s' }}>
                                {activeTab === 'bookings' ? (
                                    myBookings.length > 0 ? (
                                        myBookings.map((bk) => {
                                            const event = events.find(e => e.scheduleEventId == bk.scheduleEventId);
                                            return (
                                                <div key={bk.eventBookingId} className="col-12 col-md-6">
                                                    <div className="ef-card h-100 p-0 overflow-hidden d-flex flex-column">
                                                        <div className="position-relative" style={{ height: '180px' }}>
                                                            {event?.imagePath ? (
                                                                <img
                                                                    src={`https://localhost:7187/EventImages/${event.imagePath}`}
                                                                    alt={event.details}
                                                                    className="w-100 h-100 object-fit-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-100 h-100 bg-light d-flex align-items-center justify-content-center">
                                                                    <span className="material-symbols-outlined text-muted" style={{ fontSize: '48px' }}>event</span>
                                                                </div>
                                                            )}
                                                            <div className="position-absolute top-0 end-0 m-3">
                                                                <span className="ef-badge bg-white shadow-sm" style={{ color: 'var(--ef-text-primary)' }}>
                                                                    {Number(bk.scheduleEventFees || event?.fees || 0) === 0 ? "FREE" : `₹${bk.scheduleEventFees || event?.fees || 0}`}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="p-4 d-flex flex-column flex-grow-1">
                                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                                <span className="ef-label mb-0" style={{ color: 'var(--ef-accent-teal)' }}>
                                                                    {event?.eventCategoryName || "Event"}
                                                                </span>
                                                                <div className="d-flex gap-1">
                                                                    <span className={`ef-badge ${bk.isCancelled ? 'bg-danger text-white' : 'bg-success text-white'}`}>
                                                                        {bk.isCancelled ? 'Cancelled' : 'Active'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <h5 className="fw-800 mb-3">{event?.details || bk.scheduleEventDetails}</h5>

                                                            <div className="mt-auto pt-3 border-top border-light d-flex flex-wrap gap-2">
                                                                {(() => {
                                                                    const eventDate = event ? new Date(event.startDate) : null;
                                                                    const today = new Date();
                                                                    today.setHours(0, 0, 0, 0);
                                                                    const hasPassed = eventDate && eventDate < today;

                                                                    return (
                                                                        <>
                                                                            {!bk.isCancelled && bk.isPaid && (
                                                                                <button className="btn-pill btn-outline py-1 px-3 small" onClick={() => navigate(`/receipt/${bk.eventBookingId}`)}>
                                                                                    Receipt
                                                                                </button>
                                                                            )}
                                                                            {!bk.isCancelled && !bk.isPaid && !hasPassed && (
                                                                                <button className="btn-pill btn-primary py-1 px-3 small" onClick={() => navigate(`/payment/${bk.eventBookingId}`)}>
                                                                                    Pay
                                                                                </button>
                                                                            )}
                                                                            {!bk.isCancelled && !bk.isPaid && hasPassed && (
                                                                                <span className="text-secondary small">Expired</span>
                                                                            )}
                                                                            {!bk.isCancelled && (
                                                                                <button className="btn-pill btn-outline py-1 px-3 small text-danger" onClick={() => handleCancelBooking(bk)}>
                                                                                    Cancel
                                                                                </button>
                                                                            )}
                                                                        </>
                                                                    );
                                                                })()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="col-12 text-center py-5">
                                            <p className="text-secondary">No bookings found.</p>
                                        </div>
                                    )
                                ) : (
                                    filteredEvents.length > 0 ? (
                                        filteredEvents.map((evt) => (
                                            <div key={evt.scheduleEventId} className="col-12 col-md-6">
                                                <div className="ef-card h-100 p-0 overflow-hidden d-flex flex-column">
                                                    <div className="position-relative" style={{ height: '200px' }}>
                                                        {evt.imagePath ? (
                                                            <img
                                                                src={`https://localhost:7187/EventImages/${evt.imagePath}`}
                                                                alt={evt.details}
                                                                className="w-100 h-100 object-fit-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-100 h-100 bg-light d-flex align-items-center justify-content-center">
                                                                <span className="material-symbols-outlined text-muted" style={{ fontSize: '48px' }}>event</span>
                                                            </div>
                                                        )}
                                                        <div className="position-absolute bottom-0 start-0 m-3">
                                                            <span className="ef-badge bg-white shadow-sm">
                                                                {Number(evt.fees || 0) === 0 ? "FREE" : `₹${evt.fees}`}
                                                            </span>
                                                        </div>
                                                        {myBookings.some(bk => String(bk.scheduleEventId) === String(evt.scheduleEventId) && !bk.isCancelled) && (
                                                            <div className="position-absolute top-0 end-0 m-3">
                                                                <span className="ef-badge bg-success text-white shadow-sm">BOOKED</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="p-4 d-flex flex-column flex-grow-1">
                                                        <span className="ef-label mb-2" style={{ color: 'var(--ef-accent-teal)' }}>
                                                            {evt.eventCategoryName || "General"}
                                                        </span>
                                                        <h5 className="fw-800 mb-3">{evt.details}</h5>

                                                        <div className="d-flex align-items-center gap-2 text-secondary small mb-4">
                                                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>location_on</span>
                                                            {evt.placeName}
                                                        </div>

                                                        <div className="mt-auto">
                                                            {myBookings.some(bk => String(bk.scheduleEventId) === String(evt.scheduleEventId) && !bk.isCancelled) ? (
                                                                <button className="btn-pill btn-outline w-100" onClick={() => setActiveTab('bookings')}>
                                                                    View Booking
                                                                </button>
                                                            ) : (
                                                                // Prevent booking past events
                                                                new Date(evt.startDate) >= new Date().setHours(0,0,0,0) ? (
                                                                    <button className="btn-pill btn-primary w-100" onClick={() => navigate(`/booking/${evt.scheduleEventId}`)}>
                                                                        Book Now
                                                                    </button>
                                                                ) : (
                                                                    <button className="btn-pill btn-outline w-100 opacity-50 cursor-not-allowed" disabled title="This event has already passed.">
                                                                        Event Ended
                                                                    </button>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-12 text-center py-5">
                                            <p className="text-secondary">No events matching your filters.</p>
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
