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
                    <h2>{sidebarCollapsed ? '⚽' : '⚽ Admin Panel'}</h2>
                    <button className="toggle-btn" onClick={toggleSidebar}>
                        {sidebarCollapsed ? '→' : '←'}
                    </button>
                </div>
                
                <div className="admin-info">
                    <div className="admin-avatar">👤</div>
                    {!sidebarCollapsed && (
                        <div className="admin-details">
                            <div className="admin-name">{user?.fullName || 'Admin'}</div>
                            <div className="admin-role">Quản trị viên</div>
                        </div>
                    )}
                </div>

                <nav className="sidebar-nav">
                    <Link 
                        to="/admin/quan-ly-khach-hang" 
                        className={isActive('/admin/quan-ly-khach-hang') ? 'active' : ''}
                        title="Quản lý khách hàng"
                    >
                        <span className="icon">👥</span>
                        {!sidebarCollapsed && <span className="text">Quản lý khách hàng</span>}
                    </Link>
                    <Link 
                        to="/admin/quan-ly-khung-gio" 
                        className={isActive('/admin/quan-ly-khung-gio') ? 'active' : ''}
                        title="Quản lý khung giờ"
                    >
                        <span className="icon">⏰</span>
                        {!sidebarCollapsed && <span className="text">Quản lý khung giờ</span>}
                    </Link>
                    <Link 
                        to="/admin/quan-ly-san" 
                        className={isActive('/admin/quan-ly-san') ? 'active' : ''}
                        title="Quản lý sân"
                    >
                        <span className="icon">🏟️</span>
                        {!sidebarCollapsed && <span className="text">Quản lý sân</span>}
                    </Link>
                    <Link 
                        to="/admin/quan-ly-dat-san" 
                        className={isActive('/admin/quan-ly-dat-san') ? 'active' : ''}
                        title="Quản lý đặt sân"
                    >
                        <span className="icon">📅</span>
                        {!sidebarCollapsed && <span className="text">Quản lý đặt sân</span>}
                    </Link>
                    <Link 
                        to="/admin/quan-ly-dich-vu" 
                        className={isActive('/admin/quan-ly-dich-vu') ? 'active' : ''}
                        title="Quản lý dịch vụ"
                    >
                        <span className="icon">🛠️</span>
                        {!sidebarCollapsed && <span className="text">Quản lý dịch vụ</span>}
                    </Link>
                    <Link 
                        to="/admin/quan-ly-danh-gia" 
                        className={isActive('/admin/quan-ly-danh-gia') ? 'active' : ''}
                        title="Quản lý đánh giá"
                    >
                        <span className="icon">⭐</span>
                        {!sidebarCollapsed && <span className="text">Quản lý đánh giá</span>}
                    </Link>
                </nav>

                <div className="sidebar-footer">
                    <button onClick={() => navigate('/home')} className="back-to-home">
                        <span className="icon">🏠</span>
                        {!sidebarCollapsed && <span className="text">Về trang chủ</span>}
                    </button>
                </div>
            </aside>

            <div className={`admin-main ${sidebarCollapsed ? 'expanded' : ''}`}>
                <header className="admin-header">
                    <div className="header-left">
                        <h1>Hệ thống quản trị</h1>
                        <div className="breadcrumb">
                            {location.pathname.split('/').filter(Boolean).map((path, index, arr) => (
                                <span key={index}>
                                    {index > 0 && ' / '}
                                    {path}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="header-right">
                        <button onClick={handleLogout} className="logout-btn">
                            <span>🚪</span> Đăng xuất
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
