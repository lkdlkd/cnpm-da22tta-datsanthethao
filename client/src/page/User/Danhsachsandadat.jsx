import React, { useState, useEffect } from 'react';
import { 
    Container, 
    Row, 
    Col, 
    Card, 
    Button, 
    Badge, 
    Nav,
    Table,
    Modal,
    Alert,
    Form
} from 'react-bootstrap';
import { useAuth } from '../../components/AuthContext';
import { bookingService, paymentService, reviewService } from '../../services/api';

const Danhsachsandadat = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('all');
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(6);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 6,
        totalPages: 0
    });
    
    // Modal states
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [paymentInfo, setPaymentInfo] = useState(null);
    
    // Review modal states
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewBooking, setReviewBooking] = useState(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [hoverRating, setHoverRating] = useState(0);
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        setCurrentPage(1);
        fetchBookings(1);
    }, [activeTab]);

    const fetchBookings = async (page = currentPage) => {
        setLoading(true);
        try {
            const params = { 
                page: page,
                limit: itemsPerPage
            };
            if (activeTab !== 'all') {
                params.status = activeTab;
            }
            const response = await bookingService.getUserBookings(params);
            setBookings(response.data.data || []);
            setPagination(response.data.pagination || {
                total: 0,
                page: page,
                limit: itemsPerPage,
                totalPages: 0
            });
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const viewBookingDetail = async (booking) => {
        setSelectedBooking(booking);
        
        // Lấy thông tin thanh toán
        try {
            const paymentResponse = await paymentService.getPaymentByBooking(booking._id);
            setPaymentInfo(paymentResponse.data);
        } catch (error) {
            console.error('Error fetching payment:', error);
            setPaymentInfo(null);
        }
        
        setShowDetailModal(true);
    };

    const cancelBooking = async (bookingId) => {
        if (!window.confirm('Bạn có chắc muốn hủy đơn đặt này?')) return;

        try {
            await bookingService.cancelBooking(bookingId, { 
                cancelReason: 'Khách hàng yêu cầu hủy' 
            });
            alert('Hủy đơn thành công!');
            fetchBookings(currentPage);
            setShowDetailModal(false);
        } catch (error) {
            alert(error.response?.data?.message || 'Không thể hủy đơn');
        }
    };

    // Kiểm tra xem booking có thể đánh giá không
    const canReview = (booking) => {
        // Chỉ cho phép đánh giá với booking đã xác nhận và đã thanh toán
        if (booking.status !== 'completed' && booking.status !== 'confirmed') return false;
        if (booking.status === 'confirmed' && booking.paymentStatus !== 'paid') return false;
        if (booking.hasReviewed) return false;
        
        // Kiểm tra đã qua thời gian đá chưa
        try {
            const bookingDate = booking.bookingDate.split('T')[0];
            const bookingDateTime = new Date(`${bookingDate}T${booking.endTime}`);
            const now = new Date();
            return now > bookingDateTime;
        } catch (error) {
            console.error('Error checking canReview:', error);
            return false;
        }
    };

    const openReviewModal = (booking) => {
        setReviewBooking(booking);
        setRating(5);
        setComment('');
        setHoverRating(0);
        setShowReviewModal(true);
    };

    const submitReview = async () => {
        if (!comment.trim()) {
            alert('Vui lòng nhập nhận xét của bạn');
            return;
        }

        setSubmittingReview(true);
        try {
            await reviewService.createReview({
                field: reviewBooking.field._id,
                booking: reviewBooking._id,
                rating,
                comment: comment.trim()
            });
            
            alert('Đánh giá thành công! Cảm ơn bạn đã đóng góp ý kiến.');
            setShowReviewModal(false);
            fetchBookings(currentPage); // Refresh để cập nhật trạng thái
        } catch (error) {
            alert(error.response?.data?.message || 'Không thể gửi đánh giá');
        } finally {
            setSubmittingReview(false);
        }
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        fetchBookings(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const renderPagination = () => {
        const totalPages = pagination.totalPages;
        if (totalPages <= 1) return null;

        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        return (
            <div className="pagination-container d-flex justify-content-center align-items-center mt-4">
                <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="mx-1"
                >
                    ‹ Trước
                </Button>

                {startPage > 1 && (
                    <>
                        <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handlePageChange(1)}
                            className="mx-1"
                        >
                            1
                        </Button>
                        {startPage > 2 && <span className="mx-2">...</span>}
                    </>
                )}

                {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(page => (
                    <Button
                        key={page}
                        variant={currentPage === page ? "primary" : "outline-primary"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className="mx-1"
                    >
                        {page}
                    </Button>
                ))}

                {endPage < totalPages && (
                    <>
                        {endPage < totalPages - 1 && <span className="mx-2">...</span>}
                        <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handlePageChange(totalPages)}
                            className="mx-1"
                        >
                            {totalPages}
                        </Button>
                    </>
                )}

                <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="mx-1"
                >
                    Sau ›
                </Button>
            </div>
        );
    };
     


    const getStatusBadge = (status) => {
        const statusMap = {
            pending: { variant: 'warning', text: 'Chờ xác nhận' },
            confirmed: { variant: 'success', text: 'Đã xác nhận' },
            cancelled: { variant: 'danger', text: 'Đã hủy' },
            completed: { variant: 'info', text: 'Hoàn thành' }
        };
        const { variant, text } = statusMap[status] || { variant: 'secondary', text: status };
        return <Badge bg={variant}>{text}</Badge>;
    };

    const getPaymentBadge = (status) => {
        return status === 'paid' 
            ? <Badge bg="success">Đã thanh toán</Badge>
            : <Badge bg="warning">Chưa thanh toán</Badge>;
    };

    // Cấu hình ngân hàng
    const bankInfo = {
        bank_name: 'MB',
        account_number: process.env.REACT_APP_BANK_ACCOUNT_NUMBER || '0123456789',
        account_name: process.env.REACT_APP_BANK_ACCOUNT_NAME || 'CONG TY SAN BONG'
    };

    return (
        <Container fluid className="py-4" style={{maxWidth:1200}}>
            <Row className="mb-4">
                <Col>
                    <h2>📋 Đơn Đặt Sân Của Tôi</h2>
                    <p className="text-muted">
                        Quản lý các đơn đặt sân của bạn
                        {pagination.total > 0 && (
                            <span> - Tìm thấy <strong>{pagination.total}</strong> đơn
                                {pagination.totalPages > 1 && (
                                    <span> (Trang <strong>{currentPage}</strong>/<strong>{pagination.totalPages}</strong>)</span>
                                )}
                            </span>
                        )}
                    </p>
                </Col>
            </Row>

            {/* Filter Tabs */}
            <Nav variant="tabs" className="mb-4">
                <Nav.Item>
                    <Nav.Link 
                        active={activeTab === 'all'} 
                        onClick={() => setActiveTab('all')}
                    >
                        Tất cả
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link 
                        active={activeTab === 'pending'} 
                        onClick={() => setActiveTab('pending')}
                    >
                        Chờ xác nhận
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link 
                        active={activeTab === 'confirmed'} 
                        onClick={() => setActiveTab('confirmed')}
                    >
                        Đã xác nhận
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link 
                        active={activeTab === 'completed'} 
                        onClick={() => setActiveTab('completed')}
                    >
                        Hoàn thành
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link 
                        active={activeTab === 'cancelled'} 
                        onClick={() => setActiveTab('cancelled')}
                    >
                        Đã hủy
                    </Nav.Link>
                </Nav.Item>
            </Nav>

            {/* Bookings List */}
            <Row>
                {loading ? (
                    <Col className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </Col>
                ) : bookings.length === 0 ? (
                    <Col>
                        <Alert variant="info" className="text-center">
                            <h5>Không có đơn đặt nào</h5>
                            <p>Hãy đặt sân để bắt đầu!</p>
                        </Alert>
                    </Col>
                ) : (
                    bookings.map((booking) => (
                        <Col md={6} lg={4} key={booking._id} className="mb-4">
                            <Card className="h-100 shadow-sm booking-card">
                                <Card.Header className="d-flex justify-content-between align-items-center">
                                    <strong>#{booking.bookingCode}</strong>
                                    {getStatusBadge(booking.status)}
                                </Card.Header>
                                <Card.Body>
                                    <h5 className="card-title">{booking.field?.name}</h5>
                                    <div className="booking-details">
                                        <p className="mb-1">
                                            <strong>📅 Ngày:</strong>{' '}
                                            {new Date(booking.bookingDate).toLocaleDateString('vi-VN')}
                                        </p>
                                        <p className="mb-1">
                                            <strong>🕐 Giờ:</strong> {booking.startTime} - {booking.endTime}
                                        </p>
                                        <p className="mb-1">
                                            <strong>💰 Tổng tiền:</strong>{' '}
                                            <span className="text-primary fw-bold">
                                                {booking.totalPrice.toLocaleString()}đ
                                            </span>
                                        </p>
                                        <p className="mb-0">
                                            <strong>💳 Thanh toán:</strong>{' '}
                                            {getPaymentBadge(booking.paymentStatus)}
                                        </p>
                                    </div>
                                </Card.Body>
                                <Card.Footer className="bg-white">
                                    <div className="d-grid gap-2">
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={() => viewBookingDetail(booking)}
                                        >
                                            👁️ Xem Chi Tiết
                                        </Button>
                                        {booking.status === 'pending' && (
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => cancelBooking(booking._id)}
                                            >
                                                ❌ Hủy Đơn
                                            </Button>
                                        )}
                                        {canReview(booking) && (
                                            <Button
                                                variant="warning"
                                                size="sm"
                                                onClick={() => openReviewModal(booking)}
                                            >
                                                ⭐ Đánh Giá
                                            </Button>
                                        )}
                                    </div>
                                </Card.Footer>
                            </Card>
                        </Col>
                    ))
                )}
            </Row>

            {/* Pagination */}
            {!loading && bookings.length > 0 && renderPagination()}

            {/* Review Modal */}
            <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>⭐ Đánh Giá Sân Bóng</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {reviewBooking && (
                        <>
                            <div className="text-center mb-4">
                                <h5>{reviewBooking.field?.name}</h5>
                                <p className="text-muted">
                                    {new Date(reviewBooking.bookingDate).toLocaleDateString('vi-VN')}
                                    {' '}{reviewBooking.startTime} - {reviewBooking.endTime}
                                </p>
                            </div>

                            <Form.Group className="mb-4">
                                <Form.Label className="fw-bold">Đánh giá của bạn</Form.Label>
                                <div className="text-center mb-3">
                                    <div className="star-rating" style={{ fontSize: '2.5rem', cursor: 'pointer' }}>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <span
                                                key={star}
                                                onClick={() => setRating(star)}
                                                onMouseEnter={() => setHoverRating(star)}
                                                onMouseLeave={() => setHoverRating(0)}
                                                style={{
                                                    color: star <= (hoverRating || rating) ? '#ffc107' : '#e4e5e9',
                                                    transition: 'color 0.2s'
                                                }}
                                            >
                                                ★
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-muted mt-2">
                                        {rating === 5 && 'Tuyệt vời!'}
                                        {rating === 4 && 'Rất tốt!'}
                                        {rating === 3 && 'Khá ổn'}
                                        {rating === 2 && 'Cần cải thiện'}
                                        {rating === 1 && 'Không hài lòng'}
                                    </p>
                                </div>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Nhận xét của bạn *</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={4}
                                    placeholder="Chia sẻ trải nghiệm của bạn về sân bóng này..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    required
                                />
                                <Form.Text className="text-muted">
                                    Vui lòng chia sẻ ý kiến thật của bạn để giúp người khác có lựa chọn tốt hơn
                                </Form.Text>
                            </Form.Group>

                            <Alert variant="info" className="mb-0">
                                <small>
                                    ✓ Đánh giá của bạn sẽ được hiển thị công khai<br/>
                                    ✓ Chỉ có thể đánh giá một lần cho mỗi đơn đặt
                                </small>
                            </Alert>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowReviewModal(false)}>
                        Hủy
                    </Button>
                    <Button 
                        variant="warning" 
                        onClick={submitReview}
                        disabled={submittingReview || !comment.trim()}
                    >
                        {submittingReview ? 'Đang gửi...' : '⭐ Gửi Đánh Giá'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Detail Modal */}
            <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Chi Tiết Đơn Đặt</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedBooking && (
                        <>
                            <Card className="mb-3">
                                <Card.Body>
                                    <Row className="mb-3">
                                        <Col md={6}>
                                            <strong>Mã đơn:</strong> {selectedBooking.bookingCode}
                                        </Col>
                                        <Col md={6} className="text-end">
                                            {getStatusBadge(selectedBooking.status)}
                                        </Col>
                                    </Row>
                                    <hr />
                                    <h5>🏟️ Thông Tin Sân</h5>
                                    <p><strong>Tên sân:</strong> {selectedBooking.field?.name}</p>
                                    <p><strong>Loại sân:</strong> {selectedBooking.field?.fieldType}</p>
                                    <p><strong>Địa chỉ:</strong> {selectedBooking.field?.address}</p>
                                    <hr />
                                    <h5>📅 Thông Tin Đặt</h5>
                                    <p><strong>Ngày:</strong> {new Date(selectedBooking.bookingDate).toLocaleDateString('vi-VN')}</p>
                                    <p><strong>Giờ:</strong> {selectedBooking.startTime} - {selectedBooking.endTime}</p>
                                    <p><strong>Khách hàng:</strong> {selectedBooking.customerName}</p>
                                    <p><strong>Số điện thoại:</strong> {selectedBooking.customerPhone}</p>
                                    {selectedBooking.notes && (
                                        <p><strong>Ghi chú:</strong> {selectedBooking.notes}</p>
                                    )}
                                    
                                    {/* Hiển thị dịch vụ nếu có */}
                                    {selectedBooking.services && selectedBooking.services.length > 0 && (
                                        <>
                                            <hr />
                                            <h5>🛍️ Dịch Vụ Bổ Sung</h5>
                                            <Table bordered hover size="sm">
                                                <thead>
                                                    <tr>
                                                        <th>Tên dịch vụ</th>
                                                        <th className="text-center">SL</th>
                                                        <th className="text-end">Đơn giá</th>
                                                        <th className="text-end">Thành tiền</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {selectedBooking.services.map((item, idx) => (
                                                        <tr key={idx}>
                                                            <td>
                                                                {item.service?.name || 'N/A'}
                                                                {item.service?.category && (
                                                                    <small className="text-muted d-block">
                                                                        ({item.service.category})
                                                                    </small>
                                                                )}
                                                            </td>
                                                            <td className="text-center">{item.quantity}</td>
                                                            <td className="text-end">{item.price.toLocaleString()}đ</td>
                                                            <td className="text-end fw-bold">
                                                                {(item.price * item.quantity).toLocaleString()}đ
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        </>
                                    )}
                                    
                                    <hr />
                                    <h5>💰 Thanh Toán</h5>
                                    <p>
                                        <strong>Tổng tiền:</strong>{' '}
                                        <span className="text-primary fs-5 fw-bold">
                                            {selectedBooking.totalPrice.toLocaleString()}đ
                                        </span>
                                    </p>
                                    <p>
                                        <strong>Trạng thái:</strong>{' '}
                                        {getPaymentBadge(selectedBooking.paymentStatus)}
                                    </p>
                                </Card.Body>
                            </Card>

                            {/* Hiển thị thông tin chuyển khoản nếu chưa thanh toán và là banking */}
                            {selectedBooking.paymentStatus === 'unpaid' && 
                             paymentInfo && 
                             paymentInfo.paymentMethod === 'banking' && (
                                <Card className="border-warning">
                                    <Card.Header className="bg-warning text-dark">
                                        <h5 className="mb-0">📱 Thông Tin Chuyển Khoản</h5>
                                    </Card.Header>
                                    <Card.Body className="text-center">
                                        <Alert variant="info">
                                            <strong>⚠️ Đơn hàng chưa thanh toán</strong>
                                            <p className="mb-0">Vui lòng chuyển khoản để hoàn tất đặt sân</p>
                                        </Alert>

                                        <div className="qr-code-container mb-3">
                                            <img 
                                                src={`https://img.vietqr.io/image/${bankInfo.bank_name}-${bankInfo.account_number}-qronly.jpg?accountName=${encodeURIComponent(bankInfo.account_name)}&amount=${selectedBooking.totalPrice}&addInfo=${encodeURIComponent(selectedBooking.bookingCode)}`}
                                                alt="QR Code"
                                                style={{ maxWidth: '250px', width: '100%' }}
                                            />
                                        </div>

                                        <Card className="bg-light">
                                            <Card.Body>
                                                <p className="mb-1"><strong>Ngân hàng:</strong> MB Bank (Quân đội)</p>
                                                <p className="mb-1"><strong>Số tài khoản:</strong> {bankInfo.account_number}</p>
                                                <p className="mb-1"><strong>Chủ tài khoản:</strong> {bankInfo.account_name}</p>
                                                <p className="mb-1">
                                                    <strong>Số tiền:</strong>{' '}
                                                    <span className="text-danger fw-bold">
                                                        {selectedBooking.totalPrice.toLocaleString()}đ
                                                    </span>
                                                </p>
                                                <p className="mb-0">
                                                    <strong>Nội dung:</strong>{' '}
                                                    <code className="bg-warning p-1">{selectedBooking.bookingCode}</code>
                                                </p>
                                            </Card.Body>
                                        </Card>

                                        <Alert variant="success" className="mt-3">
                                            <small>
                                                ✅ Hệ thống tự động xác nhận thanh toán sau 5-10 phút
                                            </small>
                                        </Alert>
                                    </Card.Body>
                                </Card>
                            )}

                            {selectedBooking.status === 'cancelled' && selectedBooking.cancelReason && (
                                <Alert variant="danger">
                                    <strong>Lý do hủy:</strong> {selectedBooking.cancelReason}
                                </Alert>
                            )}
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    {selectedBooking && selectedBooking.status === 'pending' && (
                        <Button
                            variant="danger"
                            onClick={() => cancelBooking(selectedBooking._id)}
                        >
                            ❌ Hủy Đơn
                        </Button>
                    )}
                    <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
                        Đóng
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Danhsachsandadat ;
