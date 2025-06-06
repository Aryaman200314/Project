import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import axios from 'axios';
import './Home.css';
import logo from './logo.jpeg';
import Notifications from './Notification/Notifications';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import {
    taskData,
    assignmentData,
    getTaskCompletionRate,
    getAssignmentCompletionRate,
} from './Data/performanceData';


const taskCompletionRate = getTaskCompletionRate();
const assignmentCompletionRate = getAssignmentCompletionRate();
const COLORS = ["#457b9d", "#ffb703", "#43aa8b", "#ef476f", "#118ab2"];



const Home = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const storedUser = location.state || JSON.parse(localStorage.getItem("user"));

    const [user, setUser] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [selectedMentor, setSelectedMentor] = useState(null);
    const [mentors, setMentors] = useState([]);
    const [allMentors, setAllMentors] = useState([]);
    const [kanbanCounts, setKanbanCounts] = useState([]);
    const getCount = (type, status) =>
        kanbanCounts.find(c => c.type === type && c.status === status)?.count || 0;

    const taskCompletionData = [
        { name: "Completed", value: getCount("task", "done") },
        { name: "Pending", value:
            getCount("task", "new") +
            getCount("task", "inprogress") +
            getCount("task", "backlog") +
            getCount("task", "pending") +
            getCount("task", "review")
          }
      ];
      
      const assignmentCompletionData = [
        { name: "Completed", value: getCount("assignment", "done") },
        { name: "Pending", value:
            getCount("assignment", "new") +
            getCount("assignment", "inprogress") +
            getCount("assignment", "backlog") +
            getCount("assignment", "pending") +
            getCount("assignment", "review")
          }
      ];
      
      // Optional: Calculate % completed
      const taskTotal = taskCompletionData[0].value + taskCompletionData[1].value;
      const assignmentTotal = assignmentCompletionData[0].value + assignmentCompletionData[1].value;
      const taskCompletionRate = taskTotal > 0 ? Math.round((taskCompletionData[0].value / taskTotal) * 100) : 0;
      const assignmentCompletionRate = assignmentTotal > 0 ? Math.round((assignmentCompletionData[0].value / assignmentTotal) * 100) : 0;   

    useEffect(() => {
        const fetchUserByEmail = async () => {
            try {
                const email = localStorage.getItem("userEmail");
                if (!email) return;

                const res = await axios.get(`http://localhost:5000/api/user-by-email/${email}`);
                setUser(res.data);

                // Fetch mentors assigned to this mentee
                const mentorRes = await axios.get(`http://localhost:5000/api/mentee/mentors?email=${email}`);
                setMentors(mentorRes.data);
            } catch (err) {
                console.error("Failed to fetch user or mentors", err);
            }

            axios.get('http://localhost:5000/api/mentors/all')
                .then(res => setAllMentors(res.data))
                .catch(err => console.error("Failed to load mentors", err));
        };

        fetchUserByEmail();
    }, []);

    useEffect(() => {
        axios.get("http://localhost:5000/api/kanban-counts")
          .then(res => setKanbanCounts(res.data))
          .catch(console.error);
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
                        <p><strong>Mentees:</strong> {selectedMentor.mentees?.join(', ') || "N/A"}</p>
                        <button className="close-button" onClick={() => setSelectedMentor(null)}>Close</button>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="home-content">
                {/* Sidebar - Mentor List */}
                <div className="home-page-sidebar">
                    <h3>Mentor</h3>
                    {mentors.map((mentor) => (
                        <>
                        <div key={mentor.id} className="mentor-item" onClick={() => setSelectedMentor(mentor)}>
                            <div className="mentor-hover">
                                <div className="mentor-info">
                                    <p><strong>{mentor.name}</strong></p>
                                    {/* <p>{mentor.email}</p> */}
                                    {/* <hr /> */}
                                </div>
                            </div>
                        </div>
                        <button id='chat-buton' onClick={()=>navigate('/chat')}>Message Mentor</button>
                        </>
                    ))}
                    <hr />
                    <h3>All Mentors</h3>
                    {allMentors.map((mentor, idx) => (
                        <div key={idx} className="mentor-item" onClick={() => setSelectedMentor(mentor)}>
                            <div className="mentor-hover">
                                <div className="mentor-info">
                                    <p><strong>{mentor.name}</strong></p>
                                </div>
                            </div>
                        </div>
                    ))}

                </div>


                {/* Main Area */}
                <div className="main-area">
                    <h1> <span className='hi-username'>Hi, </span><span className='mentee-name'>{user?.name || "Username not found"}</span></h1>
                    <div className='grid-btn'>
                        <button onClick={() => navigate('/upload-task')} className="action-btn">Task</button>
                        <button onClick={() => navigate('/assignment-upload')} className="action-btn">Assignment</button>
                        <button onClick={() => navigate('/timeline')} className="action-btn">Check Timeline</button>
                        <button onClick={() => navigate('/mentee/kanban')} className="action-btn">View Records</button>
                        <button onClick={() => navigate('/contact-mentor')} className="action-btn">Contact Mentor</button>
                        <button onClick={() => navigate('/analysis')} className="action-btn">Analysis</button>
                    </div>

                    {/* Completion Overview */}
                    <div className="w-full max-w-4xl mt-6 bg-white p-6 rounded-lg shadow-md">
                        <div className="completion-overview">
                            <h2 className="text-xl font-bold mb-4">Completion Overview</h2>
                            <hr />
                            <div className="chart-item">
  <h3 className="text-lg font-semibold mb-2">Task Completion</h3>
  <PieChart width={200} height={200}>
    <Pie
      data={taskCompletionData}
      cx="50%"
      cy="50%"
      outerRadius={70}
      label
      dataKey="value"
    >
      <Cell fill={COLORS[0]} />
      <Cell fill={COLORS[1]} />
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
      data={assignmentCompletionData}
      cx="50%"
      cy="50%"
      outerRadius={70}
      label
      dataKey="value"
    >
      <Cell fill={COLORS[2]} />
      <Cell fill={COLORS[3]} />
    </Pie>
    <Tooltip />
    <Legend />
  </PieChart>
  <p className="text-sm mt-2">{assignmentCompletionRate}% completed</p>
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




