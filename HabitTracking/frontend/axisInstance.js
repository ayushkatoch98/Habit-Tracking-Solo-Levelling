import axios from "axios";
import { startLoading, stopLoading } from "./src/utils/loadingStore";

console.log(import.meta.env)
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_HOST,
  headers: {'X-Custom-Header': 'foobar'}
});

instance.interceptors.request.use(
  (config) => {
    startLoading();
    const token = localStorage.getItem("jwt");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    stopLoading();
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => {
    stopLoading();
    return response;
  },
  (error) => {
    stopLoading();
    if (error.response?.status === 401) {
      // ?? AUTH IS INVALID ? RESET EVERYTHING
      localStorage.removeItem("jwt");
      localStorage.removeItem("user");

      // Optional but recommended:
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default instance;
