import axios from "axios"


const instance = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {'X-Custom-Header': 'foobar'}
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwt");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 🔥 AUTH IS INVALID → RESET EVERYTHING
      localStorage.removeItem("jwt");
      localStorage.removeItem("user");

      // Optional but recommended:
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default instance;