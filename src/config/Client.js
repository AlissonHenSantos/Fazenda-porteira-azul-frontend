// ...existing code...
import axios from 'axios';

const client = axios.create({
  baseURL: 'http://localhost:5000',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

export default client;
// ...existing code...