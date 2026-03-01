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
            navigate('/login', { state: { from: `/booking/${id}` } });
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
    }, [id, navigate]);

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
            const formData = new FormData();
            formData.append('Name', bookingData.name);
            formData.append('Email', bookingData.email);
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
            alert("Booking failed: " + (error.response?.data?.message || (typeof error.response?.data === 'string' ? error.response.data : error.message)));
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
        <div className="container py-5" style={{ maxWidth: '1000px' }}>
            <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
                <div className="row g-0">
                    <div className="col-lg-4" style={{ backgroundColor: 'var(--theme-orange)', color: 'white' }}>
                        <div className="p-4 h-100 d-flex flex-column justify-content-center">
                            <span className="material-symbols-outlined mb-3" style={{ fontSize: '48px' }}>event_available</span>
                            <h3 className="fw-bold mb-4">Event Booking</h3>
                            <h4 className="fw-bold mb-3">{event.details || event.Details || event.title || event.Title}</h4>

                            <div className="mb-4">
                                <div className="d-flex align-items-center mb-2 small opacity-75">
                                    <span className="material-symbols-outlined me-2" style={{ fontSize: '18px' }}>calendar_today</span>
                                    {new Date(event.startDate || event.StartDate || event.eventDate).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                </div>
                                <div className="d-flex align-items-center mb-2 small opacity-75">
                                    <span className="material-symbols-outlined me-2" style={{ fontSize: '18px' }}>schedule</span>
                                    {event.startTime || event.StartTime || "TBD"}
                                </div>
                                <div className="d-flex align-items-center small opacity-75">
                                    <span className="material-symbols-outlined me-2" style={{ fontSize: '18px' }}>pin_drop</span>
                                    {event.placeName || event.PlaceName || "Location TBD"}
                                </div>
                            </div>

                            <div className="mt-auto pt-4 border-top border-white border-opacity-25">
                                <div className="small opacity-75 mb-1">Total Event Fee</div>
                                <div className="h3 fw-bold mb-0">
                                    {Number(event.fees || event.Fees || 0) === 0 ? "FREE" : `₹${event.fees || event.Fees || 0}`}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-8">
                        <div className="card-body p-4 p-md-5">
                            <h3 className="fw-bold mb-4" style={{ color: '#2d3748' }}>Organizer Information</h3>

                            <form onSubmit={handleSubmit}>
                                <div className="row g-3 mb-4">
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold text-muted text-uppercase">Full Name</label>
                                        <input type="text" name="name" required className="form-control" style={{ borderRadius: '10px', padding: '12px' }} value={bookingData.name} onChange={handleInputChange} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold text-muted text-uppercase">Email Address</label>
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            className="form-control"
                                            style={{ borderRadius: '10px', padding: '12px', backgroundColor: '#f8f9fa' }}
                                            value={bookingData.email}
                                            readOnly={true}
                                            onChange={handleInputChange}
                                        />
                                        <small className="text-muted">Logged in as {bookingData.email}</small>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold text-muted text-uppercase">Phone Number</label>
                                        <input type="tel" name="phone" required className="form-control" style={{ borderRadius: '10px', padding: '12px' }} value={bookingData.phone} onChange={handleInputChange} />
                                    </div>
                                    <div className="col-md-6">
                                        {/* Spacer to keep layout balanced */}
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label small fw-bold text-muted text-uppercase">Residential Address</label>
                                        <input type="text" name="address" required className="form-control" style={{ borderRadius: '10px', padding: '12px' }} value={bookingData.address} onChange={handleInputChange} />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label small fw-bold text-muted text-uppercase">City</label>
                                        <input type="text" name="city" required className="form-control" style={{ borderRadius: '10px', padding: '12px' }} value={bookingData.city} onChange={handleInputChange} />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label small fw-bold text-muted text-uppercase">State</label>
                                        <input type="text" name="state" required className="form-control" style={{ borderRadius: '10px', padding: '12px' }} value={bookingData.state} onChange={handleInputChange} />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label small fw-bold text-muted text-uppercase">Country</label>
                                        <input type="text" name="country" required className="form-control" style={{ borderRadius: '10px', padding: '12px' }} value={bookingData.country} onChange={handleInputChange} />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label small fw-bold text-muted text-uppercase">ID Proof Document (PDF/JPG/PNG)</label>
                                        <input type="file" name="idProofDocument" accept=".pdf,.jpg,.jpeg,.png" required className="form-control" style={{ borderRadius: '10px', padding: '12px' }} onChange={handleInputChange} />
                                    </div>
                                </div>

                                <div className="d-flex justify-content-between align-items-center mb-4 p-4 rounded-4" style={{ backgroundColor: '#f8f9fa', border: '1px dashed #cbd5e0' }}>
                                    <div>
                                        <div className="small text-muted text-uppercase fw-bold">Total Payable</div>
                                        <div className="h2 mb-0 fw-bold" style={{ color: 'var(--theme-orange)' }}>
                                            {Number(bookingData.totalAmount) === 0 ? "FREE" : `₹${bookingData.totalAmount}`}
                                        </div>
                                    </div>
                                    <button type="submit" className="btn btn-theme btn-lg px-5 fw-bold py-3 rounded-pill shadow" style={{ backgroundColor: 'var(--theme-orange)', color: 'black', border: 'none' }}>
                                        CONFIRM BOOKING
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingPage;
