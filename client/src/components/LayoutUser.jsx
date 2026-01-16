import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Footer from './Footer';
import './LayoutUser.css';

const LayoutUser = () => {
    const { user, logout } = useAuth();
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
                        <span className="logo-text">DatSan24H</span>
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
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
                                    <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"/>
                                </svg>
                                <span className="user-name">
                                    Xin chào, {user?.fullName || 'User'}
                                </span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16" className="dropdown-arrow">
                                    <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
                                </svg>
                            </button>
                            
                            {showDropdown && (
                                <>
                                    <div 
                                        className="dropdown-overlay" 
                                        onClick={closeDropdown}
                                    ></div>
                                    <div className="dropdown-menu">
                                        {user?.role === 'admin' && (
                                            <>
                                                <Link 
                                                    to="/admin/quan-ly-san" 
                                                    className="dropdown-item"
                                                    onClick={closeDropdown}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                                                        <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/>
                                                    </svg>
                                                    <span>Quản trị hệ thống</span>
                                                </Link>
                                                <div className="dropdown-divider"></div>
                                            </>
                                        )}
                                        <Link 
                                            to="/thong-tin-ca-nhan" 
                                            className="dropdown-item"
                                            onClick={closeDropdown}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                                                <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3Zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
                                            </svg>
                                            <span>Thông tin cá nhân</span>
                                        </Link>
                                        <Link 
                                            to="/danh-sach-san-da-dat" 
                                            className="dropdown-item"
                                            onClick={closeDropdown}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                                                <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0zM9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1zM4.5 9a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0 1h-7zM4 10.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm.5 2.5a.5.5 0 0 1 0-1h4a.5.5 0 0 1 0 1h-4z"/>
                                            </svg>
                                            <span>Danh sách sân đã đặt</span>
                                        </Link>
                                        <div className="dropdown-divider"></div>
                                        <button 
                                            className="dropdown-item logout-item" 
                                            onClick={handleLogout}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                                                <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
                                                <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
                                            </svg>
                                            <span>Đăng xuất</span>
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

            <Footer />
        </div>
    );
};

export default LayoutUser;
