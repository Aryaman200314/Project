import React, { useState } from 'react';
import './AdminAccountApprovalPopup.css';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminAccountApprovalPopup = ({ request, onClose, refreshRequests }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    location: '',
    designation: '',
    work_mode: 'WFH',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleApprove = async () => {
    try {
      await axios.post(`http://localhost:5000/api/admin/account-request/${request.id}/approve`, {
        ...formData,
      });
      toast.success('Account created successfully');
      onClose();
      refreshRequests();
    } catch (error) {
      toast.error('Failed to approve account');
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-box">
        <h3>Approve Account for {request.email} ({request.role})</h3>

        <input name="first_name" placeholder="First Name" onChange={handleChange} />
        <input name="last_name" placeholder="Last Name" onChange={handleChange} />
        <input name="phone" placeholder="Phone" onChange={handleChange} />
        <input name="location" placeholder="Location" onChange={handleChange} />
        <input name="designation" placeholder="Designation" onChange={handleChange} />
        <select name="work_mode" value={formData.work_mode} onChange={handleChange}>
          <option value="WFH">WFH</option>
          <option value="WFO">WFO</option>
          <option value="Hybrid">Hybrid</option>
        </select>

        <div className="popup-actions">
          <button onClick={handleApprove}>Approve</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default AdminAccountApprovalPopup;
