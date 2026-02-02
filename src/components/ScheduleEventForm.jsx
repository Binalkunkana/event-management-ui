import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createScheduledEvent, updateScheduledEvent, getScheduledEventById } from "../api/eventApi";
import { getAllCategories } from "../api/categoryApi";
import { getAllPlaces } from "../api/placeApi";
import { getAllUsers } from "../api/userApi";

const ScheduleEventForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [event, setEvent] = useState({
        Details: "",
        StartDate: "",
        StartTime: "",
        EndDate: "",
        EndTime: "",
        Fees: 0,
        EventCategoryId: "",
        PlaceId: "",
        Phone: "",
        ContactName: "",
        UserId: ""
    });

    const [users, setUsers] = useState([]);

    // Dropdown Data
    const [categories, setCategories] = useState([]);
    const [places, setPlaces] = useState([]);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadDependencyData();
        if (id) {
            fetchEvent();
        }
    }, [id]);

    const loadDependencyData = async () => {
        try {
            const [catRes, placeRes, userRes] = await Promise.all([
                getAllCategories(),
                getAllPlaces(),
                getAllUsers()
            ]);
            setCategories(catRes.data.data || []);
            setPlaces(placeRes.data.data || []);
            setUsers(userRes.data.data || []);
        } catch (error) {
            console.error("Failed to load dependency data", error);
        }
    };

    const fetchEvent = async () => {
        try {
            const res = await getScheduledEventById(id);
            if (res.data.data) {
                const data = res.data.data;
                // Helper to extract clean YYYY-MM-DD
                const getCleanDate = (val) => {
                    if (!val) return "";
                    return val.includes('T') ? val.split('T')[0] : val;
                };

                // Helper to extract HH:mm
                const getCleanTime = (val) => {
                    if (!val) return "";
                    let timeStr = val;
                    if (val.includes('T')) timeStr = val.split('T')[1];
                    if (timeStr.includes(' ')) {
                        const [time, modifier] = timeStr.split(' ');
                        let [hours, minutes] = time.split(':');
                        if (hours === '12') hours = '00';
                        if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
                        timeStr = `${String(hours).padStart(2, '0')}:${minutes}`;
                    }
                    return timeStr.slice(0, 5);
                };

                setEvent({
                    Details: data.Details || data.details || data.title || data.Title || data.description || data.Description || "",
                    StartDate: getCleanDate(data.StartDate || data.startDate || data.eventDate || ""),
                    StartTime: getCleanTime(data.StartTime || data.startTime || ""),
                    EndDate: getCleanDate(data.EndDate || data.endDate || ""),
                    EndTime: getCleanTime(data.EndTime || data.endTime || ""),
                    Fees: data.Fees || data.fees || 0,
                    EventCategoryId: data.EventCategoryId || data.eventCategoryId || "",
                    PlaceId: data.PlaceId || data.placeId || "",
                    Phone: data.Phone || data.phone || "",
                    ContactName: data.ContactName || data.contactName || "",
                    UserId: data.UserId || data.userId || ""
                });
            }
        } catch (error) {
            console.error("Failed to load event", error);
            alert("Failed to load event data");
        }
    };

    const handleChange = (e) => {
        setEvent({ ...event, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Format time as HH:mm:ss for backend TimeOnly.Parse
        const formatTime = (time) => {
            if (!time) return "00:00:00";
            return time.length === 5 ? `${time}:00` : time;
        };

        try {
            const payload = {
                Details: event.Details,
                StartDate: event.StartDate,
                EndDate: event.EndDate,
                StartTime: formatTime(event.StartTime),
                EndTime: formatTime(event.EndTime),
                Fees: Number(event.Fees),
                ContactName: event.ContactName,
                Phone: event.Phone,
                EventCategoryId: Number(event.EventCategoryId),
                PlaceId: Number(event.PlaceId),
                UserId: Number(event.UserId)
            };

            if (id) {
                const targetId = Number(id);
                await updateScheduledEvent(targetId, payload);
                alert("Event updated successfully!");
            } else {
                await createScheduledEvent(payload);
                alert("Event created successfully!");
            }
            navigate("/admin/events-list");
        } catch (error) {
            console.error("Error saving event", error);
            const errorData = error.response?.data;
            alert("Failed to save event: " + (errorData?.message || errorData?.title || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card shadow-sm border-0">
                        <div className="card-body p-4">
                            <h3 className="mb-4 text-center">{id ? "Edit Event" : "Add Event"}</h3>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Event Details *</label>
                                    <textarea
                                        name="Details"
                                        className="form-control"
                                        value={event.Details}
                                        onChange={handleChange}
                                        rows="4"
                                        placeholder="Enter detailed description of the event..."
                                        required
                                    />
                                </div>

                                <div className="row">
                                    <div className="col-md-3 mb-3">
                                        <label className="form-label">Start Date</label>
                                        <input
                                            type="date"
                                            name="StartDate"
                                            className="form-control"
                                            value={event.StartDate}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-3 mb-3">
                                        <label className="form-label">Start Time</label>
                                        <input
                                            type="time"
                                            name="StartTime"
                                            className="form-control"
                                            value={event.StartTime}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-3 mb-3">
                                        <label className="form-label">End Date</label>
                                        <input
                                            type="date"
                                            name="EndDate"
                                            className="form-control"
                                            value={event.EndDate}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-3 mb-3">
                                        <label className="form-label">End Time</label>
                                        <input
                                            type="time"
                                            name="EndTime"
                                            className="form-control"
                                            value={event.EndTime}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Category Name</label>
                                        <select
                                            name="EventCategoryId"
                                            className="form-select"
                                            value={event.EventCategoryId}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map(c => (
                                                <option key={c.eventCategoryId || c.EventCategoryId} value={c.eventCategoryId || c.EventCategoryId}>
                                                    {c.eventCategoryName || c.categoryName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Place Name</label>
                                        <select
                                            name="PlaceId"
                                            className="form-select"
                                            value={event.PlaceId}
                                            onChange={handleChange}
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
                                </div>

                                <div className="mb-4">
                                    <label className="form-label">Ticket Price</label>
                                    <div className="input-group">
                                        <span className="input-group-text">₹</span>
                                        <input
                                            type="number"
                                            name="Fees"
                                            className="form-control"
                                            value={event.Fees}
                                            onChange={handleChange}
                                            min="0"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Contact Name</label>
                                        <input
                                            type="text"
                                            name="ContactName"
                                            className="form-control"
                                            value={event.ContactName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Phone</label>
                                        <input
                                            type="text"
                                            name="Phone"
                                            className="form-control"
                                            value={event.Phone}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label">User Name</label>
                                    <select
                                        name="UserId"
                                        className="form-select"
                                        value={event.UserId}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select User</option>
                                        {users.map(u => (
                                            <option key={u.userId} value={u.userId}>
                                                {u.firstName} {u.lastName} ({u.role})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="d-grid gap-2">
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        {loading ? "Saving..." : (id ? "Update Event" : "Create Event")}
                                    </button>
                                    <button type="button" className="btn btn-secondary" onClick={() => navigate("/admin/events-list")}>
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

export default ScheduleEventForm;
