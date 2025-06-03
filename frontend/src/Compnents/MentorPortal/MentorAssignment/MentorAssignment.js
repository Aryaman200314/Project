import React, { useState, useEffect } from 'react';
import axios from 'axios';
  

const MentorAssignment = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedMentee, setSelectedMentee] = useState('');
    const [mentees, setMentees] = useState([]);
    const [message, setMessage] = useState('');

    useEffect(() => {
        axios.get('http://localhost:5000/api/mentees')
            .then(res => setMentees(res.data))
            .catch(err => console.error("Failed to fetch mentees", err));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/assignments', {
                title,
                description,
                mentee_id: selectedMentee
            });
            setMessage("Assignment successfully assigned!");
            setTitle('');
            setDescription('');
            setSelectedMentee('');
        } catch (err) {
            console.error("Error assigning assignment", err);
            setMessage("Failed to assign assignment");
        }
    };

    return (
        <div className="form-container">
            <h2>Assign Assignment</h2>
            {message && <p className="message">{message}</p>}
            <form onSubmit={handleSubmit}>
                <label htmlFor="title">Title:</label>
                <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />

                <label htmlFor="description">Description:</label>
                <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                ></textarea>

                <label htmlFor="mentee">Assign To:</label>
                <select
                    id="mentee"
                    value={selectedMentee}
                    onChange={(e) => setSelectedMentee(e.target.value)}
                    required
                >
                    <option value="">Select Mentee</option>
                    {mentees.map((mentee) => (
                        <option key={mentee.id} value={mentee.id}>
                            {mentee.first_name} {mentee.last_name}
                        </option>
                    ))}
                </select>

                <button type="submit">Submit</button>
            </form>
        </div>
    );
};

export default MentorAssignment;
