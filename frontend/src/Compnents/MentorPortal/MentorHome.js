import React, { useState, useEffect } from 'react';
import './MentorHome.css'
import { FaUserCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MentorNotifications from './Notification/MentorNotifications';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import logo from '../logo.jpeg';

// Example data (replace with real logic if needed)
const taskData = { completed: 3, pending: 1 };
const assignmentData = { completed: 5, pending: 2 };
const getTaskCompletionRate = () =>
  ((taskData.completed / (taskData.completed + taskData.pending)) * 100).toFixed(2);
const getAssignmentCompletionRate = () =>
  ((assignmentData.completed / (assignmentData.completed + assignmentData.pending)) * 100).toFixed(2);

const taskCompletionRate = getTaskCompletionRate();
const assignmentCompletionRate = getAssignmentCompletionRate();

const MentorHome = () => {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [selectedMentee, setSelectedMentee] = useState(null);
  const [user, setUser] = useState(null);
  const [mentees, setMentees] = useState([]);
  const [allMentees, setAllMentees] = useState([]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate('/login');
  };

  useEffect(() => {
    const fetchUserByEmail = async () => {
      try {
        const email = localStorage.getItem("userEmail");
        if (!email) return;
        const res = await axios.get(`http://localhost:5000/api/user-by-email/${email}`);
        setUser(res.data);

        const menteeRes = await axios.get(`http://localhost:5000/api/mentor/mentees?email=${email}`);
        setMentees(menteeRes.data);

      } catch (err) {
        console.error("Failed to fetch user or mentees", err);
      }
      axios.get('http://localhost:5000/api/mentees')
        .then(res => setAllMentees(res.data))
        .catch(err => console.error("Failed to load mentees", err));
    };

    fetchUserByEmail();
  }, []);

  return (
    <div className="mh__container">
      {/* Top Bar */}
      <div className="mh__topbar">
        <div className="mh__dashboard-title">
          <h2>Dashboard <span className='mh__role-tag'>Mentor</span></h2>
        </div>
        <img src={logo} className='mh__logo-img' alt="CK_logo" />
        <div className="mh__user-icon-wrapper">
          <FaUserCircle className="mh__user-icon" size={30} onClick={() => setShowPopup(true)} />
        </div>
      </div>

      {/* User Info Popup */}
      {showPopup && user && (
        <div className="mh__popup-overlay" onClick={() => setShowPopup(false)}>
          <div className="mh__popup-content" onClick={e => e.stopPropagation()}>
            <h3>User Info</h3>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <button className="mh__logout-button" onClick={handleLogout}>Logout</button>
            <button className="mh__close-button" onClick={() => setShowPopup(false)}>Close</button>
          </div>
        </div>
      )}

      {/* Mentee Info Popup */}
      {selectedMentee && (
        <div className="mh__popup-overlay" onClick={() => setSelectedMentee(null)}>
          <div className="mh__popup-content" onClick={e => e.stopPropagation()}>
            <h3 className='mh__name-popup'>{selectedMentee.name} </h3>
            <hr />
            <p><strong>Designation:</strong> {selectedMentee.designation}</p>
            <p><strong>Email:</strong> {selectedMentee.email}</p>
            <p><strong>Phone:</strong> {selectedMentee.phone}</p>
            <p><strong>Location:</strong> {selectedMentee.location}</p>
            <p><strong>Work Mode:</strong> {selectedMentee.workMode}</p>
            <p><strong>Mentors:</strong> {selectedMentee.mentee?.join(',') || "N/A"}</p>
            <button className="mh__close-button" onClick={() => setSelectedMentee(null)}>Close</button>
          </div>
        </div>
      )}

      {/* Layout: Sidebar, Main, Notifications */}
      <div className="mh__layout">
        {/* Sidebar */}
        <div className="mh__sidebar">
          <h3>Mentee</h3>
          <div className="mh__list">
            {mentees.map((mentee) => (
              <div key={mentee.id} className="mh__mentee-item" onClick={() => setSelectedMentee(mentee)}>
                {mentee.name}
              </div>
            ))}
            <button id='chat-button' className="mh__chat-button" onClick={() => navigate('/chat')}>Message Mentee</button>
          </div>
          <hr />
          <h3>All Mentees</h3>
          <div className="mh__list">
            {allMentees.map((mentee, idx) => (
              <div key={idx} className="mh__mentee-item" onClick={() => setSelectedMentee(mentee)}>
                {mentee.first_name} {mentee.last_name}
              </div>
            ))}
          </div>
        </div>

        {/* Main Area */}
        <div className="mh__main-area">
          <h1 className="mh__greeting">Hi, <span className="mh__user-name">{user?.name || "Username not found"}</span></h1>
          <div className='mh__grid-btn'>
            <button onClick={() => navigate('/mentor/task')} className="mh__action-btn">Task</button>
            <button onClick={() => navigate('/mentor/assignment')} className="mh__action-btn">Assignment</button>
            <button onClick={() => navigate('/timeline')} className="mh__action-btn">Check Timeline</button>
            <button onClick={() => navigate('/kanban')} className="mh__action-btn">KanBan</button>
            <button onClick={() => navigate('/contact-mentee')} className="mh__action-btn">Contact Mentee</button>
            <button onClick={() => navigate('/analysis')} className="mh__action-btn">Analysis</button>
          </div>
          <div className="mh__completion-overview">
            <h2>Completion Overview</h2>
            <div className="mh__charts-container">
              <div className="mh__chart-card">
                <h3>Task Completion</h3>
                <PieChart width={190} height={190}>
                  <Pie data={[
                    { name: 'Completed', value: taskData.completed },
                    { name: 'Pending', value: taskData.pending }
                  ]}
                  cx="50%" cy="50%" outerRadius={70} label dataKey="value">
                    <Cell fill="#00C49F" />
                    <Cell fill="#FF8042" />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
                <p className="mh__completed-txt">{taskCompletionRate}% completed</p>
              </div>
              <div className="mh__chart-card">
                <h3>Assignment Completion</h3>
                <PieChart width={190} height={190}>
                  <Pie data={[
                    { name: 'Completed', value: assignmentData.completed },
                    { name: 'Pending', value: assignmentData.pending }
                  ]}
                  cx="50%" cy="50%" outerRadius={70} label dataKey="value">
                    <Cell fill="#8884d8" />
                    <Cell fill="#FFBB28" />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
                <p className="mh__completed-txt">{assignmentCompletionRate}% completed</p>
              </div>
            </div>
            <button className="mh__view-btn" onClick={() => navigate('/analysis')}>View</button>
          </div>
        </div>

        {/* Notification Sidebar */}
        <div className='mh__sidebar-right'>
          <MentorNotifications />
        </div>
      </div>
    </div>
  );
};

export default MentorHome;

