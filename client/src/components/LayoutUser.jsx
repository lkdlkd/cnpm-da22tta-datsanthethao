import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './LayoutUser.css';

const LayoutUser = () => {
    const { auth, user, logout } = useAuth();
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/dang-nhap');
    };

    const toggleDropdown = () => {
        console.log('Toggle dropdown, current state:', showDropdown);
        setShowDropdown(!showDropdown);
    };

    const closeDropdown = () => {
        console.log('Close dropdown');
        setShowDropdown(false);
    };

    return (
        <div className="layout-user">
            <header className="header">
                <div className="header-container">
                    <Link to="/home" className="logo">
                        <span>⚽</span> SÂN BÓNG ĐÁ
                    </Link>

                    <nav className="nav-menu">
                        <Link to="/home">Trang chủ</Link>
                        <Link to="/danh-sach-san">Danh sách sân</Link>
                        <Link to="/dich-vu">Dịch vụ</Link>
                        <Link to="/danh-sach-san-da-dat">Danh sách sân đã đặt</Link>
                        <Link to="/lien-he">Liên hệ</Link>
                    </nav>

                    <div className="header-actions">
                        <div className="user-dropdown">
                            <button 
                                className="user-profile-btn" 
                                onClick={toggleDropdown}
                            >
                                <span className="user-icon">👤</span>
                                <span className="user-name">
                                    Xin chào, {user?.fullName || 'User'}
                                </span>
                                <span className="dropdown-arrow">▼</span>
                            </button>
                            
                            {showDropdown && (
                                <>
                                    <div 
                                        className="dropdown-overlay" 
                                        onClick={closeDropdown}
                                    ></div>
                                    <div className="dropdown-menu">
                                        <Link 
                                            to="/thong-tin-ca-nhan" 
                                            className="dropdown-item"
                                            onClick={closeDropdown}
                                        >
                                            <span>👤</span> Thông tin cá nhân
                                        </Link>
                                        <Link 
                                            to="/danh-sach-san-da-dat" 
                                            className="dropdown-item"
                                            onClick={closeDropdown}
                                        >
                                            <span>📋</span> Danh sách sân đã đặt
                                        </Link>
                                        <div className="dropdown-divider"></div>
                                        <button 
                                            className="dropdown-item logout-item" 
                                            onClick={handleLogout}
                                        >
                                            <span>🚪</span> Đăng xuất
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="main-content">
                <Outlet />
            </main>

            <footer className="footer">
                <div className="footer-container">
                    <div className="footer-section">
                        <h3>Về chúng tôi</h3>
                        <Link to="/gioi-thieu">Giới thiệu</Link>
                        <Link to="/chinh-sach">Chính sách</Link>
                    </div>
                    <div className="footer-section">
                        <h3>Liên hệ</h3>
                        <p>Email: contact@sanbongda.com</p>
                        <p>Hotline: 1900-xxxx</p>
                    </div>
                    <div className="footer-section">
                        <h3>Theo dõi chúng tôi</h3>
                        <div className="social-links">
                            <a href="#">Facebook</a>
                            <a href="#">Instagram</a>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2026 Hệ thống đặt sân bóng đá. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default LayoutUser;
