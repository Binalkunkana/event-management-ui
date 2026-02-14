import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllScheduledEvents } from '../api/eventApi';
import { getAllCategories } from '../api/categoryApi';
import { getAllPlaces } from '../api/placeApi';

const UserDashboard = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [categories, setCategories] = useState([]);
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'past'

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
            const [eventRes, catRes, placeRes] = await Promise.all([
                getAllScheduledEvents(),
                getAllCategories(),
                getAllPlaces()
            ]);

            // Robust data extraction helper for .NET API responses
            const extractArray = (res) => {
                if (!res || !res.data) return [];
                // Check res.data.data (standard) or res.data (direct)
                const data = res.data.data !== undefined ? res.data.data : res.data;
                if (Array.isArray(data)) return data;
                // Check for .NET $values wrapper
                if (data && typeof data === 'object' && data.$values && Array.isArray(data.$values)) {
                    return data.$values;
                }
                return [];
            };

            setEvents(extractArray(eventRes));
            setCategories(extractArray(catRes));
            setPlaces(extractArray(placeRes));
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

    // Derived filtering logic
    const filteredEvents = (Array.isArray(events) ? events : []).filter(evt => {
        if (!evt) return false;

        // 1. Tab Filtering (Upcoming vs Past) - Always live based on active tab
        const eventDateStr = evt.startDate || evt.StartDate || evt.eventDate || evt.EventDate || evt.startTime || evt.StartTime;
        const eventDate = eventDateStr ? new Date(eventDateStr) : new Date();
        const now = new Date();
        const isUpcoming = eventDate >= now;

        if (activeTab === 'upcoming' && !isUpcoming) return false;
        if (activeTab === 'past' && isUpcoming) return false;

        // 2. Applied Filters (Applied only when button is clicked)

        // Location Filter
        const evtPlaceId = evt.placeId || evt.PlaceId;
        if (appliedFilters.location && evtPlaceId != appliedFilters.location) return false;

        // Name Filter
        const details = evt.details || evt.Details || evt.title || evt.Title || "";
        if (appliedFilters.name && !details.toLowerCase().includes(appliedFilters.name.toLowerCase())) return false;

        // Category Filter
        const evtCatId = evt.eventCategoryId || evt.EventCategoryId;
        if (appliedFilters.category && evtCatId != appliedFilters.category) return false;

        // Price Type Filter
        if (appliedFilters.priceType !== 'All') {
            const isFree = Number(evt.fees || evt.Fees || 0) === 0;
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
                            </ul>
                            <div className="text-muted small">
                                Showing <strong>{filteredEvents.length}</strong> events
                            </div>
                        </div>

                        {/* Grid */}
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-warning" role="status"></div>
                                <p className="mt-2 text-muted">Fetching events...</p>
                            </div>
                        ) : (
                            <div className="row g-4">
                                {filteredEvents.length > 0 ? (
                                    filteredEvents.map((evt) => (
                                        <div key={evt.scheduleEventId || evt.Id || Math.random()} className="col-lg-4 col-md-6">
                                            <div className="card h-100 border-0 shadow-sm event-dashboard-card" style={{ borderRadius: '16px', overflow: 'hidden', transition: 'transform 0.2s' }}>
                                                <div className="position-relative">
                                                    <div style={{ height: '160px', backgroundColor: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#ccc' }}>event</span>
                                                    </div>
                                                    <span className="position-absolute top-0 start-0 m-3 badge rounded-pill px-3 py-2 shadow-sm" style={{ backgroundColor: 'rgba(255,255,255,0.9)', color: 'var(--theme-orange)', fontWeight: '800' }}>
                                                        {Number(evt.fees || evt.Fees || 0) === 0 ? "FREE" : `₹${evt.fees || evt.Fees}`}
                                                    </span>
                                                </div>
                                                <div className="card-body p-4">
                                                    <div className="text-uppercase small fw-800 mb-2" style={{ color: 'var(--theme-orange)', letterSpacing: '1px' }}>
                                                        {evt.eventCategoryName || evt.EventCategoryName || "UNCATEGORIZED"}
                                                    </div>
                                                    <h5 className="card-title fw-bold mb-3" style={{ height: '3rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                                        {evt.details || evt.Details || "Untitled Event"}
                                                    </h5>

                                                    <div className="d-flex align-items-center mb-2 small text-muted">
                                                        <span className="material-symbols-outlined me-2" style={{ fontSize: '18px' }}>calendar_month</span>
                                                        <span>{formatDate(evt.startDate || evt.StartDate || evt.eventDate || evt.EventDate || evt.startTime || evt.StartTime)}</span>
                                                    </div>
                                                    <div className="d-flex align-items-center mb-4 small text-muted">
                                                        <span className="material-symbols-outlined me-2" style={{ fontSize: '18px' }}>location_on</span>
                                                        <span className="text-truncate">{evt.placeName || evt.PlaceName || "Location TBD"}</span>
                                                    </div>

                                                    <button
                                                        className="btn btn-theme w-100 fw-bold py-2 rounded-pill shadow-sm"
                                                        onClick={() => navigate(`/booking/${evt.scheduleEventId || evt.Id}`)}
                                                        style={{ backgroundColor: 'var(--theme-orange)', color: 'white', border: 'none' }}
                                                    >
                                                        Book Now
                                                    </button>
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
                .btn-theme:hover {
                    opacity: 0.9;
                }
                .btn-theme:active {
                    transform: scale(0.98);
                }
            `}</style>
        </div>
    );
};

export default UserDashboard;
