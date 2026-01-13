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
    Spinner
} from 'react-bootstrap';
import { useAuth } from './AuthContext';
import { bookingService, paymentService } from '../services/api';
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
                notes: formData.notes
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

            const booking = bookingResponse.data.data;

            await paymentService.createPayment({
                booking: booking._id,
                amount: getTotalPrice(),
                paymentMethod: formData.paymentMethod
            });

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
        account_name:  process.env.REACT_APP_BANK_ACCOUNT_NAME || 'CONG TY SAN BONG'
    };

    if (bookingSuccess && bookingInfo) {
        return (
            <div className="booking-form-page">
                <Container className="py-4">
                    <Row className="justify-content-center">
                        <Col lg={8}>
                            <Card className="shadow-sm">
                                <Card.Header className="bg-success text-white">
                                    <h4 className="mb-0">✅ Đặt Sân Thành Công!</h4>
                                </Card.Header>
                                <Card.Body className="text-center">
                                    <Alert variant="success">
                                        <h5>Mã đơn: <strong>{bookingInfo.bookingCode}</strong></h5>
                                    </Alert>

                                    {formData.paymentMethod === 'banking' ? (
                                        <>
                                            <h5 className="mb-3">📱 Quét mã QR để thanh toán</h5>
                                            <div className="qr-code-container mb-4">
                                                <img 
                                                    src={`https://img.vietqr.io/image/${bankInfo.bank_name}-${bankInfo.account_number}-qronly.jpg?accountName=${encodeURIComponent(bankInfo.account_name)}&amount=${getTotalPrice()}&addInfo=${encodeURIComponent(bookingInfo.bookingCode)}`}
                                                    alt="QR Code"
                                                    style={{ maxWidth: '300px', width: '100%' }}
                                                />
                                            </div>
                                            
                                            <Card className="mb-3 bg-light">
                                                <Card.Body>
                                                    <h6>Thông tin chuyển khoản:</h6>
                                                    <hr />
                                                    <p className="mb-1"><strong>Ngân hàng:</strong> MB Bank (Quân đội)</p>
                                                    <p className="mb-1"><strong>Số tài khoản:</strong> {bankInfo.account_number}</p>
                                                    <p className="mb-1"><strong>Chủ tài khoản:</strong> {bankInfo.account_name}</p>
                                                    <p className="mb-1"><strong>Số tiền:</strong> <span className="text-danger fw-bold">{getTotalPrice().toLocaleString()}đ</span></p>
                                                    <p className="mb-1"><strong>Nội dung:</strong> <code className="bg-warning p-1">{bookingInfo.bookingCode}</code></p>
                                                    <hr />
                                                    <small className="text-muted">
                                                        ⚠️ Hệ thống sẽ tự động xác nhận thanh toán sau khi nhận được tiền (5-10 phút)
                                                    </small>
                                                </Card.Body>
                                            </Card>
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
                <Row className="justify-content-center">
                    <Col lg={8}>
                        <Card className="shadow-sm">
                            <Card.Header className="bg-primary text-white">
                                <h4 className="mb-0">📝 Xác Nhận Đặt Sân</h4>
                            </Card.Header>
                            <Card.Body>
                                {error && <Alert variant="danger">{error}</Alert>}

                                <Card className="mb-4 bg-light">
                                    <Card.Body>
                                        <h5 className="mb-3">📋 Thông Tin Đặt Sân</h5>
                                        <Row>
                                            <Col md={6}>
                                                <p><strong>Sân:</strong> {field.name}</p>
                                                <p><strong>Loại sân:</strong> {field.fieldType}</p>
                                                <p><strong>Địa chỉ:</strong> {field.address}</p>
                                            </Col>
                                            <Col md={6}>
                                                <p><strong>Ngày:</strong> {new Date(date).toLocaleDateString('vi-VN')}</p>
                                                <p><strong>Giờ:</strong> {timeSlot.startTime} - {timeSlot.endTime}</p>
                                                <p className="text-primary">
                                                    <strong>Giá sân:</strong> {timeSlot.price.toLocaleString()}đ
                                                </p>
                                            </Col>
                                        </Row>

                                        {selectedServices.length > 0 && (
                                            <>
                                                <hr />
                                                <h6 className="mb-2">🛍️ Dịch vụ bổ sung:</h6>
                                                {selectedServices.map((service, idx) => (
                                                    <div key={idx} className="d-flex justify-content-between align-items-center mb-2">
                                                        <div>
                                                            <span>{service.name}</span>
                                                            <small className="text-muted"> x{service.quantity}</small>
                                                        </div>
                                                        <div className="d-flex align-items-center gap-2">
                                                            <span className="text-primary">
                                                                {(service.price * service.quantity).toLocaleString()}đ
                                                            </span>
                                                            <Button
                                                                variant="outline-danger"
                                                                size="sm"
                                                                onClick={() => removeService(service.serviceId)}
                                                            >
                                                                ✕
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                                <hr />
                                            </>
                                        )}

                                        <div className="d-flex justify-content-between align-items-center">
                                            <h5 className="mb-0">💰 Tổng thanh toán:</h5>
                                            <h4 className="text-danger mb-0">
                                                {getTotalPrice().toLocaleString()}đ
                                            </h4>
                                        </div>

                                        {selectedServices.length === 0 && (
                                            <div className="mt-3">
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    onClick={() => {
                                                        sessionStorage.setItem('bookingDraft', JSON.stringify({
                                                            field, timeSlot, date
                                                        }));
                                                        navigate('/dich-vu');
                                                    }}
                                                >
                                                    ➕ Thêm dịch vụ
                                                </Button>
                                            </div>
                                        )}
                                    </Card.Body>
                                </Card>

                                <Form onSubmit={handleSubmit}>
                                    <h5 className="mb-3">👤 Thông Tin Khách Hàng</h5>
                                    
                                    <Form.Group className="mb-3">
                                        <Form.Label>Họ và tên <span className="text-danger">*</span></Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="customerName"
                                            value={formData.customerName}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="Nhập họ và tên"
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Số điện thoại <span className="text-danger">*</span></Form.Label>
                                        <Form.Control
                                            type="tel"
                                            name="customerPhone"
                                            value={formData.customerPhone}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="Nhập số điện thoại"
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Ghi chú</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            name="notes"
                                            value={formData.notes}
                                            onChange={handleInputChange}
                                            placeholder="Ghi chú thêm (nếu có)"
                                        />
                                    </Form.Group>

                                    <h5 className="mb-3">💳 Phương Thức Thanh Toán</h5>
                                    
                                    <Form.Group className="mb-3">
                                        <Form.Check
                                            type="radio"
                                            id="payment-cash"
                                            name="paymentMethod"
                                            value="cash"
                                            label="💵 Thanh toán tiền mặt tại sân"
                                            checked={formData.paymentMethod === 'cash'}
                                            onChange={handleInputChange}
                                        />
                                        <Form.Check
                                            type="radio"
                                            id="payment-banking"
                                            name="paymentMethod"
                                            value="banking"
                                            label="🏦 Chuyển khoản ngân hàng"
                                            checked={formData.paymentMethod === 'banking'}
                                            onChange={handleInputChange}
                                            className="mt-2"
                                        />
                                    </Form.Group>

                                    {formData.paymentMethod === 'banking' && (
                                        <Alert variant="warning" className="mb-3">
                                            <h6 className="alert-heading">📱 Thông tin chuyển khoản:</h6>
                                            <hr />
                                            <p className="mb-1"><strong>Ngân hàng:</strong> MB Bank (Quân đội)</p>
                                            <p className="mb-1"><strong>Số tài khoản:</strong> {process.env.REACT_APP_BANK_ACCOUNT_NUMBER}</p>
                                            <p className="mb-1"><strong>Chủ tài khoản:</strong> {process.env.REACT_APP_BANK_ACCOUNT_NAME}</p>
                                            <p className="mb-1"><strong>Số tiền:</strong> <span className="text-danger fw-bold">{getTotalPrice().toLocaleString()}đ</span></p>
                                            <p className="mb-1"><strong>Nội dung CK:</strong> <code className="bg-warning p-1">Mã đơn (sẽ hiển thị sau khi đặt)</code></p>
                                            <hr />
                                            <small className="text-muted"> 
                                                ⚠️ QR code và mã đơn sẽ hiển thị sau khi xác nhận đặt sân. Hệ thống tự động xác nhận thanh toán sau 5-10 phút.
                                            </small>
                                        </Alert>
                                    )}

                                    <Alert variant="info">
                                        <strong>Lưu ý:</strong> Vui lòng đến sân đúng giờ đã đặt. 
                                        {formData.paymentMethod === 'cash' && ' Thanh toán tiền mặt khi đến sân.'}
                                        {formData.paymentMethod === 'banking' && ' Vui lòng chuyển khoản trước 24h so với giờ đặt sân.'}
                                        {' '}Mọi thắc mắc xin liên hệ hotline: <strong>1900-xxxx</strong>
                                    </Alert>

                                    <div className="d-grid gap-2">
                                        <Button 
                                            variant="primary" 
                                            type="submit" 
                                            size="lg"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <Spinner animation="border" size="sm" className="me-2" />
                                                    Đang xử lý...
                                                </>
                                            ) : (
                                                '✅ Xác Nhận Đặt Sân'
                                            )}
                                        </Button>
                                        <Button 
                                            variant="outline-secondary" 
                                            onClick={() => navigate(-1)}
                                            disabled={loading}
                                        >
                                            ← Quay lại
                                        </Button>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default BookingForm;
