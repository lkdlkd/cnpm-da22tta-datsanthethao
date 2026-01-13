import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import './Register.css';

export const Register = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate
        if (formData.password !== formData.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        if (formData.password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        setLoading(true);

        try {
            await authService.register({
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password,
                phone: formData.phone
            });

            alert('Đăng ký thành công! Vui lòng đăng nhập.');
            navigate('/dang-nhap');
        } catch (err) {
            setError(err.response?.data?.message || 'Đăng ký thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page">
            <div className="register-container">
                <div className="register-card">
                    <h2>Đăng Ký</h2>
                    <p className="subtitle">Tạo tài khoản mới</p>

                    {error && <div className="error-message">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Họ và tên *</label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="Nguyễn Văn A"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Email *</label>
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
                            <label>Số điện thoại *</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="0123456789"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Mật khẩu *</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Ít nhất 6 ký tự"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Xác nhận mật khẩu *</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Nhập lại mật khẩu"
                                required
                            />
                        </div>

                        <button type="submit" className="register-btn" disabled={loading}>
                            {loading ? 'Đang xử lý...' : 'Đăng Ký'}
                        </button>
                    </form>

                    <div className="register-footer">
                        <p>Đã có tài khoản? <Link to="/dang-nhap">Đăng nhập</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
};
