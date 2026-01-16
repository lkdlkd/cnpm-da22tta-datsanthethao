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
import Swal from 'sweetalert2';
import { bookingService, paymentService } from '../../services/api';
import './AdminCommon.css';
import './SelectArrow.css';
import './Quanlydatsan.css';

// Helper function để format loại sân
const formatFieldType = (fieldType) => {
    const typeMap = {
        '5vs5': 'Sân 5',
        '7vs7': 'Sân 7',
        '11vs11': 'Sân 11'
    };
    return typeMap[fieldType] || fieldType;
};

const Quanlydatsan = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [totalBookings, setTotalBookings] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        fetchBookings();
        setCurrentPage(1); // Reset to page 1 when filter changes
    }, [filterStatus]);

    const fetchBookings = async (page = currentPage) => {
        setLoading(true);
        try {
            const params = {
                page,
                limit: itemsPerPage,
                ...(filterStatus && { status: filterStatus })
            };
            const response = await bookingService.getAllBookings(params);

            // Xử lý response từ backend
            if (response.data.data && response.data.data.bookings) {
                // Backend trả về { bookings: [], total, page, totalPages }
                setBookings(response.data.data.bookings);
                setTotalBookings(response.data.data.pagination.total || 0);
                setTotalPages(response.data.data.pagination.totalPages || 1);
            } else {
                // Fallback nếu backend chưa hỗ trợ pagination
                setBookings(response.data);
                setTotalBookings(response.data.length);
                setTotalPages(Math.ceil(response.data.length / itemsPerPage));
            }
        } catch (err) {
            setError('Không thể tải danh sách đặt sân');
            setBookings([]);
            setTotalBookings(0);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async (id) => {
        const result = await Swal.fire({
            title: 'Xác nhận đơn đặt',
            text: 'Bạn có chắc chắn muốn xác nhận đơn đặt này?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Xác nhận',
            cancelButtonText: 'Hủy'
        });

        if (!result.isConfirmed) return;

        try {
            await bookingService.confirmBooking(id);
            Swal.fire({
                icon: 'success',
                title: 'Thành công!',
                text: 'Xác nhận đơn thành công!',
                timer: 2000,
                showConfirmButton: false
            });
            await fetchBookings();
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi!',
                text: 'Không thể xác nhận đơn'
            });
        }
    };

    const handleConfirmPayment = async (booking) => {
        const result = await Swal.fire({
            title: 'Xác nhận thanh toán',
            text: `Xác nhận đã nhận tiền cho đơn ${booking.bookingCode}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Xác nhận',
            cancelButtonText: 'Hủy'
        });

        if (!result.isConfirmed) return;

        try {
            // Sử dụng trực tiếp payment._id từ booking đã populated
            const paymentId = booking.payment?._id;

            if (!paymentId) {
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi!',
                    text: 'Không tìm thấy thông tin thanh toán cho đơn này'
                });
                return;
            }

            // Xác nhận thanh toán
            await paymentService.confirmCashPayment(paymentId);
            Swal.fire({
                icon: 'success',
                title: 'Thành công!',
                text: 'Xác nhận thanh toán thành công!',
                timer: 2000,
                showConfirmButton: false
            });
            await fetchBookings();
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi!',
                text: err.response?.data?.message || 'Không thể xác nhận thanh toán'
            });
        }
    };

    const handleAdminCancel = async (booking) => {
        const { value: reason, isConfirmed } = await Swal.fire({
            title: 'Hủy đơn đặt',
            text: `Nhập lý do hủy đơn ${booking.bookingCode}:`,
            input: 'textarea',
            inputPlaceholder: 'Nhập lý do hủy...',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Hủy đơn',
            cancelButtonText: 'Đóng',
            inputValidator: (value) => {
                if (!value || !value.trim()) {
                    return 'Vui lòng nhập lý do hủy!';
                }
            }
        });

        if (!isConfirmed) return;

        try {
            await bookingService.cancelBooking(booking._id, { cancelReason: reason });
            Swal.fire({
                icon: 'success',
                title: 'Thành công!',
                text: 'Hủy đơn thành công!',
                timer: 2000,
                showConfirmButton: false
            });
            await fetchBookings();
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi!',
                text: err.response?.data?.message || 'Không thể hủy đơn'
            });
        }
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            pending: { variant: 'warning', text: 'Chờ xác nhận' },
            confirmed: { variant: 'success', text: 'Đã xác nhận' },
            cancelled: { variant: 'danger', text: 'Đã hủy' },
            completed: { variant: 'info', text: 'Hoàn thành' }
        };
        const { variant, text } = statusMap[status] || statusMap.pending;
        return <Badge bg={variant}>{text}</Badge>;
    };

    const getPaymentBadge = (status, method) => {
        const methodText = method === 'banking' ? ' (CK)' : method === 'cash' ? ' (Tiền mặt)' : '';
        return status === 'paid'
            ? <Badge bg="success">Đã thanh toán{methodText}</Badge>
            : <Badge bg="warning">Chưa thanh toán{methodText}</Badge>;
    };

    const viewDetail = (booking) => {
        setSelectedBooking(booking);
        setShowDetailModal(true);
    };

    // Pagination calculations
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        fetchBookings(pageNumber);
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
        <Container fluid className="quanlydatsan-page">
            <h2>
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '12px', verticalAlign: 'middle' }}>
                    <path d="M11 6.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1z" />
                    <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z" />
                </svg>
                Quản Lý Đặt Sân
            </h2>

            {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}
            {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

            <Card className="mb-4 filter-section">
                <Card.Body>
                    <Row>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Lọc theo trạng thái</Form.Label>
                                <Form.Select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                >
                                    <option value="">Tất cả</option>
                                    <option value="pending">Chờ xác nhận</option>
                                    <option value="confirmed">Đã xác nhận</option>
                                    <option value="cancelled">Đã hủy</option>
                                    <option value="completed">Hoàn thành</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={8} className="d-flex align-items-end justify-content-end">
                            <div className="text-muted">
                                Tổng: <strong>{totalBookings}</strong> đơn đặt
                                {totalBookings > 0 && ` | Trang ${currentPage}/${totalPages}`}
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
                                    <th>STT</th>
                                    <th>Mã Đơn</th>
                                    <th>Khách Hàng</th>
                                    <th>Sân</th>
                                    <th>Ngày Đặt</th>
                                    <th>Tổng Tiền</th>
                                    <th>Trạng Thái</th>
                                    <th>Thao Tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="text-center py-4">
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
                                    bookings.map((booking, index) => (
                                        <tr key={booking._id}>
                                            <td>{indexOfFirstItem + index + 1}</td>
                                            <td><strong style={{ fontSize: '0.9rem' }}>{booking.bookingCode}</strong></td>
                                            <td>
                                                <div style={{ fontSize: '0.9rem' }}>{booking.customerName}</div>
                                                <small className="text-muted">{booking.customerPhone}</small>
                                            </td>
                                            <td>
                                                <div style={{ fontSize: '0.85rem' }}>{booking.field?.name || 'N/A'}</div>
                                                <Badge bg="secondary" className="mt-1" style={{ fontSize: '0.75rem' }}>
                                                    {formatFieldType(booking.field?.fieldType) || 'N/A'}
                                                </Badge>
                                            </td>
                                            <td style={{ fontSize: '0.85rem' }}>
                                                {new Date(booking.bookingDate).toLocaleDateString('vi-VN')}
                                            </td>
                                            <td className="text-end" style={{ fontSize: '0.9rem' }}>
                                                <strong className="text-success">{booking.totalPrice?.toLocaleString() || 0}đ</strong>
                                            </td>
                                            <td>{getStatusBadge(booking.status)}</td>
                                            <td>
                                                <div className="action-btn-group">
                                                    <button
                                                        className="action-btn view"
                                                        onClick={() => viewDetail(booking)}
                                                        title="Xem chi tiết"
                                                    >
                                                    </button>
                                                    <button
                                                        className="action-btn confirm"
                                                        onClick={() => handleConfirm(booking._id)}
                                                        disabled={booking.status !== 'pending'}
                                                        title={booking.status === 'pending' ? 'Xác nhận đơn' : 'Đã xác nhận'}
                                                        style={booking.status !== 'pending' ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
                                                    >
                                                    </button>
                                                    <button
                                                        className="action-btn payment"
                                                        onClick={() => handleConfirmPayment(booking)}
                                                        disabled={booking.paymentStatus === 'paid' || !booking.payment || booking.payment.paymentMethod !== 'cash'}
                                                        title={booking.paymentStatus === 'paid' ? 'Đã thanh toán' : (booking.payment?.paymentMethod === 'cash' ? 'Xác nhận thanh toán' : 'Không áp dụng')}
                                                        style={(booking.paymentStatus === 'paid' || !booking.payment || booking.payment.paymentMethod !== 'cash') ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
                                                    >
                                                    </button>
                                                    <button
                                                        className="action-btn cancel"
                                                        onClick={() => handleAdminCancel(booking)}
                                                        disabled={booking.status === 'cancelled' || booking.status === 'completed'}
                                                        title={booking.status === 'cancelled' ? 'Đã hủy' : booking.status === 'completed' ? 'Đã hoàn thành' : 'Hủy đơn'}
                                                        style={(booking.status === 'cancelled' || booking.status === 'completed') ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
                                                    >
                                                    </button>
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
                            Hiển thị <strong>{totalBookings > 0 ? indexOfFirstItem + 1 : 0}</strong> - <strong>{Math.min(indexOfLastItem, totalBookings)}</strong> của <strong>{totalBookings}</strong> đơn đặt
                        </small>
                    </div>
                </Card.Body>
            </Card>

            {/* Modal Chi Tiết */}
            <Modal
                show={showDetailModal}
                onHide={() => setShowDetailModal(false)}
                size="lg"
                style={{ maxHeight: '90vh' }}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Chi Tiết Đơn Đặt</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ maxHeight: 'calc(90vh - 120px)', overflowY: 'auto' }}>
                    {selectedBooking && (
                        <div>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <strong>Mã đơn:</strong> {selectedBooking.bookingCode}
                                </Col>
                                <Col md={6}>
                                    <strong>Trạng thái:</strong> {getStatusBadge(selectedBooking.status)}
                                </Col>
                            </Row>
                            <hr />
                            <h5>👤 Thông Tin Khách Hàng</h5>
                            <p><strong>Tên:</strong> {selectedBooking.customerName}</p>
                            <p><strong>Số điện thoại:</strong> {selectedBooking.customerPhone}</p>
                            <p><strong>Email:</strong> {selectedBooking.user?.email || 'N/A'}</p>
                            <hr />
                            <h5>Thông Tin Sân</h5>
                            <p><strong>Tên sân:</strong> {selectedBooking.field?.name || 'N/A'}</p>
                            <p><strong>Loại sân:</strong> <Badge bg="secondary">{formatFieldType(selectedBooking.field?.fieldType) || 'N/A'}</Badge></p>
                            <p><strong>Địa chỉ:</strong> {selectedBooking.field?.address || 'N/A'}</p>
                            <hr />
                            <h5>📅 Thông Tin Đặt Sân</h5>
                            <p><strong>Ngày:</strong> {new Date(selectedBooking.bookingDate).toLocaleDateString('vi-VN')}</p>
                            <p><strong>Giờ:</strong> {selectedBooking.startTime} - {selectedBooking.endTime}</p>
                            <p><strong>Giá sân:</strong> {selectedBooking.timeSlot?.price?.toLocaleString() || '0'}đ</p>

                            {selectedBooking.services && selectedBooking.services.length > 0 && (
                                <>
                                    <hr />
                                    <h5>Dịch Vụ Đã Chọn</h5>
                                    <Table bordered size="sm">
                                        <thead>
                                            <tr>
                                                <th>Tên dịch vụ</th>
                                                <th>Loại</th>
                                                <th className="text-center">Số lượng</th>
                                                <th className="text-end">Đơn giá</th>
                                                <th className="text-end">Thành tiền</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedBooking.services.map((s, idx) => (
                                                <tr key={idx}>
                                                    <td>{s.service?.name || 'N/A'}</td>
                                                    <td>
                                                        <Badge bg="info">
                                                            {s.service?.category === 'equipment' ? 'Thiết bị' :
                                                                s.service?.category === 'beverage' ? 'Đồ uống' :
                                                                    s.service?.category === 'referee' ? 'Trọng tài' : 'Khác'}
                                                        </Badge>
                                                    </td>
                                                    <td className="text-center">{s.quantity} {s.service?.unit || ''}</td>
                                                    <td className="text-end">{s.service?.price?.toLocaleString() || 0}đ</td>
                                                    <td className="text-end"><strong>{(s.quantity * (s.service?.price || 0)).toLocaleString()}đ</strong></td>
                                                </tr>
                                            ))}
                                            <tr className="table-light">
                                                <td colSpan="4" className="text-end"><strong>Tổng tiền dịch vụ:</strong></td>
                                                <td className="text-end">
                                                    <strong className="text-primary">
                                                        {selectedBooking.services.reduce((sum, s) => sum + (s.quantity * (s.service?.price || 0)), 0).toLocaleString()}đ
                                                    </strong>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </Table>
                                </>
                            )}

                            <hr />
                            <h5>Thông Tin Thanh Toán</h5>
                            <p>
                                <strong>Tổng tiền:</strong>{' '}
                                <span className="text-danger fw-bold fs-5">{selectedBooking.totalPrice?.toLocaleString() || 0}đ</span>
                            </p>
                            <p>
                                <strong>Phương thức:</strong>{' '}
                                {selectedBooking.payment?.paymentMethod === 'banking' ?
                                    <Badge bg="primary">Chuyển khoản</Badge> :
                                    selectedBooking.payment?.paymentMethod === 'cash' ?
                                        <Badge bg="success">Tiền mặt</Badge> :
                                        <Badge bg="secondary">N/A</Badge>
                                }
                            </p>
                            <p>
                                <strong>Trạng thái thanh toán:</strong>{' '}
                                {getPaymentBadge(selectedBooking.paymentStatus, selectedBooking.payment?.paymentMethod)}
                            </p>

                            {selectedBooking.notes && (
                                <>
                                    <hr />
                                    <h5>📝 Ghi Chú</h5>
                                    <Alert variant="info">{selectedBooking.notes}</Alert>
                                </>
                            )}
                            {selectedBooking.cancelReason && (
                                <>
                                    <hr />
                                    <h5>❌ Lý Do Hủy</h5>
                                    <Alert variant="danger">
                                        <strong>Lý do:</strong> {selectedBooking.cancelReason}<br />
                                        <small><strong>Thời gian hủy:</strong> {new Date(selectedBooking.cancelledAt).toLocaleString('vi-VN')}</small>
                                    </Alert>
                                </>
                            )}

                            <hr />
                            <Row className="text-muted">
                                <Col md={6}>
                                    <small><strong>Tạo lúc:</strong> {new Date(selectedBooking.createdAt).toLocaleString('vi-VN')}</small>
                                </Col>
                                <Col md={6}>
                                    <small><strong>Cập nhật:</strong> {new Date(selectedBooking.updatedAt).toLocaleString('vi-VN')}</small>
                                </Col>
                            </Row>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
                        Đóng
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Quanlydatsan;
