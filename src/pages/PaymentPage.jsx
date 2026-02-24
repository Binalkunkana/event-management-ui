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
                <div className="col-md-6">
                    <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
                        <div className="card-header bg-white border-0 pt-4 px-4">
                            <h3 className="text-center fw-bold mb-0">Secure Payment</h3>
                            <div className="text-center mt-2">
                                <span className="badge bg-light text-dark fs-6 py-2 px-3 border">
                                    Amount to Pay: ₹{amount}
                                </span>
                            </div>
                        </div>
                        <div className="card-body p-4 p-md-5">

                            {/* Method Switcher */}
                            <div className="d-flex gap-2 mb-4 p-1 bg-light rounded-3">
                                <button
                                    className={`btn flex-grow-1 py-2 rounded-3 fw-bold border-0 ${method === 'Card' ? 'bg-white shadow-sm' : 'text-muted'}`}
                                    onClick={() => setMethod('Card')}
                                >
                                    <i className="bi bi-credit-card me-2"></i> Card
                                </button>
                                <button
                                    className={`btn flex-grow-1 py-2 rounded-3 fw-bold border-0 ${method === 'QR' ? 'bg-white shadow-sm' : 'text-muted'}`}
                                    onClick={() => setMethod('QR')}
                                >
                                    <i className="bi bi-qr-code-scan me-2"></i> QR Code
                                </button>
                                <button
                                    className={`btn flex-grow-1 py-2 rounded-3 fw-bold border-0 ${method === 'NetBanking' ? 'bg-white shadow-sm' : 'text-muted'}`}
                                    onClick={() => setMethod('NetBanking')}
                                >
                                    <i className="bi bi-bank me-2"></i> Net Banking
                                </button>
                            </div>

                            <form onSubmit={handlePayment}>
                                {method === "Card" && (
                                    <>
                                        <div className="mb-3">
                                            <label className="form-label small fw-bold text-muted">CARD HOLDER NAME</label>
                                            <input
                                                type="text"
                                                name="name"
                                                className="form-control premium-input text-dark"
                                                placeholder="Full Name"
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label small fw-bold text-muted">CARD NUMBER</label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-white border-end-0"><i className="bi bi-credit-card"></i></span>
                                                <input
                                                    type="text"
                                                    name="cardNumber"
                                                    className="form-control premium-input border-start-0 text-dark"
                                                    placeholder="0000 0000 0000 0000"
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-6 mb-3">
                                                <label className="form-label small fw-bold text-muted">EXPIRY DATE</label>
                                                <input
                                                    type="text"
                                                    name="expiry"
                                                    className="form-control premium-input text-dark"
                                                    placeholder="MM/YY"
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                            <div className="col-6 mb-4">
                                                <label className="form-label small fw-bold text-muted">CVV</label>
                                                <input
                                                    type="text"
                                                    name="cvv"
                                                    className="form-control premium-input text-dark"
                                                    placeholder="123"
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {method === "QR" && (
                                    <div className="text-center py-2">
                                        <div className="mb-4">
                                            <p className="text-muted mb-3">Scan this QR code using any UPI app</p>
                                            <div className="p-4 bg-white shadow-sm border rounded-4 d-inline-block mx-auto mb-3">
                                                {/* Scannable Dummy QR Code */}
                                                <img
                                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=dummy-merchant@okaxis&pn=Manup%20Events&am=${amount}&cu=INR`}
                                                    alt="Payment QR Code"
                                                    style={{ width: '180px', height: '180px' }}
                                                    className="img-fluid"
                                                />
                                            </div>
                                            <div className="h4 fw-bold mb-1">Pay with UPI</div>
                                            <p className="text-secondary small">Merchant: Manup Events</p>
                                        </div>
                                        <div className="mb-4 text-start">
                                            <label className="form-label small fw-bold text-muted">ENTER YOUR UPI ID</label>
                                            <input
                                                type="text"
                                                name="upiId"
                                                className="form-control premium-input text-dark"
                                                placeholder="username@bank"
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                )}

                                {method === "NetBanking" && (
                                    <div className="mb-4">
                                        <label className="form-label small fw-bold text-muted">SELECT YOUR BANK</label>
                                        <select
                                            name="bankName"
                                            className="form-select premium-input text-dark px-3 py-2"
                                            onChange={handleChange}
                                            required
                                            defaultValue=""
                                        >
                                            <option value="" disabled>Choose your bank</option>
                                            <option value="SBI">State Bank of India</option>
                                            <option value="HDFC">HDFC Bank</option>
                                            <option value="ICICI">ICICI Bank</option>
                                            <option value="AXIS">Axis Bank</option>
                                            <option value="PNB">Punjab National Bank</option>
                                        </select>
                                        <div className="mt-4 p-3 bg-light rounded-3 small text-muted">
                                            <i className="bi bi-info-circle me-2"></i>
                                            You will be redirected to your bank's secure login page to complete the transaction.
                                        </div>
                                    </div>
                                )}

                                <button type="submit" className="btn btn-theme w-100 btn-lg fw-bold py-3 rounded-pill shadow" style={{ backgroundColor: 'var(--theme-orange)', color: 'black', border: 'none' }} disabled={loading}>
                                    {loading ? "Processing..." : `PAY ₹${amount} SECURELY`}
                                </button>
                            </form>

                            <div className="text-center mt-4">
                                <span className="small text-muted d-flex align-items-center justify-content-center gap-1">
                                    <i className="bi bi-shield-lock-fill"></i> SSL Secure & Encrypted Payment
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;
