import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import './Lienhe.css';

const Lienhe = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate form submission
        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            setFormData({
                name: '',
                email: '',
                phone: '',
                subject: '',
                message: ''
            });
        }, 3000);
    };

    return (
        <Container fluid className="lien-he-page py-5">
            {/* Hero Section */}
            <div className="text-center mb-5">
                <h1 className="display-4 fw-bold text-primary mb-3">📞 Liên Hệ Với Chúng Tôi</h1>
                <p className="lead text-muted">
                    Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn 24/7
                </p>
            </div>

            <Row className="mb-5">
                {/* Contact Info */}
                <Col lg={4} className="mb-4">
                    <Card className="h-100 shadow-sm border-0">
                        <Card.Body className="p-4">
                            <h4 className="mb-4 text-primary">📍 Thông Tin Liên Hệ</h4>
                            
                            <div className="contact-item mb-4">
                                <div className="d-flex align-items-start">
                                    <span className="fs-4 me-3">📧</span>
                                    <div>
                                        <h6 className="mb-1">Email</h6>
                                        <p className="text-muted mb-0">contact@sanbongda.com</p>
                                        <p className="text-muted mb-0">support@sanbongda.com</p>
                                    </div>
                                </div>
                            </div>

                            <div className="contact-item mb-4">
                                <div className="d-flex align-items-start">
                                    <span className="fs-4 me-3">📱</span>
                                    <div>
                                        <h6 className="mb-1">Hotline</h6>
                                        <p className="text-muted mb-0">1900-xxxx (Miễn phí)</p>
                                        <p className="text-muted mb-0">028-xxxx-xxxx</p>
                                    </div>
                                </div>
                            </div>

                            <div className="contact-item mb-4">
                                <div className="d-flex align-items-start">
                                    <span className="fs-4 me-3">📍</span>
                                    <div>
                                        <h6 className="mb-1">Địa chỉ</h6>
                                        <p className="text-muted mb-0">
                                            123 Đường ABC, Quận 1<br/>
                                            TP. Hồ Chí Minh, Việt Nam
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="contact-item mb-4">
                                <div className="d-flex align-items-start">
                                    <span className="fs-4 me-3">🕐</span>
                                    <div>
                                        <h6 className="mb-1">Giờ làm việc</h6>
                                        <p className="text-muted mb-0">Thứ 2 - Thứ 6: 8:00 - 22:00</p>
                                        <p className="text-muted mb-0">Thứ 7 - CN: 9:00 - 21:00</p>
                                    </div>
                                </div>
                            </div>

                            <hr />

                            <div className="social-links">
                                <h6 className="mb-3">Kết nối với chúng tôi</h6>
                                <div className="d-flex gap-3">
                                    <a href="#" className="btn btn-outline-primary btn-sm">
                                        📘 Facebook
                                    </a>
                                    <a href="#" className="btn btn-outline-danger btn-sm">
                                        📷 Instagram
                                    </a>
                                    <a href="#" className="btn btn-outline-info btn-sm">
                                        🐦 Zalo
                                    </a>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Contact Form */}
                <Col lg={8} className="mb-4">
                    <Card className="shadow-sm border-0">
                        <Card.Body className="p-4">
                            <h4 className="mb-4 text-primary">✉️ Gửi Tin Nhắn Cho Chúng Tôi</h4>
                            
                            {submitted && (
                                <Alert variant="success" className="mb-4">
                                    <strong>✅ Gửi thành công!</strong> Chúng tôi sẽ phản hồi trong vòng 24 giờ.
                                </Alert>
                            )}

                            <Form onSubmit={handleSubmit}>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Họ và tên <span className="text-danger">*</span></Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="Nhập họ và tên"
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Số điện thoại <span className="text-danger">*</span></Form.Label>
                                            <Form.Control
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                placeholder="Nhập số điện thoại"
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                                            <Form.Control
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="Nhập email"
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Chủ đề</Form.Label>
                                            <Form.Select
                                                name="subject"
                                                value={formData.subject}
                                                onChange={handleChange}
                                            >
                                                <option value="">Chọn chủ đề</option>
                                                <option value="booking">Hỗ trợ đặt sân</option>
                                                <option value="payment">Thanh toán</option>
                                                <option value="cancel">Hủy/Đổi lịch</option>
                                                <option value="complaint">Khiếu nại</option>
                                                <option value="suggestion">Góp ý</option>
                                                <option value="partnership">Hợp tác kinh doanh</option>
                                                <option value="other">Khác</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-4">
                                    <Form.Label>Nội dung <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={6}
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        placeholder="Nhập nội dung bạn muốn gửi..."
                                        required
                                    />
                                </Form.Group>

                                <div className="d-grid">
                                    <Button variant="primary" size="lg" type="submit">
                                        📨 Gửi Tin Nhắn
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* FAQ Section */}
            <div className="mb-5">
                <h2 className="text-center mb-4">❓ Câu Hỏi Thường Gặp</h2>
                <Row>
                    <Col lg={6} className="mb-4">
                        <Card className="h-100 shadow-sm border-0">
                            <Card.Body>
                                <h5 className="text-primary mb-3">Làm sao để đặt sân?</h5>
                                <p className="text-muted mb-0">
                                    Bạn chỉ cần đăng nhập, chọn sân và khung giờ phù hợp, 
                                    điền thông tin và xác nhận đặt sân. Rất đơn giản!
                                </p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={6} className="mb-4">
                        <Card className="h-100 shadow-sm border-0">
                            <Card.Body>
                                <h5 className="text-primary mb-3">Có thể hủy/đổi lịch không?</h5>
                                <p className="text-muted mb-0">
                                    Có! Bạn có thể hủy đơn đặt trong vòng 24h trước giờ đá. 
                                    Vui lòng liên hệ hotline để được hỗ trợ đổi lịch.
                                </p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={6} className="mb-4">
                        <Card className="h-100 shadow-sm border-0">
                            <Card.Body>
                                <h5 className="text-primary mb-3">Thanh toán như thế nào?</h5>
                                <p className="text-muted mb-0">
                                    Chúng tôi hỗ trợ thanh toán tiền mặt tại sân hoặc chuyển khoản 
                                    ngân hàng qua QR code. Rất tiện lợi và an toàn.
                                </p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={6} className="mb-4">
                        <Card className="h-100 shadow-sm border-0">
                            <Card.Body>
                                <h5 className="text-primary mb-3">Sân có đầy đủ tiện nghi không?</h5>
                                <p className="text-muted mb-0">
                                    Tất cả các sân đối tác đều được chúng tôi kiểm duyệt kỹ lưỡng, 
                                    đảm bảo chất lượng và đầy đủ tiện nghi phục vụ.
                                </p>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </div>

            {/* Map Section */}
            <Card className="shadow-sm border-0">
                <Card.Body className="p-0">
                    <div className="map-container" style={{height: '400px', background: '#e9ecef'}}>
                        <div className="d-flex align-items-center justify-content-center h-100">
                            <div className="text-center">
                                <span className="display-1">🗺️</span>
                                <p className="text-muted mt-3">Bản đồ văn phòng</p>
                            </div>
                        </div>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default Lienhe;
