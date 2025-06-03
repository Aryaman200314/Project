import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './AddMentor.css';
import AdminLogin from '../Login/AdminLogin';

const AddMentor = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    designation: '',
    phone: '',
    location: '',
    work_mode: 'WFO',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/mentors/add', formData);
      toast.success('Mentor added successfully!');
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        designation: '',
        phone: '',
        location: '',
        work_mode: 'WFO',
      });
    } catch (err) {
      toast.error('Failed to add mentor');
    }
  };

  return (
    <>
    <div className="add-mentor-container">
      <h2>Add Mentor</h2>
      <form onSubmit={handleSubmit} className="add-mentor-form">
        <input type="text" name="first_name" placeholder="First Name" value={formData.first_name} onChange={handleChange} required />
        <input type="text" name="last_name" placeholder="Last Name" value={formData.last_name} onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
        <input type="text" name="designation" placeholder="Designation" value={formData.designation} onChange={handleChange} required />
        <input type="text" name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} required />
        
        <select
  name="location"
  value={formData.location}
  onChange={handleChange}
  required
>
  <option value="">Select Location</option>
  <option value="Noida">Noida</option>
</select>

        <select name="work_mode" value={formData.work_mode} onChange={handleChange}>
          <option value="WFO">WFO</option>
          <option value="WFH">WFH</option>
          <option value="Hybrid">Hybrid</option>
        </select>
        <button type="submit">Add Mentor</button>
      </form>
    </div>
    </>
  );
};

export default AddMentor;
