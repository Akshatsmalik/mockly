import axios from "axios";

const api = axios.create({
  baseURL: "https://mockly-le44.onrender.com/api",
});

export default api;

