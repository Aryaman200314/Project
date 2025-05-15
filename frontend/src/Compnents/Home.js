import React from 'react';
import './Home.css';
import { FaUserCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate(); // <--- Add this line

  return (
    <div className="home-container">
      {/* Top Bar */}
      <div className="top-bar">
        <h2>Dashboard</h2>
        <FaUserCircle className="user-icon" size={30} />
      </div>

      <div className="home-content">
        {/* Sidebar */}
        <div className="sidebar">
          <h3>Mentors</h3>
          <p>👤 John Doe</p>
          <p>👤 Jane Smith</p>
        </div>

        {/* Main Area */}
        <div className="main-area">
          <button onClick={() => navigate('/upload-task')} className="action-btn">
            Upload Task
          </button>
          <button onClick={() => navigate('/assignment-upload')} className="action-btn">
            Upload Assignment
            </button>
          <button className="action-btn">Check Timeline</button>
        </div>
      </div>
    </div>
  );
};

export default Home;
