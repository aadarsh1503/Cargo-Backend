import axios from 'axios';

const API_URL = 'https://cargo-backend-s9eg.onrender.com/api/excels';

// Create a new Axios instance
const api = axios.create({
    baseURL: API_URL,
});

// ===================================================================
// ✨ THE FIX: Add the Request Interceptor
// This is the missing piece. It automatically adds the auth token to
// every request made with the `api` instance.
// ===================================================================
api.interceptors.request.use(
    (config) => {
        // 1. Get the token from localStorage where you saved it during login
        const token = localStorage.getItem('token');

        // 2. If a token exists, add it to the request's Authorization header
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        // 3. Return the modified config to proceed with the request
        return config;
    },
    (error) => {
        // Handle any request errors
        return Promise.reject(error);
    }
);


// Your exported functions below will now automatically be authenticated.
// NO OTHER CHANGES ARE NEEDED IN THIS FILE.

export const getFiles = () => api.get('/list');

export const uploadFile = (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('excelFile', file);
    return api.post('/upload', formData, {
        onUploadProgress,
    });
};

export const processFile = (id) => api.post(`/process/${id}`);

export const renameFile = (id, newName) => api.put(`/rename/${id}`, { newName });

export const deleteFile = (id) => api.delete(`/delete/${id}`);