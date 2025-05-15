const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

// Replace with your Atlas connection string
const mongoURI = 'mongodb+srv://aryaman:<db_password>@cluster0.qjwayu5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB Atlas');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

app.listen(5000, () => {
  console.log('Backend running on http://localhost:5000');
});
