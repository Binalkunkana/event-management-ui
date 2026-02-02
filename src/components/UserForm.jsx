import { useEffect, useState } from "react";
import { createUser, updateUser, getUserById } from "../api/userApi";

export default function UserForm({ userId, onSuccess }) {
  const [user, setUser] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    role: ""
  });

  useEffect(() => {
    if (userId) {
      loadUser();
    }
  }, [userId]);

  const loadUser = async () => {
    const res = await getUserById(userId);
    setUser(res.data.data);
  };

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (userId) {
        await updateUser(userId, user);
        alert("User updated successfully ✅");
      } else {
        await createUser(user);
        alert("User created successfully ✅");
      }
      onSuccess();
    } catch (err) {
      console.error("UserForm Error", err);
      // Try to show specific validation errors if available (e.g. from ASP.NET 400 Bad Request)
      const msg = err.response?.data?.title || err.response?.data?.message || "Validation error occurring";
      const errors = err.response?.data?.errors ? JSON.stringify(err.response.data.errors) : "";
      alert(`${msg} ❌ \n${errors}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-3">
      <h4>{userId ? "Edit User" : "Add User"}</h4>

      <input name="firstName" className="form-control mb-2"
        placeholder="First Name" value={user.firstName}
        onChange={handleChange} required />

      <input name="middleName" className="form-control mb-2"
        placeholder="Middle Name" value={user.middleName}
        onChange={handleChange} />

      <input name="lastName" className="form-control mb-2"
        placeholder="Last Name" value={user.lastName}
        onChange={handleChange} required />

      <input name="email" type="email" className="form-control mb-2"
        placeholder="Email" value={user.email}
        onChange={handleChange} required />

      <input name="password" type="password" className="form-control mb-2"
        placeholder="Password" value={user.password}
        onChange={handleChange} required={!userId} minLength={6} />

      <input name="phone" className="form-control mb-2"
        placeholder="Phone" value={user.phone}
        onChange={handleChange} required />

      <select name="role" className="form-control mb-2"
        value={user.role} onChange={handleChange} required>
        <option value="">Select Role</option>
        <option value="Admin">Admin</option>
        <option value="Organizer">Organizer</option>
        <option value="User">User</option>
      </select>

      <button className="btn btn-primary">
        {userId ? "Update" : "Save"}
      </button>
    </form>
  );
}
