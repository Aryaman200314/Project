// ✅ server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connection = require('./db');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// ✅ Login API
app.post('/api/auth/login', (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ message: 'Email, password, and role are required' });
  }

  if (role !== 'mentor' && role !== 'mentee') {
    return res.status(400).json({ message: 'Invalid role' });
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

// ✅ Fetch user by email
app.get("/api/user-by-email/:email", (req, res) => {
  const email = req.params.email;
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

// ✅ Admin login
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

// ✅ Fetch all mentors
app.get('/api/mentors', (req, res) => {
  connection.query('SELECT * FROM mentors', (err, results) => {
    if (err) return res.status(500).json({ message: 'DB error' });
    res.status(200).json(results);
  });
});

// ✅ Fetch all mentees
app.get('/api/mentees', (req, res) => {
  connection.query('SELECT * FROM mentees', (err, results) => {
    if (err) return res.status(500).json({ message: 'DB error' });
    res.status(200).json(results);
  });
});

// ✅ Get assignments
app.get('/api/assignments', (req, res) => {
  const query = `
    SELECT mm.id AS assignment_id,
           mentors.id AS mentor_id,
           CONCAT(mentors.first_name, ' ', mentors.last_name) AS mentor_name,
           mentees.id AS mentee_id,
           CONCAT(mentees.first_name, ' ', mentees.last_name) AS mentee_name
    FROM mentor_mentee mm
    JOIN mentors ON mm.mentor_id = mentors.id
    JOIN mentees ON mm.mentee_id = mentees.id
  `;

  connection.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: 'Failed to fetch assignments' });
    res.json(results);
  });
});

// ✅ Assign mentee to mentor
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
      return res.status(500).json({ message: 'Assignment failed', error: err });
    }
    res.status(200).json({ message: 'Mentee assigned successfully' });
  });
});

// ✅ Unassign mentee from mentor
app.post('/api/unassign', (req, res) => {
  const { mentorId, menteeId } = req.body;

  if (!mentorId || !menteeId) {
    return res.status(400).json({ message: 'mentorId and menteeId are required' });
  }

  const query = `DELETE FROM mentor_mentee WHERE mentor_id = ? AND mentee_id = ?`;
  connection.query(query, [mentorId, menteeId], (err) => {
    if (err) return res.status(500).json({ message: 'Failed to unassign' });
    res.json({ message: 'Relation removed' });
  });
});

// ✅ Add mentor (Admin Panel)
app.post('/api/mentors/add', (req, res) => {
  const { first_name, last_name, email, password, designation, phone, location, work_mode } = req.body;

  const sql = `
    INSERT INTO mentors (first_name, last_name, email, password, designation, phone, location, work_mode)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  connection.query(sql, [first_name, last_name, email, password, designation, phone, location, work_mode], (err, result) => {
    if (err) return res.status(500).json({ message: 'Failed to add mentor' });
    res.status(201).json({ message: 'Mentor added successfully' });
  });
});

// mentee add admin page 
// Inside server.js
app.post('/api/mentees/add', (req, res) => {
  const { first_name, last_name, email, password, designation, phone, location, work_mode } = req.body;

  const sql = `
    INSERT INTO mentees (first_name, last_name, email, password, designation, phone, location, work_mode)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  connection.query(sql, [first_name, last_name, email, password, designation, phone, location, work_mode], (err, result) => {
    if (err) {
      console.error("DB insert error:", err);
      return res.status(500).json({ message: 'Failed to add mentee' });
    }
    res.status(201).json({ message: 'Mentee added successfully' });
  });
});


// admin list all user 
app.get('/api/admin/all-users', (req, res) => {
  const mentorsQuery = `
    SELECT id, first_name, last_name, email, phone, location, designation, work_mode, 'mentor' AS role
    FROM mentors
  `;

  const menteesQuery = `
    SELECT id, first_name, last_name, email, phone, location, designation, work_mode, 'mentee' AS role
    FROM mentees
  `;

  connection.query(mentorsQuery, (err, mentorResults) => {
    if (err) return res.status(500).json({ message: 'Failed to fetch mentors' });

    connection.query(menteesQuery, (err2, menteeResults) => {
      if (err2) return res.status(500).json({ message: 'Failed to fetch mentees' });

      const allUsers = [...mentorResults, ...menteeResults];
      res.json(allUsers);
    });
  });
});

// Delete a user by role and ID
app.delete('/api/admin/user/:role/:id', (req, res) => {
  const { role, id } = req.params;
  const table = role === 'mentor' ? 'mentors' : 'mentees';

  connection.query(`DELETE FROM ${table} WHERE id = ?`, [id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Delete failed' });
    res.json({ message: `${role} deleted successfully` });
  });
});

