import { getAllScheduledEvents, deleteScheduledEvent, updateScheduledEvent, getScheduledEventById, createScheduledEvent } from "../api/eventApi";
import { getAllCategories } from "../api/categoryApi";
import { getAllPlaces } from "../api/placeApi";
import { getAllUsers } from "../api/userApi";
import EditSidebar from "./EditSidebar";
import { useState } from "react";
import { useEffect } from "react";

const ScheduleEventList = () => {
    const [events, setEvents] = useState([]);
    const [categories, setCategories] = useState([]);
    const [places, setPlaces] = useState([]);
    const [users, setUsers] = useState([]);
    const [editSidebarOpen, setEditSidebarOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [mode, setMode] = useState("edit"); // "edit" | "add"
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
        UserId: ''
    });
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState("card"); // "table" | "card"

    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        // Extract YYYY-MM-DD manually to avoid timezone shifts
        const cleanDate = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
        const parts = cleanDate.split('-');
        if (parts.length === 3) {
            return `${parts[2]}-${parts[1]}-${parts[0]}`; // DD-MM-YYYY
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
            console.error("Failed to fetch categories/places/users", error);
            fetchEvents();
        }
    };

    const fetchEvents = async () => {
        try {
            const res = await getAllScheduledEvents();
            let eventData = res.data.data || res.data || [];
            if (!Array.isArray(eventData)) eventData = [];

            const normalizedData = eventData.map(e => ({
                scheduleEventId: e.scheduleEventId || e.ScheduleEventId || e.id || e.Id,
                details: e.Details || e.details || e.title || e.Title || "",
                startDate: e.startDate || e.StartDate || (e.startTime && e.startTime.includes('T') ? e.startTime.split('T')[0] : (e.startDate || e.eventDate || '')),
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

            // Filter to show only events assigned to organizers (optional, but requested "display only organizer information")
            const organizerEvents = normalizedData.filter(e => {
                const user = users.find(u => u.userId === e.userId);
                return user?.role?.toLowerCase() === "organizer";
            });

            setEvents(organizerEvents.length > 0 ? organizerEvents : normalizedData);
        } catch (error) {
            console.error("Failed to fetch scheduled events", error);
        }
    };

    const handleEdit = async (eventId) => {
        try {
            setLoading(true);
            setMode("edit");
            const res = await getScheduledEventById(eventId);
            const event = res.data.data || res.data;

            console.log("Editing Event Raw Data:", event);
            setEditingEvent(event);

            // Helper to extract clean YYYY-MM-DD from various date formats
            const getCleanDate = (val) => {
                if (!val) return "";
                if (val.includes('T')) return val.split('T')[0];
                return val;
            };

            // Helper to extract HH:mm from various time formats
            const getCleanTime = (val) => {
                if (!val) return "";
                let timeStr = val;
                if (val.includes('T')) timeStr = val.split('T')[1];

                // Handle "HH:mm:ss" or "HH:mm"
                if (timeStr.includes(':')) {
                    const parts = timeStr.split(':');
                    // Check if it's "10:41 PM" format
                    if (timeStr.includes(' ')) {
                        const [time, modifier] = timeStr.split(' ');
                        let [hours, minutes] = time.split(':');
                        if (hours === '12') hours = '00';
                        if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
                        timeStr = `${String(hours).padStart(2, '0')}:${minutes}`;
                    } else {
                        // Just HH:mm or HH:mm:ss
                        timeStr = `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
                    }
                }
                return timeStr.slice(0, 5);
            };

            setFormData({
                Details: event.Details || event.details || event.title || event.Title || '',
                StartDate: getCleanDate(event.StartDate || event.startDate || ''),
                StartTime: getCleanTime(event.StartTime || event.startTime || ''),
                EndDate: getCleanDate(event.EndDate || event.endDate || ''),
                EndTime: getCleanTime(event.EndTime || event.endTime || ''),
                Fees: event.Fees || event.fees || 0,
                PlaceId: event.PlaceId || event.placeId || '',
                EventCategoryId: event.EventCategoryId || event.eventCategoryId || '',
                Phone: event.Phone || event.phone || '',
                ContactName: event.ContactName || event.contactName || '',
                UserId: event.UserId || event.userId || ''
            });
            setEditSidebarOpen(true);
        } catch (error) {
            console.error("Failed to fetch event details:", error);
            alert("Failed to load event details");
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setMode("add");
        setEditingEvent(null);
        setFormData({
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
            UserId: ''
        });
        setEditSidebarOpen(true);
    };

    const handleSave = async () => {
        try {
            setLoading(true);

            // VALIDATION
            if (!formData.Details || !formData.StartDate || !formData.StartTime || !formData.EndDate || !formData.EndTime ||
                !formData.PlaceId || !formData.EventCategoryId || !formData.Phone || !formData.ContactName || !formData.UserId) {
                alert("Please fill in ALL fields.");
                setLoading(false);
                return;
            }

            // Format time as HH:mm:ss for backend TimeOnly.Parse
            const formatTime = (time) => {
                if (!time) return "00:00:00";
                return time.length === 5 ? `${time}:00` : time;
            };

            const dataToSave = {
                Details: formData.Details,
                StartDate: formData.StartDate,
                EndDate: formData.EndDate,
                StartTime: formatTime(formData.StartTime),
                EndTime: formatTime(formData.EndTime),
                Fees: Number(formData.Fees),
                ContactName: formData.ContactName,
                Phone: formData.Phone,
                EventCategoryId: Number(formData.EventCategoryId),
                PlaceId: Number(formData.PlaceId),
                UserId: Number(formData.UserId)
            };

            if (mode === "edit") {
                const updateId = Number(editingEvent?.scheduleEventId || editingEvent?.ScheduleEventId || editingEvent?.id || editingEvent?.Id);

                // Try sending ID with common names to satisfy backend model binding
                dataToSave.ScheduleEventId = updateId;
                dataToSave.scheduleEventId = updateId;
                dataToSave.id = updateId;
                dataToSave.Id = updateId;

                console.log("Saving Update Payload:", dataToSave);
                await updateScheduledEvent(updateId, dataToSave);
                alert("Event updated successfully!");
            } else {
                console.log("Saving Add Payload:", dataToSave);
                await createScheduledEvent(dataToSave);
                alert("Event scheduled successfully!");
            }
            setEditSidebarOpen(false);
            fetchEvents();
        } catch (error) {
            console.error("Failed to save event:", error.response || error);
            const errorData = error.response?.data;

            // Log full validation errors for debugging
            if (errorData?.errors) {
                console.log("Full Validation Errors:", JSON.stringify(errorData.errors, null, 2));

                // Extract and show the actual validation messages
                let validationMsgs = [];
                Object.keys(errorData.errors).forEach(key => {
                    const messages = errorData.errors[key];
                    if (Array.isArray(messages)) {
                        validationMsgs.push(...messages);
                    } else {
                        validationMsgs.push(messages);
                    }
                });

                if (validationMsgs.length > 0) {
                    alert("Validation Error: " + validationMsgs.join("\n"));
                    return;
                }
            }

            const detailedMsg = errorData?.message || errorData?.title || error.message;
            alert("Failed to save event: " + detailedMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this event?")) {
            try {
                await deleteScheduledEvent(id);
                alert("Event deleted successfully!");
                fetchEvents();
            } catch (error) {
                console.error("Failed to delete event", error);
                alert("Failed to delete event: " + (error.response?.data?.message || error.message));
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
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
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div className="view-toggle" style={{
                        display: 'flex',
                        backgroundColor: 'var(--matdash-bg-light)',
                        padding: '4px',
                        borderRadius: '8px',
                        border: '1px solid var(--matdash-border)'
                    }}>
                        <button
                            onClick={() => setViewMode('table')}
                            style={{
                                padding: '6px 12px',
                                border: 'none',
                                borderRadius: '6px',
                                backgroundColor: viewMode === 'table' ? 'white' : 'transparent',
                                color: viewMode === 'table' ? 'var(--matdash-primary)' : 'var(--matdash-text-muted)',
                                boxShadow: viewMode === 'table' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>table_rows</span>
                        </button>
                        <button
                            onClick={() => setViewMode('card')}
                            style={{
                                padding: '6px 12px',
                                border: 'none',
                                borderRadius: '6px',
                                backgroundColor: viewMode === 'card' ? 'white' : 'transparent',
                                color: viewMode === 'card' ? 'var(--matdash-primary)' : 'var(--matdash-text-muted)',
                                boxShadow: viewMode === 'card' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>grid_view</span>
                        </button>
                    </div>
                    <button
                        className="btn-matdash"
                        onClick={handleAdd}
                        style={{
                            padding: '8px 16px',
                            fontSize: '14px',
                            backgroundColor: 'var(--matdash-primary)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <span className="material-symbols-outlined">event_available</span>
                        Add Event
                    </button>
                </div>
            </div>

            {/* VIEW MODES */}
            {viewMode === 'card' ? (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                    gap: '24px'
                }}>
                    {events.map((e, index) => {
                        const accentColors = ['#9c27b0', '#4caf50', '#ff9800', '#f44336', '#2196f3'];
                        const accentColor = accentColors[index % accentColors.length];

                        return (
                            <div key={e.scheduleEventId} className="event-card" style={{
                                backgroundColor: 'white',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                borderLeft: `6px solid ${accentColor}`,
                                display: 'flex',
                                flexDirection: 'column',
                                position: 'relative',
                                transition: 'transform 0.2s ease',
                                cursor: 'default'
                            }}>
                                {/* Card Header with Event Name and Actions */}
                                <div style={{
                                    padding: '16px 24px 8px 24px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    gap: '12px'
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{
                                            margin: 0,
                                            fontSize: '18px',
                                            fontWeight: '700',
                                            color: 'var(--matdash-text-dark)',
                                            lineHeight: '1.3'
                                        }}>
                                            {e.details || "Unnamed Event"}
                                        </h4>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                                        <button
                                            onClick={() => handleEdit(e.scheduleEventId)}
                                            style={{
                                                background: '#f8f9fa',
                                                border: '1px solid #e9ecef',
                                                color: '#495057',
                                                cursor: 'pointer',
                                                padding: '6px',
                                                borderRadius: '6px',
                                                display: 'flex',
                                                alignItems: 'center'
                                            }}
                                            title="Edit"
                                        >
                                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(e.scheduleEventId)}
                                            style={{
                                                background: '#fff5f5',
                                                border: '1px solid #ffe3e3',
                                                color: '#fa5252',
                                                cursor: 'pointer',
                                                padding: '6px',
                                                borderRadius: '6px',
                                                display: 'flex',
                                                alignItems: 'center'
                                            }}
                                            title="Delete"
                                        >
                                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                                        </button>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', padding: '12px 24px 24px 24px' }}>
                                    {/* Left Section: Price & Date */}
                                    <div style={{
                                        flex: '0 0 90px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        borderRight: '1px solid #f0f0f0',
                                        paddingRight: '12px'
                                    }}>
                                        <div>
                                            <span style={{ fontSize: '24px', fontWeight: '700', color: '#1a1a1a' }}>₹{e.fees}</span>
                                        </div>
                                        <div style={{ marginTop: '8px' }}>
                                            <div style={{ fontSize: '11px', fontWeight: '700', color: accentColor, textTransform: 'uppercase', marginBottom: '2px' }}>
                                                {formatDate(e.startDate) === formatDate(new Date().toISOString()) ? 'TODAY' : formatDate(e.startDate)}
                                            </div>
                                            <div style={{ fontSize: '13px', fontWeight: '500', color: '#666' }}>{e.startTimePart}</div>
                                        </div>
                                    </div>

                                    {/* Middle Section: Path / Location */}
                                    <div style={{ flex: 1, paddingLeft: '16px', display: 'flex', gap: '10px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', padding: '4px 0' }}>
                                            <div style={{ width: '6.5px', height: '6.5px', borderRadius: '50%', border: `1.5px solid ${accentColor}` }}></div>
                                            <div style={{ flex: 1, width: '0', borderLeft: `1.5px dotted #ccc`, margin: '4px 0' }}></div>
                                            <div style={{ width: '6.5px', height: '6.5px', borderRadius: '50%', border: `1.5px solid ${accentColor}` }}></div>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '2px 0' }}>
                                            <div>
                                                <div style={{ fontSize: '10px', color: '#adb5bd', fontWeight: '700', textTransform: 'uppercase', marginBottom: '3px' }}>LOCATION</div>
                                                <div style={{ fontSize: '13px', color: '#495057', fontWeight: '600' }}>{e.placeName || places.find(p => (p.placeId || p.PlaceId) === e.placeId)?.placeName || "Not set"}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '10px', color: '#adb5bd', fontWeight: '700', textTransform: 'uppercase', marginBottom: '3px' }}>DURATION</div>
                                                <div style={{ fontSize: '12px', color: '#868e96' }}>Ends {formatDate(e.endDate)}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Stats */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr 1fr',
                                    padding: '16px 24px',
                                    backgroundColor: '#fafafa',
                                    borderTop: '1px solid #f0f0f0'
                                }}>
                                    <div>
                                        <div style={{ fontSize: '10px', color: '#999', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>CONTACT</div>
                                        <div style={{ fontSize: '13px', color: '#444', fontWeight: '600' }}>{e.contactName || "-"}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '10px', color: '#999', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>PHONE</div>
                                        <div style={{ fontSize: '13px', color: '#444', fontWeight: '600' }}>{e.phone || "-"}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '10px', color: '#999', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>CATEGORY</div>
                                        <div style={{
                                            fontSize: '12px',
                                            color: accentColor,
                                            fontWeight: '700',
                                            backgroundColor: `${accentColor}15`,
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            display: 'inline-block'
                                        }}>
                                            {e.eventCategoryName || categories.find(c => (c.eventCategoryId || c.EventCategoryId) === e.eventCategoryId)?.eventCategoryName || "-"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
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
                                        No scheduled events found
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
                                                : (e.userId || "-")}
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
            )}

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

export default ScheduleEventList;
