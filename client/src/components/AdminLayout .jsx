import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './AdminLayout.css';

const AdminLayout = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/dang-nhap');
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    return (
        <div className="admin-layout">
            <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
                <div className="sidebar-header">
                    <div className="logo-container" style={{ alignItems: 'center' }}>
                        <div className="logo-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderRadius: '12px', padding: '8px', width: '42px', height: '42px' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="white">
                                <path d="M177.1 228.6L207.9 320h96.5l29.62-91.38L256 172.1L177.1 228.6zM255.1 0C114.6 0 .0001 114.6 .0001 256S114.6 512 256 512s255.1-114.6 255.1-255.1S397.4 0 255.1 0zM435.2 361.1l-103.9-1.578l-30.67 99.52C286.2 462.2 271.3 464 256 464s-30.19-1.773-44.56-4.93L180.8 359.5L76.83 361.1C57.1 341.6 42.67 318.1 33.27 291.9l81.43-67.49L93.5 135.1l-91.31-23.58C10.48 83.72 24.83 54.96 45.49 29.96L139.6 63.57l76.12-57.59C232.7 2.363 244.1 0 256 0s23.27 2.363 40.28 5.984l76.13 57.59l94.14-33.61c20.66 25 35.01 53.76 43.3 85.45l-91.31 23.58l-21.18 89.37l81.43 67.49C469.3 318.1 454.1 341.6 435.2 361.1z"/>
                            </svg>
                        </div>
                        {!sidebarCollapsed && (
                            <h2 style={{ 
                                fontSize: '1.75rem', 
                                fontWeight: '800', 
                                letterSpacing: '0.5px',
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                margin: 0,
                                lineHeight: '1'
                            }}>DatSan24H</h2>
                        )}
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {!sidebarCollapsed && <div className="nav-section-title">TỔNG QUAN</div>}
                    
                    <Link 
                        to="/admin/quan-ly-doanh-thu" 
                        className={`nav-item ${isActive('/admin/quan-ly-doanh-thu') ? 'active' : ''}`}
                        title="Quản lý doanh thu"
                    >
                        <span className="icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
                            </svg>
                        </span>
                        {!sidebarCollapsed && <span className="text">Doanh thu</span>}
                    </Link>

                    {!sidebarCollapsed && <div className="nav-section-title">QUẢN LÝ SÂN</div>}
                    
                    <Link 
                        to="/admin/quan-ly-san" 
                        className={`nav-item ${isActive('/admin/quan-ly-san') ? 'active' : ''}`}
                        title="Quản lý sân"
                    >
                        <span className="icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>
                            </svg>
                        </span>
                        {!sidebarCollapsed && <span className="text">Quản lý sân</span>}
                    </Link>
                    <Link 
                        to="/admin/quan-ly-khung-gio" 
                        className={`nav-item ${isActive('/admin/quan-ly-khung-gio') ? 'active' : ''}`}
                        title="Khung giờ"
                    >
                        <span className="icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                            </svg>
                        </span>
                        {!sidebarCollapsed && <span className="text">Khung giờ</span>}
                    </Link>

                    {!sidebarCollapsed && <div className="nav-section-title">DỊCH VỤ & ĐẶT SÂN</div>}
                    
                    <Link 
                        to="/admin/quan-ly-dat-san" 
                        className={`nav-item ${isActive('/admin/quan-ly-dat-san') ? 'active' : ''}`}
                        title="Đặt sân"
                    >
                        <span className="icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                            </svg>
                        </span>
                        {!sidebarCollapsed && <span className="text">Đơn đặt sân</span>}
                    </Link>
                    <Link 
                        to="/admin/quan-ly-dich-vu" 
                        className={`nav-item ${isActive('/admin/quan-ly-dich-vu') ? 'active' : ''}`}
                        title="Dịch vụ"
                    >
                        <span className="icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>
                            </svg>
                        </span>
                        {!sidebarCollapsed && <span className="text">Dịch vụ</span>}
                    </Link>

                    {!sidebarCollapsed && <div className="nav-section-title">NGƯỜI DÙNG</div>}
                    
                    <Link 
                        to="/admin/quan-ly-khach-hang" 
                        className={`nav-item ${isActive('/admin/quan-ly-khach-hang') ? 'active' : ''}`}
                        title="Khách hàng"
                    >
                        <span className="icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                            </svg>
                        </span>
                        {!sidebarCollapsed && <span className="text">Khách hàng</span>}
                    </Link>
                    <Link 
                        to="/admin/quan-ly-danh-gia" 
                        className={`nav-item ${isActive('/admin/quan-ly-danh-gia') ? 'active' : ''}`}
                        title="Đánh giá"
                    >
                        <span className="icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                            </svg>
                        </span>
                        {!sidebarCollapsed && <span className="text">Đánh giá</span>}
                    </Link>
                </nav>

                <div className="sidebar-footer">
                    <button onClick={() => navigate('/home')} className="back-to-home">
                        <span className="icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                            </svg>
                        </span>
                        {!sidebarCollapsed && <span className="text">Về trang chủ</span>}
                    </button>
                </div>
            </aside>

            <div className={`admin-main ${sidebarCollapsed ? 'expanded' : ''}`}>
                <header className="admin-header">
                    <div className="header-left">
                        <button className="toggle-btn-mobile" onClick={toggleSidebar}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" width="20" height="20">
                                {sidebarCollapsed ? (
                                    <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
                                ) : (
                                    <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
                                )}
                            </svg>
                        </button>
                    </div>
                    <div className="header-right">
                        <div className="user-info">
                            <span className="user-avatar">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                </svg>
                            </span>
                        </div>
                        <button onClick={handleLogout} className="logout-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                            </svg>
                            Đăng xuất
                        </button>
                    </div>
                </header>

                <main className="admin-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
