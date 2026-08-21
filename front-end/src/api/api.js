// import axios from "axios";

// const api = axios.create({
//     baseURL: import.meta.env.VITE_BASE_URL || "",
//     withCredentials: true,
// });

import axios from 'axios';

const api = axios.create({
  baseURL: '', // 👈 Leave empty!
  withCredentials: true,
});

export default api;
