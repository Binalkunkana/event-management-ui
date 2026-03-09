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
        <div className="container py-5">
            <h2 className="mb-4 fw-bold">Available Events</h2>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                </div>
            ) : (
                <div className="row g-4">
                    {events.length > 0 ? (
                        events.map((event) => (
                            <div className="col-md-4" key={event.scheduleEventId}>
                                <div className="card h-100 shadow-sm border-0">
                                    <div className="bg-light d-flex align-items-center justify-content-center" style={{ height: '200px' }}>
                                        <i className="bi bi-image text-muted" style={{ fontSize: '3rem' }}></i>
                                    </div>
                                    <div className="card-body">
                                        <span className="badge bg-info text-dark mb-2">{event.eventCategoryName || "Category"}</span>
                                        <h5 className="card-title fw-bold">{event.title || "Event Title"}</h5>

                                        <div className="small text-muted mb-3">
                                            <div className="mb-1"><i className="bi bi-calendar3 me-2"></i>{event.startDate || "Date TBD"}</div>
                                            <div><i className="bi bi-geo-alt me-2"></i>{event.placeName || "Location TBD"}</div>
                                        </div>

                                        <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                                            <span className="h5 fw-bold text-primary mb-0">₹{event.price || 0}</span>
                                            <div className="btn-group">
                                                <Link to={`/events/${event.scheduleEventId}`} className="btn btn-outline-primary btn-sm">View</Link>
                                                <Link to={`/booking/${event.scheduleEventId}`} className="btn btn-primary btn-sm">Book</Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-12 text-center py-5">
                            <h4>No events found</h4>
                            <p className="text-muted">Try adjusting your filters.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default EventListing;