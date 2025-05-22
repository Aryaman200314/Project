const express = require('express');
const router = express.Router();
const {
  getAllTasks,
  approveTask,
  assignTask
} = require('../controllers/mentorController');

router.get('/tasks', getAllTasks);
router.post('/approve', approveTask);
router.post('/assign', assignTask);

module.exports = router;
