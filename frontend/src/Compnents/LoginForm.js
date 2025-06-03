import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";
import AdminRequestModal from "./AdminRequestModal";

const LoginForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "mentee", // default to mentee
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (!formData.role) newErrors.role = "Role is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
    setServerError("");
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const res = await axios.post("http://localhost:5000/api/auth/login", formData);
        const user = res.data.user;
        localStorage.setItem("userEmail", formData.email);
        if (formData.role === "mentee") {
          navigate("/home", { state: formData });
        } else {
          navigate("/mentor/home", { state: formData });
        }
      } catch (error) {
        const msg = error.response?.data?.message || "Login failed";
        setServerError(msg);
      }
    }
  };

  return (
    <>
    <div className="form-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <label>Email:</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />
        {errors.email && <p className="error">{errors.email}</p>}

        <label>Password:</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
        />
        {errors.password && <p className="error">{errors.password}</p>}

        {serverError && <p className="error">{serverError}</p>}
        
        <button type="submit">Login</button>
      </form>
      <label>Role:</label>
      <select name="role" value={formData.role} onChange={handleChange}>
        <option value="mentee">Mentee</option>
        <option value="mentor">Mentor</option>
      </select>
      {errors.role && <p className="error">{errors.role}</p>}
      <hr/>
      <p>Don't have an account?/Want to reset password</p>

      <button type="button" onClick={() => setShowModal(true)}>
        Contact Admin
      </button>
      {
          showModal && (
            <AdminRequestModal onClose={()=> setShowModal(false)}/>
          )}
      
    </div>
    <button onClick={()=> navigate("/admin/login")}>Admin panel</button>
    </>
  );
};

export default LoginForm;
