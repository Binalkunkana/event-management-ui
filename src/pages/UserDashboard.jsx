import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllScheduledEvents } from '../api/eventApi';
import { getAllCategories } from '../api/categoryApi';
import { getAllPlaces } from '../api/placeApi';
import { getAllBookings, updateBooking } from '../api/bookingApi';
import { getAllPayments } from '../api/paymentApi';

const UserDashboard = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [categories, setCategories] = useState([]);
    const [places, setPlaces] = useState([]);
    const [myBookings, setMyBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'past' | 'bookings'

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
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const extractArray = (res) => {
                if (!res || !res.data) return [];
                const data = res.data.data !== undefined ? res.data.data : res.data;
                if (Array.isArray(data)) return data;
                if (data && typeof data === 'object' && data.$values && Array.isArray(data.$values)) {
                    return data.$values;
                }
                return [];
            };

            const [eventRes, catRes, placeRes, bookingRes, paymentRes] = await Promise.all([
                getAllScheduledEvents(),
                getAllCategories(),
                getAllPlaces(),
                getAllBookings().catch(() => ({ data: { data: [] } })),
                getAllPayments().catch(() => ({ data: { data: [] } }))
            ]);

            const rawEvents = extractArray(eventRes);
            const normalizedEvents = rawEvents.map(e => ({
                ...e,
                scheduleEventId: e.scheduleEventId || e.ScheduleEventId || e.id || e.Id,
                details: e.details || e.Details || e.title || e.Title || "Untitled Event",
                startDate: e.startDate || e.StartDate || (e.startTime && e.startTime.includes('T') ? e.startDate.split('T')[0] : (e.startDate || e.eventDate || e.EventDate || '')),
                startTimePart: e.startTimePart || e.StartTimePart || (e.startTime && e.startTime.includes('T') ? e.startTime.split('T')[1].slice(0, 5) : (e.startTime ? e.startTime.slice(0, 5) : '')),
                fees: e.fees || e.Fees || 0,
                placeId: e.placeId || e.PlaceId,
                placeName: e.placeName || e.PlaceName,
                eventCategoryId: e.eventCategoryId || e.EventCategoryId,
                eventCategoryName: e.eventCategoryName || e.EventCategoryName,
                imagePath: e.imagePath || e.ImagePath
            }));

            setEvents(normalizedEvents);
            setCategories(extractArray(catRes));
            setPlaces(extractArray(placeRes));

            // Filter bookings for current logged in user AND check for successful payment
            const userEmail = localStorage.getItem("email") || JSON.parse(localStorage.getItem("user") || "{}").email;
            const allBookings = extractArray(bookingRes);
            const allPayments = extractArray(paymentRes);

            // Create a set of booking IDs that have a successful payment
            const paidBookingIds = new Set(
                allPayments
                    .filter(p => {
                        const status = (p.paymentStatus || p.PaymentStatus || "").toLowerCase();
                        return status === 'success' || status === 'successful';
                    })
                    .map(p => String(p.eventBookingId || p.EventBookingId))
            );

            const userBookings = allBookings.filter(b => {
                const bEmail = (b.email || b.Email || "").toLowerCase();
                const isMyBooking = bEmail === (userEmail || "").toLowerCase();
                const bId = String(b.eventBookingId || b.EventBookingId || b.id || b.Id);
                const isPaid = paidBookingIds.has(bId);
                return isMyBooking && isPaid;
            }).map(b => ({
                ...b,
                eventBookingId: b.eventBookingId || b.EventBookingId || b.id || b.Id,
                scheduleEventId: b.scheduleEventId || b.ScheduleEventId,
                isCancelled: b.isCancelled || b.IsCancelled || false
            }));

            setMyBookings(userBookings);
        } catch (err) {
            console.error("Dashboard Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
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
        <div className="container-fluid" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '2rem' }}>
            <div className="row">
                {/* Sidebar Filters */}
                <div className="col-md-3">
                    <div className="bg-white p-4 rounded shadow-sm" style={{ position: 'sticky', top: '24px' }}>
                        <h5 className="mb-4 fw-bold" style={{ color: 'var(--matdash-text-dark)' }}>Filter Events</h5>

                        <div className="mb-3">
                            <label className="form-label fw-bold small text-muted">LOCATION</label>
                            <select
                                className="form-select border-light shadow-none"
                                name="location"
                                value={filters.location}
                                onChange={handleFilterChange}
                                style={{ borderRadius: '8px', padding: '10px' }}
                            >
                                <option value="">All Locations</option>
                                {Array.isArray(places) && places.map(p => {
                                    const pId = p.placeId || p.PlaceId || p.id || p.Id;
                                    const pName = p.placeName || p.PlaceName || p.name || p.Name;
                                    return (
                                        <option key={pId} value={pId}>
                                            {pName}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-bold small text-muted">SEARCH BY NAME</label>
                            <input
                                type="text"
                                className="form-control border-light shadow-none"
                                placeholder="Event name..."
                                name="name"
                                value={filters.name}
                                onChange={handleFilterChange}
                                style={{ borderRadius: '8px', padding: '10px' }}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-bold small text-muted">CATEGORY</label>
                            <select
                                className="form-select border-light shadow-none"
                                name="category"
                                value={filters.category}
                                onChange={handleFilterChange}
                                style={{ borderRadius: '8px', padding: '10px' }}
                            >
                                <option value="">All Categories</option>
                                {Array.isArray(categories) && categories.map(c => {
                                    const cId = c.eventCategoryId || c.EventCategoryId || c.id || c.Id;
                                    const cName = c.eventCategoryName || c.EventCategoryName || c.name || c.Name;
                                    return (
                                        <option key={cId} value={cId}>
                                            {cName}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="form-label fw-bold small text-muted">PRICE TYPE</label>
                            <select
                                className="form-select border-light shadow-none"
                                name="priceType"
                                value={filters.priceType}
                                onChange={handleFilterChange}
                                style={{ borderRadius: '8px', padding: '10px' }}
                            >
                                <option value="All">All Events</option>
                                <option value="Paid Event">Paid Event</option>
                                <option value="Free Event">Free Event</option>
                            </select>
                        </div>

                        <button
                            className="btn btn-theme w-100 fw-bold py-2 shadow-sm mb-2"
                            onClick={handleApplyFilters}
                            style={{ backgroundColor: 'var(--theme-orange)', border: 'none', borderRadius: '8px', color: 'black' }}
                        >
                            Apply Filters
                        </button>

                        <button
                            className="btn btn-light w-100 fw-bold py-2 shadow-sm"
                            onClick={handleResetFilters}
                            style={{ border: 'none', borderRadius: '8px' }}
                        >
                            Reset
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="col-md-9">
                    <div className="bg-white p-4 rounded shadow-sm">
                        {/* Tabs */}
                        <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
                            <ul className="nav nav-tabs border-0">
                                <li className="nav-item">
                                    <button
                                        className={`nav-link border-0 bg-transparent fw-bold ${activeTab === 'upcoming' ? 'active' : 'text-muted'}`}
                                        style={activeTab === 'upcoming' ? { borderBottom: '3px solid var(--theme-orange)', color: 'var(--theme-orange)' } : {}}
                                        onClick={() => setActiveTab('upcoming')}
                                    >
                                        Upcoming Events
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        className={`nav-link border-0 bg-transparent fw-bold ${activeTab === 'past' ? 'active' : 'text-muted'}`}
                                        style={activeTab === 'past' ? { borderBottom: '3px solid var(--theme-orange)', color: 'var(--theme-orange)' } : {}}
                                        onClick={() => setActiveTab('past')}
                                    >
                                        Past Events
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        className={`nav-link border-0 bg-transparent fw-bold ${activeTab === 'bookings' ? 'active' : 'text-muted'}`}
                                        style={activeTab === 'bookings' ? { borderBottom: '3px solid var(--theme-orange)', color: 'var(--theme-orange)' } : {}}
                                        onClick={() => setActiveTab('bookings')}
                                    >
                                        My Bookings
                                    </button>
                                </li>
                            </ul>
                            <div className="text-muted small">
                                Showing <strong>{activeTab === 'bookings' ? myBookings.length : filteredEvents.length}</strong> {activeTab === 'bookings' ? 'bookings' : 'events'}
                            </div>
                        </div>

                        {/* Grid */}
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-warning" role="status"></div>
                                <p className="mt-2 text-muted">Fetching data...</p>
                            </div>
                        ) : activeTab === 'bookings' ? (
                            <div className="row g-4">
                                {myBookings.length > 0 ? (
                                    myBookings.map((bk) => {
                                        const event = events.find(e => e.scheduleEventId == bk.scheduleEventId);
                                        return (
                                            <div key={bk.eventBookingId} className="col-12">
                                                <div className="card border-0 shadow-sm p-3" style={{ borderRadius: '15px' }}>
                                                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                                                        <div className="d-flex align-items-center gap-3">
                                                            <div className="bg-light p-3 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                                                                <span className="material-symbols-outlined text-warning" style={{ fontSize: '32px' }}>local_activity</span>
                                                            </div>
                                                            <div>
                                                                <h5 className="mb-1 fw-bold">{event?.details || "Event Details Unavailable"}</h5>
                                                                <div className="small text-muted d-flex align-items-center gap-2">
                                                                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>calendar_month</span>
                                                                    {event ? formatDate(event.startDate) : "TBD"}
                                                                </div>
                                                                <div className="badge mt-2" style={{ backgroundColor: bk.isCancelled ? '#fee2e2' : '#dcfce7', color: bk.isCancelled ? '#991b1b' : '#166534' }}>
                                                                    {bk.isCancelled ? 'CANCELLED' : 'ACTIVE'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-end">
                                                            <div className="fw-bold fs-5 mb-2">₹{bk.scheduleEventFees || bk.ScheduleEventFees || event?.fees || 0}</div>
                                                            <div className="d-flex gap-2">
                                                                {!bk.isCancelled && (
                                                                    <button
                                                                        className="btn btn-outline-primary btn-sm rounded-pill px-3 fw-bold"
                                                                        onClick={() => navigate(`/receipt/${bk.eventBookingId}`)}
                                                                    >
                                                                        View Receipt
                                                                    </button>
                                                                )}
                                                                {!bk.isCancelled && (
                                                                    <button
                                                                        className="btn btn-outline-danger btn-sm rounded-pill px-3 fw-bold"
                                                                        onClick={() => handleCancelBooking(bk)}
                                                                    >
                                                                        Cancel Booking
                                                                    </button>
                                                                )}
                                                            </div>
                                                            {bk.isCancelled && bk.cancellationDateTime && (
                                                                <div className="small text-muted" style={{ fontSize: '11px' }}>
                                                                    Cancelled on: {new Date(bk.cancellationDateTime).toLocaleDateString()}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="col-12 text-center py-5">
                                        <span className="material-symbols-outlined" style={{ fontSize: '64px', color: '#eee' }}>book_online</span>
                                        <h5 className="mt-3 text-muted">You haven't booked any events yet.</h5>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="row g-4">
                                {filteredEvents.length > 0 ? (
                                    filteredEvents.map((evt) => (
                                        <div key={evt.scheduleEventId || evt.Id || Math.random()} className="col-12 col-xl-6">
                                            <div className="card h-100 border-0 shadow-sm event-dashboard-card" style={{ borderRadius: '20px', overflow: 'hidden', transition: 'all 0.3s ease', border: '1px solid #eee' }}>
                                                <div className="row g-0 h-100">
                                                    <div className="col-md-5">
                                                        <div className="position-relative h-100" style={{ minHeight: '200px', backgroundColor: '#f0f2f5' }}>
                                                            {evt.imagePath && (
                                                                <img
                                                                    src={`https://localhost:7187/EventImages/${evt.imagePath}`}
                                                                    alt={evt.details || 'Event'}
                                                                    className="w-100 h-100 object-fit-cover"
                                                                    onError={(e) => {
                                                                        e.target.onerror = null;
                                                                        e.target.src = 'https://via.placeholder.com/400x300?text=Event+Image';
                                                                    }}
                                                                />
                                                            )}
                                                            {!evt.imagePath && (
                                                                <div className="h-100 d-flex align-items-center justify-content-center">
                                                                    <span className="material-symbols-outlined" style={{ fontSize: '64px', color: '#cbd5e0' }}>event</span>
                                                                </div>
                                                            )}
                                                            <span className="position-absolute top-0 start-0 m-3 badge rounded-pill px-3 py-2 shadow-sm" style={{ backgroundColor: 'white', color: 'var(--theme-orange)', fontWeight: '800', border: '1px solid #ffe8cc' }}>
                                                                ₹{evt.fees || evt.Fees || 0}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-7">
                                                        <div className="card-body p-4 d-flex flex-column h-100">
                                                            <div className="text-uppercase small fw-800 mb-2" style={{ color: 'var(--theme-orange)', letterSpacing: '1.5px' }}>
                                                                {evt.eventCategoryName || evt.EventCategoryName || categories.find(c => (c.eventCategoryId || c.EventCategoryId || c.id || c.Id) == (evt.eventCategoryId || evt.EventCategoryId))?.eventCategoryName || "UNCATEGORIZED"}
                                                            </div>
                                                            <h4 className="card-title fw-bold mb-3" style={{ color: '#2d3748', lineHeight: '1.4' }}>
                                                                {evt.details || evt.Details || "Untitled Event"}
                                                            </h4>

                                                            <div className="mt-auto">
                                                                <div className="d-flex align-items-center mb-2 text-secondary">
                                                                    <span className="material-symbols-outlined me-2" style={{ fontSize: '20px' }}>calendar_month</span>
                                                                    <span className="small fw-500">{formatDate(evt.startDate || evt.StartDate || evt.eventDate || evt.EventDate || evt.startTime || evt.StartTime)}</span>
                                                                </div>
                                                                <div className="d-flex align-items-center mb-4 text-secondary">
                                                                    <span className="material-symbols-outlined me-2" style={{ fontSize: '20px' }}>location_on</span>
                                                                    <span className="small fw-500 text-truncate">{evt.placeName || evt.PlaceName || "Location TBD"}</span>
                                                                </div>

                                                                <button
                                                                    className="btn btn-theme w-100 fw-bold py-3 rounded-pill shadow-sm d-flex align-items-center justify-content-center gap-2"
                                                                    onClick={() => navigate(`/booking/${evt.scheduleEventId || evt.Id}`)}
                                                                    style={{
                                                                        backgroundColor: 'var(--theme-orange)',
                                                                        color: 'black',
                                                                        border: 'none',
                                                                        fontSize: '15px',
                                                                        letterSpacing: '0.5px'
                                                                    }}
                                                                >
                                                                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>local_activity</span>
                                                                    BOOK EVENT NOW
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-12 text-center py-5">
                                        <span className="material-symbols-outlined" style={{ fontSize: '64px', color: '#eee' }}>event_busy</span>
                                        <h5 className="mt-3 text-muted">No events found matching your search.</h5>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .event-dashboard-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 12px 24px rgba(0,0,0,0.1) !important;
                }
                .fw-800 { font-weight: 800; }
                .btn-theme:active {
                    transform: scale(0.98);
                }
            `}</style>
        </div>
    );
};

export default UserDashboard;
