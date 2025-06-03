import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import './Chat.css';

const socket = io('http://localhost:5000');

const ChatApp = ({ userEmail }) => {
  const [mentors, setMentors] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/api/mentee/mentors?email=' + userEmail)
      .then(res => setMentors(res.data));
  }, [userEmail]);

  useEffect(() => {
    if (!selectedMentor) return;

    axios.get(`http://localhost:5000/api/messages/${userEmail}/${selectedMentor.email}`)
      .then(res => setMessages(res.data));

    socket.on(`message:${userEmail}`, (msg) => {
      if (msg.sender === selectedMentor.email) {
        setMessages(prev => [...prev, msg]);
      }
    });

    return () => socket.off(`message:${userEmail}`);
  }, [selectedMentor, userEmail]);

  const sendMessage = () => {
    if (!input.trim() || !selectedMentor) return;

    const msg = { sender: userEmail, receiver: selectedMentor.email, content: input };
    socket.emit('sendMessage', msg);
    setMessages(prev => [...prev, { ...msg, timestamp: new Date() }]);
    setInput('');
  };

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <h3>Mentors</h3>
        {mentors.map((mentor, idx) => (
          <div key={idx} className={`chat-user ${selectedMentor?.email === mentor.email ? 'active' : ''}`}
               onClick={() => setSelectedMentor(mentor)}>
            {mentor.name}
          </div>
        ))}
      </div>

      <div className="chat-main">
        {selectedMentor ? (
          <>
            <div className="chat-header">{selectedMentor.name}</div>
            <div className="chat-messages">
              {messages.map((msg, idx) => (
                <div key={idx} className={`chat-message ${msg.sender === userEmail ? 'sent' : 'received'}`}>
                  {msg.content}
                </div>
              ))}
            </div>
            <div className="chat-input">
              <input
                type="text"
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </>
        ) : (
          <div className="chat-placeholder">Select a mentor to start chatting</div>
        )}
      </div>
    </div>
  );
};

export default ChatApp;
