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
import Swal from 'sweetalert2';
import { useAuth } from '../../components/AuthContext';
import { bookingService, paymentService, reviewService } from '../../services/api';
import './Danhsachsandadat.css';

// Helper function để format loại sân
const formatFieldType = (fieldType) => {
    const typeMap = {
        '5vs5': 'Sân 5',
        '7vs7': 'Sân 7',
        '11vs11': 'Sân 11'
    };
    return typeMap[fieldType] || fieldType;
};

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

            // Check for success flag in response
            if (response.data && response.data.success !== false) {
                setBookings(response.data.data.bookings || []);
                setPagination(response.data.data.pagination || {
                    total: 0,
                    page: page,
                    limit: itemsPerPage,
                    totalPages: 0
                });
            } else {
                console.error('Error fetching bookings:', response.data?.message);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Không thể tải danh sách đặt sân';
            console.error('Error fetching bookings:', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const viewBookingDetail = async (booking) => {
        setSelectedBooking(booking);

        // Lấy thông tin thanh toán
        try {
            const paymentResponse = await paymentService.getPaymentByBooking(booking._id);

            // Check for success flag in response
            if (paymentResponse.data && paymentResponse.data.success !== false) {
                setPaymentInfo(paymentResponse.data.data || paymentResponse.data);
            } else {
                console.error('Error fetching payment:', paymentResponse.data?.message);
                setPaymentInfo(null);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Không thể tải thông tin thanh toán';
            console.error('Error fetching payment:', errorMessage);
            setPaymentInfo(null);
        }

        setShowDetailModal(true);
    };

    const cancelBooking = async (bookingId) => {
        const result = await Swal.fire({
            title: 'Hủy đơn đặt',
            text: 'Bạn có chắc muốn hủy đơn đặt này?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Hủy đơn',
            cancelButtonText: 'Đóng'
        });

        if (!result.isConfirmed) return;

        try {
            const response = await bookingService.cancelBooking(bookingId, {
                cancelReason: 'Khách hàng yêu cầu hủy'
            });

            // Check for success flag in response
            if (response.data && response.data.success !== false) {
                Swal.fire({
                    icon: 'success',
                    title: 'Thành công!',
                    text: 'Hủy đơn thành công!',
                    timer: 2000,
                    showConfirmButton: false
                });
                fetchBookings(currentPage);
                setShowDetailModal(false);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi!',
                    text: response.data?.message || 'Không thể hủy đơn'
                });
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Không thể hủy đơn';
            Swal.fire({
                icon: 'error',
                title: 'Lỗi!',
                text: errorMessage
            });
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
            Swal.fire({
                icon: 'warning',
                title: 'Thông báo',
                text: 'Vui lòng nhập nhận xét của bạn'
            });
            return;
        }

        setSubmittingReview(true);
        try {
            const response = await reviewService.createReview({
                field: reviewBooking.field._id,
                booking: reviewBooking._id,
                rating,
                comment: comment.trim()
            });

            // Check for success flag in response
            if (response.data && response.data.success !== false) {
                Swal.fire({
                    icon: 'success',
                    title: 'Thành công!',
                    text: 'Đánh giá thành công! Cảm ơn bạn đã đóng góp ý kiến.',
                    timer: 2500,
                    showConfirmButton: false
                });
                setShowReviewModal(false);
                fetchBookings(currentPage); // Refresh để cập nhật trạng thái
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi!',
                    text: response.data?.message || 'Không thể gửi đánh giá'
                });
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Không thể gửi đánh giá';
            Swal.fire({
                icon: 'error',
                title: 'Lỗi!',
                text: errorMessage
            });
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
        const statusMap = {
            paid: { bg: 'success', text: '✅ Đã thanh toán' },
            pending: { bg: 'warning', text: '⏳ Chờ thanh toán' },
            unpaid: { bg: 'danger', text: '❌ Chưa thanh toán' }
        };
        const badge = statusMap[status] || { bg: 'secondary', text: status };
        return <Badge bg={badge.bg}>{badge.text}</Badge>;
    };

    const getPaymentMethodBadge = (method) => {
        if (!method) return <Badge bg="secondary">N/A</Badge>;
        const methodMap = {
            cash: { bg: 'info', text: '💵 Tiền mặt' },
            banking: { bg: 'primary', text: '🏦 Chuyển khoản' }
        };
        const badge = methodMap[method] || { bg: 'secondary', text: method };
        return <Badge bg={badge.bg}>{badge.text}</Badge>;
    };

    // Cấu hình ngân hàng
    const bankInfo = {
        bank_name: 'MB',
        account_number: process.env.REACT_APP_BANK_ACCOUNT_NUMBER || '0123456789',
        account_name: process.env.REACT_APP_BANK_ACCOUNT_NAME || 'CONG TY SAN BONG'
    };

    return (
        <div className="booking-list-page">
            {/* Page Header */}
            <div className="page-header">
                <Container>
                    <div className="page-header-content text-center">
                        <h1 className="page-title">📋 Đơn Đặt Sân Của Tôi</h1>
                        <p className="page-subtitle">
                            Quản lý và theo dõi tất cả các đơn đặt sân của bạn
                        </p>
                    </div>
                </Container>
            </div>

            <Container>
                {/* Filter Tabs */}
                <Nav className="booking-tabs">
                    <Nav.Item>
                        <Nav.Link
                            active={activeTab === 'all'}
                            onClick={() => setActiveTab('all')}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5V2zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1H4z" />
                            </svg>
                            Tất cả
                            {pagination.total > 0 && <Badge bg="secondary" className="ms-2">{pagination.total}</Badge>}
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link
                            active={activeTab === 'pending'}
                            onClick={() => setActiveTab('pending')}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z" />
                                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z" />
                            </svg>
                            Chờ xác nhận
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link
                            active={activeTab === 'confirmed'}
                            onClick={() => setActiveTab('confirmed')}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z" />
                            </svg>
                            Đã xác nhận
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link
                            active={activeTab === 'completed'}
                            onClick={() => setActiveTab('completed')}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M12.643 15C13.979 15 15 13.845 15 12.5V5H1v7.5C1 13.845 2.021 15 3.357 15h9.286zM5.5 7h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1 0-1zM.8 1a.8.8 0 0 0-.8.8V3a.8.8 0 0 0 .8.8h14.4A.8.8 0 0 0 16 3V1.8a.8.8 0 0 0-.8-.8H.8z" />
                            </svg>
                            Hoàn thành
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link
                            active={activeTab === 'cancelled'}
                            onClick={() => setActiveTab('cancelled')}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                            </svg>
                            Đã hủy
                        </Nav.Link>
                    </Nav.Item>
                </Nav>

                {/* Bookings Grid */}
                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3 text-muted">Đang tải dữ liệu...</p>
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📭</div>
                        <h3 className="empty-title">Chưa có đơn đặt nào</h3>
                        <p className="empty-description">
                            {activeTab === 'all'
                                ? 'Bạn chưa đặt sân nào. Hãy tìm và đặt sân ngay!'
                                : `Không có đơn đặt nào ở trạng thái này`}
                        </p>
                        {activeTab === 'all' && (
                            <Button variant="primary" size="lg" href="/danh-sach-san">
                                Tìm Sân Ngay
                            </Button>
                        )}
                    </div>
                ) : (
                    <>
                        <Row className="g-4">
                            {bookings.map((booking) => (
                                <Col md={6} lg={4} key={booking._id}>
                                    <Card className="booking-card">
                                        <div className="booking-card-header">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <span className="booking-id">#{booking.bookingCode}</span>
                                                <Badge className="booking-status-badge" bg={
                                                    booking.status === 'pending' ? 'warning' :
                                                        booking.status === 'confirmed' ? 'success' :
                                                            booking.status === 'completed' ? 'info' : 'danger'
                                                }>
                                                    {booking.status === 'pending' ? 'Chờ xác nhận' :
                                                        booking.status === 'confirmed' ? 'Đã xác nhận' :
                                                            booking.status === 'completed' ? 'Hoàn thành' : 'Đã hủy'}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="booking-card-body">
                                            <h5 className="field-name-title">{booking.field?.name}</h5>

                                            <div className="booking-info-row">
                                                <svg className="info-icon" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
                                                    <path d="M11 6.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1z" />
                                                    <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z" />
                                                </svg>
                                                <div>
                                                    <span className="info-label">Ngày đặt:</span>
                                                    <span className="info-value ms-2">
                                                        {new Date(booking.bookingDate).toLocaleDateString('vi-VN')}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="booking-info-row">
                                                <svg className="info-icon" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
                                                    <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z" />
                                                    <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z" />
                                                </svg>
                                                <div>
                                                    <span className="info-label">Giờ chơi:</span>
                                                    <span className="info-value ms-2">
                                                        {booking.startTime} - {booking.endTime}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="booking-info-row">
                                                <svg className="info-icon" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
                                                    <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2.5 1a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-2zm0 3a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5z" />
                                                </svg>
                                                <div>
                                                    <span className="info-label">Thanh toán:</span>
                                                    <Badge bg={booking.paymentStatus === 'paid' ? 'success' : 'warning'} className="ms-2">
                                                        {booking.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                                    </Badge>
                                                </div>
                                            </div>

                                            {/* Giá tiền */}
                                            <div className="booking-total-price">
                                                <div className="total-price-label">Tổng tiền</div>
                                                <div className="total-price-value">{booking.totalPrice.toLocaleString()}đ</div>
                                            </div>

                                            {booking.services && booking.services.length > 0 && (
                                                <div className="booking-info-row">
                                                    <svg className="info-icon" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
                                                        <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
                                                    </svg>
                                                    <div>
                                                        <span className="info-value">{booking.services.length} dịch vụ bổ sung</span>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="booking-actions">
                                                <Button
                                                    className="btn-detail"
                                                    onClick={() => viewBookingDetail(booking)}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '6px' }}>
                                                        <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z" />
                                                        <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z" />
                                                    </svg>
                                                    Chi tiết
                                                </Button>
                                                {booking.status === 'completed' && !booking.hasReviewed && (
                                                    <Button
                                                        className="btn-review"
                                                        onClick={() => openReviewModal(booking)}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '6px' }}>
                                                            <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                                                        </svg>
                                                        Đánh giá
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                        {renderPagination()}
                    </>
                )}

                {/* Review Modal */}
                <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)} centered className="review-modal">
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
                                        <div className="star-rating">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <span
                                                    key={star}
                                                    className={`star ${star <= (hoverRating || rating) ? 'filled' : ''}`}
                                                    onClick={() => setRating(star)}
                                                    onMouseEnter={() => setHoverRating(star)}
                                                    onMouseLeave={() => setHoverRating(0)}
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
                                        ✓ Đánh giá của bạn sẽ được hiển thị công khai<br />
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

                {/* Detail Modal - Redesigned */}
                <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="xl" className="booking-detail-modal">
                    <Modal.Header closeButton style={{ background: 'linear-gradient(135deg, #0f2e71 0%, #1e40af 100%)', color: 'white', borderRadius: '0' }}>
                        <Modal.Title>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '10px' }}>
                                <path d="M6.5 1A1.5 1.5 0 0 0 5 2.5V3H1.5A1.5 1.5 0 0 0 0 4.5v1.384l7.614 2.03a1.5 1.5 0 0 0 .772 0L16 5.884V4.5A1.5 1.5 0 0 0 14.5 3H11v-.5A1.5 1.5 0 0 0 9.5 1h-3zm0 1h3a.5.5 0 0 1 .5.5V3H6v-.5a.5.5 0 0 1 .5-.5z" />
                                <path d="M0 12.5A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5V6.85L8.129 8.947a.5.5 0 0 1-.258 0L0 6.85v5.65z" />
                            </svg>
                            Chi Tiết Đơn Đặt Sân
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{ padding: '0', background: '#f8fafc' }}>
                        {selectedBooking && (
                            <Row className="g-0">
                                {/* Left Column - Main Info */}
                                <Col md={7} style={{ padding: '2rem', borderRight: '2px solid #e2e8f0' }}>
                                    {/* Booking Code & Status */}
                                    <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <div>
                                                <small style={{ color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Mã đơn đặt</small>
                                                <h4 style={{ color: '#0f2e71', fontWeight: '800', marginBottom: '0', marginTop: '4px' }}>{selectedBooking.bookingCode}</h4>
                                            </div>
                                            {getStatusBadge(selectedBooking.status)}
                                        </div>
                                        <hr style={{ margin: '1rem 0', borderColor: '#e2e8f0' }} />
                                        <Row>
                                            <Col xs={6}>
                                                <div style={{ marginBottom: '0.75rem' }}>
                                                    <small style={{ color: '#64748b', fontSize: '0.85rem' }}>Khách hàng</small>
                                                    <div style={{ color: '#0f2e71', fontWeight: '600' }}>{selectedBooking.customerName}</div>
                                                </div>
                                            </Col>
                                            <Col xs={6}>
                                                <div style={{ marginBottom: '0.75rem' }}>
                                                    <small style={{ color: '#64748b', fontSize: '0.85rem' }}>Số điện thoại</small>
                                                    <div style={{ color: '#0f2e71', fontWeight: '600' }}>{selectedBooking.customerPhone}</div>
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>

                                    {/* Field Info Card */}
                                    <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                                        <h5 style={{ color: '#0f2e71', fontWeight: '700', marginBottom: '1.25rem', display: 'flex', alignItems: 'center' }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '10px', color: '#10b981' }}>
                                                <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
                                            </svg>
                                            Thông Tin Sân Bóng
                                        </h5>
                                        <div style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
                                            <h6 style={{ color: '#0f2e71', fontWeight: '700', marginBottom: '4px' }}>{selectedBooking.field?.name}</h6>
                                            <Badge bg="info" style={{ fontSize: '0.8rem' }}>{formatFieldType(selectedBooking.field?.fieldType)}</Badge>
                                        </div>
                                        <div style={{ marginBottom: '0.75rem' }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#64748b" viewBox="0 0 16 16" style={{ marginRight: '8px' }}>
                                                <path d="M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A31.493 31.493 0 0 1 8 14.58a31.481 31.481 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94zM8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10z" />
                                                <path d="M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                                            </svg>
                                            <small style={{ color: '#64748b' }}>{selectedBooking.field?.address}</small>
                                        </div>
                                        <Row className="g-2">
                                            <Col xs={6}>
                                                <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '0.75rem', textAlign: 'center' }}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#0f2e71" viewBox="0 0 16 16" style={{ marginBottom: '4px' }}>
                                                        <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5z" />
                                                    </svg>
                                                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '2px' }}>Ngày đặt</div>
                                                    <div style={{ color: '#0f2e71', fontWeight: '700' }}>{new Date(selectedBooking.bookingDate).toLocaleDateString('vi-VN')}</div>
                                                </div>
                                            </Col>
                                            <Col xs={6}>
                                                <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '0.75rem', textAlign: 'center' }}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#0f2e71" viewBox="0 0 16 16" style={{ marginBottom: '4px' }}>
                                                        <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z" />
                                                        <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z" />
                                                    </svg>
                                                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '2px' }}>Giờ chơi</div>
                                                    <div style={{ color: '#0f2e71', fontWeight: '700' }}>{selectedBooking.startTime} - {selectedBooking.endTime}</div>
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>

                                    {/* Services - if any */}
                                    {selectedBooking.services && selectedBooking.services.length > 0 && (
                                        <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                                            <h5 style={{ color: '#0f2e71', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '10px', color: '#f59e0b' }}>
                                                    <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5z" />
                                                </svg>
                                                Dịch Vụ Bổ Sung
                                            </h5>
                                            <div style={{ background: '#f8fafc', borderRadius: '12px', overflow: 'hidden' }}>
                                                <Table hover className="mb-0" style={{ background: 'transparent' }}>
                                                    <thead style={{ background: '#e2e8f0' }}>
                                                        <tr>
                                                            <th style={{ border: 'none', padding: '0.75rem', color: '#0f2e71', fontWeight: '600' }}>Dịch vụ</th>
                                                            <th style={{ border: 'none', padding: '0.75rem', color: '#0f2e71', fontWeight: '600', textAlign: 'center' }}>SL</th>
                                                            <th style={{ border: 'none', padding: '0.75rem', color: '#0f2e71', fontWeight: '600', textAlign: 'right' }}>Đơn giá</th>
                                                            <th style={{ border: 'none', padding: '0.75rem', color: '#0f2e71', fontWeight: '600', textAlign: 'right' }}>Thành tiền</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {selectedBooking.services.map((item, idx) => (
                                                            <tr key={idx}>
                                                                <td style={{ border: 'none', padding: '0.75rem' }}>
                                                                    <div style={{ fontWeight: '600', color: '#0f2e71' }}>{item.service?.name || 'N/A'}</div>
                                                                    {item.service?.category && (
                                                                        <small style={{ color: '#64748b' }}>({item.service.category})</small>
                                                                    )}
                                                                </td>
                                                                <td style={{ border: 'none', padding: '0.75rem', textAlign: 'center' }}>{item.quantity}</td>
                                                                <td style={{ border: 'none', padding: '0.75rem', textAlign: 'right', color: '#64748b' }}>{item.price.toLocaleString()}đ</td>
                                                                <td style={{ border: 'none', padding: '0.75rem', textAlign: 'right', fontWeight: '700', color: '#0f2e71' }}>
                                                                    {(item.price * item.quantity).toLocaleString()}đ
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </Table>
                                            </div>
                                        </div>
                                    )}
                                </Col>

                                {/* Right Column - Payment Info */}
                                <Col md={5} style={{ padding: '2rem', background: 'white' }}>
                                    <h5 style={{ color: '#0f2e71', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center' }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '10px', color: '#10b981' }}>
                                            <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4z" />
                                        </svg>
                                        Thanh Toán
                                    </h5>

                                    {/* Payment Method & Status */}
                                    <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
                                        <div style={{ marginBottom: '1rem' }}>
                                            <small style={{ color: '#64748b', fontSize: '0.85rem' }}>Phương thức thanh toán</small>
                                            <div style={{ marginTop: '6px' }}>
                                                {paymentInfo ? getPaymentMethodBadge(paymentInfo.paymentMethod) : <Badge bg="secondary">Đang tải...</Badge>}
                                            </div>
                                        </div>
                                        <div>
                                            <small style={{ color: '#64748b', fontSize: '0.85rem' }}>Trạng thái</small>
                                            <div style={{ marginTop: '6px' }}>
                                                {getPaymentBadge(selectedBooking.paymentStatus)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Total Amount */}
                                    <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderRadius: '16px', padding: '1.75rem', marginBottom: '1.5rem', textAlign: 'center', boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)' }}>
                                        <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Tổng Thanh Toán</div>
                                        <div style={{ color: 'white', fontSize: '2.5rem', fontWeight: '900', lineHeight: '1' }}>
                                            {selectedBooking.totalPrice.toLocaleString()}<span style={{ fontSize: '1.5rem' }}>đ</span>
                                        </div>
                                    </div>

                                    {paymentInfo && paymentInfo.paidAt && (
                                        <Alert variant="success" style={{ borderRadius: '12px', border: 'none' }}>
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '10px' }}>
                                                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
                                                </svg>
                                                <div>
                                                    <strong>Đã thanh toán</strong>
                                                    <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                                                        {new Date(paymentInfo.paidAt).toLocaleString('vi-VN')}
                                                    </div>
                                                </div>
                                            </div>
                                        </Alert>
                                    )}

                                    {/* QR Code for Unpaid Banking */}
                                    {selectedBooking.paymentStatus === 'unpaid' &&
                                        paymentInfo &&
                                        paymentInfo.paymentMethod === 'banking' && (
                                            <div style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)', borderRadius: '16px', padding: '1.5rem', border: '2px solid #fb923c' }}>
                                                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                                                    <h6 style={{ color: '#ea580c', fontWeight: '700', marginBottom: '8px' }}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '6px' }}>
                                                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                                                            <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z" />
                                                        </svg>
                                                        Quét Mã Để Thanh Toán
                                                    </h6>
                                                    <small style={{ color: '#9a3412' }}>Vui lòng chuyển khoản để hoàn tất đơn đặt sân</small>
                                                </div>

                                                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                                                    <img
                                                        src={`https://img.vietqr.io/image/${bankInfo.bank_name}-${bankInfo.account_number}-qronly.jpg?accountName=${encodeURIComponent(bankInfo.account_name)}&amount=${selectedBooking.totalPrice}&addInfo=${encodeURIComponent(selectedBooking.bookingCode)}`}
                                                        alt="QR Code Thanh Toán"
                                                        style={{ maxWidth: '200px', width: '100%', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                                                    />
                                                </div>

                                                <div style={{ background: 'white', borderRadius: '12px', padding: '1rem' }}>
                                                    <div style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                                        <strong style={{ color: '#0f2e71' }}>Ngân hàng:</strong>
                                                        <span style={{ marginLeft: '8px', color: '#64748b' }}>MB Bank (Quân đội)</span>
                                                    </div>
                                                    <div style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                                        <strong style={{ color: '#0f2e71' }}>STK:</strong>
                                                        <span style={{ marginLeft: '8px', color: '#64748b' }}>{bankInfo.account_number}</span>
                                                    </div>
                                                    <div style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                                        <strong style={{ color: '#0f2e71' }}>Chủ TK:</strong>
                                                        <span style={{ marginLeft: '8px', color: '#64748b' }}>{bankInfo.account_name}</span>
                                                    </div>
                                                    <div style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                                        <strong style={{ color: '#0f2e71' }}>Số tiền:</strong>
                                                        <span style={{ marginLeft: '8px', color: '#dc2626', fontWeight: '700' }}>
                                                            {selectedBooking.totalPrice.toLocaleString()}đ
                                                        </span>
                                                    </div>
                                                    <div style={{ fontSize: '0.9rem' }}>
                                                        <strong style={{ color: '#0f2e71' }}>Nội dung:</strong>
                                                        <code style={{ marginLeft: '8px', background: '#fef3c7', padding: '4px 8px', borderRadius: '6px', color: '#92400e', fontWeight: '600' }}>
                                                            {selectedBooking.bookingCode}
                                                        </code>
                                                    </div>
                                                </div>

                                                <Alert variant="success" style={{ marginTop: '1rem', marginBottom: '0', borderRadius: '12px', border: 'none', fontSize: '0.85rem' }}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '6px' }}>
                                                        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
                                                    </svg>
                                                    Hệ thống tự động xác nhận sau 5-10 phút
                                                </Alert>
                                            </div>
                                        )}

                                    {/* Cancel Reason */}
                                    {selectedBooking.status === 'cancelled' && selectedBooking.cancelReason && (
                                        <Alert variant="danger" style={{ borderRadius: '12px', marginTop: '1rem' }}>
                                            <strong>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '6px' }}>
                                                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                                                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                                                </svg>
                                                Lý do hủy:
                                            </strong> {selectedBooking.cancelReason}
                                        </Alert>
                                    )}
                                </Col>
                            </Row>
                        )}
                    </Modal.Body>
                    <Modal.Footer style={{ background: '#f8fafc', borderTop: '2px solid #e2e8f0' }}>
                        {selectedBooking && selectedBooking.status === 'pending' && (
                            <Button
                                variant="danger"
                                onClick={() => cancelBooking(selectedBooking._id)}
                                style={{ borderRadius: '10px', fontWeight: '600', padding: '0.5rem 1.5rem' }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '6px' }}>
                                    <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z" />
                                </svg>
                                Hủy Đơn
                            </Button>
                        )}
                        <Button
                            variant="secondary"
                            onClick={() => setShowDetailModal(false)}
                            style={{ borderRadius: '10px', fontWeight: '600', padding: '0.5rem 1.5rem' }}
                        >
                            Đóng
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </div>
    );
};

export default Danhsachsandadat;
