import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { processPayment } from "../api/paymentApi";
import "../index.css";

const PaymentPage = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [paymentDetails, setPaymentDetails] = useState({
        cardNumber: "",
        expiry: "",
        cvv: "",
        name: ""
    });

    const handleChange = (e) => {
        setPaymentDetails({ ...paymentDetails, [e.target.name]: e.target.value });
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Construct payload as per API expectation
            const payload = {
                eventBookingId: parseInt(bookingId),
                amount: 100, // Ideally fetched from booking details API
                paymentDate: new Date().toISOString(),
                paymentMethod: "Credit Card",
                transactionId: "TXN" + Date.now() // Simulation
            };

            await processPayment(payload);
            alert("Payment Successful! 🎉");
            navigate("/events");
        } catch (error) {
            console.error(error);
            alert("Payment failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card shadow-lg border-0 rounded-4">
                        <div className="card-body p-5">
                            <h3 className="text-center fw-bold mb-4">Secure Payment</h3>
                            <div className="text-center mb-4">
                                <i className="bi bi-credit-card-2-front text-primary display-1"></i>
                            </div>

                            <form onSubmit={handlePayment}>
                                <div className="mb-3">
                                    <label className="form-label">Card Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        className="form-control premium-input"
                                        placeholder="John Doe"
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Card Number</label>
                                    <input
                                        type="text"
                                        name="cardNumber"
                                        className="form-control premium-input"
                                        placeholder="0000 0000 0000 0000"
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="row">
                                    <div className="col-6 mb-3">
                                        <label className="form-label">Expiry</label>
                                        <input
                                            type="text"
                                            name="expiry"
                                            className="form-control premium-input"
                                            placeholder="MM/YY"
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="col-6 mb-3">
                                        <label className="form-label">CVV</label>
                                        <input
                                            type="text"
                                            name="cvv"
                                            className="form-control premium-input"
                                            placeholder="123"
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <button type="submit" className="btn btn-success btn-lg w-100 fw-bold mt-3 shadow-sm" disabled={loading}>
                                    {loading ? "Processing..." : "Pay Now"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;
