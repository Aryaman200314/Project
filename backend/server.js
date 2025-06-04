const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connection = require('./db');
const sendEmail = require('./utils/emailService');
const bcrypt = require('bcrypt');
const { uploadTask, uploadAssignment } = require('./middleware/multerConfig');
const fs = require('fs');
const http = require('http');
const socketIo = require('socket.io');
const mysql = require('mysql');
// app.use(express.json()); 
// const mentorEmail = localStorage.getItem("userEmail");


const app = express();
const PORT = 5000;
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: '*' }
});
app.use(cors());
app.use(bodyParser.json());


connection.connect();
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('sendMessage', (msg) => {
    const { sender, receiver, content } = msg;

    connection.query(
      'INSERT INTO messages (sender_email, receiver_email, content) VALUES (?, ?, ?)',
      [sender, receiver, content],
      (err) => {
        if (!err) {
          io.emit(`message:${receiver}`, { sender, content, timestamp: new Date() });
        }
      }
    );
  });
});


app.get('/api/messages/:user1/:user2', (req, res) => {
  const { user1, user2 } = req.params;
  connection.query(
    `SELECT * FROM messages WHERE 
      (sender_email = ? AND receiver_email = ?) 
      OR (sender_email = ? AND receiver_email = ?) 
     ORDER BY timestamp`,
    [user1, user2, user2, user1],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch messages' });
      res.json(results);
    }
  );
});




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

  const query = `SELECT * FROM ${table} WHERE email = ?`;
  connection.query(query, [email], (err, results) => {
    if (err) return res.status(500).json({ message: 'DB error' });
    if (results.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

    const user = results[0];
    if (password !== user.password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.status(200).json({ message: 'Login successful', user });
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

  const query = 'SELECT * FROM admins WHERE email = ?';
  connection.query(query, [email], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    const admin = results[0];

    if (password !== admin.password) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

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


// password reset API posting request to the new table
// POST /api/request-password-reset
app.post('/api/request-password-reset', async (req, res) => {
  const { email, newPassword, role } = req.body;

  if (!email || !newPassword || !role) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const table = role === 'mentor' ? 'mentors' : 'mentees';

  // Check if the email exists
  const checkQuery = `SELECT * FROM ${table} WHERE email = ?`;
  connection.query(checkQuery, [email], (err, result) => {
    if (err) return res.status(500).json({ message: 'Server error' });

    if (result.length === 0) {
      return res.status(404).json({ message: 'Email not found in the database' });
    }

    // Proceed with reset request
    const insertQuery = `
      INSERT INTO password_reset_requests (email, new_password, verification_code, role)
      VALUES (?, ?, ?, ?)
    `;

    connection.query(insertQuery, [email, hashedPassword, verificationCode, role], (insertErr) => {
      if (insertErr) return res.status(500).json({ message: 'Failed to log request' });

      sendEmail(email, 'Your Verification Code', `Your OTP is: ${verificationCode}`);
      sendEmail(
        '200314arya@gmail.com',
        'New Password Reset Request',
        `Password reset request by ${email} (${role}).`
      );

      res.status(200).json({ message: 'Verification code sent to email' });
    });
  });
});



// verify code API
// POST /api/verify-reset-code
app.post('/api/verify-reset-code', (req, res) => {
  const { email, code } = req.body;

  const sql = `
    UPDATE password_reset_requests
    SET is_verified = TRUE
    WHERE email = ? AND verification_code = ? AND is_verified = FALSE
  `;

  connection.query(sql, [email, code], (err, result) => {
    if (err || result.affectedRows === 0) {
      return res.status(400).json({ message: 'Invalid code or already verified' });
    }
    res.json({ message: 'Code verified, awaiting admin approval' });
  });
});


app.post('/api/verify-otp', async (req, res) => {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) return res.status(400).json({ message: 'Missing fields' });

  const query = `
    SELECT * FROM password_reset_requests 
    WHERE email = ? AND verification_code = ? AND is_verified = 0 
    ORDER BY requested_at DESC LIMIT 1
  `;

  connection.query(query, [email, code], async (err, results) => {
    if (err) return res.status(500).json({ message: 'DB error' });
    if (results.length === 0) return res.status(400).json({ message: 'Invalid or expired OTP' });

    const { role } = results[0];
    const table = role === 'mentor' ? 'mentors' : 'mentees';
    const hashed = await bcrypt.hash(newPassword, 10);

    const updatePassword = `UPDATE ${table} SET password = ? WHERE email = ?`;
    connection.query(updatePassword, [hashed, email], (err2) => {
      if (err2) return res.status(500).json({ message: 'Password update failed' });

      const markUsed = `UPDATE password_reset_requests SET is_verified = 1, status = 'approved' WHERE id = ?`;
      connection.query(markUsed, [results[0].id]);
      return res.status(200).json({ message: 'Password updated successfully' });
    });
  });
});




// pending request API
// GET /api/admin/pending-password-requests
app.post('/api/admin/password-request/:id', (req, res) => {
  const { action } = req.body;
  const requestId = req.params.id;
  connection.query(
    'UPDATE password_reset_requests SET status = ? WHERE id = ?',
    ['approved', requestId],
    (updateErr) => {
      if (updateErr) {
        console.error('Failed to mark request approved:', updateErr);
        return res.status(500).json({ message: 'Password updated but request status not saved' });
      }
      res.status(200).json({ message: 'Password updated and request approved' });
    }
  );
})







app.post('/api/request-otp', async (req, res) => {
  const { email, password, type } = req.body;
  if (!email || !type) return res.status(400).json({ message: 'Required fields missing' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  if (type === 'reset') {
    const mentorQuery = `SELECT 'mentor' AS role FROM mentors WHERE email = ?`;
    const menteeQuery = `SELECT 'mentee' AS role FROM mentees WHERE email = ?`;
    const checkQuery = `${mentorQuery} UNION ${menteeQuery}`;

    connection.query(checkQuery, [email, email], async (err, results) => {
      if (err) return res.status(500).json({ message: 'DB error' });
      if (results.length === 0) return res.status(404).json({ message: 'Email not found' });

      const role = results[0].role;
      const hashed = await bcrypt.hash(password, 10);

      const insertSql = `INSERT INTO password_reset_requests (email, new_password, verification_code, role) VALUES (?, ?, ?, ?)`;
      connection.query(insertSql, [email, hashed, otp, role], (err2) => {
        if (err2) return res.status(500).json({ message: 'Failed to store reset request' });
        sendEmail(email, 'Your OTP Code', `Your verification code is: ${otp}`);
        return res.status(200).json({ message: 'OTP sent to email' });
      });
    });

  } else if (type === 'create') {
    const insert = `INSERT INTO account_requests (email, password, role) VALUES (?, ?, 'mentee')`;
    connection.query(insert, [email, password], (err) => {
      if (err) return res.status(500).json({ message: 'Account request failed' });
      sendEmail('admin@example.com', 'New Account Request', `Account creation requested by ${email}`);
      return res.status(200).json({ message: 'Account request sent to admin' });
    });
  }
});







app.post('/api/account-request', (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  const hashed = bcrypt.hashSync(password, 10);
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const sql = `
    INSERT INTO account_requests (email, password_hash, otp, role)
    VALUES (?, ?, ?, ?)
  `;

  connection.query(sql, [email, hashed, otp, role], (err, result) => {
    if (err) {
      console.error('Insert error:', err);
      return res.status(500).json({ message: 'Failed to store request' });
    }

    // ✅ Send mail to admin
    sendEmail(
      '200314arya@gmail.com',
      'New Account Request',
      `An account request has been submitted.\nEmail: ${email}\nRole: ${role}`
    );

    res.status(201).json({ message: 'Request stored and email sent' });
  });
});



// account requests list 
app.get('/api/admin/account-requests', (req, res) => {
  const query = `
  SELECT id, email, role
  FROM account_requests
  WHERE is_verified = 0
  ORDER BY created_at DESC
`;
  ;

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Account requests fetch error:", err);
      return res.status(500).json({ message: "Failed to fetch account requests" });
    }
    res.json(results);
  });
});


// account creation approval request 





// deny 


app.post('/api/admin/create-user', (req, res) => {
  const { email, first_name, last_name, phone, location, work_mode, designation, role } = req.body;

  const getQuery = `SELECT password_hash FROM account_requests WHERE email = ?`;
  connection.query(getQuery, [email], (err, rows) => {
    if (err || rows.length === 0) return res.status(400).json({ message: 'No request found' });

    const password = rows[0].password_hash;
    const insert = `
      INSERT INTO ${role === 'mentor' ? 'mentors' : 'mentees'}
      (first_name, last_name, email, password, designation, phone, location, work_mode)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    connection.query(insert, [first_name, last_name, email, password, designation, phone, location, work_mode], (err2) => {
      if (err2) return res.status(500).json({ message: 'Failed to create user' });

      // Optionally mark request complete
      connection.query(`DELETE FROM account_requests WHERE email = ?`, [email]);
      sendEmail(email, 'Account Approved', 'Your account has been created. You can now log in.');
      res.status(200).json({ message: 'User created successfully' });
    });
  });
});



//admin page account creation request 
app.get('/api/admin/account-requests', (req, res) => {
  const query = `SELECT * FROM account_requests WHERE status = 'pending' ORDER BY created_at DESC`;

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Fetch error:', err);
      return res.status(500).json({ message: 'Failed to fetch account requests' });
    }
    res.json(results);
  });
});


// admin account creation deny request
app.post('/api/admin/account-requests/:id/deny', (req, res) => {
  const { id } = req.params;

  const denySql = 'UPDATE account_requests SET approved = 0, is_verified = 0 WHERE id = ?';

  connection.query(denySql, [id], (err) => {
    if (err) {
      console.error('Deny error:', err);
      return res.status(500).json({ message: 'Deny failed' });
    }

    res.json({ message: 'Account request denied' });
  });
});



// admin approve and insert in table 
app.post('/api/admin/account-requests/:id/approve', (req, res) => {
  const requestId = req.params.id;
  const {
    first_name,
    last_name,
    phone,
    designation,
    location,
    work_mode
  } = req.body;

  // Step 1: Get the request
  const getRequest = `SELECT * FROM account_requests WHERE id = ? AND status = 'pending'`;

  connection.query(getRequest, [requestId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ message: 'Account request not found or already processed' });
    }

    const request = results[0];
    const { email, password_hash, role } = request;
    const targetTable = role === 'mentor' ? 'mentors' : 'mentees';

    // Step 2: Insert into respective table
    const insertUser = `
      INSERT INTO ${targetTable} 
      (first_name, last_name, email, password, phone, location, designation, work_mode)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      first_name,
      last_name,
      email,
      password_hash, // already hashed/stored safely
      phone,
      location,
      designation,
      work_mode
    ];

    connection.query(insertUser, values, (insertErr) => {
      if (insertErr) {
        console.error('Insert error:', insertErr);
        return res.status(500).json({ message: 'Failed to add user' });
      }

      // Step 3: Mark request as approved
      const updateRequest = `UPDATE account_requests SET status = 'approved', approved_at = NOW() WHERE id = ?`;
      connection.query(updateRequest, [requestId], (updateErr) => {
        if (updateErr) {
          console.error('Update error:', updateErr);
          return res.status(500).json({ message: 'User added but failed to update request' });
        }

        res.json({ message: 'User created and request approved' });
      });
    });
  });
});






// MENTEE HOME PAGE GET ALL THE MENTORS 
// Get all the mentors 
// In Express backend
// Assuming you have already setup your db connection like:
// const db = require('./db'); // or wherever your connection pool is

app.get('/api/mentee/mentors', (req, res) => {
  const email = req.query.email;
  if (!email) return res.status(400).json({ error: "Email is required" });

  // Step 1: Get mentee ID
  connection.query('SELECT id FROM mentees WHERE email = ?', [email], (err, menteeResults) => {
    if (err) {
      console.error("Error getting mentee:", err);
      return res.status(500).json({ error: "Server error" });
    }

    if (menteeResults.length === 0)
      return res.status(404).json({ error: "Mentee not found" });

    const menteeId = menteeResults[0].id;

    // Step 2: Get mentor IDs assigned to this mentee
    connection.query('SELECT mentor_id FROM mentor_mentee WHERE mentee_id = ?', [menteeId], (err, linkResults) => {
      if (err) {
        console.error("Error getting mentor links:", err);
        return res.status(500).json({ error: "Server error" });
      }

      if (linkResults.length === 0) return res.json([]); // No mentors

      const mentorIds = linkResults.map(row => row.mentor_id);
      const placeholders = mentorIds.map(() => '?').join(',');

      // Step 3: Get full mentor details
      connection.query(
        `SELECT id, first_name, last_name, email, phone, location, designation, work_mode FROM mentors WHERE id IN (${placeholders})`,
        mentorIds,
        (err, mentorResults) => {
          if (err) {
            console.error("Error getting mentors:", err);
            return res.status(500).json({ error: "Server error" });
          }

          const formatted = mentorResults.map(m => ({
            id: m.id,
            name: `${m.first_name} ${m.last_name}`,
            email: m.email,
            phone: m.phone,
            location: m.location,
            designation: m.designation,
            workMode: m.work_mode
          }));

          res.json(formatted);
        }
      );
    });
  });
});



// mentor portal mentee assigned mentees
app.get('/api/mentor/mentees', (req, res) => {
  const email = req.query.email;
  if (!email) return res.status(400).json({ error: "Email is required" });

  // Step 1: Get mentor ID from email
  connection.query('SELECT id FROM mentors WHERE email = ?', [email], (err, mentorResults) => {
    if (err) {
      console.error("Error getting mentor:", err);
      return res.status(500).json({ error: "Server error" });
    }

    if (mentorResults.length === 0)
      return res.status(404).json({ error: "Mentor not found" });

    const mentorId = mentorResults[0].id;

    // Step 2: Get mentee IDs assigned to this mentor
    connection.query('SELECT mentee_id FROM mentor_mentee WHERE mentor_id = ?', [mentorId], (err, linkResults) => {
      if (err) {
        console.error("Error getting mentee links:", err);
        return res.status(500).json({ error: "Server error" });
      }

      if (linkResults.length === 0) return res.json([]); // No mentees

      const menteeIds = linkResults.map(row => row.mentee_id);
      const placeholders = menteeIds.map(() => '?').join(',');

      // Step 3: Get full mentee details
      connection.query(
        `SELECT id, first_name, last_name, email, phone, location, designation, work_mode 
         FROM mentees WHERE id IN (${placeholders})`,
        menteeIds,
        (err, menteeResults) => {
          if (err) {
            console.error("Error getting mentees:", err);
            return res.status(500).json({ error: "Server error" });
          }

          const formatted = menteeResults.map(m => ({
            id: m.id,
            name: `${m.first_name} ${m.last_name}`,
            email: m.email,
            phone: m.phone,
            location: m.location,
            designation: m.designation,
            workMode: m.work_mode
          }));

          res.json(formatted);
        }
      );
    });
  });
});




//UPLOADS
// Task Upload
app.post('/api/upload/task', uploadTask.single('file'), (req, res) => {
  const file = req.file;
  const { mentor, title, description, keywords, email } = req.body;

  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Store task details in MySQL
  connection.query(
    `INSERT INTO task_uploads 
     (mentee_email, mentor_email, title, description, keywords, filename, filepath) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      email,
      mentor,
      title,
      description,
      keywords,
      file.originalname,
      file.path
    ],
    (err) => {
      if (err) {
        console.error('DB Insert Error:', err);
        return res.status(500).json({ error: 'Failed to save task in database' });
      }
      res.json({ message: 'Task uploaded successfully' });
    }
  );
});


// Assignment Upload
app.post('/api/upload/assignment', uploadAssignment.single('file'), (req, res) => {
  const file = req.file;
  const { mentor, title, description, keywords, email } = req.body;

  if (!file) return res.status(400).json({ error: 'No file uploaded' });

  connection.query(
    `INSERT INTO assignment_uploads 
    (mentee_email, mentor_email, title, description, keywords, filename, filepath) 
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [email, mentor, title, description, keywords, file.originalname, file.path],
    (err) => {
      if (err) {
        console.error('DB Insert Error:', err);
        return res.status(500).json({ error: 'Failed to save assignment in database' });
      }
      res.json({ message: 'Assignment uploaded successfully' });
    }
  );
});


// assignment upload timeline 
app.get('/api/assignments/latest/:menteeEmail', (req, res) => {
  const email = req.params.menteeEmail;
  connection.query(
    'SELECT title, uploaded_at FROM assignment_uploads WHERE mentee_email = ? ORDER BY uploaded_at DESC LIMIT 5',
    [email],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Server error' });
      res.json(results);
    }
  );
});



// get mentor recomendations 
app.get('/api/mentors/list', (req, res) => {
  connection.query(
    'SELECT id, CONCAT(first_name, " ", last_name) AS name, email FROM mentors',
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json(results);
    }
  );
});



