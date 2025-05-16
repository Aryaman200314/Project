// src/components/Notifications.js
import React from 'react';
import './Notifications.css';

const Notifications = () => {
  const notifications = [
    'Assignment 1 deadline extended to May 20',
    'Mentor Jane has updated the timeline',
    'Meeting scheduled with John on May 18',
  ];

  return (
    <div className="notifications-sidebar">
      <h3>Notifications</h3>
      <ul className='list-notifications'>
        {notifications.map((note, index) => (
          <li key={index} className="notification-item">{note}</li>
        ))}
      </ul>
      <button className='clearall'>
        Clear All
      </button>
    </div>
  );
};

export default Notifications;
