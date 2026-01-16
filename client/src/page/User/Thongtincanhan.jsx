import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Nav, Badge, Table } from 'react-bootstrap';
import { useAuth } from '../../components/AuthContext';
import { authService, bookingService, notificationService } from '../../services/api';
import './Thongtincanhan.css';

const Thongtincanhan = () => {
    const { user, setUser } = useAuth();
    const [activeTab, setActiveTab] = useState('info');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Profile form
    const [profileData, setProfileData] = useState({
        fullName: '',
        phone: '',
        email: ''
    });

    // Password form
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Stats
    const [stats, setStats] = useState({
        totalBookings: 0,
        completedBookings: 0,
        cancelledBookings: 0,
        totalSpent: 0
    });

    // Notifications
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (user) {
            setProfileData({
                fullName: user.fullName || '',
                phone: user.phone || '',
                email: user.email || ''
            });
            fetchStats();
        }
    }, [user]);

    useEffect(() => {
        if (activeTab === 'notifications') {
            fetchNotifications();
        }
    }, [activeTab]);

    const fetchStats = async () => {
        try {
            const response = await bookingService.getUserBookings({ limit: 1000 });

            // Xử lý cả 2 cấu trúc response: mới (với success flag) và cũ
            let bookings = [];
            if (response.data.success && response.data.data) {
                bookings = response.data.data.bookings || response.data.data || [];
            } else if (response.data.data) {
                bookings = response.data.data;
            } else if (Array.isArray(response.data)) {
                bookings = response.data;
            }

            const completed = bookings.filter(b => b.status === 'completed').length;
            const cancelled = bookings.filter(b => b.status === 'cancelled').length;
            const spent = bookings
                .filter(b => b.paymentStatus === 'paid')
                .reduce((sum, b) => sum + b.totalPrice, 0);

            setStats({
                totalBookings: bookings.length,
                completedBookings: completed,
                cancelledBookings: cancelled,
                totalSpent: spent
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
            // Set default stats khi có lỗi
            setStats({
                totalBookings: 0,
                completedBookings: 0,
                cancelledBookings: 0,
                totalSpent: 0
            });
        }
    };

    const fetchNotifications = async () => {
        try {
            const response = await notificationService.getUserNotifications();

            // Xử lý cả 2 cấu trúc response
            let notifData = response.data.data || response.data;
            setNotifications(notifData.notifications || notifData || []);
            setUnreadCount(notifData.unreadCount || 0);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            setNotifications([]);
            setUnreadCount(0);
        }
    };

    const handleProfileChange = (e) => {
        setProfileData({
            ...profileData,
            [e.target.name]: e.target.value
        });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({
            ...passwordData,
            [e.target.name]: e.target.value
        });
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await authService.updateProfile(profileData);

            // Kiểm tra success flag
            if (response.data.success !== false) {
                const userData = response.data.data || response.data.user || response.data;
                setUser(userData);
                setMessage({
                    type: 'success',
                    text: response.data.message || 'Cập nhật thông tin thành công!'
                });
            } else {
                setMessage({
                    type: 'danger',
                    text: response.data.message || 'Cập nhật thất bại'
                });
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message ||
                error.message ||
                'Có lỗi xảy ra khi cập nhật thông tin';
            setMessage({
                type: 'danger',
                text: errorMessage
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'danger', text: 'Mật khẩu xác nhận không khớp!' });
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setMessage({ type: 'danger', text: 'Mật khẩu mới phải có ít nhất 6 ký tự!' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await authService.changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            // Kiểm tra success
            if (response.data.success !== false) {
                setMessage({
                    type: 'success',
                    text: response.data.message || 'Đổi mật khẩu thành công!'
                });
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
            } else {
                setMessage({
                    type: 'danger',
                    text: response.data.message || 'Đổi mật khẩu thất bại'
                });
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message ||
                error.message ||
                'Có lỗi xảy ra khi đổi mật khẩu';
            setMessage({
                type: 'danger',
                text: errorMessage
            });
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            const response = await notificationService.markAsRead(notificationId);
            if (response.data.success !== false) {
                fetchNotifications();
            }
        } catch (error) {
            console.error('Error marking as read:', error);
            // Vẫn refresh để đảm bảo UI đồng bộ
            fetchNotifications();
        }
    };

    const markAllAsRead = async () => {
        try {
            const response = await notificationService.markAllAsRead();
            if (response.data.success !== false) {
                fetchNotifications();
            }
        } catch (error) {
            console.error('Error marking all as read:', error);
            setMessage({
                type: 'danger',
                text: 'Không thể đánh dấu đã đọc. Vui lòng thử lại.'
            });
        }
    };

    return (
        <div className="profile-page">
            {/* Modern Header */}
            <div className="profile-header">
                <Container>
                    <div className="profile-header-content">
                        <div className="avatar-placeholder">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                                <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z" />
                            </svg>
                        </div>
                        <h2 className="profile-name">{user?.fullName || 'Người dùng'}</h2>
                        <p className="profile-email">{user?.email}</p>
                    </div>
                </Container>
            </div>

            <Container fluid className="thong-tin-ca-nhan py-4">
                <Row>
                    {/* Sidebar - User Info */}
                    <Col lg={3} className="mb-4">
                        <div className="profile-content-card text-center">
                            <div className="avatar-placeholder mb-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                                    <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z" />
                                </svg>
                            </div>
                            <h4 className="mb-2">{user?.fullName || 'Người dùng'}</h4>
                            <p className="text-muted mb-3">{user?.email}</p>
                            <Badge bg={user?.role === 'admin' ? 'danger' : 'primary'} className="mb-4">
                                {user?.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}
                            </Badge>

                            <hr className="my-4" />

                            {/* Stats in Sidebar */}
                            <div className="text-start">
                                <h6 className="mb-3" style={{ color: '#0f2e71', fontWeight: 700 }}>Thống Kê</h6>
                                <div className="stat-item">
                                    <span>Tổng đơn đặt:</span>
                                    <strong>{stats.totalBookings}</strong>
                                </div>
                                <div className="stat-item">
                                    <span>Hoàn thành:</span>
                                    <strong className="text-success">{stats.completedBookings}</strong>
                                </div>
                                <div className="stat-item">
                                    <span>Đã hủy:</span>
                                    <strong className="text-danger">{stats.cancelledBookings}</strong>
                                </div>
                                <hr className="my-3" />
                                <div className="stat-item">
                                    <span>Tổng chi tiêu:</span>
                                    <strong style={{ color: '#10b981', fontSize: '1.1rem' }}>
                                        {stats.totalSpent.toLocaleString()}đ
                                    </strong>
                                </div>
                            </div>
                        </div>
                    </Col>

                    {/* Main Content - 9 cols */}
                    <Col lg={9}>
                        {/* Navigation Tabs */}
                        <div className="profile-nav mb-4">
                            <Nav variant="tabs">
                                <Nav.Item>
                                    <Nav.Link
                                        active={activeTab === 'info'}
                                        onClick={() => setActiveTab('info')}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                                            <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z" />
                                        </svg>
                                        Thông tin cá nhân
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link
                                        active={activeTab === 'password'}
                                        onClick={() => setActiveTab('password')}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
                                        </svg>
                                        Đổi mật khẩu
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link
                                        active={activeTab === 'notifications'}
                                        onClick={() => setActiveTab('notifications')}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zM8 1.918l-.797.161A4.002 4.002 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4.002 4.002 0 0 0-3.203-3.92L8 1.917zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5.002 5.002 0 0 1 13 6c0 .88.32 4.2 1.22 6z" />
                                        </svg>
                                        Thông báo {unreadCount > 0 && (
                                            <Badge bg="danger" className="ms-1 unread-badge">{unreadCount}</Badge>
                                        )}
                                    </Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </div>

                        {/* Message Alert */}
                        {message.text && (
                            <Alert
                                variant={message.type}
                                dismissible
                                onClose={() => setMessage({ type: '', text: '' })}
                            >
                                {message.text}
                            </Alert>
                        )}

                        {/* Tab Content */}
                        {activeTab === 'info' && (
                            <div className="profile-content-card">
                                <div className="section-title">
                                    <div className="section-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                                            <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z" />
                                        </svg>
                                    </div>
                                    Cập Nhật Thông Tin
                                </div>
                                <Form onSubmit={handleProfileSubmit} className="profile-form">
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Họ và tên</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="fullName"
                                                    value={profileData.fullName}
                                                    onChange={handleProfileChange}
                                                    required
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Số điện thoại</Form.Label>
                                                <Form.Control
                                                    type="tel"
                                                    name="phone"
                                                    value={profileData.phone}
                                                    onChange={handleProfileChange}
                                                    required
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Form.Group className="mb-4">
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control
                                            type="email"
                                            name="email"
                                            value={profileData.email}
                                            onChange={handleProfileChange}
                                            required
                                            disabled
                                        />
                                        <Form.Text className="text-muted">
                                            Email không thể thay đổi
                                        </Form.Text>
                                    </Form.Group>

                                    <Button
                                        variant="primary"
                                        type="submit"
                                        disabled={loading}
                                        className="btn-update"
                                    >
                                        {loading ? (
                                            <>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '8px', animation: 'spin 1s linear infinite' }}>
                                                    <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z" />
                                                    <path fillRule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z" />
                                                </svg>
                                                Đang xử lý...
                                            </>
                                        ) : (
                                            <>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '8px' }}>
                                                    <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                                    <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z" />
                                                </svg>
                                                Lưu thay đổi
                                            </>
                                        )}
                                    </Button>
                                </Form>
                            </div>
                        )}

                        {activeTab === 'password' && (
                            <div className="profile-content-card">
                                <div className="section-title">
                                    <div className="section-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
                                        </svg>
                                    </div>
                                    Đổi Mật Khẩu
                                </div>
                                <Form onSubmit={handlePasswordSubmit} className="profile-form">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Mật khẩu hiện tại</Form.Label>
                                        <Form.Control
                                            type="password"
                                            name="currentPassword"
                                            value={passwordData.currentPassword}
                                            onChange={handlePasswordChange}
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Mật khẩu mới</Form.Label>
                                        <Form.Control
                                            type="password"
                                            name="newPassword"
                                            value={passwordData.newPassword}
                                            onChange={handlePasswordChange}
                                            required
                                            minLength={6}
                                        />
                                        <Form.Text className="text-muted">
                                            Mật khẩu phải có ít nhất 6 ký tự
                                        </Form.Text>
                                    </Form.Group>

                                    <Form.Group className="mb-4">
                                        <Form.Label>Xác nhận mật khẩu mới</Form.Label>
                                        <Form.Control
                                            type="password"
                                            name="confirmPassword"
                                            value={passwordData.confirmPassword}
                                            onChange={handlePasswordChange}
                                            required
                                        />
                                    </Form.Group>

                                    <Button
                                        variant="primary"
                                        type="submit"
                                        disabled={loading}
                                        className="btn-update"
                                    >
                                        {loading ? '⏳ Đang xử lý...' : '🔒 Đổi mật khẩu'}
                                    </Button>
                                </Form>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="profile-content-card">
                                <div className="notification-header mb-3 d-flex justify-content-between align-items-center">
                                    <div className="section-title">
                                        <div className="section-icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                                <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zM8 1.918l-.797.161A4.002 4.002 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4.002 4.002 0 0 0-3.203-3.92L8 1.917zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5.002 5.002 0 0 1 13 6c0 .88.32 4.2 1.22 6z" />
                                            </svg>
                                        </div>
                                        Thông Báo
                                    </div>
                                    {unreadCount > 0 && (
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            onClick={markAllAsRead}
                                        >
                                            ✓ Đánh dấu tất cả đã đọc
                                        </Button>
                                    )}
                                </div>

                                {notifications.length === 0 ? (
                                    <Alert variant="info" className="text-center">
                                        Không có thông báo nào
                                    </Alert>
                                ) : (
                                    <div className="notifications-list">
                                        {notifications.map(notif => (
                                            <div
                                                key={notif._id}
                                                className={`notification-item ${!notif.isRead ? 'unread' : ''}`}
                                                onClick={() => !notif.isRead && markAsRead(notif._id)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <div className="d-flex">
                                                    <div className="notif-icon me-3">
                                                        <span className="fs-3">
                                                            {notif.type === 'booking' ? '📅' :
                                                                notif.type === 'payment' ? '💳' : '🔔'}
                                                        </span>
                                                    </div>
                                                    <div className="flex-grow-1">
                                                        <div className="d-flex justify-content-between">
                                                            <h6 className="mb-1">{notif.title}</h6>
                                                            {!notif.isRead && (
                                                                <Badge bg="primary">Mới</Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-muted mb-1">{notif.message}</p>
                                                        <small className="text-muted">
                                                            {new Date(notif.createdAt).toLocaleString('vi-VN')}
                                                        </small>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Thongtincanhan;