// Update user fields (phone, password, location, designation)
app.put('/api/admin/user/:role/:id', (req, res) => {
  const { role, id } = req.params;
  const { phone, password, location, designation } = req.body;
  const table = role === 'mentor' ? 'mentors' : 'mentees';

  const sql = `
    UPDATE ${table} 
    SET phone = ?, password = ?, location = ?, designation = ? 
    WHERE id = ?
  `;

  connection.query(sql, [phone, password, location, designation, id], (err, result) => {
    if (err) {
      console.error("Update error:", err); // 👈 ADD THIS
      return res.status(500).json({ message: 'Update failed' });
    }

    res.json({ message: 'User updated successfully' });
  });
});

  

// ✅ Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});




























// // ✅ server.js (update login API to also return user name)
// const express = require('express');
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const connection = require('./db');
// // const adminRoutes = require('./routes/admin'); // 👈 import route


// const app = express();
// const PORT = 5000;

// app.use(cors());
// app.use(bodyParser.json());

// // app.use(adminRoutes);


// app.post('/api/auth/login', (req, res) => {
//   const { email, password, role } = req.body;

//   if (!email || !password || !role) {
//     return res.status(400).json({ message: 'Email, password, and role are required' });
//   }

//   if (role !== 'mentor' && role !== 'mentee') {
//     return res.status(400).json({ message: 'Invalid role' });
//   }

//   const table = role === 'mentor' ? 'mentors' : 'mentees';

//   const query = `SELECT * FROM ${table} WHERE email = ? AND password = ?`;
//   connection.query(query, [email, password], (err, results) => {
//     if (err) {
//       console.error('Login error:', err);
//       return res.status(500).json({ message: 'Internal server error' });
//     }

//     if (results.length === 0) {
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }

//     res.status(200).json({
//       message: 'Login successful',
//       role,
//       user: results[0]
//     });
//   });
// });


// // app.post('/api/signup', (req, res) => {
// //     const { firstName, lastName, email, password, role } = req.body;

// //     if (!firstName || !lastName || !email || !password || !role) {
// //         return res.status(400).json({ message: 'All fields are required' });
// //     }

// //     if (role !== 'mentor' && role !== 'mentee') {
// //         return res.status(400).json({ message: 'Invalid role selected' });
// //     }

// //     const table = role === 'mentor' ? 'mentors' : 'mentees';

// //     const checkUserQuery = `SELECT * FROM ${table} WHERE email = ?`;
// //     connection.query(checkUserQuery, [email], (err, results) => {
// //         if (err) return res.status(500).json({ message: 'Database error' });

// //         if (results.length > 0) {
// //             return res.status(409).json({ message: 'Email already registered' });
// //         }

// //         const insertUserQuery = `INSERT INTO ${table} (first_name, last_name, email, password) VALUES (?, ?, ?, ?)`;
// //         connection.query(insertUserQuery, [firstName, lastName, email, password], (err) => {
// //             if (err) return res.status(500).json({ message: 'Signup failed' });

// //             res.status(201).json({ message: `${role} registered successfully` });
// //         });
// //     });
// // });


// // ✅ New endpoint: fetch user by email
// app.get("/api/user-by-email/:email", (req, res) => {
//     const email = req.params.email;
//     console.log(email)

//     const queryMentor = "SELECT first_name, last_name, email FROM mentors WHERE email = ?";
//     const queryMentee = "SELECT first_name, last_name, email FROM mentees WHERE email = ?";

//     connection.query(queryMentor, [email], (err, mentorResult) => {
//         if (err) return res.status(500).json({ message: "Server error", error: err });

//         if (mentorResult.length > 0) {
//             const m = mentorResult[0];
//             return res.json({ name: m.first_name + ' ' + m.last_name, email: m.email });
//         }

//         connection.query(queryMentee, [email], (err, menteeResult) => {
//             if (err) return res.status(500).json({ message: "Server error", error: err });

//             if (menteeResult.length > 0) {
//                 const m = menteeResult[0];
//                 return res.json({ name: m.first_name + ' ' + m.last_name, email: m.email });
//             } else {
//                 return res.status(404).json({ message: "User not found" });
//             }
//         });
//     });
// });




// // admin panel
// // login page admin 
// app.post('/api/admin/login', (req, res) => {
//     const { email, password } = req.body;
  
//     if (!email || !password) {
//       return res.status(400).json({ message: 'Email and password are required' });
//     }
  
