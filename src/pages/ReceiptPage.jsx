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
                    {/* Success Message - Hide when printing */}
                    <div className="text-center mb-4 d-print-none">
                        <div className="display-1 text-success mb-3">
                            <i className="bi bi-patch-check-fill"></i>
                        </div>
                        <h2 className="fw-bold">Payment Successful!</h2>
                        <p className="text-muted">Your booking has been confirmed. You can download the receipt below.</p>
                        <div className="d-flex justify-content-center gap-2 mt-4">
                            <button className="btn btn-theme px-4 py-2 rounded-pill fw-bold" style={{ backgroundColor: 'var(--theme-orange)', border: 'none' }} onClick={handlePrint}>
                                <i className="bi bi-download me-2"></i> Download Receipt
                            </button>
                            <button className="btn btn-outline-dark px-4 py-2 rounded-pill fw-bold" onClick={() => navigate('/dashboard')}>
                                <i className="bi bi-house-door me-2"></i> Go to Dashboard
                            </button>
                        </div>
                    </div>

                    {/* Receipt Card */}
                    <div className="card border-0 shadow-sm receipt-card" id="receipt-content" style={{ borderRadius: '20px', overflow: 'hidden' }}>
                        <div className="card-header bg-dark text-white p-4 text-center border-0">
                            <h4 className="mb-1 text-uppercase fw-bold tracking-widest">Booking Receipt</h4>
                            <p className="small mb-0 opacity-75">Transaction ID: {payment?.transactionId || "N/A"}</p>
                        </div>
                        <div className="card-body p-4 p-md-5">
                            <div className="row mb-5">
                                <div className="col-6">
                                    <h6 className="text-muted small fw-bold text-uppercase mb-3">Billed To</h6>
                                    <h5 className="fw-bold mb-1">{booking.name || booking.Name}</h5>
                                    <p className="text-muted small mb-0">{booking.email || booking.Email}</p>
                                    <p className="text-muted small mb-0">{booking.phone || booking.Phone}</p>
                                </div>
                                <div className="col-6 text-end">
                                    <h6 className="text-muted small fw-bold text-uppercase mb-3">Booking Date</h6>
                                    <h5 className="fw-bold mb-0">{new Date(payment?.paymentDate || new Date()).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</h5>
                                </div>
                            </div>

                            <div className="table-responsive mb-5">
                                <table className="table table-borderless">
                                    <thead className="border-bottom">
                                        <tr>
                                            <th className="px-0 py-3 text-muted small fw-bold text-uppercase">Description</th>
                                            <th className="text-end px-0 py-3 text-muted small fw-bold text-uppercase">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-bottom">
                                            <td className="px-0 py-4">
                                                <h6 className="fw-bold mb-1">{event.details || event.Details || event.title}</h6>
                                                <p className="text-muted small mb-0">Date: {new Date(event.startDate || event.StartDate).toLocaleDateString()}</p>
                                                <p className="text-muted small mb-0">Location: {event.placeName || event.PlaceName}</p>
                                            </td>
                                            <td className="text-end px-0 py-4 fw-bold">₹{booking.scheduleEventFees || booking.ScheduleEventFees || event.fees || 0}</td>
                                        </tr>
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td className="px-0 py-4 pt-5">
                                                <h5 className="fw-bold mb-0 text-uppercase">Total Paid</h5>
                                            </td>
                                            <td className="text-end px-0 py-4 pt-5">
                                                <h5 className="fw-bold mb-0 text-success">₹{booking.scheduleEventFees || booking.ScheduleEventFees || event.fees || 0}</h5>
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            <div className="bg-light p-4 rounded-4 mb-4">
                                <div className="row g-3">
                                    <div className="col-sm-6">
                                        <h6 className="text-muted small fw-bold text-uppercase mb-2">Payment Method</h6>
                                        <p className="fw-bold mb-0">{payment?.paymentMethod || "Online"}</p>
                                    </div>
                                    <div className="col-sm-6 text-sm-end">
                                        <h6 className="text-muted small fw-bold text-uppercase mb-2">Payment Status</h6>
                                        <p className="text-success fw-bold mb-0">Successful <i className="bi bi-check-circle-fill"></i></p>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center pt-4 border-top">
                                <p className="text-muted small mb-1">Thank you for booking with Manup!</p>
                                <p className="text-muted x-small mb-0">This is a computer-generated receipt.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print specific styles */}
            <style>
                {`
                @media print {
                    nav, .d-print-none, footer {
                        display: none !important;
                    }
                    body {
                        background: white !important;
                        padding: 0 !important;
                    }
                    .container {
                        max-width: 100% !important;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    .receipt-card {
                        box-shadow: none !important;
                        border: 1px solid #eee !important;
                    }
                    .card-body {
                        padding: 2rem !important;
                    }
                }
                .tracking-widest {
                    letter-spacing: 0.2rem;
                }
                .x-small {
                    font-size: 0.75rem;
                }
                `}
            </style>
        </div>
    );
};

export default ReceiptPage;
