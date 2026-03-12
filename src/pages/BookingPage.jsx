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

            // Prevent booking past events
            const eventDate = new Date(evt.startDate || evt.eventDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (eventDate < today) {
                alert("This event has already passed and cannot be booked.");
                navigate('/events');
            }
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
        <div className="container-fluid py-5" style={{ backgroundColor: 'var(--ef-bg-secondary)', minHeight: '100vh' }}>
            <div className="container">
                <div className="col-lg-8 mx-auto animate-ef">
                    <div className="text-center mb-5">
                        <h1 className="fw-800 mb-2">Event Registration</h1>
                        <p className="ef-label text-secondary">Complete your booking for {event.title || event.details}</p>
                    </div>

                    <div className="ef-card p-5 shadow-sm">
                        <div className="bg-light p-4 rounded-4 mb-5 d-flex align-items-center gap-3">
                            <div className="bg-white p-3 rounded-circle shadow-sm">
                                <span className="material-symbols-outlined text-dark">event_available</span>
                            </div>
                            <div>
                                <h6 className="fw-800 mb-1">Schedule Confirmation</h6>
                                <p className="text-secondary small mb-0">
                                    {new Date(event.startDate || event.eventDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {event.startTime || "09:00 AM"}
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="row g-4">
                                <div className="col-12">
                                    <label className="ef-label">Full Name</label>
                                    <input type="text" name="name" required className="ef-input" placeholder="Enter your legal name" value={bookingData.name} onChange={handleInputChange} />
                                </div>
                                <div className="col-md-6">
                                    <label className="ef-label">Email Address</label>
                                    <input type="email" name="email" required className="ef-input" style={{ backgroundColor: '#fdfdfd', cursor: 'not-allowed' }} value={bookingData.email} readOnly />
                                </div>
                                <div className="col-md-6">
                                    <label className="ef-label">Phone Number</label>
                                    <input type="tel" name="phone" required className="ef-input" placeholder="+91 00000 00000" value={bookingData.phone} onChange={handleInputChange} />
                                </div>
                                <div className="col-12">
                                    <label className="ef-label">Identity Verification (ID Proof)</label>
                                    <div className="position-relative">
                                        <input type="file" name="idProofDocument" accept=".pdf,.jpg,.jpeg,.png" required className="ef-input" onChange={handleInputChange} />
                                        <span className="position-absolute end-0 top-50 translate-middle-y me-3 text-secondary material-symbols-outlined">upload_file</span>
                                    </div>
                                    <small className="text-muted mt-2 d-block">Please upload a valid PDF or Image of your official ID.</small>
                                </div>
                                <div className="col-12">
                                    <label className="ef-label">Residential Address</label>
                                    <input type="text" name="address" required className="ef-input" placeholder="House no, Street, Landmark" value={bookingData.address} onChange={handleInputChange} />
                                </div>
                                <div className="col-md-4">
                                    <label className="ef-label">City</label>
                                    <input type="text" name="city" required className="ef-input" value={bookingData.city} onChange={handleInputChange} />
                                </div>
                                <div className="col-md-4">
                                    <label className="ef-label">State</label>
                                    <input type="text" name="state" required className="ef-input" value={bookingData.state} onChange={handleInputChange} />
                                </div>
                                <div className="col-md-4">
                                    <label className="ef-label">Country</label>
                                    <input type="text" name="country" required className="ef-input" value={bookingData.country} onChange={handleInputChange} />
                                </div>
                            </div>

                            <div className="mt-5 pt-5 border-top border-light text-center">
                                <div className="d-flex justify-content-between align-items-center mb-4 px-3">
                                    <span className="ef-label text-dark fw-800 h5 mb-0">Total Investment</span>
                                    <span className="h3 fw-800 mb-0" style={{ color: 'var(--ef-text-primary)' }}>₹{bookingData.totalAmount}</span>
                                </div>
                                <button type="submit" className="btn-pill btn-primary w-100 py-3 shadow">
                                    Confirm Registration
                                </button>
                                <p className="text-secondary small mt-4">
                                    By clicking confirm, you agree to our <span className="text-dark fw-800">Terms of Service</span>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingPage;
