import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getScheduledEventById } from "../api/eventApi";
import "../index.css";

const EventDetails = () => {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEventDetails();
    }, [id]);

    const fetchEventDetails = async () => {
        try {
            const res = await getScheduledEventById(id);
            setEvent(res.data.data);
        } catch (error) {
            console.error("Failed to load event details", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );

    if (!event) return (
        <div className="container py-5 text-center">
            <h3>Event not found</h3>
            <Link to="/events" className="btn btn-primary mt-3">Back to Events</Link>
        </div>
    );

    return (
        <div className="container py-5">
            <div className="row">
                <div className="col-lg-8">
                    <div className="card shadow-sm border-0 mb-4">
                        <img
                            src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200"
                            className="card-img-top"
                            alt="Event Banner"
                            style={{ height: '400px', objectFit: 'cover' }}
                        />
                        <div className="card-body p-4">
                            <span className="badge bg-warning text-dark mb-2">{event.eventCategoryName || "Event"}</span>
                            <h2 className="fw-bold mb-3">{event.title}</h2>
                            <p className="text-muted mb-4">{event.description || "No description available."}</p>

                            <div className="d-flex align-items-center text-muted mb-2">
                                <i className="bi bi-geo-alt-fill me-2 text-primary"></i>
                                {event.placeName || "Venue TBD"}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-4">
                    <div className="card shadow-sm border-0 sticky-top" style={{ top: '24px' }}>
                        <div className="card-body p-4">
                            <h5 className="fw-bold mb-4">Event Details</h5>

                            <div className="mb-4">
                                <div className="d-flex align-items-center mb-3">
                                    <div className="bg-light p-2 rounded me-3">
                                        <i className="bi bi-calendar-event text-primary"></i>
                                    </div>
                                    <div>
                                        <div className="small text-muted">Date</div>
                                        <div className="fw-bold">{event.eventDate ? new Date(event.eventDate).toLocaleDateString() : "TBD"}</div>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center">
                                    <div className="bg-light p-2 rounded me-3">
                                        <i className="bi bi-clock text-primary"></i>
                                    </div>
                                    <div>
                                        <div className="small text-muted">Time</div>
                                        <div className="fw-bold">{event.startTime || "09:00 AM"} - {event.endTime || "05:00 PM"}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-top">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <span className="text-muted">Ticket Price</span>
                                    <span className="h4 fw-bold text-primary mb-0">{event.price ? `₹${event.price}` : "FREE"}</span>
                                </div>
                                <Link to={`/booking/${event.scheduleEventId}`} className="btn btn-primary w-100 py-3 fw-bold">
                                    Book Now
                                </Link>
                            </div>

                            <div className="text-center mt-3">
                                <small className="text-muted">Secure checkout by Manup</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetails;