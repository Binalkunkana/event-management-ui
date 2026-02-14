import { useEffect, useState } from "react";
import {
  getAllPayments,
  deletePayment,
  updatePayment,
  getPaymentById,
  processPayment
} from "../api/paymentApi";
import { getAllBookings } from "../api/bookingApi";
import EditSidebar from "./EditSidebar";

const PaymentList = () => {
  const [payments, setPayments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [editSidebarOpen, setEditSidebarOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [mode, setMode] = useState("add");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    eventBookingId: "",
    paymentMethod: "",
    paymentStatus: "",
    paymentDate: ""
  });

  useEffect(() => {
    fetchPayments();
    fetchBookings();
  }, []);

  const fetchPayments = async () => {
    const res = await getAllPayments();
    setPayments(res.data.data || []);
  };

  const fetchBookings = async () => {
    const res = await getAllBookings();
    setBookings(res.data.data || res.data || []);
  };

  // ================= ADD =================
  const handleAdd = () => {
    setMode("add");
    setEditingPayment(null);
    setFormData({
      eventBookingId: "",
      paymentMethod: "",
      paymentStatus: "",
      paymentDate: new Date().toISOString().slice(0, 16)
    });
    setEditSidebarOpen(true);
  };

  // ================= EDIT =================
  const handleEdit = async (id) => {
    try {
      setLoading(true);
      setMode("edit");

      const res = await getPaymentById(id);
      const p = res.data.data || res.data;

      setEditingPayment(p);
      setFormData({
        eventBookingId: p.eventBookingId || "",
        paymentMethod: p.paymentMethod || "",
        paymentStatus: p.paymentStatus || "",
        paymentDate: p.paymentDate?.slice(0, 16) || ""
      });

      setEditSidebarOpen(true);
    } catch {
      alert("Failed to load payment");
    } finally {
      setLoading(false);
    }
  };

  // ================= SAVE =================
  const handleSave = async () => {
    try {
      setLoading(true);

      const selectedBooking = bookings.find(
        b => b.eventBookingId === Number(formData.eventBookingId)
      );

      if (!selectedBooking) {
        alert("Please select booking");
        return;
      }

      const payload = {
        eventBookingId: Number(formData.eventBookingId),
        paymentMethod: formData.paymentMethod,
        paymentStatus: formData.paymentStatus,
        paymentDate: new Date(formData.paymentDate).toISOString(),
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString()
      };

      if (mode === "add") {
        await processPayment(payload);
        alert("Payment added successfully!");
      } else {
        await updatePayment(editingPayment.paymentId, payload);
        alert("Payment updated successfully!");
      }

      setEditSidebarOpen(false);
      fetchPayments();
    } catch (error) {
      console.error("SAVE ERROR:", error.response || error);

      // Show detailed error from backend
      const errorData = error.response?.data;
      if (errorData?.errors) {
        const errorMessages = Object.entries(errorData.errors)
          .map(([field, msgs]) => `${field}: ${msgs.join(", ")}`)
          .join("\n");
        alert("Validation errors:\n" + errorMessages);
      } else {
        alert(errorData?.message || errorData?.title || "Save failed");
      }
    } finally {
      setLoading(false);
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (window.confirm("Delete this payment?")) {
      await deletePayment(id);
      fetchPayments();
    }
  };

  return (
    <div>
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h2 style={{ fontSize: "24px", fontWeight: "700" }}>Payment List</h2>
          <p style={{ fontSize: "14px", color: "var(--matdash-text-muted)" }}>
            Manage payments
          </p>
        </div>

        <button
          className="btn-matdash"
          onClick={handleAdd}
          style={{
            padding: "8px 16px",
            fontSize: "14px",
            backgroundColor: "var(--matdash-primary)",
            color: "white",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span className="material-symbols-outlined">add</span>
          Add Payment
        </button>
      </div>

      {/* TABLE */}
      <div className="matdash-card" style={{ padding: 0 }}>
        <table className="matdash-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Booking</th>
              <th>Status</th>
              <th>Method</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(p => {
              const booking = bookings.find(b => b.eventBookingId === p.eventBookingId);
              return (
                <tr key={p.paymentId}>
                  <td>{p.paymentId}</td>
                  <td><strong>{booking?.name || p.eventBookingName || `Booking #${p.eventBookingId}`}</strong></td>
                  <td>{p.paymentStatus}</td>
                  <td>{p.paymentMethod}</td>
                  <td>{new Date(p.paymentDate).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn-matdash btn-matdash-outline"
                      onClick={() => handleEdit(p.paymentId)}
                    >
                      <span className="material-symbols-outlined">edit_square</span>
                    </button>

                    <button
                      className="btn-matdash"
                      style={{ backgroundColor: "var(--matdash-danger)", color: "white" }}
                      onClick={() => handleDelete(p.paymentId)}
                    >
                      <span className="material-symbols-outlined">delete_forever</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* SIDEBAR */}
      <EditSidebar
        isOpen={editSidebarOpen}
        onClose={() => setEditSidebarOpen(false)}
        title={mode === "add" ? "Add Payment" : "Edit Payment"}
        onSave={handleSave}
        loading={loading}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <select
            value={formData.eventBookingId}
            onChange={e => setFormData({ ...formData, eventBookingId: e.target.value })}
          >
            <option value="">Select Booking</option>
            {bookings.map(b => (
              <option key={b.eventBookingId} value={b.eventBookingId}>
                {b.name}
              </option>
            ))}
          </select>

          <select
            value={formData.paymentMethod}
            onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
          >
            <option value="">Select Method</option>
            <option value="UPI">UPI</option>
            <option value="DebitCard">Debit Card</option>
            <option value="CreditCard">Credit Card</option>
            <option value="NetBanking">Net Banking</option>
            <option value="Cash">Cash</option>
          </select>

          <select
            value={formData.paymentStatus}
            onChange={e => setFormData({ ...formData, paymentStatus: e.target.value })}
          >
            <option value="">Select Status</option>
            <option value="Pending">Pending</option>
            <option value="Success">Success</option>
            <option value="Failed">Failed</option>
          </select>

          <input
            type="datetime-local"
            value={formData.paymentDate}
            onChange={e => setFormData({ ...formData, paymentDate: e.target.value })}
          />
        </div>
      </EditSidebar>
    </div>
  );
};

export default PaymentList;
