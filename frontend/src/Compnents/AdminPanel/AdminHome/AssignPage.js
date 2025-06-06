import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AssignPage.css';
import MentorMenteeDiagram from '../../ReactFlow/MentorMenteeDiagram';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../AdminSidepanel/AdminSidebar';

const AssignPage = () => {
  const [mentors, setMentors] = useState([]);
  const [mentees, setMentees] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState('');
  const [selectedMentees, setSelectedMentees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(Date.now());
  const [refreshCount, setRefreshCount] = useState(0);
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

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
    try {
      setRefreshCount(prev => prev + 1);
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
      setRefreshTrigger(Date.now());  // 🔁 trigger diagram refresh
    } catch (err) {
      setErrorMessage("Assignment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <AdminSidebar/>
      <div className="assign-container">
        <h2 className="title">Assign Mentees to Mentor</h2>
        <hr />
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
          <label>Select Mentee<span className='line-bar'>/</span>Mentees:</label>
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

      <MentorMenteeDiagram refreshTrigger={refreshCount} />
    </>
  );
};

export default AssignPage;
