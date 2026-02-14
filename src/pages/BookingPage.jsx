import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getScheduledEventById } from "../api/eventApi";
import { createBooking } from "../api/bookingApi";
import "../index.css";

const BookingPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [bookingData, setBookingData] = useState({
        userId: 0, // Should be fetched from logged in user context
        eventId: parseInt(id),
        ticketCount: 1,
        totalAmount: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock getting user ID from localStorage or Context
        const userStr = localStorage.getItem("user");
        if (userStr) {
            const user = JSON.parse(userStr);
            setBookingData(prev => ({ ...prev, userId: user.userId || 1 }));
        }
        fetchEvent();
    }, [id]);

    const fetchEvent = async () => {
        try {
            const res = await getScheduledEventById(id);
            const evt = res.data.data;
            setEvent(evt);
            const price = Number(evt.fees || evt.Fees || 0);
            setBookingData(prev => ({ ...prev, totalAmount: price * prev.ticketCount }));
        } catch (error) {
            console.error("Failed to load event", error);
        } finally {
            setLoading(false);
        }
    };

    const handleTicketChange = (e) => {
        const count = parseInt(e.target.value);
        if (count < 1) return;
        const price = Number(event?.fees || event?.Fees || 0);
        setBookingData(prev => ({
            ...prev,
            ticketCount: count,
            totalAmount: price * count
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await createBooking(bookingData);
            const bookingId = res.data.data?.eventBookingId || res.data.data?.id || 1;
            navigate(`/payment/${bookingId}`);
        } catch (error) {
            alert("Booking failed: " + (error.response?.data?.message || error.message));
        }
    };

    if (loading) return (
        <div className="p-5 text-center">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-2 text-muted">Loading event details...</p>
        </div>
    );
    if (!event) return <div className="p-5 text-center">Event not found</div>;

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
                        <div className="card-header p-4" style={{ backgroundColor: 'var(--theme-orange)', color: 'white' }}>
                            <h3 className="mb-0 fw-bold">Complete Your Booking</h3>
                        </div>
                        <div className="card-body p-4">
                            <h4 className="fw-bold mb-3">{event.details || event.Details || event.title || event.Title}</h4>
                            <div className="d-flex flex-wrap gap-4 text-muted mb-4 small">
                                <div>
                                    <i className="bi bi-calendar-event me-2"></i>
                                    {new Date(event.startDate || event.StartDate || event.eventDate).toLocaleDateString()}
                                </div>
                                <div>
                                    <i className="bi bi-clock me-2"></i>
                                    {event.startTime || event.StartTime || "TBD"}
                                </div>
                                <div>
                                    <i className="bi bi-geo-alt me-2"></i>
                                    {event.placeName || event.PlaceName || "Location TBD"}
                                </div>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="form-label fw-bold">Number of Tickets</label>
                                    <input
                                        type="number"
                                        className="form-control form-control-lg border-light shadow-none"
                                        value={bookingData.ticketCount}
                                        onChange={handleTicketChange}
                                        min="1"
                                        style={{ borderRadius: '12px', backgroundColor: '#f8f9fa' }}
                                    />
                                </div>

                                <div className="d-flex justify-content-between align-items-center mb-4 p-3 rounded-3" style={{ backgroundColor: '#fff8f4' }}>
                                    <span className="h5 mb-0 fw-bold">Total Amount</span>
                                    <span className="h3 mb-0 fw-bold" style={{ color: 'var(--theme-orange)' }}>₹{bookingData.totalAmount}</span>
                                </div>

                                <button type="submit" className="btn btn-theme btn-lg w-100 fw-bold py-3 shadow-sm rounded-pill" style={{ backgroundColor: 'var(--theme-orange)', color: 'white', border: 'none' }}>
                                    Proceed to Payment
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingPage;
