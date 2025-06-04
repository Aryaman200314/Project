import React, { useState } from "react";
import "./Analysis.css";
import {
    PieChart, Pie, Cell,
    BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
    LineChart, Line, Legend
} from "recharts";

// Dummy mentees list (replace with your API data)
const assignedMentees = [
    { id: 1, name: "Aryaman Sharma" },
    { id: 2, name: "Anjali Jain" },
];

const menteeData = {
    1: {
        // All the chart data for Aryaman Sharma
        taskPerMentorData: [
            { name: "Mentor A", tasks: 10 },
            { name: "Mentor B", tasks: 7 },
            { name: "Mentor C", tasks: 13 },
        ],
        taskCompletionData: [
            { name: "Completed", value: 65 },
            { name: "Pending", value: 35 },
        ],
        taskWeeklySubmissionData: [
            { week: "Week 1", submissions: 10 },
            { week: "Week 2", submissions: 15 },
            { week: "Week 3", submissions: 8 },
            { week: "Week 4", submissions: 20 },
        ],
        assignmentPerMentorData: [
            { name: "Mentor A", assignments: 5 },
            { name: "Mentor B", assignments: 9 },
            { name: "Mentor C", assignments: 6 },
        ],
        assignmentCompletionData: [
            { name: "Completed", value: 55 },
            { name: "Pending", value: 45 },
        ],
        assignmentWeeklySubmissionData: [
            { week: "Week 1", submissions: 7 },
            { week: "Week 2", submissions: 11 },
            { week: "Week 3", submissions: 5 },
            { week: "Week 4", submissions: 13 },
        ],
    },
    2: {
        // All the chart data for Anjali Jain (dummy data, update with real)
        taskPerMentorData: [
            { name: "Mentor A", tasks: 7 },
            { name: "Mentor B", tasks: 12 },
            { name: "Mentor C", tasks: 9 },
        ],
        taskCompletionData: [
            { name: "Completed", value: 40 },
            { name: "Pending", value: 60 },
        ],
        taskWeeklySubmissionData: [
            { week: "Week 1", submissions: 7 },
            { week: "Week 2", submissions: 9 },
            { week: "Week 3", submissions: 11 },
            { week: "Week 4", submissions: 10 },
        ],
        assignmentPerMentorData: [
            { name: "Mentor A", assignments: 6 },
            { name: "Mentor B", assignments: 4 },
            { name: "Mentor C", assignments: 8 },
        ],
        assignmentCompletionData: [
            { name: "Completed", value: 35 },
            { name: "Pending", value: 65 },
        ],
        assignmentWeeklySubmissionData: [
            { week: "Week 1", submissions: 5 },
            { week: "Week 2", submissions: 8 },
            { week: "Week 3", submissions: 4 },
            { week: "Week 4", submissions: 9 },
        ],
    }
};

const COLORS = ["#00C49F", "#FF8042", "#0088FE"];

const Analysis = () => {
    // Default: first mentee assigned to this mentor
    const [selectedMenteeId, setSelectedMenteeId] = useState(assignedMentees[0].id);

    const mentee = assignedMentees.find(m => m.id === selectedMenteeId);
    const data = menteeData[selectedMenteeId];

    return (
        <>
            <div className="top-bar" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <h2 style={{ marginRight: "1rem" }}>Analysis</h2>
                {/* Show mentee name, and dropdown if more than one */}
                {assignedMentees.length > 1 ? (
                    <select
                        value={selectedMenteeId}
                        onChange={e => setSelectedMenteeId(Number(e.target.value))}
                        style={{
                            fontSize: "1.1rem",
                            padding: "0.3rem 0.7rem",
                            borderRadius: "6px",
                            border: "1px solid #004d99",
                            background: "#f5faff",
                            color: "#004d99",
                            fontWeight: "bold"
                        }}>
                        {assignedMentees.map(m =>
                            <option key={m.id} value={m.id}>{m.name}</option>
                        )}
                    </select>
                ) : (
                    <span style={{ fontSize: "1.3rem", color: "#004d99", fontWeight: "bold" }}>
                        {mentee.name}
                    </span>
                )}
            </div>
            <div className="analysis-container">
                <h2 className="analysis-title">Mentee Task Performance Analysis</h2>

                <div className="charts-wrapper">
                    <div className="chart-card">
                        <h3 className="chart-title">Tasks Uploaded Per Mentor</h3>
                        <BarChart width={300} height={250} data={data.taskPerMentorData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="tasks" fill="#8884d8" />
                        </BarChart>
                    </div>

                    <div className="chart-card">
                        <h3 className="chart-title">Task Completion Rate</h3>
                        <PieChart width={300} height={250}>
                            <Pie
                                data={data.taskCompletionData}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                label
                                dataKey="value"
                            >
                                {data.taskCompletionData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </div>

                    <div className="chart-card">
                        <h3 className="chart-title">Weekly Task Submissions</h3>
                        <LineChart width={300} height={250} data={data.taskWeeklySubmissionData}>
                            <XAxis dataKey="week" />
                            <YAxis />
                            <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="submissions" stroke="#82ca9d" />
                        </LineChart>
                    </div>
                </div>
                <hr />
                <h2 className="analysis-title assignment-heading">Mentee Assignment Performance Analysis</h2>

                <div className="charts-wrapper">
                    <div className="chart-card">
                        <h3 className="chart-title">Assignments Uploaded Per Mentor</h3>
                        <BarChart width={300} height={250} data={data.assignmentPerMentorData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="assignments" fill="#82ca9d" />
                        </BarChart>
                    </div>

                    <div className="chart-card">
                        <h3 className="chart-title">Assignment Completion Rate</h3>
                        <PieChart width={300} height={250}>
                            <Pie
                                data={data.assignmentCompletionData}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                label
                                dataKey="value"
                            >
                                {data.assignmentCompletionData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </div>

                    <div className="chart-card">
                        <h3 className="chart-title">Weekly Assignment Submissions</h3>
                        <LineChart width={300} height={250} data={data.assignmentWeeklySubmissionData}>
                            <XAxis dataKey="week" />
                            <YAxis />
                            <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="submissions" stroke="#8884d8" />
                        </LineChart>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Analysis;
