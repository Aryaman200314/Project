import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from "recharts";
import "./Analysis.css"; // Make sure to use this new CSS file!

const COLORS = ["#457b9d", "#ffb703", "#43aa8b", "#ef476f", "#118ab2"];

const Analysis = () => {
  const [counts, setCounts] = useState([]);
  const [tasksPerMentee, setTasksPerMentee] = useState([]);
  const [assignmentsPerMentee, setAssignmentsPerMentee] = useState([]);

  // Fetch kanban_counts for completion charts
  useEffect(() => {
    axios.get("http://localhost:5000/api/kanban-counts")
      .then(res => setCounts(res.data))
      .catch(console.error);
  }, []);

  // Fetch tasks/assignments per mentee for the logged-in mentor
  useEffect(() => {
    const mentorEmail = localStorage.getItem("userEmail");
    if (!mentorEmail) return;
    axios
      .get(`http://localhost:5000/api/tasks/per-mentee?mentorEmail=${mentorEmail}`)
      .then(res => setTasksPerMentee(res.data))
      .catch(console.error);

    axios
      .get(`http://localhost:5000/api/assignments/per-mentee?mentorEmail=${mentorEmail}`)
      .then(res => setAssignmentsPerMentee(res.data))
      .catch(console.error);
  }, []);

  // Helper to get kanban counts
  const getCount = (type, status) =>
    counts.find(c => c.type === type && c.status === status)?.count || 0;

  // Dynamic data for pie charts
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

  return (
    <div className="analysis-container">
      <h2 className="analysis-title">Mentee Task Performance Analysis</h2>
      <div className="charts-wrapper">
        {/* Tasks Uploaded Per Mentee for logged-in mentor */}
        <div className="chart-card">
          <h3 className="chart-title">Tasks Uploaded Per Mentee</h3>
          <BarChart width={300} height={230} data={tasksPerMentee}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mentee" fontSize={14}/>
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill={COLORS[0]} radius={[10, 10, 0, 0]} />
          </BarChart>
        </div>
        {/* Task Completion Pie Chart */}
        <div className="chart-card">
          <h3 className="chart-title">Task Completion Rate</h3>
          <PieChart width={250} height={230}>
            <Pie
              data={taskCompletionData}
              cx="50%"
              cy="50%"
              outerRadius={75}
              label
              dataKey="value"
              paddingAngle={5}
            >
              {taskCompletionData.map((entry, idx) => (
                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>
      </div>
      <hr />
      <h2 className="analysis-title assignment-heading">Mentee Assignment Performance Analysis</h2>
      <div className="charts-wrapper">
        {/* Assignments Uploaded Per Mentee for logged-in mentor */}
        <div className="chart-card">
          <h3 className="chart-title">Assignments Uploaded Per Mentee</h3>
          <BarChart width={300} height={230} data={assignmentsPerMentee}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mentee" fontSize={14}/>
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill={COLORS[2]} radius={[10, 10, 0, 0]} />
          </BarChart>
        </div>
        {/* Assignment Completion Pie Chart */}
        <div className="chart-card">
          <h3 className="chart-title">Assignment Completion Rate</h3>
          <PieChart width={250} height={230}>
            <Pie
              data={assignmentCompletionData}
              cx="50%"
              cy="50%"
              outerRadius={75}
              label
              dataKey="value"
              paddingAngle={5}
            >
              {assignmentCompletionData.map((entry, idx) => (
                <Cell key={idx} fill={COLORS[(idx + 2) % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>
      </div>
    </div>
  );
};

export default Analysis;
