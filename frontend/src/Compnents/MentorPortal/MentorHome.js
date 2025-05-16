import React, { useState } from 'react';
import './MentorHome.css';
import { FaUserCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import MentorNotifications from './Notification/MentorNotifications';
import {
    taskData,
    assignmentData,
    getTaskCompletionRate,
    getAssignmentCompletionRate,
} from '../Data/performanceData';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import logo from '../logo.jpeg'
const taskCompletionRate = getTaskCompletionRate();
const assignmentCompletionRate = getAssignmentCompletionRate();

// Sample Mentor Data
const mentors = [
    {
        id: 1,
        name: 'Aryaman sharma',
        designation: 'Devops Trainee',
        email: 'aryaman@example.com',
        phone: '1234567890',
        // image: '/images/john.jpg',
        location: 'Noida',
        workMode: 'WFO',
    },
    // {
    //     id: 2,
    //     name: 'Jane Smith',
    //     designation: 'Cloud Architect',
    //     email: 'jane.smith@example.com',
    //     phone: '9876543210',
    //     // image: '/images/jane.jpg',
    //     location: 'Noida',
    //     workMode: 'WFH',
    //     mentees: ['Rahul Gupta', 'Anita Mehra']
    // }
];
// Dummy values - replace with dynamic data


const MentorHome = () => {
    const navigate = useNavigate();
    const [showPopup, setShowPopup] = useState(false);
    const [selectedMentor, setSelectedMentor] = useState(null);

    const handleLogout = () => {
        navigate('/login');
    };

    const user = {
        name: 'Mentor',
        email: 'Mentor@example.com',
    };

    // const handleView = () => { 
    //     navigate('/analysis');
    // }

    return (
        <>
            <div className="home-container">
                {/* Top Bar */}
                <div className="top-bar">
                    <h2>Dashboard</h2>
                    <img src= {logo} className='logo-img' alt="CK_logo" />

                    <div className="user-icon-wrapper">
                        <FaUserCircle className="user-icon" size={30} onClick={() => setShowPopup(true)} />
                    </div>
                </div>

                {/* User Popup */}
                {showPopup && (
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
                            <img src={selectedMentor.image} alt={selectedMentor.name} className="mentor-img-large" />
                            <h3 className='name-popup'>{selectedMentor.name}</h3>
                            <hr/>
                            <p><strong>Designation:</strong> {selectedMentor.designation}</p>
                            <p><strong>Email:</strong> {selectedMentor.email}</p>
                            <p><strong>Phone:</strong> {selectedMentor.phone}</p>
                            <p><strong>Location:</strong> {selectedMentor.location}</p>
                            <p><strong>Work Mode:</strong> {selectedMentor.workMode}</p>
                            {/* <p><strong>Mentees:</strong> {selectedMentor.mentees.join(', ')}</p> */}
                            <button className="close-button" onClick={() => setSelectedMentor(null)}>Close</button>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="home-content">
                    {/* Sidebar */}
                    <div className="sidebar">
                        <h3>Mentee</h3>
                        {mentors.map((mentor) => (
                            <div
                                key={mentor.id}
                                className="mentor-item"
                                onClick={() => setSelectedMentor(mentor)}
                            >
                                <div className="mentor-hover">
                                    {/* <img src={mentor.image} alt={mentor.name} className="mentor-img" /> */}
                                    <div className="mentor-info">
                                        <p><strong>{mentor.name}</strong></p>
                                        {/* <p>{mentor.designation}</p> */}
                                        <p>{mentor.email}</p>
                                        {/* <p>{mentor.phone}</p> */}
                                        <hr/>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Main Area */}
                    <div className="main-area">
                        <h1>
                            Hi,&nbsp;<span className="user-name">{user.name}</span>
                        </h1>
                        <div className='grid-btn'>
                            <button onClick={() => navigate('/mentor/task')} className="action-btn">
                                Task
                            </button>
                            <button onClick={() => navigate('/mentor/assignment')} className="action-btn">
                                 Assignment
                            </button>
                            <button onClick={() => navigate('/timeline')} className="action-btn">
                                Check Timeline
                            </button>
                            <button onClick={() => navigate('/mentor/approve')} className="action-btn">
                                View Records
                            </button>
                            <button onClick={() => navigate('/contant-mentee')} className='action-btn'>
                                Contact Mentee
                            </button>
                            <button onClick={() => navigate('/analysis')} className='action-btn'>
                                Analysis
                            </button>
                        </div>
                        {/* Completion Charts */}
                        {/* Completion Charts */}
                        <div className="w-full max-w-4xl mt-6 bg-white p-6 rounded-lg shadow-md">
                            {/* Completion Charts */}
                            <div className="completion-overview">
                                <h2 className="text-xl font-bolder mb-4">Completion Overview</h2>
                                <hr/>

                                <div className="charts-container">
                                    {/* Task Completion */}
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

                                    {/* Assignment Completion */}
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
                    <div className='sidebar-right'>
                        <MentorNotifications />
                    </div>





                </div>
            </div>



        </>
    );
};

export default MentorHome;

