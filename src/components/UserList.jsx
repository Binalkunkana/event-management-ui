import { useEffect, useState } from "react";
import { getAllUsers, deleteUser, updateUser, getUserById, createUser } from "../api/userApi";
import EditSidebar from "./EditSidebar";
import AddUserCard from "./AddUserCard";
// import { getAllUsers } from "../api/usersApi";

import UserForm from "./UserForm";


const UserList = () => {
  const [users, setUsers] = useState([]);

  const [editSidebarOpen, setEditSidebarOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [mode, setMode] = useState("edit"); // "edit" | "add"
  const [formData, setFormData] = useState({
    // userId: '',          // Added UserId
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [addSidebarOpen, setAddSidebarOpen] = useState(false); // To handle Add User sidebar/modal

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await getAllUsers();
      setUsers(res.data.data || []);
    } catch (error) {
      console.error(error);
      alert("Failed to fetch users");
    }
  };

  const handleEdit = async (userId) => {
    try {
      setLoading(true);
      setMode("edit"); // ✅ important
      const res = await getUserById(userId);
      const user = res.data.data || res.data;

      setEditingUser(user);
      setFormData({
        firstName: user.firstName || '',
        middleName: user.middleName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'User',
        password: user.password || ''
      });
      setEditSidebarOpen(true);
    } catch (error) {
      alert("Failed to load user details");
    } finally {
      setLoading(false);
    }
  };


  const handleSave = async () => {
    try {
      const passwordRegex =
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/;

      if (!passwordRegex.test(formData.password)) {
        alert(
          "Password must contain letters, numbers and at least one special character."
        );
        return;
      }

      if (!formData.role) {
        alert("Please select a role");
        return;
      }

      let newErrors = {};

      if (!passwordRegex.test(formData.password)) {
        newErrors.password =
          "Password must include letter, number & special character.";
      }

      if (!formData.role) {
        newErrors.role = "Role is required";
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      setLoading(true);

      if (mode === "add") {
        // ➕ ADD USER
        await createUser(formData);
        alert("User added successfully!");
      } else {
        // ✏️ EDIT USER
        await updateUser(editingUser.userId, formData);
        alert("User updated successfully!");
      }

      setEditSidebarOpen(false);
      fetchUsers();
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.title ||
        error.response?.data?.message ||
        "Validation error"
      );
    } finally {
      setLoading(false);
    }
  };


  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(id);
        alert("User deleted successfully!");
        fetchUsers(); // refresh list
      } catch (error) {
        console.error("Failed to delete user", error);
        alert("Failed to delete user: " + (error.response?.data?.message || error.message));
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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <div>
          <h2 style={{ fontSize: "24px", fontWeight: "700", color: "var(--matdash-text-dark)", marginBottom: "4px" }}>
            User List
          </h2>
          <p style={{ color: "var(--matdash-text-muted)", fontSize: "14px", margin: 0 }}>
            Manage registered users
          </p>
        </div>

        {/* ➕ ADD USER BUTTON */}
        <button
          className="btn-matdash"
          onClick={() => {
            setMode("add");
            setEditingUser(null);
            setFormData({
              firstName: "",
              middleName: "",
              lastName: "",
              email: "",
              phone: "",
              role: "User",
              password: ""
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
          <span className="material-symbols-outlined">person_add</span>
          Add User
        </button>

      </div>


      {/* TABLE */}
      <div className="matdash-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="matdash-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Password</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--matdash-text-muted)' }}>
                  No users found
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.userId}>
                  <td>{u.userId}</td>
                  <td>
                    <strong>{u.firstName} {u.middleName} {u.lastName}</strong>
                  </td>
                  <td>{u.email || "-"}</td>
                  <td>{u.phone}</td>
                  <td>
                    <span className={`matdash-badge ${u.role === 'Admin' ? 'danger' :
                      u.role === 'Organizer' ? 'warning' :
                        'primary'
                      }`}>
                      {u.role || "User"}
                    </span>
                  </td>
                  <td>{u.password || "-"}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn-matdash btn-matdash-outline"
                        style={{ padding: '6px 12px', fontSize: '13px' }}
                        onClick={() => handleEdit(u.userId)}
                        title="Edit User"
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
                        onClick={() => handleDelete(u.userId)}
                        title="Delete User"
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
        title={mode === "add" ? "Add User" : "Edit User"}
        onSave={handleSave}
        loading={loading}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--matdash-text-dark)', marginBottom: '8px' }}>
              First Name *
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
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
              Middle Name
            </label>
            <input
              type="text"
              name="middleName"
              value={formData.middleName}
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
              Last Name *
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
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
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--matdash-text-dark)', marginBottom: '8px', }}>
                Password *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange} minLength={6}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--matdash-border)',
                  fontSize: '14px'
                }}
                required
              />
              {/* {errors.password && <small style={{ color: 'red' }}>{errors.password}</small>} */}

            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--matdash-text-dark)', marginBottom: '8px' }}>
              Role *
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--matdash-border)',
                fontSize: '14px',
                backgroundColor: 'white',
                color: 'var(--matdash-text-dark)'
              }}
              required

            >
              {/* {errors.role && <small style={{color:'red'}}>{errors.role}</small>} */}


              <option value="User">User</option>
              <option value="Admin">Admin</option>
              <option value="Organizer">Organizer</option>
            </select>
          </div>
        </div>
      </EditSidebar>
    </div>
  );
};

export default UserList;
