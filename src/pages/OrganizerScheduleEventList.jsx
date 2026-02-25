import { getAllScheduledEvents, deleteScheduledEvent, updateScheduledEvent, getScheduledEventById, createScheduledEvent } from "../api/eventApi";
import { getAllCategories } from "../api/categoryApi";
import { getAllPlaces } from "../api/placeApi";
import { getAllUsers } from "../api/userApi";
import EditSidebar from "../components/EditSidebar";
import { useState, useEffect } from "react";

const OrganizerScheduleEventList = () => {
    const [events, setEvents] = useState([]);
    const [categories, setCategories] = useState([]);
    const [places, setPlaces] = useState([]);
    const [users, setUsers] = useState([]);
    const [editSidebarOpen, setEditSidebarOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [mode, setMode] = useState("edit");
    const [formData, setFormData] = useState({
        Details: '',
        StartDate: '',
        StartTime: '',
        EndDate: '',
        EndTime: '',
        Fees: 0,
        PlaceId: '',
        EventCategoryId: '',
        Phone: '',
        ContactName: '',
        UserId: localStorage.getItem("userId"),
        ImageFile: null,
        ImagePath: ''
    });
    const [loading, setLoading] = useState(false);
    const currentUserId = localStorage.getItem("userId");

    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        const cleanDate = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
        const parts = cleanDate.split('-');
        if (parts.length === 3) {
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        return cleanDate;
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [catRes, placeRes, userRes] = await Promise.all([
                getAllCategories(),
                getAllPlaces(),
                getAllUsers()
            ]);
            setCategories(catRes.data.data || []);
            setPlaces(placeRes.data.data || []);
            setUsers(userRes.data.data || []);
            fetchEvents();
        } catch (error) {
            console.error("Failed to fetch initial data", error);
            fetchEvents();
        }
    };

    const fetchEvents = async () => {
        try {
            const res = await getAllScheduledEvents();
            let eventData = res.data.data || res.data || [];
            if (!Array.isArray(eventData)) eventData = [];

            // DISPLAY ALL DATA (Like Admin Side)
            const normalizedData = eventData.map(e => ({
                scheduleEventId: e.scheduleEventId || e.ScheduleEventId || e.id || e.Id,
                details: e.Details || e.details || e.title || e.Title || "",
                startDate: e.startDate || e.StartDate || (e.startTime && e.startTime.includes('T') ? e.startTime.split('T')[0] : (e.startDate || '')),
                startTimePart: e.startTimePart || e.StartTimePart || (e.startTime && e.startTime.includes('T') ? e.startTime.split('T')[1].slice(0, 5) : (e.startTime ? e.startTime.slice(0, 5) : '')),
                endDate: e.endDate || e.EndDate || (e.endTime && e.endTime.includes('T') ? e.endTime.split('T')[0] : (e.endDate || '')),
                endTimePart: e.endTimePart || e.EndTimePart || (e.endTime && e.endTime.includes('T') ? e.endTime.split('T')[1].slice(0, 5) : (e.endTime ? e.endTime.slice(0, 5) : '')),
                fees: e.fees || e.Fees || 0,
                placeId: e.placeId || e.PlaceId,
                eventCategoryId: e.eventCategoryId || e.EventCategoryId,
                placeName: e.placeName || e.PlaceName,
                eventCategoryName: e.eventCategoryName || e.EventCategoryName,
                phone: e.phone || e.Phone,
                contactName: e.contactName || e.ContactName,
                userId: e.userId || e.UserId
            }));

            setEvents(normalizedData);
        } catch (error) {
            console.error("Failed to fetch events", error);
        }
    };

    const handleEdit = async (eventId) => {
        try {
            setLoading(true);
            setMode("edit");
            const res = await getScheduledEventById(eventId);
            const event = res.data.data || res.data;

            // Helper to extract clean YYYY-MM-DD
            const getCleanDate = (val) => {
                if (!val) return "";
                if (val.includes('T')) return val.split('T')[0];
                return val;
            };

            // Helper to extract HH:mm from various formats
            const getCleanTime = (val) => {
                if (!val) return "";
                let timeStr = val;
                if (val.includes('T')) timeStr = val.split('T')[1];

                if (timeStr.includes(':')) {
                    const parts = timeStr.split(':');
                    if (timeStr.includes(' ')) {
                        const [time, modifier] = timeStr.split(' ');
                        let [hours, minutes] = time.split(':');
                        if (hours === '12') hours = '00';
                        if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
                        timeStr = `${String(hours).padStart(2, '0')}:${minutes}`;
                    } else {
                        timeStr = `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
                    }
                }
                return timeStr.slice(0, 5);
            };

            setEditingEvent(event);
            setFormData({
                Details: event.Details || event.details || '',
                StartDate: getCleanDate(event.StartDate || event.startDate),
                StartTime: getCleanTime(event.StartTime || event.startTime),
                EndDate: getCleanDate(event.EndDate || event.endDate),
                EndTime: getCleanTime(event.EndTime || event.endTime),
                Fees: event.Fees || event.fees || 0,
                PlaceId: event.PlaceId || event.placeId || '',
                EventCategoryId: event.EventCategoryId || event.eventCategoryId || '',
                Phone: event.Phone || event.phone || '',
                ContactName: event.ContactName || event.contactName || '',
                UserId: event.UserId || event.userId || currentUserId,
                ImageFile: null,
                ImagePath: event.ImagePath || event.imagePath || ''
            });
            setEditSidebarOpen(true);
        } catch (error) {
            console.error("Failed to fetch event details:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setMode("add");
        setEditingEvent(null);
        setFormData({
            Details: '', StartDate: '', StartTime: '', EndDate: '', EndTime: '',
            Fees: 0, PlaceId: '', EventCategoryId: '', Phone: '', ContactName: '',
            UserId: currentUserId, ImageFile: null, ImagePath: ''
        });
        setEditSidebarOpen(true);
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            if (!formData.Details || !formData.StartDate || !formData.StartTime || !formData.EndDate || !formData.EndTime ||
                !formData.PlaceId || !formData.EventCategoryId || !formData.Phone || !formData.ContactName || !formData.UserId) {
                alert("Please fill in all required fields.");
                setLoading(false);
                return;
            }

            // Format time as HH:mm:ss for backend TimeOnly.Parse
            const formatTime = (time) => {
                if (!time) return "00:00:00";
                return time.length === 5 ? `${time}:00` : time;
            };

            const formDataToSend = new FormData();
            formDataToSend.append('Details', formData.Details);
            formDataToSend.append('StartDate', formData.StartDate);
            formDataToSend.append('EndDate', formData.EndDate);
            formDataToSend.append('StartTime', formatTime(formData.StartTime));
            formDataToSend.append('EndTime', formatTime(formData.EndTime));
            formDataToSend.append('Fees', formData.Fees);
            formDataToSend.append('ContactName', formData.ContactName);
            formDataToSend.append('Phone', formData.Phone);
            formDataToSend.append('EventCategoryId', formData.EventCategoryId);
            formDataToSend.append('PlaceId', formData.PlaceId);
            formDataToSend.append('UserId', formData.UserId);
            formDataToSend.append('ImagePath', formData.ImagePath || ""); // Crucial to avoid NULL constraint

            if (formData.ImageFile) {
                formDataToSend.append('ImageFile', formData.ImageFile);
            }

            if (mode === "edit") {
                const id = Number(editingEvent.scheduleEventId || editingEvent.ScheduleEventId || editingEvent.id || editingEvent.Id);
                formDataToSend.append('ScheduleEventId', id);

                console.log("Updating Event with FormData (PascalCase)");
                await updateScheduledEvent(id, formDataToSend);
                alert("Event updated!");
            } else {
                console.log("Creating Event with FormData (PascalCase)");
                await createScheduledEvent(formDataToSend);
                alert("Event created!");
            }
            setEditSidebarOpen(false);
            fetchEvents();
        } catch (error) {
            console.error("Save error full details:", error.response || error);
            const errorData = error.response?.data;

            if (errorData?.errors) {
                console.log("Validation Errors:", JSON.stringify(errorData.errors, null, 2));
                alert("Validation Error: " + Object.values(errorData.errors).flat().join("\n"));
            } else {
                alert("Error saving event: " + (errorData?.title || errorData?.message || error.message));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Delete this event?")) {
            try {
                await deleteScheduledEvent(id);
                fetchEvents();
            } catch (error) {
                console.error("Delete error", error);
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "ImageFile") {
            const file = files[0];
            setFormData(prev => ({
                ...prev,
                [name]: file,
                ImagePath: file ? file.name : prev.ImagePath // Update path preview name if file selected
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    return (
        <div>
            {/* HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--matdash-text-dark)', marginBottom: '4px' }}>
                        Scheduled Events List
                    </h2>
                    <p style={{ color: 'var(--matdash-text-muted)', fontSize: '14px', margin: 0 }}>
                        Manage event schedule
                    </p>
                </div>
                <button
                    className="btn-matdash btn-matdash-primary"
                    onClick={handleAdd}
                    style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <span className="material-symbols-outlined">event_available</span>
                    Add Event
                </button>
            </div>

            {/* TABLE */}
            <div className="matdash-card" style={{ padding: 0, overflowX: 'auto' }}>
                <table className="matdash-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Event Details</th>
                            <th>Start</th>
                            <th>End</th>
                            <th>Fees</th>
                            <th>Place</th>
                            <th>Category</th>
                            <th>Contact</th>
                            <th>Phone</th>
                            <th>Organizer</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.length === 0 ? (
                            <tr>
                                <td colSpan="11" style={{ textAlign: 'center', padding: '40px', color: 'var(--matdash-text-muted)' }}>
                                    No events found
                                </td>
                            </tr>
                        ) : (
                            events.map((e) => (
                                <tr key={e.scheduleEventId}>
                                    <td>{e.scheduleEventId}</td>
                                    <td><div style={{ fontWeight: '600', color: 'var(--matdash-text-dark)', marginBottom: '4px' }}>{e.details || "No Details"}</div></td>
                                    <td>
                                        {formatDate(e.startDate)}<br />
                                        <small style={{ color: 'var(--matdash-text-muted)' }}>{e.startTimePart || "00:00"}</small>
                                    </td>
                                    <td>
                                        {formatDate(e.endDate)}<br />
                                        <small style={{ color: 'var(--matdash-text-muted)' }}>{e.endTimePart || "00:00"}</small>
                                    </td>
                                    <td><strong>₹{e.fees}</strong></td>
                                    <td>{e.placeName || places.find(p => (p.placeId || p.PlaceId) === e.placeId)?.placeName || "-"}</td>
                                    <td>
                                        <span className="matdash-badge info">
                                            {e.eventCategoryName || categories.find(c => (c.eventCategoryId || c.EventCategoryId) === e.eventCategoryId)?.eventCategoryName || "-"}
                                        </span>
                                    </td>
                                    <td>{e.contactName || "-"}</td>
                                    <td>{e.phone || "-"}</td>
                                    <td>
                                        {users.find(u => u.userId === e.userId)?.firstName
                                            ? `${users.find(u => u.userId === e.userId).firstName} ${users.find(u => u.userId === e.userId).lastName}`
                                            : (e.userId === currentUserId ? localStorage.getItem("email") : (e.userId || "-"))}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                className="btn-matdash btn-matdash-outline"
                                                style={{ padding: '6px 12px', fontSize: '13px' }}
                                                onClick={() => handleEdit(e.scheduleEventId)}
                                                title="Edit Event"
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
                                                onClick={() => handleDelete(e.scheduleEventId)}
                                                title="Delete Event"
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
                title={mode === "add" ? "Add Scheduled Event" : "Edit Scheduled Event"}
                onSave={handleSave}
                loading={loading}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--matdash-text-dark)', marginBottom: '8px' }}>
                            Event Details *
                        </label>
                        <textarea
                            name="Details"
                            value={formData.Details}
                            onChange={handleInputChange}
                            style={{
                                width: '100%',
                                padding: '10px 14px',
                                borderRadius: '8px',
                                border: '1px solid var(--matdash-border)',
                                fontSize: '14px',
                                minHeight: '100px'
                            }}
                            placeholder="Describe your event..."
                            required
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--matdash-text-dark)', marginBottom: '8px' }}>Start Date *</label>
                            <input
                                type="date"
                                name="StartDate"
                                value={formData.StartDate}
                                onChange={handleInputChange}
                                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--matdash-border)', fontSize: '14px' }}
                                required
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--matdash-text-dark)', marginBottom: '8px' }}>Start Time *</label>
                            <input
                                type="time"
                                name="StartTime"
                                value={formData.StartTime}
                                onChange={handleInputChange}
                                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--matdash-border)', fontSize: '14px' }}
                                required
                            />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--matdash-text-dark)', marginBottom: '8px' }}>End Date *</label>
                            <input
                                type="date"
                                name="EndDate"
                                value={formData.EndDate}
                                onChange={handleInputChange}
                                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--matdash-border)', fontSize: '14px' }}
                                required
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--matdash-text-dark)', marginBottom: '8px' }}>End Time *</label>
                            <input
                                type="time"
                                name="EndTime"
                                value={formData.EndTime}
                                onChange={handleInputChange}
                                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--matdash-border)', fontSize: '14px' }}
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--matdash-text-dark)', marginBottom: '8px' }}>Fees (₹) *</label>
                        <input
                            type="number"
                            name="Fees"
                            value={formData.Fees}
                            onChange={handleInputChange}
                            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--matdash-border)', fontSize: '14px' }}
                            required
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--matdash-text-dark)', marginBottom: '8px' }}>Place Name *</label>
                        <select
                            name="PlaceId"
                            value={formData.PlaceId}
                            onChange={handleInputChange}
                            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--matdash-border)', fontSize: '14px', backgroundColor: 'white' }}
                            required
                        >
                            <option value="">Select Place</option>
                            {places.map(p => (
                                <option key={p.placeId || p.PlaceId} value={p.placeId || p.PlaceId}>
                                    {p.placeName || p.PlaceName}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--matdash-text-dark)', marginBottom: '8px' }}>Category Name *</label>
                        <select
                            name="EventCategoryId"
                            value={formData.EventCategoryId}
                            onChange={handleInputChange}
                            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--matdash-border)', fontSize: '14px', backgroundColor: 'white' }}
                            required
                        >
                            <option value="">Select Category</option>
                            {categories.map(c => (
                                <option key={c.eventCategoryId || c.EventCategoryId} value={c.eventCategoryId || c.EventCategoryId}>
                                    {c.eventCategoryName || c.eventCategoryName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--matdash-text-dark)', marginBottom: '8px' }}>Contact Name *</label>
                        <input
                            type="text"
                            name="ContactName"
                            value={formData.ContactName}
                            onChange={handleInputChange}
                            placeholder="John Doe"
                            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--matdash-border)', fontSize: '14px' }}
                            required
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--matdash-text-dark)', marginBottom: '8px' }}>Phone *</label>
                        <input
                            type="text"
                            name="Phone"
                            value={formData.Phone}
                            onChange={handleInputChange}
                            placeholder="+91 XXXXX XXXXX"
                            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--matdash-border)', fontSize: '14px' }}
                            required
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--matdash-text-dark)', marginBottom: '8px' }}>Event Image</label>
                        <input
                            type="file"
                            name="ImageFile"
                            onChange={handleInputChange}
                            accept="image/*"
                            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--matdash-border)', fontSize: '14px', backgroundColor: 'white' }}
                        />
                        {mode === "edit" && editingEvent?.imagePath && !formData.ImageFile && (
                            <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--matdash-text-muted)' }}>
                                Current image: {editingEvent.imagePath}
                            </div>
                        )}
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--matdash-text-dark)', marginBottom: '8px' }}>Organizer Name *</label>
                        <select
                            name="UserId"
                            value={formData.UserId}
                            onChange={handleInputChange}
                            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--matdash-border)', fontSize: '14px', backgroundColor: 'white' }}
                            required
                        >
                            <option value="">Select User</option>
                            {users
                                .filter(u => u.role?.toLowerCase() === "organizer")
                                .map(u => (
                                    <option key={u.userId} value={u.userId}>
                                        {u.firstName} {u.lastName} ({u.role})
                                    </option>
                                ))}
                        </select>
                    </div>
                </div>
            </EditSidebar>
        </div>
    );
};

export default OrganizerScheduleEventList;

