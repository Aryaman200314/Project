// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connection = require('./db');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());
app.post('/api/auth/login', (req, res) => {
    const { email, password, role } = req.body;

    console.log("Login payload:", req.body); // Debugging

    if (!email || !password || !role) {
        return res.status(400).json({ message: 'Email, password, and role are required' });
    }

    if (role !== 'mentor' && role !== 'mentee') {
        return res.status(400).json({ message: 'Invalid role selected' });
    }

    const table = role === 'mentor' ? 'mentors' : 'mentees';

    const query = `SELECT * FROM ${table} WHERE email = ? AND password = ?`;
    connection.query(query, [email, password], (err, results) => {
        if (err) {
            console.error('Login error:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        res.status(200).json({
            message: 'Login successful',
            role,
            user: results[0]
        });
    });
});

app.post('/api/signup', (req, res) => {
    const { firstName, lastName, email, password, role } = req.body;

    console.log("Signup payload:", req.body); // Debugging

    if (!firstName || !lastName || !email || !password || !role) {
        return res.status(400).json({ message: 'All fields including role are required' });
    }

    if (role !== 'mentor' && role !== 'mentee') {
        return res.status(400).json({ message: 'Invalid role selected' });
    }

    const table = role === 'mentor' ? 'mentors' : 'mentees';

    const checkUserQuery = `SELECT * FROM ${table} WHERE email = ?`;
    connection.query(checkUserQuery, [email], (err, results) => {
        if (err) {
            console.error("DB error:", err);
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length > 0) {
            return res.status(409).json({ message: 'Email already registered' });
        }

        const insertUserQuery = `INSERT INTO ${table} (first_name, last_name, email, password) VALUES (?, ?, ?, ?)`;
        connection.query(insertUserQuery, [firstName, lastName, email, password], (err) => {
            if (err) {
                console.error("Insert error:", err);
                return res.status(500).json({ message: 'Signup failed' });
            }
            res.status(201).json({ message: `${role} registered successfully` });
        });
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});