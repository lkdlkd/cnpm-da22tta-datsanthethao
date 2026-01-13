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
            const bookings = response.data.data || [];
            
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
        }
    };

    const fetchNotifications = async () => {
        try {
            const response = await notificationService.getUserNotifications();
            setNotifications(response.data.notifications || []);
            setUnreadCount(response.data.unreadCount || 0);
        } catch (error) {
            console.error('Error fetching notifications:', error);
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
            setUser(response.data.user);
            setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' });
        } catch (error) {
            setMessage({ 
                type: 'danger', 
                text: error.response?.data?.message || 'Có lỗi xảy ra' 
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
            await authService.changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            setMessage({ type: 'success', text: 'Đổi mật khẩu thành công!' });
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            setMessage({ 
                type: 'danger', 
                text: error.response?.data?.message || 'Có lỗi xảy ra' 
            });
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await notificationService.markAsRead(notificationId);
            fetchNotifications();
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            fetchNotifications();
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    return (
        <Container fluid className="thong-tin-ca-nhan py-4">
            <Row>
                {/* Sidebar */}
                <Col lg={3} className="mb-4">
                    <Card className="shadow-sm border-0">
                        <Card.Body className="text-center">
                            <div className="avatar-placeholder mb-3">
                                <span className="display-1">👤</span>
                            </div>
                            <h5 className="mb-1">{user?.fullName}</h5>
                            <p className="text-muted small mb-3">{user?.email}</p>
                            <Badge bg={user?.role === 'admin' ? 'danger' : 'primary'}>
                                {user?.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}
                            </Badge>
                        </Card.Body>
                    </Card>

                    {/* Stats Card */}
                    <Card className="shadow-sm border-0 mt-3">
                        <Card.Body>
                            <h6 className="mb-3">📊 Thống Kê</h6>
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
                            <hr />
                            <div className="stat-item">
                                <span>Tổng chi tiêu:</span>
                                <strong className="text-primary">
                                    {stats.totalSpent.toLocaleString()}đ
                                </strong>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Main Content */}
                <Col lg={9}>
                    {/* Navigation Tabs */}
                    <Nav variant="tabs" className="mb-4">
                        <Nav.Item>
                            <Nav.Link 
                                active={activeTab === 'info'}
                                onClick={() => setActiveTab('info')}
                            >
                                📋 Thông tin cá nhân
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link 
                                active={activeTab === 'password'}
                                onClick={() => setActiveTab('password')}
                            >
                                🔒 Đổi mật khẩu
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link 
                                active={activeTab === 'notifications'}
                                onClick={() => setActiveTab('notifications')}
                            >
                                🔔 Thông báo {unreadCount > 0 && (
                                    <Badge bg="danger" className="ms-1">{unreadCount}</Badge>
                                )}
                            </Nav.Link>
                        </Nav.Item>
                    </Nav>

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
                        <Card className="shadow-sm border-0">
                            <Card.Body className="p-4">
                                <h4 className="mb-4">Cập Nhật Thông Tin</h4>
                                <Form onSubmit={handleProfileSubmit}>
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
                                    >
                                        {loading ? '⏳ Đang xử lý...' : '💾 Lưu thay đổi'}
                                    </Button>
                                </Form>
                            </Card.Body>
                        </Card>
                    )}

                    {activeTab === 'password' && (
                        <Card className="shadow-sm border-0">
                            <Card.Body className="p-4">
                                <h4 className="mb-4">Đổi Mật Khẩu</h4>
                                <Form onSubmit={handlePasswordSubmit}>
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
                                    >
                                        {loading ? '⏳ Đang xử lý...' : '🔒 Đổi mật khẩu'}
                                    </Button>
                                </Form>
                            </Card.Body>
                        </Card>
                    )}

                    {activeTab === 'notifications' && (
                        <Card className="shadow-sm border-0">
                            <Card.Body className="p-4">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h4 className="mb-0">Thông Báo</h4>
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
                            </Card.Body>
                        </Card>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default Thongtincanhan;
