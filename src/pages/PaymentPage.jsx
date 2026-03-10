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
        <div className="container-fluid py-5" style={{ backgroundColor: 'var(--ef-bg-primary)', minHeight: '100vh' }}>
            <div className="container animate-ef">
                <div className="row justify-content-center">
                    <div className="col-lg-6">
                        <div className="text-center mb-5">
                            <h1 className="fw-800 mb-2">Secure Checkout</h1>
                            <p className="ef-label text-secondary">Finalize your registration with EventFlow</p>
                        </div>

                        <div className="ef-card p-5 shadow-lg">
                            <div className="text-center mb-5 p-4 bg-light rounded-4">
                                <span className="ef-label d-block mb-1">Total Subscription Due</span>
                                <h1 className="fw-800 text-dark mb-0" style={{ fontSize: '3rem' }}>₹{amount}</h1>
                            </div>

                            <div className="mb-5">
                                <label className="ef-label text-center d-block mb-3">Prefered Payment Method</label>
                                <div className="d-flex gap-2 p-1 bg-white rounded-pill border border-light shadow-sm">
                                    <button
                                        className={`btn-pill flex-grow-1 border-0 ${method === 'Card' ? 'btn-primary' : 'bg-transparent text-secondary'}`}
                                        onClick={() => setMethod('Card')}
                                    >
                                        Card
                                    </button>
                                    <button
                                        className={`btn-pill flex-grow-1 border-0 ${method === 'QR' ? 'btn-primary' : 'bg-transparent text-secondary'}`}
                                        onClick={() => setMethod('QR')}
                                    >
                                        UPI / QR
                                    </button>
                                    <button
                                        className={`btn-pill flex-grow-1 border-0 ${method === 'NetBanking' ? 'btn-primary' : 'bg-transparent text-secondary'}`}
                                        onClick={() => setMethod('NetBanking')}
                                    >
                                        Net Banking
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handlePayment}>
                                {method === "Card" && (
                                    <div className="animate-ef">
                                        <div className="mb-4">
                                            <label className="ef-label">Account Holder Name</label>
                                            <input type="text" name="name" className="ef-input" placeholder="Full name as on card" onChange={handleChange} required />
                                        </div>
                                        <div className="mb-4">
                                            <label className="ef-label">Card Number</label>
                                            <input type="text" name="cardNumber" className="ef-input" placeholder="0000 0000 0000 0000" onChange={handleChange} required />
                                        </div>
                                        <div className="row g-3">
                                            <div className="col-6">
                                                <label className="ef-label">Expiry Date</label>
                                                <input type="text" name="expiry" className="ef-input" placeholder="MM/YY" onChange={handleChange} required />
                                            </div>
                                            <div className="col-6">
                                                <label className="ef-label">Security Code</label>
                                                <input type="password" name="cvv" className="ef-input" placeholder="***" maxLength="3" onChange={handleChange} required />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {method === "QR" && (
                                    <div className="text-center py-4 animate-ef">
                                        <p className="ef-label text-secondary mb-4">Fast and secure payment with any UPI app</p>
                                        <div className="mb-5 p-3 bg-white rounded-4 border border-light shadow-sm d-inline-block">
                                            <img
                                                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=eventflow@upi&pn=EventFlowSecure&am=${amount}&cu=INR`}
                                                alt="Secure QR Code"
                                                style={{ width: '200px', height: '200px' }}
                                            />
                                        </div>
                                        <div className="text-start">
                                            <label className="ef-label">Enter your Virtual Payment Address (UPI ID)</label>
                                            <input type="text" name="upiId" className="ef-input" placeholder="username@provider" onChange={handleChange} required />
                                        </div>
                                    </div>
                                )}

                                {method === "NetBanking" && (
                                    <div className="mb-5 animate-ef">
                                        <label className="ef-label">Select Secure Financial Institution</label>
                                        <select name="bankName" className="ef-input" onChange={handleChange} required defaultValue="">
                                            <option value="" disabled>Choose your trusted bank</option>
                                            <option value="SBI">State Bank of India</option>
                                            <option value="HDFC">HDFC Bank</option>
                                            <option value="ICICI">ICICI Bank</option>
                                            <option value="Axis">Axis Bank</option>
                                        </select>
                                    </div>
                                )}

                                <button type="submit" className="btn-pill btn-primary w-100 py-3 mt-4 shadow" disabled={loading}>
                                    {loading ? (
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                    ) : (
                                        <span className="d-flex align-items-center justify-content-center gap-2">
                                            <span className="material-symbols-outlined">verified</span>
                                            Complete Secure Payment
                                        </span>
                                    )}
                                </button>
                            </form>

                            <div className="text-center mt-5">
                                <p className="small text-secondary mb-0">
                                    <span className="material-symbols-outlined align-middle me-1" style={{ fontSize: '18px' }}>lock</span>
                                    256-bit SSL Encrypted Payment by <span className="fw-800 text-dark">EventFlow</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;