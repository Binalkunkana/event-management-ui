import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { processPayment, updatePayment, getPaymentById } from "../api/paymentApi";

const PaymentForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Manually managing payment records (Admin override)
    const [payment, setPayment] = useState({
        eventBookingId: "",
        amount: "",
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: "",
        transactionId: ""
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (id) {
            fetchPayment();
        }
    }, [id]);

    const fetchPayment = async () => {
        try {
            const res = await getPaymentById(id);
            if (res.data.data) {
                const data = res.data.data;
                if (data.paymentDate) {
                    data.paymentDate = data.paymentDate.split('T')[0];
                }
                setPayment(data);
            }
        } catch (error) {
            console.error("Failed to load payment", error);
            alert("Failed to load payment data");
        }
    };

    const handleChange = (e) => {
        setPayment({ ...payment, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (id) {
                await updatePayment(id, payment);
                alert("Payment updated successfully!");
            } else {
                // 'processPayment' is essentially create
                await processPayment(payment);
                alert("Payment recorded successfully!");
            }
            navigate("/admin/payments");
        } catch (error) {
            console.error("Error saving payment", error);
            alert("Failed to save payment");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card shadow-sm border-0">
                        <div className="card-body p-4">
                            <h3 className="mb-4 text-center">{id ? "Edit Payment" : "Add Payment Record"}</h3>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Booking ID</label>
                                    <input
                                        type="number"
                                        name="eventBookingId"
                                        className="form-control"
                                        value={payment.eventBookingId}
                                        onChange={handleChange}
                                        required
                                        disabled={!!id} // Usually don't change linked booking on edit
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Amount</label>
                                    <div className="input-group">
                                        <span className="input-group-text">₹</span>
                                        <input
                                            type="number"
                                            name="amount"
                                            className="form-control"
                                            value={payment.amount}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Date</label>
                                    <input
                                        type="date"
                                        name="paymentDate"
                                        className="form-control"
                                        value={payment.paymentDate}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Payment Method</label>
                                    <select
                                        name="paymentMethod"
                                        className="form-select"
                                        value={payment.paymentMethod}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select Method</option>
                                        <option value="Credit Card">Credit Card</option>
                                        <option value="Debit Card">Debit Card</option>
                                        <option value="UPI">UPI</option>
                                        <option value="Net Banking">Net Banking</option>
                                        <option value="Cash">Cash</option>
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <label className="form-label">Transaction ID</label>
                                    <input
                                        type="text"
                                        name="transactionId"
                                        className="form-control"
                                        value={payment.transactionId}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="d-grid gap-2">
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        {loading ? "Saving..." : (id ? "Update Payment" : "Record Payment")}
                                    </button>
                                    <button type="button" className="btn btn-secondary" onClick={() => navigate("/admin/payments")}>
                                        Cancel
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

export default PaymentForm;
