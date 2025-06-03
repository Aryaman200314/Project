import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminAccountRequests.css';
import { toast } from 'react-toastify';

const AdminAccountRequests = () => {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    location: '',
    designation: '',
    work_mode: 'WFH'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRequests();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedRequest(null);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/account-requests');
      setRequests(res.data);
    } catch {
      toast.error('Failed to fetch requests');
    }
  };

  const handleDeny = async (id) => {
    try {
      await axios.post(`http://localhost:5000/api/admin/account-requests/${id}/deny`);
      toast.success('Request denied');
      setRequests(prev => prev.filter(r => r.id !== id));  // 🔁 Remove from UI
    } catch {
      toast.error('Deny failed');
    }
  };
  
  const handleApprove = async () => {
    try {
      await axios.post(`http://localhost:5000/api/admin/account-requests/${selectedRequest.id}/approve`, formData);
      toast.success('User created and request approved');
      setSelectedRequest(null);
      setRequests(prev => prev.filter(r => r.id !== selectedRequest.id));  // 🔁 Remove from UI
    } catch {
      toast.error('Approval failed');
    }
  };
  

  return (
    <div className="account-requests-container">
      <h2>Account Creation Requests</h2>
      {requests.length === 0 ? <p>No pending requests</p> : (
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Requested At</th>
              <th>Approved At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(req => (
              <tr key={req.id}>
                <td>{req.email}</td>
                <td>{req.role}</td>
                <td>{new Date(req.created_at).toLocaleString()}</td>
                <td>{req.approved_at ? new Date(req.approved_at).toLocaleString() : 'Pending'}</td>
                <td>
                  <button onClick={() => setSelectedRequest(req)}>Approve</button>
                  <button onClick={() => handleDeny(req.id)}>Deny</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedRequest && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Approve Account for: <br /> <span style={{ color: '#2c3e50' }}>{selectedRequest.email}</span></h3>
            <p>Role: <strong>{selectedRequest.role}</strong></p>

            {['first_name', 'last_name', 'phone', 'location', 'designation'].map(field => (
              <input
                key={field}
                placeholder={field.replace('_', ' ').toUpperCase()}
                value={formData[field]}
                onChange={e => setFormData({ ...formData, [field]: e.target.value })}
                disabled={loading}
              />
            ))}

            <select
              value={formData.work_mode}
              onChange={e => setFormData({ ...formData, work_mode: e.target.value })}
              disabled={loading}
            >
              <option value="WFH">WFH</option>
              <option value="WFO">WFO</option>
              <option value="Hybrid">Hybrid</option>
            </select>

            <div className="btn-group">
              <button onClick={handleApprove} disabled={loading}>Confirm & Create</button>
              <button onClick={() => setSelectedRequest(null)} disabled={loading}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAccountRequests;
