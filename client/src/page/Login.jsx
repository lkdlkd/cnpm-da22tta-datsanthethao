import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { authService } from '../services/api';
import './Login.css';

export const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { updateAuth } = useAuth();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authService.login(formData);
            const { token, user } = response.data;

            // Cập nhật auth context
            updateAuth({
                token,
                role: user.role,
                userId: user.id,
                user: user
            });

            // Chuyển hướng dựa trên role
            if (user.role === 'admin') {
                navigate('/admin/quan-ly-khach-hang');
            } else {
                navigate('/home');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Đăng nhập thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-card">
                    <h2>Đăng Nhập</h2>
                    <p className="subtitle">Chào mừng bạn quay trở lại!</p>

                    {error && <div className="error-message">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="example@email.com"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Mật khẩu</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Nhập mật khẩu"
                                required
                            />
                        </div>

                        <button type="submit" className="login-btn" disabled={loading}>
                            {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
                        </button>
                    </form>

                    <div className="login-footer">
                        <p>Chưa có tài khoản? <Link to="/dang-ky">Đăng ký ngay</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
};
