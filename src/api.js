import axios from 'axios'

// Base URL for API
const API_URL = 'http://54.80.178.193:8000'

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
})

// Add token to every request if it exists
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export default api
