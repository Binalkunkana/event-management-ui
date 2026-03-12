import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAllScheduledEvents } from "../api/eventApi";
import { getAllCategories } from "../api/categoryApi";
import { getAllPlaces } from "../api/placeApi";
import { getAllBookings, updateBooking } from "../api/bookingApi";
import { getAllPayments } from "../api/paymentApi";
import "../index.css";

const HomePage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Data States
    const [events, setEvents] = useState([]);
    const [categories, setCategories] = useState([]);
    const [places, setPlaces] = useState([]);
    const [myBookings, setMyBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    
    // UI States
    const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'past' | 'bookings'
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
    
    // Search/Filter States (from LandingPage)
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedPlace, setSelectedPlace] = useState("");
    const [searchName, setSearchName] = useState("");

    useEffect(() => {
        setIsLoggedIn(!!localStorage.getItem("token"));
        fetchData();
    }, []);

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

            const getRootEmail = (email) => {
                if (!email || !email.includes('@')) return (email || "").toLowerCase();
                const [local, domain] = email.split('@');
                const rootLocal = local.split('+')[0];
                return `${rootLocal}@${domain}`.toLowerCase();
            };

            const currentUserEmail = getRootEmail(localStorage.getItem("email"));

            const [eventRes, catRes, placeRes, bookingRes, paymentRes] = await Promise.all([
                getAllScheduledEvents().catch(() => ({ data: { data: [] } })),
                getAllCategories().catch(() => ({ data: { data: [] } })),
                getAllPlaces().catch(() => ({ data: { data: [] } })),
                isLoggedIn ? getAllBookings().catch(() => ({ data: { data: [] } })) : Promise.resolve({ data: { data: [] } }),
                isLoggedIn ? getAllPayments().catch(() => ({ data: { data: [] } })) : Promise.resolve({ data: { data: [] } })
            ]);

            // Normalized Events
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
            if (isLoggedIn) {
                const rawBookings = extractArray(bookingRes);
                const paidBookingIds = new Set(
                    extractArray(paymentRes)
                        .filter(p => (p.paymentStatus || p.PaymentStatus || "").toLowerCase() === 'success')
                        .map(p => String(p.eventBookingId || p.EventBookingId))
                );

                const filteredBookings = rawBookings
                    .filter(b => {
                        const bookingEmail = (b.email || b.Email || "").toLowerCase();
                        return getRootEmail(bookingEmail) === currentUserEmail;
                    })
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
            }

        } catch (err) {
            console.error("Home Data Fetch Error:", err);
            setError("Could not load latest events.");
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

    // Filter Logic
    const filteredEvents = events.filter(evt => {
        // 1. Tab Check
        const eventDate = new Date(evt.startDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const isUpcoming = eventDate >= today;
        if (activeTab === 'upcoming' && !isUpcoming) return false;
        if (activeTab === 'past' && isUpcoming) return false;

        // 2. Search Filters
        if (selectedCategory && evt.eventCategoryId != selectedCategory) return false;
        if (selectedPlace && evt.placeId != selectedPlace) return false;
        if (searchName && !evt.details.toLowerCase().includes(searchName.toLowerCase())) return false;

        return true;
    });

    return (
        <div className="home-page overflow-hidden" style={{ backgroundColor: 'var(--ef-bg-primary)' }}>
            {/* Hero Section */}
            <section className="ef-hero d-flex align-items-center min-vh-100 position-relative pb-0">
                <div className="ef-hero-bg-blur blur-teal position-absolute" style={{ top: '-10%', right: '5%', opacity: '0.6' }}></div>
                <div className="ef-hero-bg-blur blur-lavender position-absolute" style={{ bottom: '-10%', left: '5%', opacity: '0.6' }}></div>
                
                <div className="container position-relative z-1 pt-5">
                    <div className="row justify-content-center">
                        <div className="col-lg-10 text-center animate-ef">
                            <div className="d-inline-flex align-items-center gap-2 ef-badge mb-4 py-2 px-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', color: 'var(--ef-text-primary)' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>celebration</span>
                                <span className="fw-800 small text-uppercase" style={{ letterSpacing: '0.1em' }}>New Era of Experiences</span>
                            </div>

                            <h1 className="display-1 fw-800 mb-4" style={{ letterSpacing: '-0.05em', lineHeight: '1' }}>
                                Design Your <br />
                                Perfect <span style={{ color: 'var(--ef-accent-teal)', position: 'relative' }}>
                                    EventFlow
                                    <svg viewBox="0 0 200 20" className="position-absolute start-0 bottom-0 w-100" style={{ height: '15px', zIndex: '-1' }}>
                                        <path d="M0 15 Q50 5 100 15 T200 15" fill="none" stroke="var(--ef-accent-teal)" strokeWidth="4" opacity="0.3" />
                                    </svg>
                                </span>
                            </h1>

                            <p className="lead text-secondary mb-5 mx-auto lh-lg" style={{ maxWidth: '650px', fontSize: '1.25rem' }}>
                                Seamlessly discover, curate, and book world-class gatherings through an interface built for the future.
                            </p>

                            {/* Minimalist Search Bar */}
                            <div className="ef-card p-2 mx-auto animate-ef shadow-xl" style={{ maxWidth: '1000px', borderRadius: '30px', marginTop: '40px' }}>
                                <div className="row g-2 p-2">
                                    <div className="col-lg-4">
                                        <div className="position-relative h-100">
                                            <span className="position-absolute start-0 top-50 translate-middle-y ms-3 text-secondary material-symbols-outlined" style={{ fontSize: '20px' }}>category</span>
                                            <select
                                                className="ef-input ps-5 h-100 border-0"
                                                value={selectedCategory}
                                                onChange={(e) => setSelectedCategory(e.target.value)}
                                                style={{ backgroundColor: '#f9f9f9', borderRadius: '20px' }}
                                            >
                                                <option value="">Any Category</option>
                                                {categories.map((cat) => (
                                                    <option key={cat.eventCategoryId} value={cat.eventCategoryId}>{cat.eventCategoryName}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-lg-3">
                                        <div className="position-relative h-100">
                                            <span className="position-absolute start-0 top-50 translate-middle-y ms-3 text-secondary material-symbols-outlined" style={{ fontSize: '20px' }}>location_on</span>
                                            <select
                                                className="ef-input ps-5 h-100 border-0"
                                                value={selectedPlace}
                                                onChange={(e) => setSelectedPlace(e.target.value)}
                                                style={{ backgroundColor: '#f9f9f9', borderRadius: '20px' }}
                                            >
                                                <option value="">Everywhere</option>
                                                {places.map((place) => (
                                                    <option key={place.placeId} value={place.placeId}>{place.placeName}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-lg-3">
                                        <div className="position-relative h-100">
                                            <span className="position-absolute start-0 top-50 translate-middle-y ms-3 text-secondary material-symbols-outlined" style={{ fontSize: '20px' }}>search</span>
                                            <input
                                                type="text"
                                                className="ef-input ps-5 h-100 border-0"
                                                placeholder="Search event name..."
                                                value={searchName}
                                                onChange={(e) => setSearchName(e.target.value)}
                                                style={{ backgroundColor: '#f9f9f9', borderRadius: '20px' }}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-lg-2">
                                        <button className="btn-pill btn-primary w-100 h-100 py-3 shadow-none" onClick={() => document.getElementById('activity-hub').scrollIntoView({ behavior: 'smooth' })}>
                                            Explore
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Activity Hub Section */}
            <section id="activity-hub" className="py-5" style={{ minHeight: '80vh' }}>
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-10">
                            {/* Tabs Switcher */}
                            <div className="d-flex justify-content-center mb-5 animate-ef">
                                <div className="d-flex gap-2 p-1 bg-white rounded-pill border border-light shadow-sm">
                                    <button
                                        className={`btn-pill border-0 px-4 py-2 ${activeTab === 'upcoming' ? 'btn-primary shadow' : 'bg-transparent text-secondary'}`}
                                        onClick={() => setActiveTab('upcoming')}
                                    >
                                        Upcoming Events
                                    </button>
                                    <button
                                        className={`btn-pill border-0 px-4 py-2 ${activeTab === 'past' ? 'btn-primary shadow' : 'bg-transparent text-secondary'}`}
                                        onClick={() => setActiveTab('past')}
                                    >
                                        Past Events
                                    </button>
                                    {isLoggedIn && (
                                        <button
                                            className={`btn-pill border-0 px-4 py-2 ${activeTab === 'bookings' ? 'btn-primary shadow' : 'bg-transparent text-secondary'}`}
                                            onClick={() => setActiveTab('bookings')}
                                        >
                                            My Booked Events
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Content Grid */}
                            <div className="row g-4 animate-ef">
                                {loading ? (
                                    <div className="col-12 text-center py-5">
                                        <div className="spinner-border text-dark" role="status"></div>
                                        <p className="mt-3 ef-label">Syncing Events...</p>
                                    </div>
                                ) : activeTab === 'bookings' ? (
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
                                                                {(() => {
                                                                    const eventDate = event ? new Date(event.startDate) : null;
                                                                    const today = new Date();
                                                                    today.setHours(0, 0, 0, 0);
                                                                    const hasPassed = eventDate && eventDate < today;

                                                                    return (
                                                                        <>
                                                                            {!bk.isCancelled && bk.isPaid && (
                                                                                <button className="btn-pill btn-outline py-1 px-3 small shadow-none" onClick={() => navigate(`/receipt/${bk.eventBookingId}`)}>Receipt</button>
                                                                            )}
                                                                            {!bk.isCancelled && !bk.isPaid && !hasPassed && (
                                                                                <button className="btn-pill btn-primary py-1 px-3 small shadow-none" onClick={() => navigate(`/payment/${bk.eventBookingId}`)}>Pay Now</button>
                                                                            )}
                                                                            {!bk.isCancelled && !bk.isPaid && hasPassed && (
                                                                                <span className="text-secondary small">Exp (Unpaid)</span>
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
                                            <p className="text-secondary">No booked events found.</p>
                                        </div>
                                    )
                                ) : (
                                    filteredEvents.length > 0 ? (
                                        filteredEvents.map((evt) => (
                                            <div key={evt.scheduleEventId} className="col-12 col-md-6">
                                                <div className="ef-card h-100 p-0 overflow-hidden d-flex flex-column border-0 shadow-sm">
                                                    <div className="position-relative" style={{ height: '200px' }}>
                                                        {evt.imagePath ? (
                                                            <img
                                                                src={`https://localhost:7187/EventImages/${evt.imagePath}`}
                                                                alt={evt.details}
                                                                className="w-100 h-100 object-fit-cover"
                                                                onError={(e) => {e.target.src = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800"}}
                                                            />
                                                        ) : (
                                                            <div className="w-100 h-100 bg-light d-flex align-items-center justify-content-center">
                                                                <span className="material-symbols-outlined text-muted" style={{ fontSize: '40px' }}>event</span>
                                                            </div>
                                                        )}
                                                        <div className="position-absolute bottom-0 start-0 m-3">
                                                            <span className="ef-badge bg-white shadow-sm fw-800">
                                                                {Number(evt.fees || 0) === 0 ? "FREE" : `₹${evt.fees}`}
                                                            </span>
                                                        </div>
                                                        {isLoggedIn && myBookings.some(bk => String(bk.scheduleEventId) === String(evt.scheduleEventId) && !bk.isCancelled) && (
                                                            <div className="position-absolute top-0 end-0 m-3">
                                                                <span className="ef-badge bg-success text-white shadow-sm">BOOKED</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="p-4 d-flex flex-column flex-grow-1">
                                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                                            <span className="ef-label mb-0" style={{ color: 'var(--ef-accent-teal)' }}>{evt.eventCategoryName}</span>
                                                            <span className="text-secondary small d-flex align-items-center gap-1">
                                                                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>location_on</span>
                                                                {evt.placeName}
                                                            </span>
                                                        </div>
                                                        <h5 className="fw-800 mb-4">{evt.details}</h5>
                                                        <div className="mt-auto">
                                                            {(() => {
                                                                const isBooked = isLoggedIn && myBookings.some(bk => String(bk.scheduleEventId) === String(evt.scheduleEventId) && !bk.isCancelled);
                                                                const eventDate = new Date(evt.startDate);
                                                                const today = new Date();
                                                                today.setHours(0, 0, 0, 0);
                                                                const hasPassed = eventDate < today;

                                                                if (isBooked) {
                                                                    return (
                                                                        <button className="btn-pill btn-outline w-100" onClick={() => setActiveTab('bookings')}>
                                                                            View Booking
                                                                        </button>
                                                                    );
                                                                }

                                                                if (hasPassed) {
                                                                    return <button className="btn-pill btn-outline w-100 opacity-50 shadow-none" disabled>Event Ended</button>;
                                                                }
                                                                return (
                                                                    <button className="btn-pill btn-primary w-100" onClick={() => navigate(`/booking/${evt.scheduleEventId}`)}>
                                                                        Book Now
                                                                    </button>
                                                                );
                                                            })()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-12 text-center py-5">
                                            <p className="text-secondary">No events found for the current selection.</p>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
