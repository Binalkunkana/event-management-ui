import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createBooking, updateBooking, getBookingById } from "../api/bookingApi";
import { getAllScheduledEvents } from "../api/eventApi";

const BookingForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    country: "",
    state: "",
    city: "",
    scheduleEventId: "",
    isCancelled: false,
    cancellationDateTime: "",
    idProofDocument: null
  });

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEvents();
    if (id) fetchBooking();
  }, [id]);

  const loadEvents = async () => {
    const res = await getAllScheduledEvents();
    setEvents(res.data.data || res.data || []);
  };

  const fetchBooking = async () => {
    const res = await getBookingById(id);
    const data = res.data.data || res.data;

    setBooking({
      name: data.name || "",
      email: data.email || "",
      phone: data.phone || "",
      address: data.address || "",
      country: data.country || "",
      state: data.state || "",
      city: data.city || "",
      scheduleEventId: data.scheduleEventId || "",
      isCancelled: data.isCancelled || false,
      cancellationDateTime: data.cancellationDateTime || "",
      idProofDocument: null
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setBooking({
      ...booking,
      [name]: type === "checkbox" ? checked : files ? files[0] : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("Name", booking.name);
    formData.append("Email", booking.email);
    formData.append("Phone", booking.phone);
    formData.append("Address", booking.address);
    formData.append("Country", booking.country);
    formData.append("State", booking.state);
    formData.append("City", booking.city);
    formData.append("ScheduleEventId", booking.scheduleEventId);
    formData.append("IsCancelled", booking.isCancelled);
    if (booking.cancellationDateTime) {
      formData.append("CancellationDateTime", booking.cancellationDateTime);
    }

    if (booking.idProofDocument) {
      formData.append("IdProofDocument", booking.idProofDocument);
    }

    try {
      if (id) {
        await updateBooking(id, formData);
        alert("Booking updated!");
      } else {
        await createBooking(formData);
        alert("Booking created!");
      }
      navigate("/admin/bookings");
    } catch (err) {
      console.error(err.response?.data || err);
      alert(JSON.stringify(err.response?.data) || "Save failed");
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
              <h3 className="mb-4 text-center">{id ? "Edit Booking" : "Create Booking"}</h3>

              <form onSubmit={handleSubmit}>
                <input className="form-control mb-2" name="name" placeholder="Name" value={booking.name} onChange={handleChange} required />
                <input className="form-control mb-2" name="email" placeholder="Email" value={booking.email} onChange={handleChange} required />
                <input className="form-control mb-2" name="phone" placeholder="Phone" value={booking.phone} onChange={handleChange} required />
                <input className="form-control mb-2" name="address" placeholder="Address" value={booking.address} onChange={handleChange} required />
                <input className="form-control mb-2" name="country" placeholder="Country" value={booking.country} onChange={handleChange} required />
                <input className="form-control mb-2" name="state" placeholder="State" value={booking.state} onChange={handleChange} required />
                <input className="form-control mb-2" name="city" placeholder="City" value={booking.city} onChange={handleChange} required />

                <select className="form-select mb-2" name="scheduleEventId" value={booking.scheduleEventId} onChange={handleChange} required>
                  <option value="">Select Event</option>
                  {events.map(e => (
                    <option key={e.scheduleEventId} value={e.scheduleEventId}>
                      {e.scheduleEventDetails || e.title}
                    </option>
                  ))}
                </select>

                <input type="file" className="form-control mb-3" name="idProofDocument" onChange={handleChange} />

                <div className="form-check mb-3">
                  <input type="checkbox" className="form-check-input" name="isCancelled" checked={booking.isCancelled} onChange={handleChange} />
                  <label className="form-check-label">Cancelled</label>
                </div>

                {booking.isCancelled && (
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted text-uppercase">Cancellation Date & Time</label>
                    <input type="datetime-local" className="form-control" name="cancellationDateTime" value={booking.cancellationDateTime ? booking.cancellationDateTime.slice(0, 16) : ""} onChange={handleChange} />
                  </div>
                )}

                <div className="d-grid gap-2">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? "Saving..." : id ? "Update Booking" : "Create Booking"}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => navigate("/admin/bookings")}>
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

export default BookingForm;
// The error "No routes matched location '/admin/bookings/create'" means your router does not have a Route that matches the path "/admin/bookings/create".
// To solve, ensure your React Router is set up to render <BookingForm /> at this path. 