// ✅ server.js (update login API to also return user name)
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

        const user = results[0];
        const name = user.first_name + ' ' + user.last_name;

        res.status(200).json({
            message: 'Login successful',
            role,
            user: {
                email: user.email,
                name,
                role
            }
        });
    });
});

app.post('/api/signup', (req, res) => {
    const { firstName, lastName, email, password, role } = req.body;

    if (!firstName || !lastName || !email || !password || !role) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    if (role !== 'mentor' && role !== 'mentee') {
        return res.status(400).json({ message: 'Invalid role selected' });
    }

    const table = role === 'mentor' ? 'mentors' : 'mentees';

    const checkUserQuery = `SELECT * FROM ${table} WHERE email = ?`;
    connection.query(checkUserQuery, [email], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error' });

        if (results.length > 0) {
            return res.status(409).json({ message: 'Email already registered' });
        }

        const insertUserQuery = `INSERT INTO ${table} (first_name, last_name, email, password) VALUES (?, ?, ?, ?)`;
        connection.query(insertUserQuery, [firstName, lastName, email, password], (err) => {
            if (err) return res.status(500).json({ message: 'Signup failed' });

            res.status(201).json({ message: `${role} registered successfully` });
        });
    });
});


// ✅ New endpoint: fetch user by email
app.get("/api/user-by-email/:email", (req, res) => {
    const email = req.params.email;
    console.log(email)

    const queryMentor = "SELECT first_name, last_name, email FROM mentors WHERE email = ?";
    const queryMentee = "SELECT first_name, last_name, email FROM mentees WHERE email = ?";

    connection.query(queryMentor, [email], (err, mentorResult) => {
        if (err) return res.status(500).json({ message: "Server error", error: err });

        if (mentorResult.length > 0) {
            const m = mentorResult[0];
            return res.json({ name: m.first_name + ' ' + m.last_name, email: m.email });
        }

        connection.query(queryMentee, [email], (err, menteeResult) => {
            if (err) return res.status(500).json({ message: "Server error", error: err });

            if (menteeResult.length > 0) {
                const m = menteeResult[0];
                return res.json({ name: m.first_name + ' ' + m.last_name, email: m.email });
            } else {
                return res.status(404).json({ message: "User not found" });
            }
        });
    });
});




// admin panel
// login page admin 
app.post('/api/admin/login', (req, res) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
  
    const query = 'SELECT * FROM admins WHERE email = ? AND password = ?';
    connection.query(query, [email, password], (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error' });
  
      if (results.length === 0) {
        return res.status(401).json({ message: 'Invalid admin credentials' });
      }
  
      const admin = results[0];
      res.status(200).json({ message: 'Login successful', admin });
    });
  });
  

// assign page
// Get all mentors
app.get('/api/mentors', (req, res) => {
    connection.query('SELECT * FROM mentors', (err, results) => {
      if (err) {
        console.error("Mentor fetch error:", err); // 👈 this will show the exact SQL issue
        return res.status(500).json({ message: 'DB error' });
      }
      res.status(200).json(results);
    });
  });
  
  // Get all mentees
  app.get('/api/mentees', (req, res) => {
    connection.query('SELECT * FROM mentees', (err, results) => {
      if (err) {
        console.error("Mentee fetch error:", err);
        return res.status(500).json({ message: 'DB error' });
      }
      res.status(200).json(results);
    });
  });
  



  app.post('/api/assign', (req, res) => {
    const mentorId = parseInt(req.body.mentorId);
    const menteeId = parseInt(req.body.menteeId);
  
    if (!mentorId || !menteeId) {
      return res.status(400).json({ message: 'mentorId and menteeId are required' });
    }
  
    const query = 'INSERT INTO mentor_mentee (mentor_id, mentee_id) VALUES (?, ?)';
    connection.query(query, [mentorId, menteeId], (err) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ message: 'This mentee is already assigned to this mentor.' });
        }
        console.error("Assignment SQL error:", err);
        return res.status(500).json({ message: 'Assignment failed', error: err });
      }
  
      res.status(200).json({ message: 'Mentee assigned successfully' });
    });
  });
  
  
// ReactFlow diagram data fetch 
app.get('/api/assignments', (req, res) => {
    const query = `
      SELECT 
        mm.id AS assignment_id,
        mentors.id AS mentor_id,
        CONCAT(mentors.first_name, ' ', mentors.last_name) AS mentor_name,
        mentees.id AS mentee_id,
        CONCAT(mentees.first_name, ' ', mentees.last_name) AS mentee_name
      FROM mentor_mentee mm
      JOIN mentors ON mm.mentor_id = mentors.id
      JOIN mentees ON mm.mentee_id = mentees.id
    `;
  
    connection.query(query, (err, results) => {
      if (err) {
        console.error("Assignment fetch error:", err);
        return res.status(500).json({ message: 'Failed to fetch assignments' });
      }
  
      res.json(results);
    });
  });
  
  

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// ✅ Home.js remains the same (already calling /user-by-email/:email)
// ✅ LoginForm.js: update localStorage to store "user" object
// Inside handleSubmit()

// Replace this:
// localStorage.setItem("userEmail", formData.email);

// With this:
// localStorage.setItem("userEmail", formData.email);

// localStorage.setItem("user", JSON.stringify(user));
