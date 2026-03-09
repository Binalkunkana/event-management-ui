import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getBookingById } from "../api/bookingApi";
import { getScheduledEventById } from "../api/eventApi";
import { getAllPayments } from "../api/paymentApi";

const ReceiptPage = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const { search } = useLocation();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        fetchReceiptData();
    }, [bookingId]);

    const fetchReceiptData = async () => {
        try {
            setLoading(true);
            const [bookingRes, allPaymentsRes] = await Promise.all([
                getBookingById(bookingId),
                getAllPayments()
            ]);

            const booking = bookingRes.data.data || bookingRes.data;
            const payments = allPaymentsRes.data.data || allPaymentsRes.data || [];

            // Find the payment for this booking
            const payment = payments.find(p => String(p.eventBookingId || p.EventBookingId) === String(bookingId));

            // Fetch event details
            const eventRes = await getScheduledEventById(booking.scheduleEventId || booking.ScheduleEventId);
            const event = eventRes.data.data || eventRes.data;

            setData({ booking, payment, event });

            // Check for auto-download parameter
            const params = new URLSearchParams(search);
            if (params.get('download') === 'true') {
                // Short timeout to ensure DOM is rendered before print dialog
                setTimeout(() => {
                    window.print();
                }, 1000);
            }
        } catch (error) {
            console.error("Failed to load receipt:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) return (
        <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status"></div>
            <p className="mt-2 text-muted">Generating receipt...</p>
        </div>
    );

    if (!data) return (
        <div className="container py-5 text-center">
            <h3 className="text-danger">Receipt not found</h3>
            <button className="btn btn-primary mt-3" onClick={() => navigate('/userdashboard')}>Back to Dashboard</button>
        </div>
    );

    const { booking, payment, event } = data;

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="text-center mb-5 mt-4">
                        <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
                        <h2 className="fw-bold mt-3">Booking Confirmed!</h2>
                        <p className="text-muted">Thank you for booking with Manup. Your ticket is ready.</p>

                        <div className="mt-4">
                            <button className="btn btn-primary px-4 py-2 me-3" onClick={handlePrint}>
                                <i className="bi bi-printer me-2"></i> Print Receipt
                            </button>
                            <button className="btn btn-outline-dark px-4 py-2" onClick={() => navigate('/userdashboard')}>
                                Go to Dashboard
                            </button>
                        </div>
                    </div>

                    <div className="card shadow border-0" id="receipt-content">
                        <div className="card-header bg-dark text-white p-4 d-flex justify-content-between align-items-center">
                            <div>
                                <h3 className="mb-0 fw-bold">Manup</h3>
                                <small className="opacity-75">Event Management Receipt</small>
                            </div>
                            <div className="text-end">
                                <div className="badge bg-warning text-dark">PAID</div>
                                <div className="small mt-1">Ref: {payment?.transactionId || `REF-${bookingId}`}</div>
                            </div>
                        </div>
                        <div className="card-body p-5">
                            <div className="row mb-5">
                                <div className="col-6">
                                    <h6 className="fw-bold text-muted mb-2">Customer Details</h6>
                                    <p className="mb-0 fw-bold">{booking.name}</p>
                                    <p className="mb-0 small text-muted">{booking.email}</p>
                                    <p className="mb-0 small text-muted">{booking.phone}</p>
                                </div>
                                <div className="col-6 text-end">
                                    <h6 className="fw-bold text-muted mb-2">Booking Info</h6>
                                    <p className="mb-0 small text-muted">Date: {new Date().toLocaleDateString()}</p>
                                    <p className="mb-0 small text-muted">Method: {payment?.paymentMethod || "Direct"}</p>
                                </div>
                            </div>

                            <table className="table table-bordered mt-4">
                                <thead className="table-light">
                                    <tr>
                                        <th>Event Description</th>
                                        <th className="text-end" style={{ width: '150px' }}>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            <div className="fw-bold">{event.title}</div>
                                            <small className="text-muted">{new Date(event.startDate).toLocaleDateString()} at {event.placeName || "Venue"}</small>
                                        </td>
                                        <td className="text-end fw-bold">₹{booking.scheduleEventFees || event.fees || 0}</td>
                                    </tr>
                                </tbody>
                                <tfoot>
                                    <tr className="table-light">
                                        <th className="text-end">Total Paid</th>
                                        <th className="text-end text-primary h5 fw-bold">₹{booking.scheduleEventFees || event.fees || 0}</th>
                                    </tr>
                                </tfoot>
                            </table>

                            <div className="mt-5 text-center pt-4 border-top">
                                <p className="mb-0 text-muted small">This is a system generated receipt and does not require a signature.</p>
                                <p className="fw-bold text-primary mb-0">Manup - Perfect Events, Every Time.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReceiptPage;