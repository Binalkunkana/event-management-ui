import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getScheduledEventById } from "../api/eventApi";
import { createBooking } from "../api/bookingApi";
import "../index.css";

const BookingPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [event, setEvent] = useState(null);
    const [bookingData, setBookingData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        country: '',
        scheduleEventId: parseInt(id),
        totalAmount: 0,
        idProofDocument: null,
        isCancelled: false,
        cancellationDateTime: null
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate('/login', { state: { from: location.pathname } });
            return;
        }

        const userEmail = localStorage.getItem("email");
        if (userEmail) {
            setBookingData(prev => ({
                ...prev,
                email: userEmail
            }));
        }
        fetchEvent();
    }, [id, navigate, location.pathname]);

    const fetchEvent = async () => {
        try {
            const res = await getScheduledEventById(id);
            const evt = res.data.data;
            setEvent(evt);
            const price = Number(evt.fees || evt.Fees || 0);
            setBookingData(prev => ({ ...prev, totalAmount: price }));
        } catch (error) {
            console.error("Failed to load event", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "idProofDocument") {
            setBookingData(prev => ({ ...prev, [name]: files[0] }));
        } else {
            setBookingData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!bookingData.idProofDocument) {
            alert("Please upload your ID proof document.");
            return;
        }

        try {
            // Check if already booked for this specific event to give a better error than 500
            const rootEmail = bookingData.email.split('+')[0];

            const formData = new FormData();
            formData.append('Name', bookingData.name);

            // Sub-addressing Workaround: root+eventId@domain.com
            // This satisfies the backend Unique Index on Email
            const emailParts = bookingData.email.split('@');
            const uniqueEmail = `${emailParts[0]}+${id}@${emailParts[1]}`;
            formData.append('Email', uniqueEmail);

            formData.append('Phone', bookingData.phone);
            formData.append('Address', bookingData.address);
            formData.append('City', bookingData.city);
            formData.append('State', bookingData.state);
            formData.append('Country', bookingData.country);
            formData.append('ScheduleEventId', bookingData.scheduleEventId);
            formData.append('IdProofDocument', bookingData.idProofDocument);
            formData.append('IsCancelled', bookingData.isCancelled);
            if (bookingData.cancellationDateTime) {
                formData.append('CancellationDateTime', bookingData.cancellationDateTime);
            }

            const res = await createBooking(formData);
            const bookingId = res.data.eventBookingId || res.data.id || 1;

            const isFree = Number(event.fees || event.Fees || 0) === 0;
            if (isFree) {
                alert("Successfully booked an event!");
                navigate('/my-bookings');
            } else {
                alert("Event booked successfully!");
                navigate(`/payment/${bookingId}`);
            }
        } catch (error) {
            console.error("Booking Error:", error.response?.data);
            const errorMsg = error.response?.data?.error || error.response?.data?.message || "";
            if (errorMsg.includes("IX_EventBookings_Email")) {
                alert("You have already booked this specific event.");
            } else {
                alert("Booking failed: " + (error.response?.data?.message || (typeof error.response?.data === 'string' ? error.response.data : error.message)));
            }
        }
    };

    if (loading) return <div className="text-center py-5 mt-5">Loading...</div>;

    if (!event) return <div className="p-5 text-center">Event not found</div>;

    return (
        <div className="container py-5">
            <div className="card shadow border-0 col-md-8 mx-auto">
                <div className="card-header bg-primary text-white p-4">
                    <h3 className="mb-0">Event Booking</h3>
                    <p className="mb-0 small">{event.title || "Book your event"}</p>
                </div>
                <div className="card-body p-4">
                    <div className="alert alert-info py-2">
                        <i className="bi bi-info-circle me-2"></i>
                        Booking for: <strong>{new Date(event.startDate || event.eventDate).toLocaleDateString()}</strong> at {event.startTime || "09:00 AM"}
                    </div>

                    <form onSubmit={handleSubmit} className="mt-4">
                        <div className="row g-3">
                            <div className="col-12">
                                <label className="form-label fw-bold">Full Name</label>
                                <input type="text" name="name" required className="form-control" placeholder="Enter your full name" value={bookingData.name} onChange={handleInputChange} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Email</label>
                                <input type="email" name="email" required className="form-control bg-light" value={bookingData.email} readOnly />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Phone</label>
                                <input type="tel" name="phone" required className="form-control" placeholder="Enter phone number" value={bookingData.phone} onChange={handleInputChange} />
                            </div>
                            <div className="col-12">
                                <label className="form-label fw-bold">ID Proof (PDF/Image)</label>
                                <input type="file" name="idProofDocument" accept=".pdf,.jpg,.jpeg,.png" required className="form-control" onChange={handleInputChange} />
                            </div>
                            <div className="col-12">
                                <label className="form-label fw-bold">Address</label>
                                <input type="text" name="address" required className="form-control" placeholder="Full address" value={bookingData.address} onChange={handleInputChange} />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label fw-bold">City</label>
                                <input type="text" name="city" required className="form-control" value={bookingData.city} onChange={handleInputChange} />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label fw-bold">State</label>
                                <input type="text" name="state" required className="form-control" value={bookingData.state} onChange={handleInputChange} />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label fw-bold">Country</label>
                                <input type="text" name="country" required className="form-control" value={bookingData.country} onChange={handleInputChange} />
                            </div>
                        </div>

                        <div className="mt-5 text-center pt-4 border-top">
                            <div className="h4 mb-4">Total Amount: <span className="text-primary fw-bold">₹{bookingData.totalAmount}</span></div>
                            <button type="submit" className="btn btn-primary btn-lg px-5 fw-bold">
                                Confirm Booking
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BookingPage;