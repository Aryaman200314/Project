import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './AdminSidebar.css';

const AdminSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <button className="toggle-btn" onClick={() => setCollapsed(!collapsed)}>
        {collapsed ? '☰' : '✖'}
      </button>

      {!collapsed && (
        <ul className="menu">
          <li><Link to="/admin/dashboard">Dashboard</Link></li>
          <li><Link to="/admin/add/mentor">Add Mentor</Link></li>
          <li><Link to="/admin/add/mentee">Add Mentee</Link></li>
          <li><Link to="/admin/all/users">All Users</Link></li>
          <li><Link to="/admin/user/add/requests">Account Requests</Link></li>
        </ul>
      )}
    </div>
  );
};

export default AdminSidebar;
