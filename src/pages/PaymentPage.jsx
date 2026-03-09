import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { processPayment, makePayment } from "../api/paymentApi";
import { getBookingById } from "../api/bookingApi";
import { getScheduledEventById } from "../api/eventApi";
import "../index.css";

const PaymentPage = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [amount, setAmount] = useState(0);
    const [method, setMethod] = useState("Card"); // "Card" | "QR" | "NetBanking"
    const [paymentDetails, setPaymentDetails] = useState({
        cardNumber: "",
        expiry: "",
        cvv: "",
        name: "",
        upiId: "",
        bankName: ""
    });

    useEffect(() => {
        fetchBookingAmount();
    }, [bookingId]);

    const fetchBookingAmount = async () => {
        try {
            setLoadingData(true);
            const bookingRes = await getBookingById(bookingId);
            const booking = bookingRes.data.data || bookingRes.data;

            // Try to get amount from booking first, then from scheduled event
            let fee = booking.scheduleEventFees || booking.ScheduleEventFees;

            if (!fee) {
                const eventRes = await getScheduledEventById(booking.scheduleEventId || booking.ScheduleEventId);
                const event = eventRes.data.data || eventRes.data;
                fee = event.fees || event.Fees || 0;
            }

            setAmount(Number(fee));
        } catch (error) {
            console.error("Failed to fetch booking amount:", error);
        } finally {
            setLoadingData(false);
        }
    };

    const handleChange = (e) => {
        setPaymentDetails({ ...paymentDetails, [e.target.name]: e.target.value });
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // 1. Perform Dummy Payment Check (Backend make-payment endpoint)
            const dummyPayload = {
                bookingId: parseInt(bookingId),
                amount: amount,
                paymentMode: method, // "Card", "QR", "NetBanking" (matches controller expectations)
                cardNumber: method === "Card" ? paymentDetails.cardNumber : null,
                upiId: method === "QR" ? paymentDetails.upiId : null,
                bankName: method === "NetBanking" ? paymentDetails.bankName : null
            };

            await makePayment(dummyPayload);

            // 2. Create Payment Record in Database
            const now = new Date().toISOString();
            const dbPayload = {
                eventBookingId: parseInt(bookingId),
                amount: amount,
                paymentDate: now,
                paymentMethod: method === "QR" ? "UPI" : method, // Validator requires "UPI" for QR
                paymentStatus: "Success", // Validator requires "Success"
                createdAt: now,
                modifiedAt: now
            };

            await processPayment(dbPayload);

            alert("Payment Successful! 🎉");
            // Navigate to receipt page and trigger download
            navigate(`/receipt/${bookingId}?download=true`);
        } catch (error) {
            console.error(error);
            alert("Payment failed: " + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    if (loadingData) return (
        <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status"></div>
            <p className="mt-2 text-muted">Loading payment details...</p>
        </div>
    );

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-6 mt-4">
                    <div className="card shadow-sm border-0">
                        <div className="card-header bg-warning text-dark py-3">
                            <h4 className="mb-0 fw-bold text-center">Checkout</h4>
                        </div>
                        <div className="card-body p-4">
                            <div className="text-center mb-4 p-3 bg-light rounded">
                                <span className="text-muted d-block small mb-1">Total Amount Payable</span>
                                <h2 className="fw-bold text-primary mb-0">₹{amount}</h2>
                            </div>

                            <div className="mb-4">
                                <label className="form-label fw-bold small text-uppercase">Payment Method</label>
                                <div className="btn-group w-100" role="group">
                                    <input type="radio" className="btn-check" name="method" id="card" checked={method === 'Card'} onChange={() => setMethod('Card')} />
                                    <label className="btn btn-outline-primary" htmlFor="card">Card</label>

                                    <input type="radio" className="btn-check" name="method" id="qr" checked={method === 'QR'} onChange={() => setMethod('QR')} />
                                    <label className="btn btn-outline-primary" htmlFor="qr">UPI / QR</label>

                                    <input type="radio" className="btn-check" name="method" id="net" checked={method === 'NetBanking'} onChange={() => setMethod('NetBanking')} />
                                    <label className="btn btn-outline-primary" htmlFor="net">Net Banking</label>
                                </div>
                            </div>

                            <form onSubmit={handlePayment}>
                                {method === "Card" && (
                                    <div className="fade-in">
                                        <div className="mb-3">
                                            <label className="form-label">Card Holder Name</label>
                                            <input type="text" name="name" className="form-control" placeholder="Full name on card" onChange={handleChange} required />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Card Number</label>
                                            <input type="text" name="cardNumber" className="form-control" placeholder="1234 5678 9101 1121" onChange={handleChange} required />
                                        </div>
                                        <div className="row">
                                            <div className="col-6 mb-3">
                                                <label className="form-label">Expiry</label>
                                                <input type="text" name="expiry" className="form-control" placeholder="MM/YY" onChange={handleChange} required />
                                            </div>
                                            <div className="col-6 mb-3">
                                                <label className="form-label">CVV</label>
                                                <input type="password" name="cvv" className="form-control" placeholder="***" maxLength="3" onChange={handleChange} required />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {method === "QR" && (
                                    <div className="text-center py-3 fade-in">
                                        <p className="small text-muted mb-3">Scan to pay with any UPI app</p>
                                        <div className="mb-4 border p-2 d-inline-block bg-white shadow-sm">
                                            <img
                                                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=manup@upi&pn=ManupEvents&am=${amount}&cu=INR`}
                                                alt="QR Code"
                                                style={{ width: '180px' }}
                                            />
                                        </div>
                                        <div className="mb-3 text-start">
                                            <label className="form-label">Your UPI ID</label>
                                            <input type="text" name="upiId" className="form-control" placeholder="user@bank" onChange={handleChange} required />
                                        </div>
                                    </div>
                                )}

                                {method === "NetBanking" && (
                                    <div className="mb-4 fade-in">
                                        <label className="form-label">Select Bank</label>
                                        <select name="bankName" className="form-select" onChange={handleChange} required defaultValue="">
                                            <option value="" disabled>Choose your bank</option>
                                            <option value="SBI">State Bank of India</option>
                                            <option value="HDFC">HDFC Bank</option>
                                            <option value="ICICI">ICICI Bank</option>
                                        </select>
                                    </div>
                                )}

                                <button type="submit" className="btn btn-primary w-100 py-3 fw-bold mt-4" disabled={loading}>
                                    {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : `Pay ₹${amount}`}
                                </button>
                            </form>

                            <div className="text-center mt-4">
                                <small className="text-muted"><i className="bi bi-shield-lock-fill me-1"></i> Secure Payment by Manup</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;