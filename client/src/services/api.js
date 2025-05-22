import axios from 'axios';

// Cấu hình base URL cho API
const API = axios.create({
    baseURL: 'http://localhost:5000/api',
});

// Thêm token vào header nếu có
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Đăng ký
export const registerUser = async (formData) => {
    try {
        const response = await API.post('/auth/register', formData);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : { message: 'Lỗi kết nối đến máy chủ' };
    }
};

// Đăng nhập
export const loginUser = async (email, matKhau) => {
    try {
        const response = await API.post('/auth/login', { email, matKhau });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : { message: 'Lỗi kết nối đến máy chủ' };
    }
};

// Lấy danh sách sân bóng (user)
export const getDanhSachSan = async () => {
    try {
        const response = await API.get('/danhsachsan');
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : { message: 'Lỗi kết nối đến máy chủ' };
    }
};

// Lấy thông tin sân bóng theo id
export const getSanTheoId = async (id) => {
    try {
        const response = await API.get(`/sanbong/${id}`);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : { message: 'Lỗi kết nối đến máy chủ' };
    }
};
// Đặt sân
export const datSan = async (data) => {
    try {
        const response = await API.post('/datsan', data);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : { message: 'Lỗi kết nối đến máy chủ' };
    }
};

// Lấy danh sách đã đặt của user
export const getDanhSachDaDat = async () => {
    try {
        const response = await API.get('/danhsachdadat');
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : { message: 'Lỗi kết nối đến máy chủ' };
    }
};

// ADMIN - Quản lý sân bóng
export const themSan = async (data) => {
    try {
        const response = await API.post('/addsan', data);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : { message: 'Lỗi kết nối đến máy chủ' };
    }
};

export const suaSan = async (id, data) => {
    try {
        const response = await API.put(`/suasan/${id}`, data);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : { message: 'Lỗi kết nối đến máy chủ' };
    }
};

export const xoaSan = async (id) => {
    try {
        const response = await API.delete(`/xoasan/${id}`);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : { message: 'Lỗi kết nối đến máy chủ' };
    }
};

export const adminXacNhanDatSan = async (id, data) => {
    try {
        const response = await API.put(`/${id}/xacnhandatsan`, data);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : { message: 'Lỗi kết nối đến máy chủ' };
    }
};

// ADMIN - Quản lý user
export const xoaUser = async (id) => {
    try {
        const response = await API.delete(`/xoauser/${id}`);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : { message: 'Lỗi kết nối đến máy chủ' };
    }
};

export const updateUser = async (id, data) => {
    try {
        const response = await API.put(`/updateuser/${id}`, data);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : { message: 'Lỗi kết nối đến máy chủ' };
    }
};

export const getUsers = async () => {
    try {
        const response = await API.get('/user');
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : { message: 'Lỗi kết nối đến máy chủ' };
    }
};