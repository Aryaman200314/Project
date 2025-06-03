// db.js
const mysql = require('mysql');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'India@123',
  database: 'backend'
});

// connection.connect((err) => {
//   if (err) throw err;
//   console.log('Connected to MySQL database');
// });

module.exports = connection;
