import React, { useState } from 'react';
import './ContactMentor.css';
import { useNavigate } from 'react-router-dom';

const ContactMentor = () => {
  const [message, setMessage] = useState('');
    const navigate = useNavigate();
  const mentor = {
    name: 'Animesh ',
    email: 'mentor@example.com',
    calendarEmbedUrl:
      'https://calendar.google.com/calendar/embed?src=aryaman.sharma@cloudkeeper.com%40group.calendar.google.com&ctz=Asia%2FKolkata',
  };

  const handleSendMessage = () => {
    if (!message.trim()) return alert('Please enter a message.');
    alert('Message sent to mentor: ' + message);
    setMessage('');
  };

  const handleSendEmail = () => {
    const email = mentor.email;
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`;
    window.open(gmailUrl, '_blank');
  };
  const handleVideoCall = () => {
    alert('Redirecting to video call platform (e.g., Google Meet or Zoom)...');
    // Simulate redirection to meeting (replace with actual logic)
    window.open('https://meet.google.com/', '_blank');
  };

  return (
    <>
     <div className="top-bar">
    <h2>Contact Mentor: {mentor.name}</h2>
</div>
    <div className="contact-mentor-container">

      <div className="contact-options">
        <div className="option-box">
          <h3>Send a Message</h3>
          <textarea
            rows="4"
            placeholder="Type your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button onClick={handleSendMessage}>Send Message</button>
        </div>

        <div className="option-box">
          <h3>Send an Email</h3>
          <p>Email: <strong>{mentor.email}</strong></p>
          <button onClick={handleSendEmail}>Email Mentor</button>
        </div>

        <div className="option-box">
          <h3>Start a Video Call</h3>
          <button onClick={handleVideoCall}>Join Call</button>
        </div>
      </div>

      <div className="calendar-section">
        <h3>Mentor's Calendar (Availability)</h3>
        <iframe
          src={mentor.calendarEmbedUrl}
          style={{ border: 0 }}
          width="1500"
          height="550"
          frameBorder="0"
          scrolling="no"
          title="Mentor Calendar"
        ></iframe>
      </div>
      <button onClick={()=>navigate('/home')} >Back</button>
    </div>
    </>
   
  );
};

export default ContactMentor;



 