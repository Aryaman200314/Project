import React, { useEffect, useState } from 'react';
import './UploadTask.css';
import axios from 'axios';

const statusOptions = ["All", "Backlog", "Pending", "Review", "Inprogress", "Done"];

const UploadTask = () => {
  const userEmail = localStorage.getItem('userEmail');
  const [tasks, setTasks] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    // Fetch tasks assigned to the user
    axios.get(`http://localhost:5000/api/tasks/by-mentee?email=${userEmail}`)
      .then(res => {
        setTasks(res.data);
        setFiltered(res.data);
      })
      .catch(() => setTasks([]));
  }, [userEmail]);

  useEffect(() => {
    let res = tasks;
    if (status !== 'All') {
      res = res.filter(t => t.status.toLowerCase() === status.toLowerCase());
    }
    if (search) {
      res = res.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));
    }
    setFiltered(res);
    if (res.length > 0 && !selected) setSelected(res[0]);
  }, [tasks, status, search]);

  return (
    <div className="taskpage-root">
      <div className="taskpage-sidebar">
        <h2>Tasks <span className='extra'>Assigned to you</span></h2>
        <div className="taskpage-filters">
          {statusOptions.map(opt => (
            <button
              key={opt}
              className={status === opt ? "active" : ""}
              onClick={() => setStatus(opt)}
            >
              {opt}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search tasks..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="taskpage-search"
        />
        <div className="taskpage-list">
          {filtered.map(task => (
            <div
              className={`taskpage-item ${selected && task.id === selected.id ? "selected" : ""}`}
              key={task.id}
              onClick={() => setSelected(task)}
            >
              <span className="task-title">{task.title}</span>
              <span className={`task-status status-${task.status}`}>{task.status}</span>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="taskpage-empty">No tasks found.</div>
          )}
        </div>
      </div>
      <div className="taskpage-arrow-area">
        {selected && <div className="taskpage-arrow"></div>}
      </div>
      <div className="taskpage-details">
        {selected ? (
          <div className="details-card">
            <h2>{selected.title}</h2>
            <div className="details-row">
              <b>Status:</b>
              <span className={`status-dot status-${selected.status}`}></span>
              <span>{selected.status}</span>
            </div>
            <div className="details-row">
              <b>Description:</b>
              <div className="details-desc">{selected.description}</div>
            </div>
            <div className="details-row">
              <b>Assigned by:</b>
              <span>{selected.mentor_first} {selected.mentor_last}</span>
            </div>
            <div className="details-row">
              <b>Assigned at:</b>
              <span>{new Date(selected.created_at).toLocaleString()}</span>
            </div>

            <div className="details-row">
              <b>Due:</b>
              <span>{new Date(selected.end_time).toLocaleString()}</span>
            </div>
          </div>
        ) : (
          <div className="no-details">Select a task to see details</div>
        )}
      </div>
    </div>
  );
};

export default UploadTask;






// import React, { useEffect, useState } from 'react';
// import './UploadTask.css';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';

// const UploadTask = () => {
//   const userEmail = localStorage.getItem('userEmail');
//   const [mentor, setMentor] = useState('');
//   const [title, setTitle] = useState('');
//   const [description, setDescription] = useState('');
//   const [keywords, setKeywords] = useState('');
//   const [file, setFile] = useState(null);
//   const [mentorOptions, setMentorOptions] = useState([]);
//   const [assignedTasks, setAssignedTasks] = useState([]);
//   const navigate = useNavigate();

//   // Fetch mentor options for datalist
//   useEffect(() => {
//     axios.get('http://localhost:5000/api/mentors/list')
//       .then(res => setMentorOptions(res.data))
//       .catch(err => console.error('Failed to fetch mentors', err));
//   }, []);

//   // Fetch tasks assigned to the logged-in mentee (show latest 5)
//   useEffect(() => {
//     axios.get(`http://localhost:5000/api/tasks/by-mentee?email=${userEmail}`)
//       .then(res => setAssignedTasks(res.data.slice(0, 5)))
//       .catch(err => console.error("Failed to fetch assigned tasks:", err));
//   }, [userEmail]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!file || file.type !== 'application/pdf') {
//       alert('Please upload a valid PDF file.');
//       return;
//     }

//     const formData = new FormData();
//     formData.append('mentor', mentor);
//     formData.append('title', title);
//     formData.append('description', description);
//     formData.append('keywords', keywords);
//     formData.append('email', userEmail); // mentee's email
//     formData.append('file', file);

//     try {
//       const res = await axios.post('http://localhost:5000/api/upload/task', formData);
//       alert(res.data.message || 'Task uploaded successfully');
//       window.location.reload();
//     } catch (err) {
//       console.error('Upload failed:', err);
//       alert('Upload failed. Try again.');
//     }
//   };

//   return (
//     <>
//       <div className="top-bar">
//         <h2>Tasks</h2>
//       </div>

//       <div className="upload-task-page">
//         {/* Timeline Column */}
//         <div className="timeline-container">
//           <h3 className="timeline-title">Timeline <span className="five-days">Latest-5</span></h3>
//           {assignedTasks.length > 0 ? (
//             assignedTasks.map((item, index) => (
//               <div key={index} className="timeline-entry">
//                 <div className="date">{new Date(item.created_at || item.uploaded_at).toLocaleString()}</div>
//                 <div className="title">{item.title}</div>
//                 <div className="desc">
//                   Assigned by: {item.mentor_first || item.mentor_name || item.mentor_email}
//                 </div>
//                 <div className="status">
//                   Status: <b>{item.status?.toUpperCase()}</b>
//                 </div>
//               </div>
//             ))
//           ) : (
//             <p className="no-tasks">No tasks assigned to you yet.</p>
//           )}

//           <div className="timeline-actions">
//             <button className="btn-primary" onClick={() => navigate('/home')}>Back</button>
//             <button className="btn-primary" onClick={() => navigate('/timeline')}>View all submissions</button>
//           </div>
//         </div>

//         {/* Upload Form Column */}
//         <div className="upload-form-container">
//           <h2>Upload Task</h2>
//           <form onSubmit={handleSubmit} className="upload-task-form">
//             <input
//               list="mentor-suggestions"
//               placeholder="Start typing mentor name or email"
//               value={mentor}
//               onChange={(e) => setMentor(e.target.value)}
//               required
//             />
//             <datalist id="mentor-suggestions">
//               {mentorOptions.map(m => (
//                 <option key={m.id} value={m.email}>
//                   {m.name || `${m.first_name} ${m.last_name}`} ({m.email})
//                 </option>
//               ))}
//             </datalist>

//             <input
//               type="text"
//               placeholder="Task Title"
//               value={title}
//               onChange={(e) => setTitle(e.target.value)}
//               required
//             />
//             <textarea
//               placeholder="Task Description"
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//               required
//             ></textarea>
//             <input
//               type="text"
//               placeholder="Keywords (comma separated)"
//               value={keywords}
//               onChange={(e) => setKeywords(e.target.value)}
//               required
//             />
//             <input
//               type="file"
//               accept=".pdf"
//               onChange={(e) => setFile(e.target.files[0])}
//               required
//             />
//             <button type="submit" className="btn-submit">Upload</button>
//           </form>
//         </div>
//       </div>
//     </>
//   );
// };

// export default UploadTask;
