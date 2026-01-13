import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import './GioiThieu.css';

const GioiThieu = () => {
    return (
        <Container fluid className="gioi-thieu-page py-5">
            {/* Hero Section */}
            <div className="hero-section text-center mb-5">
                <h1 className="display-4 fw-bold text-primary mb-3">⚽ Về Chúng Tôi</h1>
                <p className="lead text-muted">
                    Hệ thống đặt sân bóng đá hiện đại và chuyên nghiệp
                </p>
            </div>

            {/* Mission Section */}
            <Row className="mb-5">
                <Col lg={6} className="mb-4">
                    <Card className="h-100 shadow-sm border-0">
                        <Card.Body className="p-4">
                            <div className="text-center mb-3">
                                <span className="display-4">🎯</span>
                            </div>
                            <h3 className="text-center mb-3">Sứ Mệnh</h3>
                            <p className="text-muted">
                                Chúng tôi cam kết mang đến trải nghiệm đặt sân bóng đá thuận tiện, 
                                nhanh chóng và hiện đại nhất cho cộng đồng yêu bóng đá. Với công nghệ 
                                tiên tiến, chúng tôi giúp bạn dễ dàng tìm kiếm và đặt sân chỉ trong vài cú click.
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={6} className="mb-4">
                    <Card className="h-100 shadow-sm border-0">
                        <Card.Body className="p-4">
                            <div className="text-center mb-3">
                                <span className="display-4">👁️</span>
                            </div>
                            <h3 className="text-center mb-3">Tầm Nhìn</h3>
                            <p className="text-muted">
                                Trở thành nền tảng đặt sân bóng đá số 1 Việt Nam, kết nối hàng triệu 
                                người yêu bóng đá với các sân chất lượng. Chúng tôi hướng đến việc xây 
                                dựng một cộng đồng thể thao năng động và phát triển bền vững.
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Features Section */}
            <div className="mb-5">
                <h2 className="text-center mb-4">✨ Điểm Nổi Bật</h2>
                <Row>
                    <Col md={6} lg={3} className="mb-4">
                        <Card className="text-center h-100 shadow-sm border-0 feature-card">
                            <Card.Body>
                                <div className="mb-3">
                                    <span className="display-3">🚀</span>
                                </div>
                                <h5>Đặt Sân Nhanh Chóng</h5>
                                <p className="text-muted small">
                                    Chỉ 3 bước đơn giản để hoàn tất đặt sân trong vài phút
                                </p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={6} lg={3} className="mb-4">
                        <Card className="text-center h-100 shadow-sm border-0 feature-card">
                            <Card.Body>
                                <div className="mb-3">
                                    <span className="display-3">💳</span>
                                </div>
                                <h5>Thanh Toán Linh Hoạt</h5>
                                <p className="text-muted small">
                                    Hỗ trợ đa dạng phương thức: Tiền mặt, Chuyển khoản
                                </p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={6} lg={3} className="mb-4">
                        <Card className="text-center h-100 shadow-sm border-0 feature-card">
                            <Card.Body>
                                <div className="mb-3">
                                    <span className="display-3">⭐</span>
                                </div>
                                <h5>Sân Chất Lượng Cao</h5>
                                <p className="text-muted small">
                                    Đối tác với hơn 100+ sân bóng uy tín trên toàn quốc
                                </p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={6} lg={3} className="mb-4">
                        <Card className="text-center h-100 shadow-sm border-0 feature-card">
                            <Card.Body>
                                <div className="mb-3">
                                    <span className="display-3">🔔</span>
                                </div>
                                <h5>Thông Báo Tức Thì</h5>
                                <p className="text-muted small">
                                    Cập nhật trạng thái đặt sân real-time qua thông báo
                                </p>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </div>

            {/* Stats Section */}
            <div className="stats-section py-5 bg-light rounded mb-5">
                <Row className="text-center">
                    <Col md={3} className="mb-4 mb-md-0">
                        <h2 className="display-4 text-primary fw-bold">100+</h2>
                        <p className="text-muted">Sân bóng đối tác</p>
                    </Col>
                    <Col md={3} className="mb-4 mb-md-0">
                        <h2 className="display-4 text-success fw-bold">10K+</h2>
                        <p className="text-muted">Người dùng</p>
                    </Col>
                    <Col md={3} className="mb-4 mb-md-0">
                        <h2 className="display-4 text-warning fw-bold">50K+</h2>
                        <p className="text-muted">Đơn đặt thành công</p>
                    </Col>
                    <Col md={3}>
                        <h2 className="display-4 text-danger fw-bold">4.8/5</h2>
                        <p className="text-muted">Đánh giá trung bình</p>
                    </Col>
                </Row>
            </div>

            {/* Values Section */}
            <div className="mb-5">
                <h2 className="text-center mb-4">💎 Giá Trị Cốt Lõi</h2>
                <Row>
                    <Col md={4} className="mb-4">
                        <Card className="h-100 shadow-sm border-0">
                            <Card.Body>
                                <h5 className="text-primary">🤝 Uy Tín</h5>
                                <p className="text-muted">
                                    Đặt uy tín và chất lượng lên hàng đầu trong mọi dịch vụ. 
                                    Cam kết minh bạch và trung thực với khách hàng.
                                </p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4} className="mb-4">
                        <Card className="h-100 shadow-sm border-0">
                            <Card.Body>
                                <h5 className="text-success">💡 Sáng Tạo</h5>
                                <p className="text-muted">
                                    Không ngừng cải tiến và áp dụng công nghệ mới để mang lại 
                                    trải nghiệm tốt nhất cho người dùng.
                                </p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4} className="mb-4">
                        <Card className="h-100 shadow-sm border-0">
                            <Card.Body>
                                <h5 className="text-warning">❤️ Tận Tâm</h5>
                                <p className="text-muted">
                                    Luôn lắng nghe và đặt sự hài lòng của khách hàng làm mục tiêu 
                                    phấn đấu hàng đầu.
                                </p>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </div>

            {/* Team Section */}
            <div className="text-center mb-5">
                <h2 className="mb-4">👥 Đội Ngũ Phát Triển</h2>
                <p className="lead text-muted mb-4">
                    Chúng tôi là một đội ngũ trẻ, năng động và đam mê công nghệ, 
                    cam kết xây dựng nền tảng đặt sân bóng tốt nhất cho cộng đồng.
                </p>
                <Card className="shadow-sm border-0 mx-auto" style={{maxWidth: '600px'}}>
                    <Card.Body className="p-4">
                        <p className="mb-2"><strong>🎓 Dự án:</strong> Hệ thống đặt sân bóng đá</p>
                        <p className="mb-2"><strong>🏫 Trường:</strong> Đại học Công nghệ Thông tin</p>
                        <p className="mb-2"><strong>📚 Khóa:</strong> DA22TTA</p>
                        <p className="mb-0"><strong>📅 Năm:</strong> 2025-2026</p>
                    </Card.Body>
                </Card>
            </div>

            {/* CTA Section */}
            <div className="cta-section text-center py-5 bg-primary text-white rounded">
                <h2 className="mb-3">Sẵn sàng đặt sân?</h2>
                <p className="lead mb-4">Tham gia cùng hàng ngàn người yêu bóng đá khác!</p>
                <a href="/danh-sach-san" className="btn btn-light btn-lg px-5">
                    🎯 Đặt Sân Ngay
                </a>
            </div>
        </Container>
    );
};

export default GioiThieu;
