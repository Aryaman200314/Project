// frontend/src/Services/api.js
export async function getData() {
  const response = await fetch('http://localhost:5000/api/data');
  return response.json();
}
