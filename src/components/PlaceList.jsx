import { useEffect, useState } from "react";
import {
  getAllPlaces,
  deletePlace,
  updatePlace,
  getPlaceById,
  createPlace,
} from "../api/placeApi";
import { getAllUsers } from "../api/userApi";
import EditSidebar from "./EditSidebar";

const PlaceList = () => {
  const [places, setPlaces] = useState([]);
  const [users, setUsers] = useState([]);

  const [editSidebarOpen, setEditSidebarOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState(null);
  const [mode, setMode] = useState("edit");

  const [formData, setFormData] = useState({
    placeName: "",
    address: "",
    country: "",
    city: "",
    maxCapacity: "",
    userId: ""
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPlaces();
    fetchUsers();
  }, []);

  const fetchPlaces = async () => {
    const res = await getAllPlaces();
    setPlaces(res.data.data || []);
  };

  const fetchUsers = async () => {
    const res = await getAllUsers();
    setUsers(res.data.data || []);
  };

  // ================= EDIT =================
  const handleEdit = async (id) => {
    try {
      setLoading(true);
      setMode("edit");

      const res = await getPlaceById(id);
      const p = res.data.data || res.data;

      setEditingPlace(p);
      setFormData({
        placeName: p.placeName || "",
        address: p.address || "",
        country: p.country || "",
        city: p.city || "",
        maxCapacity: p.maxCapacity || "",
        userId: p.userId || ""
      });

      setEditSidebarOpen(true);
    } catch {
      alert("Failed to load place");
    } finally {
      setLoading(false);
    }
  };

  // ================= SAVE =================
  const handleSave = async () => {
    try {
      setLoading(true);

      const selectedUser = users.find(u => u.userId === Number(formData.userId));
      if (!selectedUser) {
        alert("Please select a valid user");
        return;
      }

      const payload = {
        PlaceName: formData.placeName,
        Address: formData.address,
        Country: formData.country,
        City: formData.city,
        MaxCapacity: Number(formData.maxCapacity),
        UserId: Number(formData.userId)
      };

      if (mode === "add") {
        await createPlace(payload);
        alert("Place added successfully!");
      } else {
        await updatePlace(editingPlace.placeId, payload);
        alert("Place updated successfully!");
      }

      setEditSidebarOpen(false);
      fetchPlaces();
    } catch (error) {
      console.error("SAVE ERROR:", error.response || error);
      alert(error.response?.data?.title || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (window.confirm("Delete this place?")) {
      await deletePlace(id);
      fetchPlaces();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h2 style={{ fontSize: "24px", fontWeight: "700" }}>Place List</h2>
          <p style={{ fontSize: "14px", color: "var(--matdash-text-muted)" }}>
            Manage event places
          </p>
        </div>

        <button
          className="btn-matdash"
          onClick={() => {
            setMode("add");
            setEditingPlace(null);
            setFormData({
              placeName: "",
              address: "",
              country: "",
              city: "",
              maxCapacity: "",
              userId: ""
            });
            setEditSidebarOpen(true);
          }}
        >
          <span className="material-symbols-outlined">add_location_alt</span>
          Add Place
        </button>
      </div>

      {/* TABLE */}
      <div className="matdash-card" style={{ padding: 0 }}>
        <table className="matdash-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Address</th>
              <th>City</th>
              <th>Country</th>
              <th>Capacity</th>
              <th>User</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {places.map((p) => (
              <tr key={p.placeId}>
                <td>{p.placeId}</td>
                <td><strong>{p.placeName}</strong></td>
                <td>{p.address}</td>
                <td>{p.city}</td>
                <td>{p.country}</td>
                <td>{p.maxCapacity}</td>
                <td>
                  {users.find(u => u.userId === p.userId)?.firstName || "-"}
                </td>
                <td>
                  <button
                    className="btn-matdash btn-matdash-outline"
                    onClick={() => handleEdit(p.placeId)}
                  >
                    <span className="material-symbols-outlined">edit_square</span>
                  </button>

                  <button
                    className="btn-matdash"
                    style={{ backgroundColor: "var(--matdash-danger)", color: "white" }}
                    onClick={() => handleDelete(p.placeId)}
                  >
                    <span className="material-symbols-outlined">delete_forever</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SIDEBAR */}
      <EditSidebar
        isOpen={editSidebarOpen}
        onClose={() => setEditSidebarOpen(false)}
        title={mode === "add" ? "Add Place" : "Edit Place"}
        onSave={handleSave}
        loading={loading}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <input name="placeName" placeholder="Place Name" value={formData.placeName} onChange={handleInputChange} />
          <input name="address" placeholder="Address" value={formData.address} onChange={handleInputChange} />
          <input name="city" placeholder="City" value={formData.city} onChange={handleInputChange} />
          <input name="country" placeholder="Country" value={formData.country} onChange={handleInputChange} />
          <input type="number" name="maxCapacity" placeholder="Capacity" value={formData.maxCapacity} onChange={handleInputChange} />

          {/* USER DROPDOWN */}
          <select name="userId" value={formData.userId} onChange={handleInputChange}>
            <option value="">Select User</option>
            {users
              .filter(u => u.role === "Admin" || u.role === "Organizer")
              .map(u => (
                <option key={u.userId} value={u.userId}>
                  {u.firstName} {u.lastName} ({u.role})
                </option>
              ))}
          </select>
        </div>
      </EditSidebar>
    </div>
  );
};

export default PlaceList;
