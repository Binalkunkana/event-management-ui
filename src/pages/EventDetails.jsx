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
        <div className="container-fluid py-5" style={{ backgroundColor: 'var(--ef-bg-primary)', minHeight: '100vh' }}>
            <div className="container">
                <nav aria-label="breadcrumb" className="mb-4 animate-ef">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item"><Link to="/events" className="text-decoration-none text-secondary">Events</Link></li>
                        <li className="breadcrumb-item active" aria-current="page">{event.title || event.details}</li>
                    </ol>
                </nav>

                <div className="row g-5">
                    <div className="col-lg-8 animate-ef" style={{ animationDelay: '0.1s' }}>
                        <div className="ef-card p-0 overflow-hidden mb-5">
                            <img
                                src={event.imagePath ? `https://localhost:7187/EventImages/${event.imagePath}` : "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200"}
                                alt={event.title || event.details}
                                className="w-100"
                                style={{ height: '500px', objectFit: 'cover' }}
                            />
                            <div className="p-5">
                                <span className="ef-badge mb-3" style={{ backgroundColor: 'var(--ef-accent-lavender)', color: 'white' }}>
                                    {event.eventCategoryName || "Featured Event"}
                                </span>
                                <h1 className="fw-800 display-5 mb-4">{event.title || event.details}</h1>

                                <div className="mb-5">
                                    <h5 className="fw-800 mb-3">About this event</h5>
                                    <p className="text-secondary lh-lg" style={{ fontSize: '1.1rem' }}>
                                        {event.description || event.details || "No detailed description provided for this event. Join us for an unforgettable experience filled with learning, networking, and fun."}
                                    </p>
                                </div>

                                <div className="row g-4 border-top pt-5">
                                    <div className="col-md-6">
                                        <div className="d-flex align-items-start gap-3">
                                            <div className="bg-light p-3 rounded-circle">
                                                <span className="material-symbols-outlined text-dark">location_on</span>
                                            </div>
                                            <div>
                                                <h6 className="fw-800 mb-1">Location</h6>
                                                <p className="text-secondary mb-0">{event.placeName || "Venue details will be shared soon"}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="d-flex align-items-start gap-3">
                                            <div className="bg-light p-3 rounded-circle">
                                                <span className="material-symbols-outlined text-dark">category</span>
                                            </div>
                                            <div>
                                                <h6 className="fw-800 mb-1">Category</h6>
                                                <p className="text-secondary mb-0">{event.eventCategoryName || "General Admission"}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-4 animate-ef" style={{ animationDelay: '0.2s' }}>
                        <div className="ef-card sticky-top" style={{ top: '100px' }}>
                            <h4 className="fw-800 mb-4">Event Details</h4>

                            <div className="d-flex flex-column gap-4 mb-5">
                                <div className="d-flex align-items-center gap-3">
                                    <span className="material-symbols-outlined text-secondary">calendar_today</span>
                                    <div>
                                        <div className="ef-label mb-0">Date</div>
                                        <div className="fw-800">{event.startDate ? new Date(event.startDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : "Date to be announced"}</div>
                                    </div>
                                </div>

                                <div className="d-flex align-items-center gap-3">
                                    <span className="material-symbols-outlined text-secondary">schedule</span>
                                    <div>
                                        <div className="ef-label mb-0">Time</div>
                                        <div className="fw-800">{event.startTime || "09:00 AM"} - {event.endTime || "05:00 PM"}</div>
                                    </div>
                                </div>

                                <div className="d-flex align-items-center gap-3">
                                    <span className="material-symbols-outlined text-secondary">payments</span>
                                    <div>
                                        <div className="ef-label mb-0">Investment</div>
                                        <div className="fw-800 text-dark h3 mb-0">
                                            {Number(event.fees || event.Fees || 0) === 0 ? "Complimentary" : `₹${event.fees || event.Fees}`}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Link to={`/booking/${event.scheduleEventId}`} className="btn-pill btn-primary w-100 py-3 mb-3 text-center text-decoration-none d-block shadow">
                                Reserve Your Spot
                            </Link>

                            <div className="text-center">
                                <p className="small text-secondary mb-0">
                                    <span className="material-symbols-outlined align-middle me-1" style={{ fontSize: '18px' }}>verified_user</span>
                                    Secure booking via <span className="fw-800 text-dark">EventFlow</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetails;
