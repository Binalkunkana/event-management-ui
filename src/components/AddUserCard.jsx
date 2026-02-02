import { useState } from "react";
import { createUser } from "../api/userApi";

const AddUserCard = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    role: "User"
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await createUser(formData);
      alert("User Added Successfully ✅");
      onSuccess();
    } catch (err) {
      console.error(err);
      alert("Failed to add user ❌");
    }
  };

  return (
    <div className="card shadow p-4 mb-4">
      <h5>Add New User</h5>
      <form onSubmit={handleSubmit}>

        {Object.keys(formData).map((key) => (
          key !== "role" && (
            <input
              key={key}
              type={key === "password" ? "password" : "text"}
              name={key}
              placeholder={key}
              value={formData[key]}
              onChange={handleChange}
              className="form-control mb-2"
              required
            />
          )
        ))}

        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="form-control mb-3"
        >
          <option>User</option>
          <option>Admin</option>
        </select>

        <button className="btn btn-primary w-100">Save User</button>
      </form>
    </div>
  );
};

export default AddUserCard;
