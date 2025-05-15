import axios from 'axios';

const API_URL = 'http://localhost:5000';  // Change to your backend URL if deployed

export const fetchAssignments = async () => {
  try {
    const response = await axios.get(`${API_URL}/assignments`);
    return response.data;
  } catch (error) {
    console.error('Error fetching assignments:', error);
  }
};
