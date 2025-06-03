import React, { useState } from 'react';
import './AdminRequestModal.css';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminRequestModal = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('mentee'); // default role
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      toast.warn('Please enter both email and password');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/account-request', {
        email,
        password,
        role,
      });

      toast.success('Request sent to admin');
      setSubmitted(true);
    } catch (err) {
      toast.error('Failed to send request');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <button className="close-btn" onClick={onClose}>×</button>

        {!submitted ? (
          <>
            <h3>Request New Account</h3>
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Desired password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
            >
              <option value="mentee">Mentee</option>
              <option value="mentor">Mentor</option>
            </select>

            <button onClick={handleSubmit}>Submit Request</button>
          </>
        ) : (
          <p>Request submitted successfully. Please wait for admin approval.</p>
        )}
      </div>
    </div>
  );
};

export default AdminRequestModal;
