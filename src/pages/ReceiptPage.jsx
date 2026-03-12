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
        <div className="container-fluid py-5" style={{ backgroundColor: 'var(--ef-bg-primary)', minHeight: '100vh' }}>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-8">
                        <div className="text-center mb-5 animate-ef">
                            <div className="d-inline-flex align-items-center justify-content-center bg-white rounded-circle shadow-sm p-4 mb-4">
                                <span className="material-symbols-outlined text-success" style={{ fontSize: '4rem' }}>check_circle</span>
                            </div>
                            <h1 className="fw-800 display-5 mb-2">Booking Confirmed</h1>
                            <p className="ef-label text-secondary">Your journey with EventFlow begins here</p>

                            <div className="mt-5 d-flex justify-content-center gap-3 no-print">
                                <button className="btn-pill btn-primary px-4 py-2 shadow" onClick={handlePrint}>
                                    <span className="material-symbols-outlined align-middle me-2">print</span>
                                    Print Receipt
                                </button>
                                <button className="btn-pill btn-outline px-4 py-2" onClick={() => navigate('/   ')}>
                                    <span className="material-symbols-outlined align-middle me-2">home</span>
                                    Home
                                </button>
                            </div>
                        </div>

                        <div className="ef-card p-0 overflow-hidden shadow-lg animate-ef" id="receipt-content" style={{ animationDelay: '0.1s' }}>
                            <div className="bg-dark text-white p-5 d-flex justify-content-between align-items-center">
                                <div>
                                    <h4 className="fw-800 mb-1" style={{ letterSpacing: '-1px' }}>EventFlow.</h4>
                                    <p className="ef-label mb-0 opacity-75">Electronic Admission Ticket</p>
                                </div>
                                <div className="text-end">
                                    <span className="ef-badge bg-white text-dark mb-2">OFFICIAL RECEIPT</span>
                                    <div className="small opacity-50">Trans ID: {payment?.transactionId || `EF-${bookingId}`}</div>
                                </div>
                            </div>

                            <div className="p-5">
                                <div className="row g-4 mb-5">
                                    <div className="col-sm-6">
                                        <h6 className="ef-label text-secondary">Registrant Details</h6>
                                        <h5 className="fw-800 mb-1">{booking.name}</h5>
                                        <p className="text-secondary mb-0">{booking.email}</p>
                                        <p className="text-secondary mb-0">{booking.phone}</p>
                                    </div>
                                    <div className="col-sm-6 text-sm-end">
                                        <h6 className="ef-label text-secondary">Event Information</h6>
                                        <p className="text-secondary mb-0">Issued: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                        <p className="text-secondary mb-0">Status: <span className="text-success fw-800">Confirmed & Paid</span></p>
                                    </div>
                                </div>

                                <div className="table-responsive mb-5">
                                    <table className="table bg-transparent">
                                        <thead>
                                            <tr>
                                                <th className="ef-label border-0 px-0">Experience Description</th>
                                                <th className="ef-label border-0 px-0 text-end">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="border-top border-light">
                                                <td className="py-4 px-0">
                                                    <h5 className="fw-800 mb-1">{event.title || event.details}</h5>
                                                    <div className="d-flex align-items-center gap-2 text-secondary small">
                                                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>location_on</span>
                                                        {event.placeName || "Venue Confirmed"}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-0 text-end fw-800 h5">
                                                    ₹{booking.scheduleEventFees || event.fees || 0}
                                                </td>
                                            </tr>
                                        </tbody>
                                        <tfoot>
                                            <tr className="border-top-0">
                                                <td className="pt-4 px-0 ef-label h4 fw-800 text-dark">Total Investment</td>
                                                <td className="pt-4 px-0 text-end h3 fw-800 text-dark">₹{booking.scheduleEventFees || event.fees || 0}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>

                                <div className="bg-light p-4 rounded-4 text-center mt-5">
                                    <p className="mb-2 text-secondary small">This is an automated confirmation of purchase.</p>
                                    <h6 className="fw-800 text-dark mb-0">EventFlow — Redefining Experiences.</h6>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; }
                    .ef-card { box-shadow: none !important; border: 1px solid #eee !important; }
                    .container-fluid { padding: 0 !important; }
                }
            `}</style>
        </div>
    );
};

export default ReceiptPage;
