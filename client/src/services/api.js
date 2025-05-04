import axios from 'axios';

// Cấu hình base URL cho API
const API = axios.create({
    baseURL: 'http://localhost:5000/api/auth', // Thay đổi URL nếu cần
});

// Hàm gọi API đăng nhập
export const loginUser = async (email, matKhau) => {
    try {
        const response = await API.post('/login', { email, matKhau });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : { message: 'Lỗi kết nối đến máy chủ' };
    }
};

// Hàm gọi API đăng ký
export const registerUser = async (formData) => {
    try {
        const response = await API.post('/register', formData);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : { message: 'Lỗi kết nối đến máy chủ' };
    }
};