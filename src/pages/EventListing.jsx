import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { getAllScheduledEvents } from "../api/eventApi";
import { getAllCategories } from "../api/categoryApi";
import { getAllPlaces } from "../api/placeApi";
import "../index.css";

const EventListing = () => {
    const [events, setEvents] = useState([]);
    const [searchParams] = useSearchParams();
    const categoryId = searchParams.get("category");
    const placeId = searchParams.get("place");
    const date = searchParams.get("date");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEvents();
    }, [categoryId, placeId, date]);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            // Fetch all data locally since we don't have server-side filtering endpoints confirmed yet
            // In a real app, strict filtering should happen on backend
            // For now, fetching all ScheduleEvents and filtering in JS
            const res = await getAllScheduledEvents();
            let allEvents = res.data.data || [];

            if (categoryId) {
                allEvents = allEvents.filter(e => e.eventCategoryId == categoryId);
            }
            if (placeId) {
                allEvents = allEvents.filter(e => (e.placeId || e.PlaceId) == placeId);
            }
            if (date) {
                // Ensure date match (handles cases where date might be in ISO or simple YYYY-MM-DD)
                allEvents = allEvents.filter(e => {
                    const eventStartDate = e.startDate || e.StartDate;
                    if (!eventStartDate) return false;
                    const eventDate = new Date(eventStartDate).toISOString().split('T')[0];
                    return eventDate === date;
                });
            }

            setEvents(allEvents);
        } catch (error) {
            console.error("Error fetching events:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid py-5" style={{ backgroundColor: 'var(--ef-bg-secondary)', minHeight: '100vh' }}>
            <div className="container">
                <div className="d-flex justify-content-between align-items-end mb-5 animate-ef">
                    <div>
                        <h1 className="fw-800 mb-2">Available Events</h1>
                        <p className="ef-label text-secondary mb-0">Discover and book extraordinary experiences</p>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-dark" role="status"></div>
                        <p className="mt-3 ef-label">Finding events for you...</p>
                    </div>
                ) : (
                    <div className="row g-4 animate-ef" style={{ animationDelay: '0.1s' }}>
                        {events.length > 0 ? (
                            events.map((event) => (
                                <div className="col-12 col-md-6 col-lg-4" key={event.scheduleEventId}>
                                    <div className="ef-card h-100 p-0 overflow-hidden d-flex flex-column shadow-hover">
                                        <div className="position-relative" style={{ height: '220px' }}>
                                            {event.imagePath ? (
                                                <img
                                                    src={`https://localhost:7187/EventImages/${event.imagePath}`}
                                                    alt={event.title}
                                                    className="w-100 h-100 object-fit-cover"
                                                />
                                            ) : (
                                                <div className="w-100 h-100 bg-light d-flex align-items-center justify-content-center">
                                                    <span className="material-symbols-outlined text-muted" style={{ fontSize: '48px' }}>image</span>
                                                </div>
                                            )}
                                            <div className="position-absolute bottom-0 start-0 m-3">
                                                <span className="ef-badge bg-white shadow-sm">
                                                    {event.eventCategoryName || "General"}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-4 d-flex flex-column flex-grow-1">
                                            <h4 className="fw-800 mb-3">{event.title || event.details || "Event Title"}</h4>

                                            <div className="d-flex flex-column gap-2 mb-4">
                                                <div className="d-flex align-items-center gap-2 text-secondary small">
                                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>calendar_month</span>
                                                    {event.startDate || "Date TBD"}
                                                </div>
                                                <div className="d-flex align-items-center gap-2 text-secondary small">
                                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>location_on</span>
                                                    {event.placeName || "Location TBD"}
                                                </div>
                                            </div>

                                            <div className="mt-auto pt-3 border-top border-light d-flex justify-content-between align-items-center">
                                                <span className="h5 fw-800 mb-0">₹{event.fees || event.Fees || 0}</span>
                                                <div className="d-flex gap-2">
                                                    <Link to={`/events/${event.scheduleEventId}`} className="btn-pill btn-outline py-2 px-3 small">Details</Link>
                                                    <Link to={`/booking/${event.scheduleEventId}`} className="btn-pill btn-primary py-2 px-3 small">Book Now</Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-12 text-center py-5">
                                <span className="material-symbols-outlined text-muted mb-3" style={{ fontSize: '64px' }}>search_off</span>
                                <h3 className="fw-800">No events found</h3>
                                <p className="text-secondary">Try adjusting your filters or browsing all categories.</p>
                                <button className="btn-pill btn-primary mt-3 px-4" onClick={() => (window.location.href = '/events')}>
                                    Browse All Events
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventListing;