import axios from "axios";

const apiClient = axios.create({
    // Ako VITE_API_URL nije definisan, koristi '/api' (relativna putanja)
    baseURL: import.meta.env.VITE_API_URL || "/api",
    withCredentials: true
});

export default apiClient;