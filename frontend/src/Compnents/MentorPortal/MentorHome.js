import React, { useState, useEffect } from 'react';
import './MentorHome.css';
import { FaUserCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MentorNotifications from './Notification/MentorNotifications';
import {
    taskData,
    assignmentData,
    getTaskCompletionRate,
    getAssignmentCompletionRate,
} from '../Data/performanceData';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import logo from '../logo.jpeg';

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
        <div className="home-container">
            <div className="top-bar">
                <h2>Dashboard <span className='mentor-dashboard'>Mentor</span></h2>
                <img src={logo} className='logo-img' alt="CK_logo" />
                <div className="user-icon-wrapper">
                    <FaUserCircle className="user-icon" size={30} onClick={() => setShowPopup(true)} />
                </div>
            </div>

            {/* User Info Popup */}
            {showPopup && user && (
                <div className="popup-overlay" onClick={() => setShowPopup(false)}>
                    <div className="popup-content" onClick={e => e.stopPropagation()}>
                        <h3>User Info</h3>
                        <p><strong>Name:</strong> {user.name}</p>
                        <p><strong>Email:</strong> {user.email}</p>
                        <button className="logout-button" onClick={handleLogout}>Logout</button>
                        <button className="close-button" onClick={() => setShowPopup(false)}>Close</button>
                    </div>
                </div>
            )}

            {/* Selected Mentee Info Popup */}
            {selectedMentee && (
                <div className="popup-overlay" onClick={() => setSelectedMentee(null)}>
                    <div className="popup-content" onClick={e => e.stopPropagation()}>
                        <h3 className='name-popup'>{selectedMentee.name} </h3>
                        <hr />
                        <p><strong>Designation:</strong> {selectedMentee.designation}</p>
                        <p><strong>Email:</strong> {selectedMentee.email}</p>
                        <p><strong>Phone:</strong> {selectedMentee.phone}</p>
                        <p><strong>Location:</strong> {selectedMentee.location}</p>
                        <p><strong>Work Mode:</strong> {selectedMentee.workMode}</p>
                        <p><strong>Montors:</strong> {selectedMentee.mentee?.join(',') || "N/A"}</p>
                        <button className="close-button" onClick={() => setSelectedMentee(null)}>Close</button>
                    </div>
                </div>
            )}

            <div className="home-content">
                {/* Sidebar */}
                <div className="home-page-sidebar">
                    <h3>Mentee</h3>
                    {mentees.map((mentee) => (
                        <div key={mentee.id} className="mentor-item">
                            <div className="mentor-hover" onClick={() => setSelectedMentee(mentee)}>
                                <div className="mentor-info">
                                    <p><strong>{mentee.name} </strong></p>
                                </div>
                            </div>
                        </div>
                    ))}
                     <button id='chat-button' onClick={() => navigate('/chat')}>Message Mentee</button>
                    <hr />
                    <h3>All Mentees</h3>
                    {allMentees.map((mentee, idx) => (
                        <div key={idx} className="mentor-item" onClick={() => setSelectedMentee(mentee)}>
                            <div className="mentor-hover">
                                <div className="mentor-info">
                                    <p><strong>{mentee.first_name} {mentee.last_name}</strong></p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Area */}
                <div className="main-area">
                    <h1><span className='Hi-mentor'>Hi, </span><span className='user-name'>{user?.name || "Username not found"}</span></h1>
                    <div className='grid-btn'>
                        <button onClick={() => navigate('/mentor/task')} className="action-btn">Task</button>
                        <button onClick={() => navigate('/mentor/assignment')} className="action-btn">Assignment</button>
                        <button onClick={() => navigate('/timeline')} className="action-btn">Check Timeline</button>
                        <button onClick={() => navigate('/kanban')} className="action-btn">KanBan</button>
                        <button onClick={() => navigate('/contact-mentee')} className="action-btn">Contact Mentee</button>
                        <button onClick={() => navigate('/analysis')} className="action-btn">Analysis</button>
                    </div>

                    <div className="w-full max-w-4xl mt-6 bg-white p-6 rounded-lg shadow-md">
                        <div className="completion-overview">
                            <h2 className="text-xl font-bold mb-4">Completion Overview</h2>
                            <hr />
                            <div className="charts-container">
                                <div className="chart-item">
                                    <h3 className="text-lg font-semibold mb-2">Task Completion</h3>
                                    <PieChart width={200} height={200}>
                                        <Pie data={[{ name: 'Completed', value: taskData.completed }, { name: 'Pending', value: taskData.pending }]} cx="50%" cy="50%" outerRadius={70} label dataKey="value">
                                            <Cell fill="#00C49F" />
                                            <Cell fill="#FF8042" />
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                    <p className="text-sm mt-2">{taskCompletionRate}% completed</p>
                                </div>

                                <div className="chart-item">
                                    <h3 className="text-lg font-semibold mb-2">Assignment Completion</h3>
                                    <PieChart width={200} height={200}>
                                        <Pie data={[{ name: 'Completed', value: assignmentData.completed }, { name: 'Pending', value: assignmentData.pending }]} cx="50%" cy="50%" outerRadius={70} label dataKey="value">
                                            <Cell fill="#8884d8" />
                                            <Cell fill="#FFBB28" />
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                    <p className="text-sm mt-2">{assignmentCompletionRate}% completed</p>
                                </div>
                            </div>
                            <button onClick={() => navigate('/analysis')}>View</button>
                        </div>
                    </div>
                </div>

                <div className='sidebar-right'>
                    <MentorNotifications />
                </div>
            </div>
        </div>
    );
};

export default MentorHome;
