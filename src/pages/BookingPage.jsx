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
            setBookingData(prev => ({ ...prev, totalAmount: (evt.price || 0) * prev.ticketCount }));
        } catch (error) {
            console.error("Failed to load event", error);
        } finally {
            setLoading(false);
        }
    };

    const handleTicketChange = (e) => {
        const count = parseInt(e.target.value);
        if (count < 1) return;
        setBookingData(prev => ({
            ...prev,
            ticketCount: count,
            totalAmount: (event?.price || 0) * count
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // NOTE: API might return the created Booking ID
            const res = await createBooking(bookingData);
            // Assuming res.data.data is the booking object or ID
            const bookingId = res.data.data?.eventBookingId || res.data.data?.id || 1;
            navigate(`/payment/${bookingId}`);
        } catch (error) {
            alert("Booking failed: " + (error.response?.data?.message || error.message));
        }
    };

    if (loading) return <div className="p-5 text-center">Loading...</div>;
    if (!event) return <div className="p-5 text-center">Event not found</div>;

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
                        <div className="card-header bg-primary text-white p-4">
                            <h3 className="mb-0 fw-bold">Complete Your Booking</h3>
                        </div>
                        <div className="card-body p-4">
                            <h4 className="fw-bold mb-3">{event.title}</h4>
                            <p className="text-muted mb-4">
                                <i className="bi bi-calendar-event me-2"></i> {new Date(event.eventDate).toLocaleDateString()} at {event.startTime}
                            </p>

                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="form-label fw-bold">Number of Tickets</label>
                                    <input
                                        type="number"
                                        className="form-control form-control-lg premium-input"
                                        value={bookingData.ticketCount}
                                        onChange={handleTicketChange}
                                        min="1"
                                    />
                                </div>

                                <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-light rounded-3">
                                    <span className="h5 mb-0">Total Amount</span>
                                    <span className="h3 mb-0 fw-bold text-primary">${bookingData.totalAmount}</span>
                                </div>

                                <button type="submit" className="btn btn-primary btn-lg w-100 fw-bold shadow-sm">
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
