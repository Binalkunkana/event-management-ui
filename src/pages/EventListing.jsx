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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEvents();
    }, [categoryId, placeId]);

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
                allEvents = allEvents.filter(e => e.placeId == placeId);
            }

            setEvents(allEvents);
        } catch (error) {
            console.error("Error fetching events:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="event-listing-page pt-5 pb-5">
            <div className="container">
                <div className="d-flex justify-content-between align-items-center mb-5">
                    <h2 className="fw-bold text-dark">Upcoming Events</h2>
                    <Link to="/" className="btn btn-outline-primary rounded-pill px-4">Change Search</Link>
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : (
                    <div className="row g-4">
                        {events.length > 0 ? (
                            events.map((event) => (
                                <div className="col-md-4" key={event.scheduleEventId}>
                                    <div className="card event-card h-100 border-0 shadow-sm">
                                        <div className="card-img-top bg-light d-flex align-items-center justify-content-center" style={{ height: '200px' }}>
                                            {/* Placeholder for event image since API might not return one yet */}
                                            <span className="text-muted">Event Image</span>
                                        </div>
                                        <div className="card-body p-4">
                                            <div className="mb-2 text-primary small fw-bold text-uppercase">
                                                {event.eventCategoryName || "Event"}
                                            </div>
                                            <h5 className="card-title fw-bold mb-3">{event.title || "Untitled Event"}</h5>
                                            <p className="card-text text-muted small mb-2">
                                                <i className="bi bi-geo-alt me-2"></i>
                                                {event.placeName || "Location TBD"}
                                            </p>
                                            <p className="card-text text-muted small mb-4">
                                                <i className="bi bi-calendar3 me-2"></i>
                                                {event.eventDate ? new Date(event.eventDate).toLocaleDateString() : "Date TBD"}
                                            </p>
                                            <div className="d-flex gap-2">
                                                <Link to={`/events/${event.scheduleEventId}`} className="btn btn-outline-primary w-50 rounded-3 fw-bold">
                                                    Details
                                                </Link>
                                                <Link to={`/booking/${event.scheduleEventId}`} className="btn btn-primary w-50 rounded-3 fw-bold">
                                                    Book Now
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-12 text-center py-5">
                                <h3>No events found matching your criteria.</h3>
                                <p className="text-muted">Try changing your filters or browse all events.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventListing;
