import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AssignPage.css';
import MentorMenteeDiagram from '../../ReactFlow/MentorMenteeDiagram';

const AssignPage = () => {
  const [mentors, setMentors] = useState([]);
  const [mentees, setMentees] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState('');
  const [selectedMentees, setSelectedMentees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mentorsRes, menteesRes] = await Promise.all([
          axios.get('http://localhost:5000/api/mentors'),
          axios.get('http://localhost:5000/api/mentees'),
        ]);
        setMentors(mentorsRes.data);
        setMentees(menteesRes.data);
      } catch (err) {
        setError('Failed to fetch mentors or mentees.');
      }
    };
    fetchData();
  }, []);

  const assignMentees = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      await Promise.all(
        selectedMentees.map(menteeId =>
          axios.post('http://localhost:5000/api/assign', {
            mentorId: selectedMentor,
            menteeId
          })
        )
      );
      alert('Mentees assigned successfully!');
      setSelectedMentees([]);
    } catch (err) {
      if (err.response?.status === 409) {
        setErrorMessage(err.response.data.message);
      } else {
        setErrorMessage("Assignment failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <div className="assign-container">
      <h2 className="title">Assign Mentees to Mentor</h2>
      <hr/>

      {error && <p className="error-text">{error}</p>}

      <div className="form-group">
        <label>Select a Mentor:</label>
        <select
          value={selectedMentor}
          onChange={e => setSelectedMentor(e.target.value)}
        >
          <option value="">-- Select Mentor --</option>
          {mentors.map(m => (
            <option key={m.id} value={m.id}>
              {m.first_name} {m.last_name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Select Mentees:</label>
        <div className="mentee-list">
          {mentees.map(m => (
            <label key={m.id} className="checkbox-label">
              <input
                type="checkbox"
                value={m.id}
                checked={selectedMentees.includes(m.id)}
                onChange={e => {
                  const id = parseInt(e.target.value, 10);
                  setSelectedMentees(prev =>
                    prev.includes(id)
                      ? prev.filter(i => i !== id)
                      : [...prev, id]
                  );
                }}
              />
              {m.first_name} {m.last_name}
            </label>
          ))}
        </div>
      </div>

      {errorMessage && <p className="error-text">{errorMessage}</p>}

      <button
        className="assign-btn"
        onClick={assignMentees}
        disabled={loading || !selectedMentor || selectedMentees.length === 0}
      >
        {loading ? 'Assigning...' : 'Assign'}
      </button>
    </div>
    <MentorMenteeDiagram/>
    </>
  );
};

export default AssignPage;
