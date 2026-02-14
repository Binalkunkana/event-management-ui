import { useEffect, useState } from "react";
import {
  getAllCategories,
  deleteCategory,
  updateCategory,
  getCategoryById,
  createCategory,
} from "../api/categoryApi";
import { getAllUsers } from "../api/userApi";
import EditSidebar from "./EditSidebar";
import axios from "axios";

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);

  const [editSidebarOpen, setEditSidebarOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [mode, setMode] = useState("edit");

  const [formData, setFormData] = useState({
    eventCategoryName: "",
    eventCategoryDescription: "",
    userId: ""
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchUsers();
  }, []);

  // ================= FETCH =================
  const fetchCategories = async () => {
    const res = await getAllCategories();
    setCategories(res.data.data || []);
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

      const res = await getCategoryById(id);
      const cat = res.data.data || res.data;

      setEditingCategory(cat);
      setFormData({
        eventCategoryName: cat.eventCategoryName || "",
        eventCategoryDescription: cat.eventCategoryDescription || "",
        userId: cat.userId || ""
      });

      setEditSidebarOpen(true);
    } catch {
      alert("Failed to load category");
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
        alert("Please select a valid user.");
        return;
      }

      const payload = {
        eventCategoryName: formData.eventCategoryName,
        eventCategoryDescription: formData.eventCategoryDescription,
        userId: Number(formData.userId),
        Role: selectedUser.role // Admin or Organizer
      };

      if (mode === "add") {
        await createCategory(payload);
        alert("Category added successfully!");
      } else {
        await updateCategory(editingCategory.eventCategoryId, payload);
        alert("Category updated successfully!");
      }

      setEditSidebarOpen(false);
      fetchCategories();
    } catch (error) {
      console.error("SAVE ERROR:", error.response || error);
      alert(error.response?.data?.title || "Save failed");
    } finally {
      setLoading(false);
    }
  };
  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      await deleteCategory(id);
      fetchCategories();
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
          <h2 style={{ fontSize: "24px", fontWeight: "700" }}>Category List</h2>
          <p style={{ fontSize: "14px", color: "var(--matdash-text-muted)" }}>
            Manage event categories
          </p>
        </div>

        <button
          className="btn-matdash"
          onClick={() => {
            setMode("add");
            setEditingCategory(null);
            setFormData({
              eventCategoryName: "",
              eventCategoryDescription: "",
              userId: ""
            });
            setEditSidebarOpen(true);
          }}
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
          Add Category
        </button>
      </div>

      {/* TABLE */}
      <div className="matdash-card" style={{ padding: 0 }}>
        <table className="matdash-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>User</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.eventCategoryId}>
                <td>{c.eventCategoryId}</td>
                <td><strong>{c.eventCategoryName}</strong></td>
                <td>{c.eventCategoryDescription}</td>
                <td>
                  {users.find(u => u.userId === c.userId)?.firstName || "-"}
                </td>
                <td>
                  <button
                    className="btn-matdash btn-matdash-outline"
                    onClick={() => handleEdit(c.eventCategoryId)}
                  >
                    <span className="material-symbols-outlined">edit_square</span>
                  </button>

                  <button
                    className="btn-matdash"
                    style={{ backgroundColor: "var(--matdash-danger)", color: "white" }}
                    onClick={() => handleDelete(c.eventCategoryId)}
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
        title={mode === "add" ? "Add Category" : "Edit Category"}
        onSave={handleSave}
        loading={loading}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <input
            name="eventCategoryName"
            placeholder="Category Name"
            value={formData.eventCategoryName}
            onChange={handleInputChange}
          />

          <textarea
            name="eventCategoryDescription"
            placeholder="Description"
            value={formData.eventCategoryDescription}
            onChange={handleInputChange}
          />

          <select name="userId" value={formData.userId} onChange={handleInputChange}>
            <option value="">Select User</option>

            {users
              .filter(u => u.role === "Admin" || u.role === "Organizer")
              .map((u) => (
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

export default CategoryList;