// UPload task timeline page 
app.get('/api/tasks/latest/:menteeEmail', (req, res) => {
  const email = req.params.menteeEmail;

  connection.query(
    `SELECT title, uploaded_at 
     FROM task_uploads 
     WHERE mentee_email = ? 
     ORDER BY uploaded_at DESC 
     LIMIT 5`,
    [email],
    (err, results) => {
      if (err) {
        console.error("Timeline fetch error:", err);
        return res.status(500).json({ error: 'Server error' });
      }
      res.json(results);
    }
  );
});


// CHECK TIMELINE API
app.get('/api/timeline/:email', (req, res) => {
  const email = req.params.email;

  const taskQuery = `
    SELECT title, uploaded_at, 'task' AS type
    FROM task_uploads
    WHERE mentee_email = ?
  `;

  const assignmentQuery = `
    SELECT title, uploaded_at, 'assignment' AS type
    FROM assignment_uploads
    WHERE mentee_email = ?
  `;

  connection.query(`${taskQuery} UNION ALL ${assignmentQuery} ORDER BY uploaded_at DESC LIMIT 100`, [email, email], (err, results) => {
    if (err) {
      console.error('Timeline query error:', err);
      return res.status(500).json({ error: 'Server error' });
    }

    res.json(results);
  });
});


