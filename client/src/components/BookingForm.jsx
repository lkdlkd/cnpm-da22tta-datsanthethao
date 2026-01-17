import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Container,
    Row,
    Col,
    Card,
    Button,
    Form,
    Alert,
    Spinner,
    Badge,
    ListGroup
} from 'react-bootstrap';
import { useAuth } from './AuthContext';
import { bookingService } from '../services/api';
import './BookingForm.css';

const BookingForm = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { auth, user } = useAuth();
    const { field, timeSlot, date } = location.state || {};

    const [formData, setFormData] = useState({
        customerName: user?.fullName || '',
        customerPhone: user?.phone || '',
        notes: '',
        paymentMethod: 'cash'
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [bookingInfo, setBookingInfo] = useState(null);
    const [selectedServices, setSelectedServices] = useState([]);

    // Load services from sessionStorage on mount
    useEffect(() => {
        const savedServices = sessionStorage.getItem('selectedServices');
        if (savedServices) {
            try {
                const parsed = JSON.parse(savedServices);
                setSelectedServices(parsed);
            } catch (e) {
                console.error('Error parsing services:', e);
                sessionStorage.removeItem('selectedServices');
            }
        }
    }, []);

    const removeService = (serviceId) => {
        const updated = selectedServices.filter(s => s.serviceId !== serviceId);
        setSelectedServices(updated);
        sessionStorage.setItem('selectedServices', JSON.stringify(updated));
    };

    const getServicesTotal = () => {
        return selectedServices.reduce((total, s) => total + (s.price * s.quantity), 0);
    };

    const getTotalPrice = () => {
        return (timeSlot?.price || 0) + getServicesTotal();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!field || !timeSlot) {
            setError('Thiếu thông tin đặt sân');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const bookingData = {
                field: field._id,
                timeSlot: timeSlot._id,
                bookingDate: date,
                startTime: timeSlot.startTime,
                endTime: timeSlot.endTime,
                totalPrice: getTotalPrice(),
                customerName: formData.customerName,
                customerPhone: formData.customerPhone,
                notes: formData.notes,
                paymentMethod: formData.paymentMethod // Backend tự động tạo payment
            };

            // Add services if any
            if (selectedServices.length > 0) {
                bookingData.services = selectedServices.map(s => ({
                    service: s.serviceId,
                    quantity: s.quantity,
                    price: s.price
                }));
            }

            const bookingResponse = await bookingService.createBooking(bookingData);
            const booking = bookingResponse.data.data.booking;

            // Clear saved services
            sessionStorage.removeItem('selectedServices');

            // Hiển thị thông tin thanh toán
            setBookingInfo(booking);
            setBookingSuccess(true);

            // Chỉ navigate nếu thanh toán tiền mặt
            if (formData.paymentMethod === 'cash') {
                setTimeout(() => {
                    navigate('/danh-sach-san-da-dat');
                }, 2000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra khi đặt sân');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    if (!field || !timeSlot) {
        return (
            <Container className="py-5">
                <Alert variant="danger">Thiếu thông tin đặt sân</Alert>
                <Button variant="primary" onClick={() => navigate('/')}>
                    Quay lại trang chủ
                </Button>
            </Container>
        );
    }

    // Cấu hình ngân hàng
    const bankInfo = {
        bank_name: 'MB',
        account_number: process.env.REACT_APP_BANK_ACCOUNT_NUMBER || '0123456789',
        account_name: process.env.REACT_APP_BANK_ACCOUNT_NAME || 'CONG TY SAN BONG'
    };

    if (bookingSuccess && bookingInfo) {
        return (
            <div className="booking-form-page">
                <Container className="py-5">
                    <Row className="justify-content-center">
                        <Col lg={8}>
                            <div className="success-animation mb-4">
                                <div className="success-checkmark">
                                    <div className="check-icon">
                                        <span className="icon-line line-tip"></span>
                                        <span className="icon-line line-long"></span>
                                        <div className="icon-circle"></div>
                                        <div className="icon-fix"></div>
                                    </div>
                                </div>
                            </div>
                            
                            <Card className="booking-success-card shadow-lg">
                                <Card.Header className="success-header text-center">
                                    <h2 className="mb-2">🎉 Đặt Sân Thành Công!</h2>
                                    <p className="mb-0">Cảm ơn bạn đã tin tưởng sử dụng dịch vụ</p>
                                </Card.Header>
                                <Card.Body className="p-4">
                                    <div className="booking-code-section text-center mb-4">
                                        <p className="mb-2 text-muted">Mã đơn đặt sân của bạn</p>
                                        <div className="booking-code">
                                            <h3 className="mb-0">{bookingInfo.bookingCode}</h3>
                                        </div>
                                        <small className="text-muted">Vui lòng lưu mã này để tra cứu đơn hàng</small>
                                    </div>

                                    {formData.paymentMethod === 'banking' ? (
                                        <>
                                            <div className="qr-payment-wrapper">
                                                <Row>
                                                    <Col md={6} className="text-center mb-4 mb-md-0">
                                                        <div className="qr-section">
                                                            <h5 className="qr-title">Quét mã QR để thanh toán</h5>
                                                            <div className="qr-frame">
                                                                <img
                                                                    src={`https://img.vietqr.io/image/${bankInfo.bank_name}-${bankInfo.account_number}-compact.jpg?accountName=${encodeURIComponent(bankInfo.account_name)}&amount=${getTotalPrice()}&addInfo=${encodeURIComponent(bookingInfo.bookingCode)}`}
                                                                    alt="QR Code"
                                                                    className="qr-image"
                                                                />
                                                            </div>
                                                            <p className="qr-hint">Mở app ngân hàng và quét mã</p>
                                                        </div>
                                                    </Col>
                                                    <Col md={6}>
                                                        <div className="bank-details">
                                                            <h5 className="bank-title">Thông tin chuyển khoản</h5>
                                                            <div className="bank-info-list">
                                                                <div className="bank-info-item">
                                                                    <span className="label">Ngân hàng</span>
                                                                    <span className="value">MB Bank</span>
                                                                </div>
                                                                <div className="bank-info-item">
                                                                    <span className="label">Số tài khoản</span>
                                                                    <span className="value account-number">{bankInfo.account_number}</span>
                                                                </div>
                                                                <div className="bank-info-item">
                                                                    <span className="label">Chủ tài khoản</span>
                                                                    <span className="value">{bankInfo.account_name}</span>
                                                                </div>
                                                                <div className="bank-info-item amount">
                                                                    <span className="label">Số tiền</span>
                                                                    <span className="value text-danger">{getTotalPrice().toLocaleString()}đ</span>
                                                                </div>
                                                                <div className="bank-info-item">
                                                                    <span className="label">Nội dung CK</span>
                                                                    <span className="value transfer-code">{bookingInfo.bookingCode}</span>
                                                                </div>
                                                            </div>
                                                            <div className="payment-note">
                                                                <small>⏱️ Hệ thống tự động xác nhận sau 5-10 phút</small>
                                                            </div>
                                                        </div>
                                                    </Col>
                                                </Row>
                                            </div>
                                        </>
                                    ) : (
                                        <Alert variant="info">
                                            <p>✅ Đơn đặt sân của bạn đã được tạo thành công!</p>
                                            <p>💵 Vui lòng thanh toán tiền mặt khi đến sân.</p>
                                        </Alert>
                                    )}

                                    <div className="d-grid gap-2 mt-4">
                                        <Button
                                            variant="primary"
                                            size="lg"
                                            onClick={() => navigate('/danh-sach-san-da-dat')}
                                        >
                                            📋 Xem Đơn Đặt Của Tôi
                                        </Button>
                                        <Button
                                            variant="outline-secondary"
                                            onClick={() => navigate('/home')}
                                        >
                                            🏠 Về Trang Chủ
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        );
    }

    return (
        <div className="booking-form-page">
            <Container className="py-4">
                {/* Header */}
                <div className="booking-page-header">
                    <div className="header-content">
                        <h1 className="page-title">Xác Nhận Đặt Sân</h1>
                        <p className="page-subtitle">Hoàn tất thông tin để đặt sân ngay</p>
                    </div>
                </div>

                {/* Progress Steps - Compact */}
                <div className="progress-tracker">
                    <div className="progress-step completed">
                        <div className="step-number">1</div>
                        <span>Chọn sân</span>
                    </div>
                    <div className="progress-line completed"></div>
                    <div className="progress-step active">
                        <div className="step-number">2</div>
                        <span>Xác nhận</span>
                    </div>
                    <div className="progress-line"></div>
                    <div className="progress-step">
                        <div className="step-number">3</div>
                        <span>Hoàn tất</span>
                    </div>
                </div>

                {error && <Alert variant="danger" className="error-alert">{error}</Alert>}

                <Row className="g-4">
                    {/* Left Column - Field Info */}
                    <Col lg={5}>

                        <div className="field-info-card">
                            {/* Field Image */}
                            {field.images && field.images.length > 0 && (
                                <div className="field-image-section">
                                    <img 
                                        src={field.images[0]} 
                                        alt={field.name}
                                        className="field-preview-image"
                                        onError={(e) => {
                                            e.target.src = '/img/default-field.jpg';
                                        }}
                                    />
                                    <div className="field-badge">
                                        <Badge bg="success">{field.fieldType}</Badge>
                                    </div>
                                </div>
                            )}

                            {/* Field Details */}
                            <div className="field-details-section">
                                <h4 className="field-name">{field.name}</h4>
                                
                                <div className="info-grid">
                                    <div className="info-item">
                                        <div className="info-icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                                                <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
                                            </svg>
                                        </div>
                                        <div className="info-text">
                                            <span className="info-label">Địa chỉ</span>
                                            <span className="info-value">{field.address}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="info-item">
                                        <div className="info-icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                                                <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM2 2a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H2z"/>
                                                <path d="M2.5 4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5V4z"/>
                                            </svg>
                                        </div>
                                        <div className="info-text">
                                            <span className="info-label">Ngày đặt</span>
                                            <span className="info-value">{new Date(date).toLocaleDateString('vi-VN', { 
                                                weekday: 'long', 
                                                day: 'numeric',
                                                month: 'numeric',
                                                year: 'numeric'
                                            })}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="info-item">
                                        <div className="info-icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                                                <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                                                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
                                            </svg>
                                        </div>
                                        <div className="info-text">
                                            <span className="info-label">Khung giờ</span>
                                            <span className="info-value time-slot">{timeSlot.startTime} - {timeSlot.endTime}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Services */}
                                {selectedServices.length > 0 && (
                                    <div className="services-section">
                                        <h6 className="services-heading">Dịch vụ bổ sung</h6>
                                        {selectedServices.map((service, idx) => (
                                            <div key={idx} className="service-row">
                                                <span className="service-name-text">{service.name} <small>x{service.quantity}</small></span>
                                                <div className="service-right">
                                                    <span className="service-price-text">{(service.price * service.quantity).toLocaleString()}đ</span>
                                                    <button className="remove-service-btn" onClick={() => removeService(service.serviceId)}>×</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Price Summary */}
                                <div className="price-summary">
                                    <div className="price-row">
                                        <span>Giá thuê sân</span>
                                        <span>{timeSlot.price.toLocaleString()}đ</span>
                                    </div>
                                    {selectedServices.length > 0 && (
                                        <div className="price-row">
                                            <span>Dịch vụ</span>
                                            <span>{getServicesTotal().toLocaleString()}đ</span>
                                        </div>
                                    )}
                                    <div className="price-row total">
                                        <span>Tổng cộng</span>
                                        <span className="total-price">{getTotalPrice().toLocaleString()}đ</span>
                                    </div>
                                </div>

                                {selectedServices.length === 0 && (
                                    <button
                                        className="add-service-btn"
                                        onClick={() => {
                                            sessionStorage.setItem('bookingDraft', JSON.stringify({ field, timeSlot, date }));
                                            navigate('/dich-vu');
                                        }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                                        </svg>
                                        Thêm dịch vụ
                                    </button>
                                )}
                            </div>
                        </div>
                    </Col>

                    {/* Right Column - Booking Form */}
                    <Col lg={7}>
                        <div className="booking-form-section">
                            <Form onSubmit={handleSubmit}>
                                {/* Customer Info */}
                                <div className="form-card">
                                    <div className="form-card-header">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
                                        </svg>
                                        <h5>Thông tin khách hàng</h5>
                                    </div>
                                    <div className="form-card-body">
                                        <div className="form-row">
                                            <Form.Group className="form-group-custom">
                                                <Form.Label>Họ và tên <span className="required">*</span></Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="customerName"
                                                    value={formData.customerName}
                                                    onChange={handleInputChange}
                                                    required
                                                    placeholder="Nhập họ và tên"
                                                    className="custom-input"
                                                />
                                            </Form.Group>
                                            <Form.Group className="form-group-custom">
                                                <Form.Label>Số điện thoại <span className="required">*</span></Form.Label>
                                                <Form.Control
                                                    type="tel"
                                                    name="customerPhone"
                                                    value={formData.customerPhone}
                                                    onChange={handleInputChange}
                                                    required
                                                    placeholder="Nhập số điện thoại"
                                                    className="custom-input"
                                                />
                                            </Form.Group>
                                        </div>
                                        <Form.Group className="form-group-custom">
                                            <Form.Label>Ghi chú</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={2}
                                                name="notes"
                                                value={formData.notes}
                                                onChange={handleInputChange}
                                                placeholder="Ghi chú thêm (nếu có)"
                                                className="custom-input"
                                            />
                                        </Form.Group>
                                    </div>
                                </div>

                                {/* Payment Method */}
                                <div className="form-card">
                                    <div className="form-card-header">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v1h14V4a1 1 0 0 0-1-1H2zm13 4H1v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V7z"/>
                                            <path d="M2 10a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-1z"/>
                                        </svg>
                                        <h5>Phương thức thanh toán</h5>
                                    </div>
                                    <div className="form-card-body">
                                        <div className="payment-methods">
                                            <label className={`payment-method-card ${formData.paymentMethod === 'cash' ? 'selected' : ''}`}>
                                                <input
                                                    type="radio"
                                                    name="paymentMethod"
                                                    value="cash"
                                                    checked={formData.paymentMethod === 'cash'}
                                                    onChange={handleInputChange}
                                                />
                                                <div className="payment-method-content">
                                                    <div className="payment-method-icon cash">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                                                            <path d="M1 3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1H1zm7 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/>
                                                            <path d="M0 5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V5zm3 0a2 2 0 0 1-2 2v4a2 2 0 0 1 2 2h10a2 2 0 0 1 2-2V7a2 2 0 0 1-2-2H3z"/>
                                                        </svg>
                                                    </div>
                                                    <div className="payment-method-info">
                                                        <strong>Tiền mặt</strong>
                                                        <span>Thanh toán tại sân</span>
                                                    </div>
                                                    <div className="check-mark"></div>
                                                </div>
                                            </label>
                                            
                                            <label className={`payment-method-card ${formData.paymentMethod === 'banking' ? 'selected' : ''}`}>
                                                <input
                                                    type="radio"
                                                    name="paymentMethod"
                                                    value="banking"
                                                    checked={formData.paymentMethod === 'banking'}
                                                    onChange={handleInputChange}
                                                />
                                                <div className="payment-method-content">
                                                    <div className="payment-method-icon banking">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                                                            <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zM2.04 4.326c.325 1.329 2.532 2.54 3.717 3.19.48.263.793.434.743.484-.08.08-.162.158-.242.234-.416.396-.787.749-.758 1.266.035.634.618.824 1.214 1.017.577.188 1.168.38 1.286.983.082.417-.075.988-.22 1.52-.215.782-.406 1.48.22 1.48 1.5-.5 3.798-3.186 4-5 .138-1.243-2-2-3.5-2.5-.478-.16-.755.081-.99.284-.172.15-.322.279-.51.216-.445-.148-2.5-2-1.5-2.5.78-.39.952-.171 1.227.182.078.099.163.208.273.318.609.304.662-.132.723-.633.039-.322.081-.671.277-.867.434-.434 1.265-.791 2.028-1.12.712-.306 1.365-.587 1.579-.88A7 7 0 1 1 2.04 4.327z"/>
                                                        </svg>
                                                    </div>
                                                    <div className="payment-method-info">
                                                        <strong>Chuyển khoản</strong>
                                                        <span>QR Code ngân hàng</span>
                                                    </div>
                                                    <div className="check-mark"></div>
                                                </div>
                                            </label>
                                        </div>

                                        {formData.paymentMethod === 'banking' && (
                                            <div className="banking-info-note">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                    <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
                                                </svg>
                                                <span>Mã QR sẽ hiển thị sau khi xác nhận. Hệ thống tự động xác nhận sau 5-10 phút.</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Notice */}
                                <div className="booking-notice-box">
                                    <div className="notice-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
                                        </svg>
                                    </div>
                                    <div className="notice-content">
                                        <strong>Lưu ý:</strong> Vui lòng đến sân đúng giờ đã đặt. Liên hệ hotline <strong>1900-xxxx</strong> nếu cần hỗ trợ.
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="form-actions-section">
                                    <Button
                                        type="submit"
                                        className="btn-confirm-booking"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <Spinner animation="border" size="sm" className="me-2" />
                                                Đang xử lý...
                                            </>
                                        ) : (
                                            <>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                                    <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
                                                </svg>
                                                Xác nhận đặt sân
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        variant="outline-secondary"
                                        className="btn-back"
                                        onClick={() => navigate(-1)}
                                        disabled={loading}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                            <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
                                        </svg>
                                        Quay lại
                                    </Button>
                                </div>
                            </Form>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default BookingForm;