//     const query = 'SELECT * FROM admins WHERE email = ? AND password = ?';
//     connection.query(query, [email, password], (err, results) => {
//       if (err) return res.status(500).json({ message: 'Database error' });
  
//       if (results.length === 0) {
//         return res.status(401).json({ message: 'Invalid admin credentials' });
//       }
  
//       const admin = results[0];
//       res.status(200).json({ message: 'Login successful', admin });
//     });
//   });
  

// // assign page
// // Get all mentors
// app.get('/api/mentors', (req, res) => {
//     connection.query('SELECT * FROM mentors', (err, results) => {
//       if (err) {
//         console.error("Mentor fetch error:", err); // 👈 this will show the exact SQL issue
//         return res.status(500).json({ message: 'DB error' });
//       }
//       res.status(200).json(results);
//     });
//   });
  
//   // Get all mentees
//   app.get('/api/mentees', (req, res) => {
//     connection.query('SELECT * FROM mentees', (err, results) => {
//       if (err) {
//         console.error("Mentee fetch error:", err);
//         return res.status(500).json({ message: 'DB error' });
//       }
//       res.status(200).json(results);
//     });
//   });
  




  
  
// // ReactFlow diagram data fetch 
// app.get('/api/assignments', (req, res) => {
//     const query = `
//       SELECT 
//         mm.id AS assignment_id,
//         mentors.id AS mentor_id,
//         CONCAT(mentors.first_name, ' ', mentors.last_name) AS mentor_name,
//         mentees.id AS mentee_id,
//         CONCAT(mentees.first_name, ' ', mentees.last_name) AS mentee_name
//       FROM mentor_mentee mm
//       JOIN mentors ON mm.mentor_id = mentors.id
//       JOIN mentees ON mm.mentee_id = mentees.id
//     `;
  
//     connection.query(query, (err, results) => {
//       if (err) {
//         console.error("Assignment fetch error:", err);
//         return res.status(500).json({ message: 'Failed to fetch assignments' });
//       }
  
//       res.json(results);
//     });
//   });


// //metor assign API

//   app.post('/api/assign', (req, res) => {
//     const mentorId = parseInt(req.body.mentorId);
//     const menteeId = parseInt(req.body.menteeId);
  
//     if (!mentorId || !menteeId) {
//       return res.status(400).json({ message: 'mentorId and menteeId are required' });
//     }
  
//     const query = 'INSERT INTO mentor_mentee (mentor_id, mentee_id) VALUES (?, ?)';
//     connection.query(query, [mentorId, menteeId], (err) => {
//       if (err) {
//         if (err.code === 'ER_DUP_ENTRY') {
//           return res.status(409).json({ message: 'This mentee is already assigned to this mentor.' });
//         }
//         console.error("Assignment SQL error:", err);
//         return res.status(500).json({ message: 'Assignment failed', error: err });
//       }
  
//       res.status(200).json({ message: 'Mentee assigned successfully' });
//     });
//   });

//   // Menter mentee flow diagram delete 
//   app.post('/api/unassign', (req, res) => {
//     const { mentorId, menteeId } = req.body;
  
//     if (!mentorId || !menteeId) {
//       return res.status(400).json({ message: 'mentorId and menteeId are required' });
//     }
  
//     const query = `DELETE FROM mentor_mentee WHERE mentor_id = ? AND mentee_id = ?`;
//     connection.query(query, [mentorId, menteeId], (err, results) => {
//       if (err) {
//         console.error("Unassign error:", err);
//         return res.status(500).json({ message: 'Failed to unassign' });
//       }
  
//       res.json({ message: 'Relation removed' });
//     });
//   });
  
//   // admin add mentor API
//   const express = require('express');
//   const router = express.Router();
//   const db = require('../db'); // your DB connection
  
//   router.post('/api/mentors/add', (req, res) => {
//     const { first_name, last_name, email, password, designation, phone, location, work_mode } = req.body;
  
//     const sql = `
//       INSERT INTO mentors (first_name, last_name, email, password, designation, phone, location, work_mode)
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
//     `;
  
//     db.query(sql, [first_name, last_name, email, password, designation, phone, location, work_mode], (err, result) => {
//       if (err) {
//         console.error("DB insert error:", err);
//         return res.status(500).json({ message: 'Failed to add mentor' });
//       }
//       res.status(201).json({ message: 'Mentor added successfully' });
//     });
//   });
  
//   module.exports = router;
  

// app.listen(PORT, () => {
//     console.log(`Server running on http://localhost:${PORT}`);
// });