app.get('/api/timeline/latest/:email', (req, res) => {
  const email = req.params.email;

  const taskQuery = `
    SELECT title, uploaded_at, 'task' AS type
    FROM task_uploads
    WHERE mentee_email = ?
  `;

  const assignmentQuery = `
    SELECT title, uploaded_at, 'assignment' AS type
    FROM assignment_uploads
    WHERE mentee_email = ?
  `;

  connection.query(`${taskQuery} UNION ALL ${assignmentQuery} ORDER BY uploaded_at DESC LIMIT 5`, [email, email], (err, results) => {
    if (err) {
      console.error('Timeline latest query error:', err);
      return res.status(500).json({ error: 'Server error' });
    }

    res.json(results);
  });
});


// TIME LINE OPEN EACH TASK 
app.get('/api/timeline/:email', (req, res) => {
  const email = req.params.email;

  const query = `
  SELECT id, title, description, uploaded_at, filename, filepath, 'task' AS type
FROM task_uploads
WHERE mentee_email = ?

UNION

SELECT id, title, description, uploaded_at, filename, filepath, 'assignment' AS type
FROM assignment_uploads
WHERE mentee_email = ?

ORDER BY uploaded_at DESC;

  `;

  connection.query(query, [email, email], (err, results) => {
    if (err) {
      console.error("Timeline fetch error:", err);
      return res.status(500).json({ error: "Server error" });
    }
    res.json(results); // ✅ result objects must include 'id'
  });
});


