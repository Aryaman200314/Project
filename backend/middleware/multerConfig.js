const multer = require('multer');
const path = require('path');

// Task Storage
const taskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/tasks/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const uploadTask = multer({ storage: taskStorage });

// Assignment Storage
const assignmentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/assignments/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const uploadAssignment = multer({ storage: assignmentStorage });

module.exports = {
  uploadTask,
  uploadAssignment
};
