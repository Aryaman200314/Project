import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import axios from 'axios';
import './Home.css';
import logo from './logo.jpeg';
import Notifications from './Notification/Notifications';
import {
    taskData,
    assignmentData,
    getTaskCompletionRate,
    getAssignmentCompletionRate,
} from './Data/performanceData';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const taskCompletionRate = getTaskCompletionRate();
const assignmentCompletionRate = getAssignmentCompletionRate();

const mentors = [
    {
        id: 1,
        name: 'John Doe',
        designation: 'Senior Developer',
        email: 'john.doe@example.com',
        phone: '1234567890',
        location: 'Noida',
        workMode: 'WFO',
        mentees: ['Aryaman Sharma'],
    },
    {
        id: 2,
        name: 'Jane Smith',
        designation: 'Cloud Architect',
        email: 'jane.smith@example.com',
        phone: '9876543210',
        location: 'Noida',
        workMode: 'WFH',
        mentees: ['Rahul Gupta', 'Anita Mehra'],
    }
];

const Home = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const storedUser = location.state || JSON.parse(localStorage.getItem("user"));

    const [user, setUser] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [selectedMentor, setSelectedMentor] = useState(null);

    useEffect(() => {
        const fetchUserByEmail = async () => {
            try {
                const email = localStorage.getItem("userEmail");
                if (!email) return;
    
                const res = await axios.get(`http://localhost:5000/api/user-by-email/${email}`);
                setUser(res.data);
            } catch (err) {
                console.error("Failed to fetch user by email", err);
            }
        };
    
        fetchUserByEmail();
    }, []);
    

    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate('/login');
    };

    return (
        <div className="home-container">
            {/* Top Bar */}
            <div className="top-bar">
                <h2>Dashboard <span className='mentee-small'>Mentee</span></h2>
                <img src={logo} className='logo-img' alt="CK_logo" />
                <div className="user-icon-wrapper">
                    <FaUserCircle className="user-icon" size={30} onClick={() => setShowPopup(true)} />
                </div>
            </div>

            {/* User Popup */}
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

            {/* Mentor Modal */}
            {selectedMentor && (
                <div className="popup-overlay" onClick={() => setSelectedMentor(null)}>
                    <div className="popup-content" onClick={e => e.stopPropagation()}>
                        <h3 className='name-popup'>{selectedMentor.name}</h3>
                        <hr />
                        <p><strong>Designation:</strong> {selectedMentor.designation}</p>
                        <p><strong>Email:</strong> {selectedMentor.email}</p>
                        <p><strong>Phone:</strong> {selectedMentor.phone}</p>
                        <p><strong>Location:</strong> {selectedMentor.location}</p>
                        <p><strong>Work Mode:</strong> {selectedMentor.workMode}</p>
                        <p><strong>Mentees:</strong> {selectedMentor.mentees.join(', ')}</p>
                        <button className="close-button" onClick={() => setSelectedMentor(null)}>Close</button>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="home-content">
                {/* Sidebar - Mentor List */}
                <div className="sidebar">
                    <h3>Mentors</h3>
                    {mentors.map((mentor) => (
                        <div key={mentor.id} className="mentor-item" onClick={() => setSelectedMentor(mentor)}>
                            <div className="mentor-hover">
                                <div className="mentor-info">
                                    <p><strong>{mentor.name}</strong></p>
                                    <p>{mentor.email}</p>
                                    <hr />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Area */}
                <div className="main-area">
                <h1> <span className='hi-username'>Hi, </span><span className='mentee-name'>{user?.name || "Username not found"}</span></h1>
                    <div className='grid-btn'>
                        <button onClick={() => navigate('/upload-task')} className="action-btn">Upload Task</button>
                        <button onClick={() => navigate('/assignment-upload')} className="action-btn">Upload Assignment</button>
                        <button onClick={() => navigate('/timeline')} className="action-btn">Check Timeline</button>
                        <button onClick={() => navigate('/view-records')} className="action-btn">View Records</button>
                        <button onClick={() => navigate('/contact-mentor')} className="action-btn">Contact Mentor</button>
                        <button onClick={() => navigate('/analysis')} className="action-btn">Analysis</button>
                    </div>

                    {/* Completion Overview */}
                    <div className="w-full max-w-4xl mt-6 bg-white p-6 rounded-lg shadow-md">
                        <div className="completion-overview">
                            <h2 className="text-xl font-bold mb-4">Completion Overview</h2>
                            <hr />
                            <div className="charts-container">
                                <div className="chart-item">
                                    <h3 className="text-lg font-semibold mb-2">Task Completion</h3>
                                    <PieChart width={200} height={200}>
                                        <Pie
                                            data={[
                                                { name: 'Completed', value: taskData.completed },
                                                { name: 'Pending', value: taskData.pending },
                                            ]}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={70}
                                            label
                                            dataKey="value"
                                        >
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
                                        <Pie
                                            data={[
                                                { name: 'Completed', value: assignmentData.completed },
                                                { name: 'Pending', value: assignmentData.pending },
                                            ]}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={70}
                                            label
                                            dataKey="value"
                                        >
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

                {/* Right Sidebar - Notifications */}
                <div className='sidebar-right'>
                    <Notifications />
                </div>
            </div>
        </div>
    );
};

export default Home;




