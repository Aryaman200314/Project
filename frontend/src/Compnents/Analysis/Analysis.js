import React from "react";
import "./Analysis.css";
import {
    PieChart, Pie, Cell,
    BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
    LineChart, Line, Legend
} from "recharts";

const Analysis = () => {
    // Task data
    const taskPerMentorData = [
        { name: "Mentor A", tasks: 10 },
        { name: "Mentor B", tasks: 7 },
        { name: "Mentor C", tasks: 13 },
    ];

    const taskCompletionData = [
        { name: "Completed", value: 65 },
        { name: "Pending", value: 35 },
    ];

    const taskWeeklySubmissionData = [
        { week: "Week 1", submissions: 10 },
        { week: "Week 2", submissions: 15 },
        { week: "Week 3", submissions: 8 },
        { week: "Week 4", submissions: 20 },
    ];

    // Assignment data
    const assignmentPerMentorData = [
        { name: "Mentor A", assignments: 5 },
        { name: "Mentor B", assignments: 9 },
        { name: "Mentor C", assignments: 6 },
    ];

    const assignmentCompletionData = [
        { name: "Completed", value: 55 },
        { name: "Pending", value: 45 },
    ];

    const assignmentWeeklySubmissionData = [
        { week: "Week 1", submitssions: 7 },
        { week: "Week 2", submissions: 11 },
        { week: "Week 3", submissions: 5 },
        { week: "Week 4", submissions: 13 },
    ];

    const COLORS = ["#00C49F", "#FF8042", "#0088FE"];

    return (
        <>
            <div className="top-bar">
                <h2>Analysis</h2>
                </div>
            <div className="analysis-container">
                <h2 className="analysis-title">Mentee Task Performance Analysis</h2>

                <div className="charts-wrapper">
                    <div className="chart-card">
                        <h3 className="chart-title">Tasks Uploaded Per Mentor</h3>
                        <BarChart width={300} height={250} data={taskPerMentorData}>
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
                                data={taskCompletionData}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                label
                                dataKey="value"
                            >
                                {taskCompletionData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </div>

                    <div className="chart-card">
                        <h3 className="chart-title">Weekly Task Submissions</h3>
                        <LineChart width={300} height={250} data={taskWeeklySubmissionData}>
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
                        <BarChart width={300} height={250} data={assignmentPerMentorData}>
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
                                data={assignmentCompletionData}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                label
                                dataKey="value"
                            >
                                {assignmentCompletionData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </div>

                    <div className="chart-card">
                        <h3 className="chart-title">Weekly Assignment Submissions</h3>
                        <LineChart width={300} height={250} data={assignmentWeeklySubmissionData}>
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
