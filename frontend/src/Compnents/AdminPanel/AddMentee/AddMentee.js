// ✅ AddMentee.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './AddMentee.css';

const AddMentee = () => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        designation: '',
        phone: '',
        location: '',
        work_mode: 'WFO'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/mentees/add', formData);
            toast.success('Mentee added successfully');
            setFormData({
                first_name: '',
                last_name: '',
                email: '',
                password: '',
                designation: '',
                phone: '',
                location: '',
                work_mode: 'WFO'
            });
        } catch (err) {
            toast.error('Failed to add mentee');
        }
    };

    return (
        <div className="add-mentee-container">
            <h2>Add Mentee</h2>
            <form onSubmit={handleSubmit}>
                <input name="first_name" placeholder="First Name" value={formData.first_name} onChange={handleChange} required />
                <input name="last_name" placeholder="Last Name" value={formData.last_name} onChange={handleChange} required />
                <input name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
                <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
                <input name="designation" placeholder="Designation" value={formData.designation} onChange={handleChange} required />
                <input name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} required />

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
                <button type="submit">Add Mentee</button>
            </form>
        </div>
    );
};

export default AddMentee;
