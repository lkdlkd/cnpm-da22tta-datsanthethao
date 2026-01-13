import React, { useState, useEffect } from 'react';
import { 
    Container, 
    Row, 
    Col, 
    Table, 
    Button, 
    Badge,
    Card,
    Alert,
    Form,
    Modal
} from 'react-bootstrap';
import { reviewService } from '../../services/api';
import './AdminCommon.css';

const Quanlydanhgia = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [filterRating, setFilterRating] = useState('');
    const [showReplyModal, setShowReplyModal] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);
    const [replyContent, setReplyContent] = useState('');
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [totalReviews, setTotalReviews] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        fetchReviews();
        setCurrentPage(1);
    }, [filterRating]);

    const fetchReviews = async (page = currentPage) => {
        setLoading(true);
        try {
            const params = {
                page,
                limit: itemsPerPage,
                ...(filterRating && { rating: filterRating })
            };
            const response = await reviewService.getAllReviews(params);
            
            if (response.data.reviews) {
                setReviews(response.data.reviews);
                setTotalReviews(response.data.total || 0);
                setTotalPages(response.data.totalPages || 1);
            } else {
                setReviews(response.data);
                setTotalReviews(response.data.length);
                setTotalPages(Math.ceil(response.data.length / itemsPerPage));
            }
        } catch (err) {
            setError('Không thể tải danh sách đánh giá');
            setReviews([]);
            setTotalReviews(0);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async () => {
        if (!replyContent.trim()) {
            setError('Vui lòng nhập nội dung phản hồi');
            setTimeout(() => setError(''), 3000);
            return;
        }

        try {
            await reviewService.replyToReview(selectedReview._id, { content: replyContent });
            setSuccess('Phản hồi đánh giá thành công!');
            setShowReplyModal(false);
            setReplyContent('');
            await fetchReviews();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể phản hồi đánh giá');
            setTimeout(() => setError(''), 3000);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Xác nhận xóa đánh giá này?')) return;

        try {
            await reviewService.deleteReview(id);
            setSuccess('Xóa đánh giá thành công!');
            await fetchReviews();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Không thể xóa đánh giá');
            setTimeout(() => setError(''), 3000);
        }
    };

    const getRatingStars = (rating) => {
        return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
    };

    const openReplyModal = (review) => {
        setSelectedReview(review);
        setReplyContent(review.reply?.content || '');
        setShowReplyModal(true);
    };

    // Pagination calculations
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        fetchReviews(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        const pages = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        return (
            <div className="d-flex justify-content-center align-items-center gap-2 my-3">
                <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    ‹ Trước
                </Button>
                
                {startPage > 1 && (
                    <>
                        <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handlePageChange(1)}
                        >
                            1
                        </Button>
                        {startPage > 2 && <span>...</span>}
                    </>
                )}

                {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(page => (
                    <Button
                        key={page}
                        variant={currentPage === page ? "primary" : "outline-primary"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                    >
                        {page}
                    </Button>
                ))}

                {endPage < totalPages && (
                    <>
                        {endPage < totalPages - 1 && <span>...</span>}
                        <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handlePageChange(totalPages)}
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
                >
                    Sau ›
                </Button>
            </div>
        );
    };

    return (
        <Container fluid className="admin-page">
            <h2>⭐ Quản Lý Đánh Giá</h2>

            {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}
            {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

            <Card className="mb-4 filter-section">
                <Card.Body>
                    <Row>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Lọc theo đánh giá</Form.Label>
                                <Form.Select 
                                    value={filterRating}
                                    onChange={(e) => setFilterRating(e.target.value)}
                                >
                                    <option value="">Tất cả</option>
                                    <option value="5">⭐⭐⭐⭐⭐ (5 sao)</option>
                                    <option value="4">⭐⭐⭐⭐ (4 sao)</option>
                                    <option value="3">⭐⭐⭐ (3 sao)</option>
                                    <option value="2">⭐⭐ (2 sao)</option>
                                    <option value="1">⭐ (1 sao)</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={8} className="d-flex align-items-end justify-content-end">
                            <div className="text-muted">
                                Tổng: <strong>{totalReviews}</strong> đánh giá
                                {totalReviews > 0 && ` | Trang ${currentPage}/${totalPages}`}
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            <Card>
                <Card.Body className="p-0">
                    <div style={{ overflowX: 'auto' }}>
                        <Table striped bordered hover responsive style={{ marginBottom: 0 }}>
                            <thead>
                                <tr>
                                    <th style={{ width: '50px' }}>#</th>
                                    <th style={{ width: '150px' }}>Khách Hàng</th>
                                    <th style={{ width: '140px' }}>Sân</th>
                                    <th style={{ width: '100px' }}>Mã Đơn</th>
                                    <th style={{ width: '100px' }}>Đánh Giá</th>
                                    <th style={{ width: '250px' }}>Nội Dung</th>
                                    <th style={{ width: '200px' }}>Phản Hồi</th>
                                    <th style={{ width: '120px' }}>Ngày Tạo</th>
                                    <th style={{ width: '150px' }}>Thao Tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reviews.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="text-center py-4">
                                            {loading ? (
                                                <div>
                                                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                                                        <span className="visually-hidden">Loading...</span>
                                                    </div>
                                                    <div className="mt-2">Đang tải...</div>
                                                </div>
                                            ) : (
                                                'Không có dữ liệu'
                                            )}
                                        </td>
                                    </tr>
                                ) : (
                                    reviews.map((review, index) => (
                                        <tr key={review._id}>
                                            <td>{indexOfFirstItem + index + 1}</td>
                                            <td>
                                                <div style={{ fontSize: '0.9rem' }}>{review.user?.fullName || 'N/A'}</div>
                                                <small className="text-muted">{review.user?.phone || review.user?.email || ''}</small>
                                            </td>
                                            <td>
                                                <div style={{ fontSize: '0.85rem' }}>{review.field?.name || 'N/A'}</div>
                                                <Badge bg="secondary" className="mt-1" style={{ fontSize: '0.75rem' }}>
                                                    {review.field?.fieldType || 'N/A'}
                                                </Badge>
                                            </td>
                                            <td>
                                                <small className="text-muted">{review.booking?.bookingCode || 'N/A'}</small>
                                            </td>
                                            <td>
                                                <div style={{ fontSize: '1.1rem' }}>{getRatingStars(review.rating)}</div>
                                                <small className="text-muted">({review.rating}/5)</small>
                                            </td>
                                            <td>
                                                <div style={{ 
                                                    maxHeight: '60px', 
                                                    overflowY: 'auto',
                                                    fontSize: '0.85rem',
                                                    whiteSpace: 'pre-wrap'
                                                }}>
                                                    {review.comment || 'Không có nội dung'}
                                                </div>
                                            </td>
                                            <td>
                                                {review.reply ? (
                                                    <div style={{ 
                                                        maxHeight: '60px', 
                                                        overflowY: 'auto',
                                                        fontSize: '0.8rem'
                                                    }}>
                                                        <Badge bg="success" className="mb-1">Đã phản hồi</Badge>
                                                        <div className="text-muted">{review.reply.content}</div>
                                                    </div>
                                                ) : (
                                                    <Badge bg="warning">Chưa phản hồi</Badge>
                                                )}
                                            </td>
                                            <td style={{ fontSize: '0.8rem' }}>
                                                {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                                            </td>
                                            <td>
                                                <div className="d-flex flex-wrap gap-1">
                                                    <Button 
                                                        variant={review.reply ? "secondary" : "primary"}
                                                        size="sm" 
                                                        style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                                                        onClick={() => openReplyModal(review)}
                                                        title={review.reply ? "Sửa phản hồi" : "Phản hồi"}
                                                    >
                                                        💬
                                                    </Button>
                                                    <Button 
                                                        variant="danger" 
                                                        size="sm"
                                                        style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                                                        onClick={() => handleDelete(review._id)}
                                                        title="Xóa đánh giá"
                                                    >
                                                        🗑️
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    </div>
                    
                    {renderPagination()}
                    
                    <div className="p-3 border-top">
                        <small className="text-muted">
                            Hiển thị <strong>{totalReviews > 0 ? indexOfFirstItem + 1 : 0}</strong> - <strong>{Math.min(indexOfLastItem, totalReviews)}</strong> của <strong>{totalReviews}</strong> đánh giá
                        </small>
                    </div>
                </Card.Body>
            </Card>

            {/* Modal Phản Hồi */}
            <Modal 
                show={showReplyModal} 
                onHide={() => setShowReplyModal(false)}
            >
                <Modal.Header closeButton>
                    <Modal.Title>💬 {selectedReview?.reply ? 'Sửa Phản Hồi' : 'Phản Hồi Đánh Giá'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedReview && (
                        <div>
                            <div className="mb-3 p-3 bg-light rounded">
                                <div><strong>Khách hàng:</strong> {selectedReview.user?.fullName}</div>
                                <div><strong>Đánh giá:</strong> {getRatingStars(selectedReview.rating)} ({selectedReview.rating}/5)</div>
                                <div className="mt-2"><strong>Nội dung:</strong></div>
                                <p className="mb-0 text-muted">{selectedReview.comment}</p>
                            </div>
                            
                            <Form.Group>
                                <Form.Label>Nội dung phản hồi <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={4}
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    placeholder="Nhập nội dung phản hồi..."
                                />
                            </Form.Group>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowReplyModal(false)}>
                        Hủy
                    </Button>
                    <Button variant="primary" onClick={handleReply}>
                        {selectedReview?.reply ? 'Cập Nhật' : 'Gửi Phản Hồi'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Quanlydanhgia;
