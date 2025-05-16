import React, { useState } from 'react';
import './Mentors.css';
import { mentors } from './mentors';

const Mentors = () => {
  const [selectedMentor, setSelectedMentor] = useState(null);

  return (
    <div className="mentors-container">
      <h2>Our Mentors</h2>
      <div className="mentors-grid">
        {mentors.map((mentor) => (
          <div
            className="mentor-card"
            key={mentor.id}
            onClick={() => setSelectedMentor(mentor)}
          >
            <div className="mentor-hover">
              <img src={mentor.image} alt={mentor.name} />
              <div className="mentor-info">
                <p><strong>{mentor.name}</strong></p>
                <p>{mentor.designation}</p>
                <p>Email: {mentor.email}</p>
                <p>Phone: {mentor.phone}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Popup */}
      {selectedMentor && (
        <div className="mentor-modal">
          <div className="modal-content">
            <span className="close-btn" onClick={() => setSelectedMentor(null)}>&times;</span>
            <img src={selectedMentor.image} alt={selectedMentor.name} />
            <h3>{selectedMentor.name}</h3>
            <p><strong>Designation:</strong> {selectedMentor.designation}</p>
            <p><strong>Email:</strong> {selectedMentor.email}</p>
            <p><strong>Phone:</strong> {selectedMentor.phone}</p>
            <p><strong>Location:</strong> {selectedMentor.location}</p>
            <p><strong>Work Mode:</strong> {selectedMentor.workMode}</p>
            <p><strong>Mentees:</strong> {selectedMentor.mentees.join(', ')}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mentors;