// HOME page get all mentors 
app.get('/api/mentors/all', async (req, res) => {
  try {
    const mentorQuery = `
      SELECT 
        id,
        CONCAT(first_name, ' ', last_name) AS name,
        email,
        phone,
        location,
        designation,
        work_mode AS workMode
      FROM mentors
    `;

    connection.query(mentorQuery, async (err, mentors) => {
      if (err) {
        console.error("Failed to fetch all mentors:", err);
        return res.status(500).json({ error: 'Server error' });
      }

      const mentorDetails = await Promise.all(mentors.map((mentor) => {
        return new Promise((resolve, reject) => {
          const menteeQuery = `
            SELECT CONCAT(m.first_name, ' ', m.last_name) AS name
            FROM mentees m
            INNER JOIN mentor_mentee mm ON mm.mentee_id = m.id
            WHERE mm.mentor_id = ?
          `;
          connection.query(menteeQuery, [mentor.id], (err, mentees) => {
            if (err) return reject(err);
            mentor.mentees = mentees.map(m => m.name);  // Get mentee names
            resolve(mentor);
          });
        });
      }));

      res.json(mentorDetails);
    });

  } catch (err) {
    console.error("Mentor fetch error:", err);
    res.status(500).json({ error: 'Internal error' });
  }
});

