import { getAllBookings, deleteBooking, updateBooking, getBookingById, createBooking } from "../api/bookingApi";
import { getAllScheduledEvents } from "../api/eventApi";
import EditSidebar from "./EditSidebar";
import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";

const BookingList = () => {
    const [bookings, setBookings] = useState([]);
    const [events, setEvents] = useState([]);
    const [editSidebarOpen, setEditSidebarOpen] = useState(false);
    const [editingBooking, setEditingBooking] = useState(null);
    const [mode, setMode] = useState("edit"); // "edit" | "add"
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        country: '',
        state: '',
        city: '',
        scheduleEventId: '',
        scheduleEventFees: 0,
        isCancelled: false,
        cancellationDateTime: '',
        idProofDocument: null, // For new file uploads
        idProofDocumentPath: '' // For existing filename from backend
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const eventRes = await getAllScheduledEvents();
            setEvents(eventRes.data.data || eventRes.data || []);
            fetchBookings();
        } catch (error) {
            console.error("Failed to fetch initial data", error);
            fetchBookings();
        }
    };

    const fetchBookings = async () => {
        try {
            const res = await getAllBookings();
            const apiData = res?.data?.data || res?.data || [];

            if (!Array.isArray(apiData)) {
                setBookings([]);
                return;
            }

            const normalizedData = apiData.map(b => ({
                eventBookingId: b.eventBookingId ?? b.EventBookingId,
                name: b.name ?? b.Name,
                email: b.email ?? b.Email,
                phone: b.phone ?? b.Phone,
                address: b.address ?? b.Address,
                country: b.country ?? b.Country,
                state: b.state ?? b.State,
                city: b.city ?? b.City,
                isCancelled: b.isCancelled ?? b.IsCancelled ?? false,
                cancellationDateTime: b.cancellationDateTime ?? b.CancellationDateTime ?? '',
                scheduleEventId: b.scheduleEventId ?? b.ScheduleEventId,
                scheduleEventDetails: b.scheduleEventDetails ?? b.ScheduleEventDetails,
                scheduleEventFees: b.scheduleEventFees ?? b.ScheduleEventFees ?? 0,
                idProofDocumentPath: b.idProofDocumentPath || b.IdProofDocumentPath || ''
            }));

            setBookings(normalizedData);
        } catch (error) {
            console.error("Failed to fetch bookings", error);
        }
    };

    const handleEdit = async (bookingId) => {
        try {
            setLoading(true);
            setMode("edit");
            const res = await getBookingById(bookingId);
            const booking = res.data.data || res.data;
            console.log("HandleEdit fetched booking:", booking);

            setEditingBooking(booking);
            setFormData({
                name: booking.name || booking.Name || '',
                email: booking.email || booking.Email || '',
                phone: booking.phone || booking.Phone || '',
                address: booking.address || booking.Address || '',
                country: booking.country || booking.Country || '',
                state: booking.state || booking.State || '',
                city: booking.city || booking.City || '',
                scheduleEventId: booking.scheduleEventId || booking.ScheduleEventId || '',
                scheduleEventFees: booking.scheduleEventFees || booking.ScheduleEventFees || 0,
                isCancelled: booking.isCancelled ?? booking.IsCancelled ?? false,
                cancellationDateTime: booking.cancellationDateTime || booking.CancellationDateTime || '',
                idProofDocument: null,
                idProofDocumentPath: booking.idProofDocumentPath || booking.IdProofDocumentPath || ''
            });
            setEditSidebarOpen(true);
        } catch (error) {
            console.error("Failed to fetch booking details:", error);
            alert("Failed to load booking details");
        } finally {
            setLoading(false);
        }
    };


    const handleAdd = () => {
        setMode("add");
        setEditingBooking(null);
        setFormData({
            name: '',
            email: '',
            phone: '',
            address: '',
            country: '',
            state: '',
            city: '',
            scheduleEventId: '',
            scheduleEventFees: 0,
            isCancelled: false,
            cancellationDateTime: '',
            idProofDocument: null,
            idProofDocumentPath: ''
        });
        setEditSidebarOpen(true);
    };
    // Fix: Ensure "Add Booking" button is present and opens the sidebar
    // You can place this button typically above your bookings table/list render.
    // For minimal UI interruption, add here:
    // (Assume this is inside your component's top-level return JSX, adapt per your list/table JSX position)
    // Example:
    /*
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--matdash-text-dark)' }}>Booking List</h2>
        <button
            className="btn-matdash"
            onClick={handleAdd}
            style={{
                padding: "10px 16px",
                fontSize: "14px",
                backgroundColor: "var(--matdash-primary)",
                color: "white",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center"
            }}
        >
            <span className="material-symbols-outlined" style={{ marginRight: 6 }}>add</span>
            New Booking
        </button>
    </div>
    */


    const handleSave = async () => {
        try {
            setLoading(true);

            if (!formData.name || !formData.email || !formData.phone || !formData.scheduleEventId) {
                alert("Please fill in all required fields (Name, Email, Phone, Event)!");
                setLoading(false);
                return;
            }

            if (mode === "add" && !formData.idProofDocument) {
                alert("ID proof document is required for new bookings!");
                setLoading(false);
                return;
            }

            const data = new FormData();
            data.append('Name', formData.name);
            data.append('Email', formData.email);
            data.append('Phone', formData.phone);
            data.append('Address', formData.address || '');
            data.append('Country', formData.country || '');
            data.append('State', formData.state || '');
            data.append('City', formData.city || '');
            data.append('ScheduleEventId', formData.scheduleEventId);

            if (editingBooking) {
                const id = editingBooking.eventBookingId || editingBooking.EventBookingId || editingBooking.id;
                data.append('EventBookingId', id);
            }
            data.append('IsCancelled', String(formData.isCancelled));
            data.append('IdProofDocumentPath', formData.idProofDocumentPath || '');

            if (formData.cancellationDateTime) {
                data.append('CancellationDateTime', formData.cancellationDateTime);
            }

            if (formData.idProofDocument instanceof File) {
                console.log("Appending file:", formData.idProofDocument.name);
                data.append('IdProofDocument', formData.idProofDocument);
            }

            if (mode === "add") {
                console.log("Creating booking with data:");
                for (let pair of data.entries()) {
                    console.log(pair[0] + ': ' + pair[1]);
                }
                await createBooking(data);
                alert("Booking created successfully!");
            } else {
                const id = editingBooking.eventBookingId || editingBooking.EventBookingId || editingBooking.id;
                console.log("Updating booking ID:", id);
                console.log("Updating booking with data:");
                for (let pair of data.entries()) {
                    console.log(pair[0] + ': ' + pair[1]);
                }

                if (!id) {
                    throw new Error("Target Booking ID is missing! Cannot update.");
                }

                await updateBooking(id, data);
                alert("Booking updated successfully!");
            }
            setEditSidebarOpen(false);
            fetchBookings();
        } catch (error) {
            console.error("Failed to save booking error object:", error);
            if (error.response) {
                console.error("Error response data:", error.response.data);
                console.error("Error response status:", error.response.status);
                console.error("Error response headers:", error.response.headers);
            }

            const detailedError = error.response?.data
                ? (typeof error.response.data === 'object'
                    ? JSON.stringify(error.response.data, null, 2)
                    : error.response.data)
                : error.message;
            alert("Failed to save booking: " + detailedError);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this booking?")) {
            try {
                await deleteBooking(id);
                alert("Booking deleted successfully!");
                fetchBookings();
            } catch (error) {
                console.error("Failed to delete booking", error);
                alert("Failed to delete booking: " + (error.response?.data?.message || error.message));
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value, files, type, checked } = e.target;
        if (name === "idProofDocument" && files && files.length > 0) {
            setFormData(prev => ({
                ...prev,
                [name]: files[0]
            }));
        } else if (type === "checkbox") {
            setFormData(prev => ({
                ...prev,
                [name]: checked
            }));
        } else if (name === "scheduleEventId") {
            const selectedEvent = events.find(ev => (ev.scheduleEventId || ev.id) == value);
            setFormData(prev => ({
                ...prev,
                scheduleEventId: value,
                scheduleEventFees: selectedEvent ? (selectedEvent.fees || selectedEvent.Fees || 0) : 0
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const getEventName = (eventId) => {
        const found = events.find(e => (e.scheduleEventId || e.id) == eventId);
        return found ? (found.title || found.Title || found.details) : `Event ID: ${eventId}`;
    };

    return (
        <div>
            {/* HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--matdash-text-dark)', marginBottom: '4px' }}>
                        Booking List
                    </h2>
                    <p style={{ color: 'var(--matdash-text-muted)', fontSize: '14px', margin: 0 }}>
                        Manage event bookings
                    </p>
                </div>
                <button
                    className="btn-matdash btn-matdash-primary"
                    onClick={handleAdd}
                    style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <span className="material-symbols-outlined">add_circle</span>
                    Add Booking
                </button>
            </div>

            {/* TABLE */}
            <div className="matdash-card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="matdash-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>User</th>
                            <th>Contact</th>
                            <th>Address</th>
                            <th>Event Name</th>
                            <th>Fees</th>
                            <th>Status / Cancellation</th>
                            <th>Id Proof</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.length === 0 ? (
                            <tr>
                                <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--matdash-text-muted)' }}>
                                    No bookings found
                                </td>
                            </tr>
                        ) : (
                            bookings.map((b) => (
                                <tr key={b.eventBookingId}>
                                    <td>{b.eventBookingId}</td>
                                    <td><strong>{b.name}</strong></td>
                                    <td>
                                        {b.email}<br />
                                        <small style={{ color: 'var(--matdash-text-muted)' }}>{b.phone}</small>
                                    </td>
                                    <td>{b.city}, {b.state}</td>
                                    <td>{getEventName(b.scheduleEventId)}</td>
                                    <td><strong>₹{b.scheduleEventFees}</strong></td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <span className={`matdash-badge ${b.isCancelled ? 'danger' : 'success'}`}>
                                                {b.isCancelled ? 'Cancelled' : 'Active'}
                                            </span>
                                            {b.isCancelled && b.cancellationDateTime && (
                                                <small style={{ fontSize: '11px', color: 'var(--matdash-text-muted)' }}>
                                                    {new Date(b.cancellationDateTime).toLocaleString()}
                                                </small>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        {b.idProofDocumentPath ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <span style={{ fontSize: '12px' }}>{b.idProofDocumentPath}</span>
                                                <a
                                                    href={`https://localhost:7187/uploads/idproofs/${b.idProofDocumentPath}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ fontSize: '12px', color: 'var(--matdash-primary)', textDecoration: 'underline' }}
                                                >
                                                    View Document
                                                </a>
                                            </div>
                                        ) : 'N/A'}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                className="btn-matdash btn-matdash-outline"
                                                style={{ padding: '6px 12px', fontSize: '13px' }}
                                                onClick={() => handleEdit(b.eventBookingId)}
                                                title="Edit Booking"
                                            >
                                                <span className="material-symbols-outlined">edit_square</span>
                                            </button>
                                            <button
                                                className="btn-matdash"
                                                style={{
                                                    padding: '6px 12px',
                                                    fontSize: '13px',
                                                    backgroundColor: 'var(--matdash-danger)',
                                                    color: 'white'
                                                }}
                                                onClick={() => handleDelete(b.eventBookingId)}
                                                title="Delete Booking"
                                            >
                                                <span className="material-symbols-outlined">delete_forever</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* EDIT SIDEBAR */}
            <EditSidebar
                isOpen={editSidebarOpen}
                onClose={() => setEditSidebarOpen(false)}
                title={mode === "add" ? "Add Booking" : "Edit Booking"}
                onSave={handleSave}
                loading={loading}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--matdash-text-dark)', marginBottom: '8px' }}>
                            Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            style={{
                                width: '100%',
                                padding: '10px 14px',
                                borderRadius: '8px',
                                border: '1px solid var(--matdash-border)',
                                fontSize: '14px'
                            }}
                            required
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--matdash-text-dark)', marginBottom: '8px' }}>
                            Email *
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            style={{
                                width: '100%',
                                padding: '10px 14px',
                                borderRadius: '8px',
                                border: '1px solid var(--matdash-border)',
                                fontSize: '14px'
                            }}
                            required
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--matdash-text-dark)', marginBottom: '8px' }}>
                            Phone *
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            style={{
                                width: '100%',
                                padding: '10px 14px',
                                borderRadius: '8px',
                                border: '1px solid var(--matdash-border)',
                                fontSize: '14px'
                            }}
                            required
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--matdash-text-dark)', marginBottom: '8px' }}>
                            Address
                        </label>
                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            rows="3"
                            style={{
                                width: '100%',
                                padding: '10px 14px',
                                borderRadius: '8px',
                                border: '1px solid var(--matdash-border)',
                                fontSize: '14px',
                                fontFamily: 'inherit'
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--matdash-text-dark)', marginBottom: '8px' }}>
                            Select Event *
                        </label>
                        <select
                            name="scheduleEventId"
                            value={formData.scheduleEventId}
                            onChange={handleInputChange}
                            style={{
                                width: '100%',
                                padding: '10px 14px',
                                borderRadius: '8px',
                                border: '1px solid var(--matdash-border)',
                                fontSize: '14px',
                                backgroundColor: 'white'
                            }}
                            required
                        >
                            <option value="">Select an Event</option>
                            {events.map(ev => (
                                <option key={ev.scheduleEventId || ev.id} value={ev.scheduleEventId || ev.id}>
                                    {ev.title || ev.Title || ev.details}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--matdash-text-dark)', marginBottom: '8px' }}>
                                City
                            </label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--matdash-border)',
                                    fontSize: '14px'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--matdash-text-dark)', marginBottom: '8px' }}>
                                State
                            </label>
                            <input
                                type="text"
                                name="state"
                                value={formData.state}
                                onChange={handleInputChange}
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--matdash-border)',
                                    fontSize: '14px'
                                }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--matdash-text-dark)', marginBottom: '8px' }}>
                            Country
                        </label>
                        <input
                            type="text"
                            name="country"
                            value={formData.country}
                            onChange={handleInputChange}
                            style={{
                                width: '100%',
                                padding: '10px 14px',
                                borderRadius: '8px',
                                border: '1px solid var(--matdash-border)',
                                fontSize: '14px'
                            }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--matdash-text-dark)', marginBottom: '8px' }}>
                                Status *
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    name="isCancelled"
                                    checked={formData.isCancelled}
                                    onChange={handleInputChange}
                                />
                                <span style={{ fontSize: '14px' }}>Cancelled</span>
                            </label>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--matdash-text-dark)', marginBottom: '8px' }}>
                                Cancellation Date/Time
                            </label>
                            <input
                                type="datetime-local"
                                name="cancellationDateTime"
                                value={formData.cancellationDateTime ? formData.cancellationDateTime.slice(0, 16) : ''}
                                onChange={handleInputChange}
                                disabled={!formData.isCancelled}
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--matdash-border)',
                                    fontSize: '14px',
                                    backgroundColor: !formData.isCancelled ? '#f5f5f5' : 'white'
                                }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--matdash-text-dark)', marginBottom: '8px' }}>
                            Id Proof (Upload JPG, PNG, PDF)
                        </label>
                        <input
                            type="file"
                            name="idProofDocument"
                            onChange={handleInputChange}
                            accept=".jpg,.jpeg,.png,.pdf"
                            style={{
                                width: '100%',
                                padding: '10px 14px',
                                borderRadius: '8px',
                                border: '1px solid var(--matdash-border)',
                                fontSize: '14px'
                            }}
                        />
                        {formData.idProofDocumentPath && !formData.idProofDocument && (
                            <div style={{ marginTop: '8px', fontSize: '13px' }}>
                                Current: <span style={{ fontWeight: 500 }}>{formData.idProofDocumentPath}</span>
                                <br />
                                <a
                                    href={`https://localhost:7187/uploads/idproofs/${formData.idProofDocumentPath}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: 'var(--matdash-primary)' }}
                                >
                                    View Current File
                                </a>
                            </div>
                        )}
                        {formData.idProofDocument && (
                            <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--matdash-text-muted)' }}>
                                New file selected: {formData.idProofDocument.name}
                            </div>
                        )}
                    </div>
                </div>
            </EditSidebar>
        </div>
    );
};

export default BookingList;
