import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MentorAssignment.css'; // shared styles with task form

const MentorAssignment = () => {
    const [form, setForm] = useState({
        title: '',
        description: '',
        end_time: '',
        mentee_email: ''
    });
    const [mentees, setMentees] = useState([]);
    const userEmail = localStorage.getItem("userEmail");

    useEffect(() => {
        axios.get('http://localhost:5000/api/mentees')
            .then(res => setMentees(res.data))
            .catch(err => console.error("Failed to fetch mentees", err));
    }, []);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/assignments/by-email', {
                ...form,
                mentor_email: userEmail
            });
            alert("✅ Assignment Assigned!");
            setForm({ title: '', description: '', end_time: '', mentee_email: '' });
        } catch (err) {
            console.error("❌ Error assigning assignment:", err);
            alert("❌ Failed to assign assignment.");
        }
    };

    return (
        <div className="form-container">
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Assign Assignment</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="title"
                    placeholder="Assignment Title"
                    value={form.title}
                    onChange={handleChange}
                    required
                />

                <textarea
                    name="description"
                    placeholder="Assignment Description"
                    value={form.description}
                    onChange={handleChange}
                    required
                />

                <label style={{ fontWeight: 'bold', marginTop: '10px' }}>End Time</label>
                <input
                    type="datetime-local"
                    name="end_time"
                    value={form.end_time}
                    onChange={handleChange}
                    required
                />

                <select
                    name="mentee_email"
                    value={form.mentee_email}
                    onChange={handleChange}
                    required
                >
                    <option value="">Assign To</option>
                    {mentees.map(mentee => (
                        <option key={mentee.id} value={mentee.email}>
                            {mentee.name || `${mentee.first_name} ${mentee.last_name}`} ({mentee.email})
                        </option>
                    ))}
                </select>

                <button type="submit" className="assign-btn">Assign Assignment</button>
            </form>
        </div>
    );
};

export default MentorAssignment;
