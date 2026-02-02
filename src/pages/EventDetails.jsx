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
        <div className="event-details-page pb-5">
            {/* Hero / Banner */}
            <div className="bg-dark text-white py-5 mb-5" style={{ background: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1600&q=80')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <div className="container">
                    <span className="badge bg-warning text-dark mb-3 px-3 py-2 rounded-pill fw-bold">
                        {event.eventCategoryName || "Event"}
                    </span>
                    <h1 className="display-4 fw-bold mb-3">{event.title}</h1>
                    <p className="lead opacity-75"><i className="bi bi-geo-alt-fill me-2"></i>{event.placeName || "Location TBD"}</p>
                </div>
            </div>

            <div className="container">
                <div className="row">
                    <div className="col-lg-8">
                        <div className="card border-0 shadow-sm p-4 mb-4">
                            <h3 className="fw-bold mb-3">About this Event</h3>
                            <p className="text-muted" style={{ lineHeight: '1.8' }}>
                                {event.description || "No description provided for this event. Join us for an amazing experience!"}
                            </p>
                        </div>

                        {/* Additional details could go here like Organizer info, Map, etc */}
                        <div className="card border-0 shadow-sm p-4">
                            <h5 className="fw-bold mb-3">Organizer</h5>
                            <p className="mb-0">Contact details and organizer information would appear here.</p>
                        </div>
                    </div>

                    <div className="col-lg-4">
                        <div className="card border-0 shadow-lg p-4 sticky-top" style={{ top: '100px' }}>
                            <h4 className="fw-bold mb-4">Event Details</h4>

                            <div className="mb-4">
                                <label className="text-muted small fw-bold text-uppercase d-block mb-1">Date</label>
                                <div className="d-flex align-items-center">
                                    <i className="bi bi-calendar-event fs-4 text-primary me-3"></i>
                                    <span className="fs-5">{event.eventDate ? new Date(event.eventDate).toLocaleDateString() : "TBD"}</span>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="text-muted small fw-bold text-uppercase d-block mb-1">Time</label>
                                <div className="d-flex align-items-center">
                                    <i className="bi bi-clock fs-4 text-primary me-3"></i>
                                    <span className="fs-5">{event.startTime || "TBD"} - {event.endTime || "TBD"}</span>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="text-muted small fw-bold text-uppercase d-block mb-1">Price</label>
                                <div className="d-flex align-items-center">
                                    <i className="bi bi-tag fs-4 text-primary me-3"></i>
                                    {/* Assuming price might be in the event object, if not defaulting to Free or mock */}
                                    <span className="fs-4 fw-bold text-success">{event.price ? `$${event.price}` : "Free"}</span>
                                </div>
                            </div>

                            <hr className="my-4" />

                            <Link to={`/booking/${event.scheduleEventId}`} className="btn btn-primary btn-lg w-100 fw-bold py-3 shadow-sm hover-scale">
                                Book Now
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetails;
