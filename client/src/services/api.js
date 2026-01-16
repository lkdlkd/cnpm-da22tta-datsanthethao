import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Tạo axios instance với cấu hình mặc định
const axiosInstance = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor để tự động thêm token vào mỗi request
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Auth Service
export const authService = {
    register: (data) => axiosInstance.post('/auth/register', data),
    login: (data) => axiosInstance.post('/auth/login', data),
    // getCurrentUser: () => axiosInstance.get('/auth/me'),
    updateProfile: (data) => axiosInstance.put('/auth/profile', data),
    changePassword: (data) => axiosInstance.put('/auth/change-password', data),
    // Admin functions
    getAllUsers: (params) => axiosInstance.get('/auth/users', { params }),
    updateUserByAdmin: (id, data) => axiosInstance.put(`/auth/users/${id}`, data),
    deleteUser: (id) => axiosInstance.delete(`/auth/users/${id}`)
};

// Field Service
export const fieldService = {
    getAllFields: (params) => axiosInstance.get('/fields', { params }),
    getFieldById: (id) => axiosInstance.get(`/fields/${id}`),
    createField: (data) => axiosInstance.post('/fields', data),
    updateField: (id, data) => axiosInstance.put(`/fields/${id}`, data),
    deleteField: (id) => axiosInstance.delete(`/fields/${id}`),
    uploadFieldImages: (id, formData) => axiosInstance.post(`/fields/${id}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
};

// TimeSlot Service
export const timeSlotService = {
    getTimeSlotsByFieldAndDate: (fieldId, date) =>
        axiosInstance.get(`/timeslots/field/${fieldId}`, { params: { date } }),
    createTimeSlot: (data) => axiosInstance.post('/timeslots', data),
    generateTimeSlots: (data) => axiosInstance.post('/timeslots/generate', data),
    updateTimeSlot: (id, data) => axiosInstance.put(`/timeslots/${id}`, data),
    deleteTimeSlot: (id) => axiosInstance.delete(`/timeslots/${id}`)
};

// Booking Service
export const bookingService = {
    createBooking: (data) => axiosInstance.post('/bookings', data),
    getUserBookings: (params) => axiosInstance.get('/bookings/my-bookings', { params }),
    getBookingById: (id) => axiosInstance.get(`/bookings/${id}`),
    cancelBooking: (id, data) => axiosInstance.put(`/bookings/${id}/cancel`, data),
    getAllBookings: (params) => axiosInstance.get('/bookings', { params }),
    confirmBooking: (id) => axiosInstance.put(`/bookings/${id}/confirm`)
};

// Payment Service
export const paymentService = {
    getPaymentByBooking: (bookingId) => axiosInstance.get(`/payments/booking/${bookingId}`),
    confirmCashPayment: (id) => axiosInstance.put(`/payments/${id}/confirm-cash`)
};

// Review Service
export const reviewService = {
    getReviewsByField: (fieldId, params) =>
        axiosInstance.get(`/reviews/field/${fieldId}`, { params }),
    createReview: (data) => axiosInstance.post('/reviews', data),
    deleteReview: (id) => axiosInstance.delete(`/reviews/${id}`),
    replyToReview: (id, data) => axiosInstance.put(`/reviews/${id}/reply`, data),
    getAllReviews: (params) => axiosInstance.get('/reviews', { params })
};

// Service Service
export const serviceService = {
    getAllServices: (params) => axiosInstance.get('/services', { params }),
    getServicesByCategory: (category) => axiosInstance.get(`/services/category/${category}`),
    getServicesStats: () => axiosInstance.get('/services/stats'),
    createService: (data) => axiosInstance.post('/services', data),
    updateService: (id, data) => axiosInstance.put(`/services/${id}`, data),
    updateStock: (id, data) => axiosInstance.put(`/services/${id}/stock`, data),
    deleteService: (id) => axiosInstance.delete(`/services/${id}`)
};

// Notification Service
export const notificationService = {
    getUserNotifications: (params) => axiosInstance.get('/notifications', { params }),
    markAsRead: (id) => axiosInstance.put(`/notifications/${id}/read`),
    markAllAsRead: () => axiosInstance.put('/notifications/read-all'),
};

// Revenue Service
export const revenueService = {
    getRevenueStats: (params) => axiosInstance.get('/revenue/stats', { params }),
    getDailyRevenue: (params) => axiosInstance.get('/revenue/daily', { params }),
    getTopFields: (params) => axiosInstance.get('/revenue/top-fields', { params })
};

export default axiosInstance;
