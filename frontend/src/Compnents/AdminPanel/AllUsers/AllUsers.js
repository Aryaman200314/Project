import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AllUsers.css';
import { toast } from 'react-toastify';

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editData, setEditData] = useState({ phone: '', password: '', location: '', designation: '' });

  // 🛠 Unified filters including search
  const [filters, setFilters] = useState({ role: '', work_mode: '', location: '', search: '' });

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/all-users');
      setUsers(res.data);
    } catch (err) {
      toast.error('Failed to fetch users');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (role, id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/user/${role}/${id}`);
      toast.success(`${role} deleted successfully`);
      fetchUsers();
    } catch {
      toast.error('Delete failed');
    }
  };

  const startEditing = (user) => {
    setEditingUserId(user.id);
    setEditData({
      phone: user.phone,
      password: user.password,
      location: user.location,
      designation: user.designation
    });
  };

  const handleUpdate = async (role, id) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/user/${role}/${id}`, editData);
      toast.success('User updated successfully');
      setEditingUserId(null);
      fetchUsers();
    } catch {
      toast.error('Update failed');
    }
  };

  const clearFilters = () => {
    setFilters({ role: '', work_mode: '', location: '', search: '' });
  };

  const filteredUsers = users.filter(user =>
    (!filters.role || user.role === filters.role) &&
    (!filters.work_mode || user.work_mode === filters.work_mode) &&
    (!filters.location || user.location.toLowerCase() === filters.location.toLowerCase()) &&
    (!filters.search || `${user.first_name} ${user.last_name} ${user.email}`.toLowerCase().includes(filters.search.toLowerCase()))
  );

  return (
    <div className="all-users-container">
      <h2>All Users</h2>
      <hr/>
      {/* 🧠 Filter Bar */}
      <div className="filter-bar">
        <select value={filters.role} onChange={e => setFilters({ ...filters, role: e.target.value })}>
          <option value="">All Roles</option>
          <option value="mentor">Mentor</option>
          <option value="mentee">Mentee</option>
        </select>

        <select value={filters.work_mode} onChange={e => setFilters({ ...filters, work_mode: e.target.value })}>
          <option value="">All Work Modes</option>
          <option value="WFO">WFO</option>
          <option value="WFH">WFH</option>
          <option value="Hybrid">Hybrid</option>
        </select>

        <select value={filters.location} onChange={e => setFilters({ ...filters, location: e.target.value })}>
          <option value="">All Locations</option>
          <option value="Noida">Noida</option>
          <option value="Delhi">Delhi</option>
          <option value="Hyderabad">Hyderabad</option>
        </select>

        <input
          type="text"
          placeholder="Search by name/email"
          value={filters.search}
          onChange={e => setFilters({ ...filters, search: e.target.value })}
        />

        <button className="clear-btn" onClick={clearFilters}>Clear Filters</button>
      </div>

      {/* 📋 Table */}
      <table className="users-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Password</th>
            <th>Location</th>
            <th>Designation</th>
            <th>Work Mode</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map(user => (
            <tr key={user.role + '-' + user.id}>
              <td>{user.first_name} {user.last_name}</td>
              <td style={{ color: user.role === 'mentor' ? 'blue' : 'green' }}>{user.role}</td>
              <td>{user.email}</td>
              <td>
                {editingUserId === user.id ? (
                  <input value={editData.phone} onChange={e => setEditData({ ...editData, phone: e.target.value })} />
                ) : user.phone}
              </td>
              <td>
                {editingUserId === user.id ? (
                  <input value={editData.password} onChange={e => setEditData({ ...editData, password: e.target.value })} />
                ) : user.password}
              </td>
              <td>
                {editingUserId === user.id ? (
                  <select value={editData.location} onChange={e => setEditData({ ...editData, location: e.target.value })}>
                    <option value="Noida">Noida</option>
                    <option value="Delhi">Delhi</option>
                  </select>
                ) : user.location}
              </td>
              <td>
                {editingUserId === user.id ? (
                  <input value={editData.designation} onChange={e => setEditData({ ...editData, designation: e.target.value })} />
                ) : user.designation}
              </td>
              <td>{user.work_mode}</td>
              <td>
                {editingUserId === user.id ? (
                  <>
                    <button onClick={() => handleUpdate(user.role, user.id)}>Save</button>
                    <button onClick={() => setEditingUserId(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEditing(user)}>Edit</button>
                    <button onClick={() => handleDelete(user.role, user.id)}>Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AllUsers;
