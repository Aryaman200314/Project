const express = require('express');
const router = express.Router();
const { getTasks, markComplete } = require('../controllers/menteeController');

router.get('/tasks/:id', getTasks); // mentee ID
router.post('/tasks/complete', markComplete);
router.get('/:id', getMenteeById); // Add this line

module.exports = router;