// KANBAN
app.post('/api/tasks/by-email', (req, res) => {
  const { title, description, end_time, mentor_email, mentee_email } = req.body;
  if (!title || !mentor_email || !mentee_email || !end_time) {
    return res.status(400).json({ message: 'Title, mentor_email, mentee_email, and end_time are required' });
  }

  const mentorQuery = 'SELECT id FROM mentors WHERE email = ?';
  const menteeQuery = 'SELECT id FROM mentees WHERE email = ?';

  connection.query(mentorQuery, [mentor_email], (err, mentorResults) => {
    if (err || mentorResults.length === 0) {
      return res.status(404).json({ message: 'Mentor not found' });
    }
    const mentor_id = mentorResults[0].id;

    connection.query(menteeQuery, [mentee_email], (err2, menteeResults) => {
      if (err2 || menteeResults.length === 0) {
        return res.status(404).json({ message: 'Mentee not found' });
      }
      const mentee_id = menteeResults[0].id;

      const status = 'backlog'; // initial status for new tasks

      const insertQuery = `
        INSERT INTO tasks (title, description, end_time, mentor_id, mentee_id, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      connection.query(insertQuery, [title, description, end_time, mentor_id, mentee_id, status], (err3, result) => {
        if (err3) {
          console.error("Error inserting task:", err3);
          return res.status(500).json({ message: 'Error creating task', error: err3 });
        }

        // Update the kanban_counts table after insert
        connection.query(
          'UPDATE kanban_counts SET count = count + 1 WHERE type = ? AND status = ?',
          ['task', status],
          (err4) => {
            if (err4) {
              console.error("Error updating kanban_counts:", err4);
              return res.status(500).json({ message: 'Task created but failed to update counts', error: err4 });
            }
            res.status(201).json({ message: 'Task created', id: result.insertId });
          }
        );
      });
    });
  });
});



app.post('/api/assignments/by-email', (req, res) => {
  const { title, description, end_time, mentor_email, mentee_email } = req.body;
  if (!title || !mentor_email || !mentee_email || !end_time) {
    return res.status(400).json({ message: 'Title, mentor_email, mentee_email, and end_time are required' });
  }

  const mentorQuery = 'SELECT id FROM mentors WHERE email = ?';
  const menteeQuery = 'SELECT id FROM mentees WHERE email = ?';

  connection.query(mentorQuery, [mentor_email], (err, mentorResults) => {
    if (err || mentorResults.length === 0) {
      return res.status(404).json({ message: 'Mentor not found' });
    }
    const mentor_id = mentorResults[0].id;

    connection.query(menteeQuery, [mentee_email], (err2, menteeResults) => {
      if (err2 || menteeResults.length === 0) {
        return res.status(404).json({ message: 'Mentee not found' });
      }
      const mentee_id = menteeResults[0].id;

      const status = 'backlog'; // initial status for new assignments

      const insertQuery = `
        INSERT INTO assignments (title, description, end_time, mentor_id, mentee_id, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      connection.query(insertQuery, [title, description, end_time, mentor_id, mentee_id, status], (err3, result) => {
        if (err3) {
          console.error("Error inserting assignment:", err3);
          return res.status(500).json({ message: 'Error creating assignment', error: err3 });
        }

        // Update the kanban_counts table after insert
        connection.query(
          'UPDATE kanban_counts SET count = count + 1 WHERE type = ? AND status = ?',
          ['assignment', status],
          (err4) => {
            if (err4) {
              console.error("Error updating kanban_counts:", err4);
              return res.status(500).json({ message: 'Assignment created but failed to update counts', error: err4 });
            }
            res.status(201).json({ message: 'Assignment created', id: result.insertId });
          }
        );
      });
    });
  });
});



// KANAN board 
app.get('/api/tasks/by-mentor', (req, res) => {
  const mentorEmail = req.query.email;
  if (!mentorEmail) return res.status(400).json({ message: 'mentor_email required' });

  const query = `
    SELECT 
  tasks.id, tasks.title, tasks.description, tasks.end_time, tasks.status, tasks.created_at,
  CONCAT(m.first_name, ' ', m.last_name) AS mentee_name,
  m.email AS mentee_email
FROM tasks
JOIN mentees m ON tasks.mentee_id = m.id
JOIN mentors ON mentors.id = tasks.mentor_id
WHERE mentors.email = ?

  `;

  connection.query(query, [mentorEmail], (err, results) => {
    if (err) {
      console.error("Error fetching tasks by mentor:", err);
      return res.status(500).json({ message: 'Server error' });
    }
    res.json(results);
  });
});

app.get('/api/assignments/by-mentor', (req, res) => {
  const mentorEmail = req.query.email;
  if (!mentorEmail) {
    return res.status(400).json({ message: 'mentor_email required' });
  }

  const query = `
    SELECT 
  assignments.id, assignments.title, assignments.description, assignments.end_time, assignments.status, assignments.created_at,
  CONCAT(m.first_name, ' ', m.last_name) AS mentee_name,
  m.email AS mentee_email
FROM assignments
JOIN mentees m ON assignments.mentee_id = m.id
JOIN mentors ON mentors.id = assignments.mentor_id
WHERE mentors.email = ?
  `;

  connection.query(query, [mentorEmail], (err, results) => {
    if (err) {
      console.error("Error fetching assignments by mentor:", err);
      return res.status(500).json({ message: 'Server error' });
    }
    res.json(results);
  });
});



// DRAG and GROP update 
// for assignment and tasks 
app.put('/api/tasks/:id/status', (req, res) => {
  const taskId = req.params.id;
  const { status } = req.body;

  if (!status) return res.status(400).json({ message: 'Status is required' });

  const query = 'UPDATE tasks SET status = ? WHERE id = ?';

  connection.query(query, [status, taskId], (err, result) => {
    if (err) {
      console.error("Error updating task status:", err);
      return res.status(500).json({ message: 'Server error' });
    }
    res.json({ message: 'Task status updated successfully' });
  });
});

app.put('/api/assignments/:id/status', (req, res) => {
  const assignmentId = req.params.id;
  const { status } = req.body;

  if (!status) return res.status(400).json({ message: 'Status is required' });

  const query = 'UPDATE assignments SET status = ? WHERE id = ?';

  connection.query(query, [status, assignmentId], (err, result) => {
    if (err) {
      console.error("Error updating assignment status:", err);
      return res.status(500).json({ message: 'Server error' });
    }
    res.json({ message: 'Assignment status updated successfully' });
  });
});


// udpating the total task and assignment table 

app.get('/api/kanban-counts', (req, res) => {
  connection.query(
    'SELECT type, status, count FROM kanban_counts',
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});


app.patch('/api/kanban-counts/increment', (req, res) => {
  const { type, status, delta } = req.body;
  connection.query(
    'UPDATE kanban_counts SET count = GREATEST(count + ?, 0) WHERE type = ? AND status = ?',
    [delta, type, status],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Count updated!' });
    }
  );
});


//Upload task per mentor for amalysis page 
// Tasks uploaded per mentor (by count)
// API to get number of tasks assigned per mentee for a mentor
// tasks per mentee for a specific mentor by email
app.get('/api/tasks/per-mentee', (req, res) => {
  const { mentorEmail } = req.query;
  if (!mentorEmail) return res.status(400).json({ error: "mentorEmail required" });

  const sql = `
    SELECT CONCAT(me.first_name, ' ', me.last_name) AS mentee, COUNT(t.id) AS count
    FROM tasks t
    JOIN mentors m ON t.mentor_id = m.id
    JOIN mentees me ON t.mentee_id = me.id
    WHERE m.email = ?
    GROUP BY me.id, me.first_name, me.last_name
    ORDER BY count DESC
  `;
  connection.query(sql, [mentorEmail], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});


// assignments for the same given by the mentors to all the mentees
app.get('/api/assignments/per-mentee', (req, res) => {
  const { mentorEmail } = req.query;
  if (!mentorEmail) return res.status(400).json({ error: "mentorEmail required" });

  const sql = `
    SELECT CONCAT(me.first_name, ' ', me.last_name) AS mentee, COUNT(a.id) AS count
    FROM assignments a
    JOIN mentors m ON a.mentor_id = m.id
    JOIN mentees me ON a.mentee_id = me.id
    WHERE m.email = ?
    GROUP BY me.id, me.first_name, me.last_name
    ORDER BY count DESC
  `;
  connection.query(sql, [mentorEmail], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});




// mentee page pending tasks and assignment display
// For tasks
app.get('/api/tasks/by-mentee', (req, res) => {
  const menteeEmail = req.query.email;
  const query = `
    SELECT tasks.*, mentors.first_name AS mentor_first, mentors.last_name AS mentor_last
    FROM tasks
    JOIN mentees ON tasks.mentee_id = mentees.id
    JOIN mentors ON tasks.mentor_id = mentors.id
    WHERE mentees.email = ?
    ORDER BY tasks.end_time DESC
  `;
  connection.query(query, [menteeEmail], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// For assignments
app.get('/api/assignments/by-mentee', (req, res) => {
  const menteeEmail = req.query.email;
  const query = `
    SELECT assignments.*, mentors.first_name AS mentor_first, mentors.last_name AS mentor_last
    FROM assignments
    JOIN mentees ON assignments.mentee_id = mentees.id
    JOIN mentors ON assignments.mentor_id = mentors.id
    WHERE mentees.email = ?
    ORDER BY assignments.end_time DESC
  `;
  connection.query(query, [menteeEmail], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});



//Update the status of task on open of the task from Backlog-->New on open of task 
app.post('/api/tasks/update-status', (req, res) => {
  const { taskId, status } = req.body;
  if (!taskId || !status) return res.status(400).send("Missing data");
  connection.query(
    "UPDATE tasks SET status = ? WHERE id = ?",
    [status, taskId],
    (err, result) => {
      if (err) return res.status(500).send("Failed to update");
      res.json({ message: "Status updated" });
    }
  );
});


// Update activity logs of tasks when a user will make a check in this is the API of that 
// POST /api/task-activity
app.post('/api/task-activity', (req, res) => {
  const {
    task_id,
    mentee_email,
    action_type,     // e.g., "checkin" or "review"
    old_value,       // optional
    new_value,       // e.g., new check-in text
    description      // optional/summary
  } = req.body;

  if (!task_id || !mentee_email) {
    return res.status(400).json({ error: "task_id and mentee_email are required" });
  }

  connection.query(
    `INSERT INTO task_activity_log (task_id, mentee_email, action_type, old_value, new_value, description)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [task_id, mentee_email, action_type, old_value, new_value, description],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to log activity', details: err.message });
      }
      res.status(201).json({ message: 'Activity logged successfully', id: result.insertId });
    }
  );
});


//get activity logs 
// GET /api/task-activity/:taskId
app.get('/api/task-activity/:taskId', async (req, res) => {
  const { taskId } = req.params;
  try {
    const [rows] = await connection.query(
      `SELECT * FROM task_activity_log WHERE task_id = ? ORDER BY action_time ASC`,
      [taskId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch activity logs', details: err.message });
  }
});







app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


