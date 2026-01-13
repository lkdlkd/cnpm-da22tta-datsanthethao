import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Container, 
    Row, 
    Col, 
    Card, 
    Button, 
    Form,
    Badge,
    Spinner,
    Alert,
    Carousel
} from 'react-bootstrap';
import { fieldService, timeSlotService, reviewService } from '../services/api';
import { useAuth } from './AuthContext';
import './FieldDetail.css';

const FieldDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { auth } = useAuth();
    const [field, setField] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [selectedDate, setSelectedDate] = useState('');
    const [timeSlots, setTimeSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [timeSlotsError, setTimeSlotsError] = useState('');

    useEffect(() => {
        fetchFieldDetail();
        fetchReviews();
        const today = new Date().toISOString().split('T')[0];
        setSelectedDate(today);
    }, [id]);

    useEffect(() => {
        if (selectedDate && field) {
            fetchTimeSlots();
        }
    }, [selectedDate, field]);

    const fetchFieldDetail = async () => {
        setLoading(true);
        try {
            const response = await fieldService.getFieldById(id);
            setField(response.data.data);
        } catch (error) {
            setError('Không thể tải thông tin sân');
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async () => {
        try {
            const response = await reviewService.getReviewsByField(id);
            setReviews(response.data.data || []);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        }
    };

    const fetchTimeSlots = async () => {
        setTimeSlotsError('');
        try {
            const response = await timeSlotService.getTimeSlotsByFieldAndDate(id, selectedDate);
            console.log('Time slots response:', response.data);
            // Backend trả về trực tiếp array, không có nested data
            const slots = Array.isArray(response.data) ? response.data : [];
            setTimeSlots(slots);
            if (slots.length === 0) {
                setTimeSlotsError('Chưa có khung giờ nào được tạo cho ngày này. Vui lòng liên hệ admin để tạo khung giờ.');
            }
        } catch (error) {
            console.error('Error fetching time slots:', error);
            setTimeSlots([]);
            setTimeSlotsError(error.response?.data?.message || 'Không thể tải khung giờ');
        }
    };

    const handleBooking = () => {
        if (!auth.token) {
            alert('Để đặt sân, vui lòng đăng nhập!');
            navigate('/dang-nhap');
            return;
        }

        if (!selectedSlot) {
            alert('Vui lòng chọn khung giờ!');
            return;
        }

        navigate('/booking', {
            state: { field, timeSlot: selectedSlot, date: selectedDate }
        });
    };

    const getSlotStatusBadge = (status) => {
        const statusMap = {
            available: { variant: 'success', text: 'Còn trống' },
            booked: { variant: 'danger', text: 'Đã đặt' },
            blocked: { variant: 'secondary', text: 'Khóa' }
        };
        const { variant, text } = statusMap[status] || statusMap.available;
        return <Badge bg={variant}>{text}</Badge>;
    };

    if (loading) {
        return (
            <Container className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">Đang tải...</p>
            </Container>
        );
    }

    if (error || !field) {
        return (
            <Container className="py-5">
                <Alert variant="danger">{error || 'Không tìm thấy thông tin sân'}</Alert>
                <Button variant="primary" onClick={() => navigate('/')}>Quay lại trang chủ</Button>
            </Container>
        );
    }

    return (
        <div className="field-detail-page">
            <Container className="py-4">
                <nav aria-label="breadcrumb" className="mb-4">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item">
                            <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>Trang chủ</a>
                        </li>
                        <li className="breadcrumb-item active">{field.name}</li>
                    </ol>
                </nav>

                <Row>
                    <Col lg={8}>
                        <Card className="mb-4 shadow-sm">
                            <Card.Body className="p-0">
                                {field.images && field.images.length > 0 ? (
                                    <Carousel>
                                        {field.images.map((image, idx) => (
                                            <Carousel.Item key={idx}>
                                                <img
                                                    className="d-block w-100"
                                                    src={image}
                                                    alt={`${field.name} - ${idx + 1}`}
                                                    style={{ height: '400px', objectFit: 'cover' }}
                                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/800x400?text=Sân+Bóng' }}
                                                />
                                            </Carousel.Item>
                                        ))}
                                    </Carousel>
                                ) : (
                                    <img src="https://via.placeholder.com/800x400?text=Sân+Bóng" alt={field.name} style={{ height: '400px', objectFit: 'cover', width: '100%' }} />
                                )}
                            </Card.Body>
                        </Card>

                        <Card className="mb-4 shadow-sm">
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div>
                                        <h2 className="mb-2">{field.name}</h2>
                                        <Badge bg="primary" className="me-2">{field.fieldType}</Badge>
                                        <Badge bg={field.status === 'active' ? 'success' : 'secondary'}>
                                            {field.status === 'active' ? 'Hoạt động' : 'Bảo trì'}
                                        </Badge>
                                    </div>
                                    <div className="text-end">
                                        <div className="rating mb-1">
                                            <span className="text-warning fs-5">⭐</span>
                                            <strong className="fs-5 ms-1">{(field.rating || 0).toFixed(1)}</strong>
                                            <span className="text-muted"> ({field.totalReviews || 0} đánh giá)</span>
                                        </div>
                                        <div className="price">
                                            <h3 className="text-primary mb-0">
                                                {(field.pricePerHour || 0).toLocaleString()}đ
                                                <small className="text-muted">/giờ</small>
                                            </h3>
                                        </div>
                                    </div>
                                </div>

                                <hr />

                                <div className="mb-3">
                                    <h5>📍 Địa chỉ</h5>
                                    <p className="mb-2"><strong>{field.location}</strong></p>
                                    <p className="text-muted">{field.address}</p>
                                </div>

                                {field.description && (
                                    <div className="mb-3">
                                        <h5>📝 Mô tả</h5>
                                        <p>{field.description}</p>
                                    </div>
                                )}

                                {field.facilities && field.facilities.length > 0 && (
                                    <div className="mb-3">
                                        <h5>🏟️ Tiện ích</h5>
                                        <div className="d-flex flex-wrap gap-2">
                                            {field.facilities.map((facility, idx) => (
                                                <Badge key={idx} bg="light" text="dark" className="p-2">
                                                    ✅ {facility}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>

                        <Card className="shadow-sm">
                            <Card.Header>
                                <h5 className="mb-0">💬 Đánh giá của khách hàng</h5>
                            </Card.Header>
                            <Card.Body>
                                {reviews.length === 0 ? (
                                    <p className="text-muted text-center py-3">Chưa có đánh giá nào</p>
                                ) : (
                                    reviews.map((review) => (
                                        <div key={review._id} className="review-item mb-3 pb-3 border-bottom">
                                            <div className="d-flex justify-content-between mb-2">
                                                <strong>{review.user?.fullName || 'Khách hàng'}</strong>
                                                <div>
                                                    {[...Array(5)].map((_, i) => (
                                                        <span key={i} className={i < review.rating ? 'text-warning' : 'text-muted'}>⭐</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="mb-1">{review.comment}</p>
                                            <small className="text-muted">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</small>
                                            
                                            {review.reply && (
                                                <div className="admin-reply mt-3 ms-3 p-3 bg-light border-start border-3 border-primary rounded">
                                                    <div className="d-flex align-items-center mb-2">
                                                        <Badge bg="primary" className="me-2">👨‍💼 Quản trị viên</Badge>
                                                        <small className="text-muted">
                                                            {new Date(review.reply.createdAt).toLocaleDateString('vi-VN')}
                                                        </small>
                                                    </div>
                                                    <p className="mb-0 text-secondary">{review.reply.content}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col lg={4}>
                        <Card className="shadow-sm sticky-booking">
                            <Card.Header className="bg-primary text-white">
                                <h5 className="mb-0">🏟️ Đặt Sân</h5>
                            </Card.Header>
                            <Card.Body>
                                <Form>
                                    <Form.Group className="mb-3">
                                        <Form.Label><strong>Chọn ngày</strong></Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={selectedDate}
                                            min={new Date().toISOString().split('T')[0]}
                                            onChange={(e) => setSelectedDate(e.target.value)}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label><strong>Khung giờ còn trống</strong></Form.Label>
                                        {timeSlotsError && (
                                            <Alert variant="warning">{timeSlotsError}</Alert>
                                        )}
                                        {!timeSlotsError && timeSlots.length === 0 ? (
                                            <Alert variant="info">Đang tải khung giờ...</Alert>
                                        ) : timeSlots.length > 0 ? (
                                            <div className="time-slots-grid">
                                                {timeSlots.map((slot) => (
                                                    <Button
                                                        key={slot._id}
                                                        variant={selectedSlot?._id === slot._id ? 'primary' : 'outline-primary'}
                                                        size="sm"
                                                        className="time-slot-btn"
                                                        disabled={slot.status !== 'available'}
                                                        onClick={() => setSelectedSlot(slot)}
                                                    >
                                                        <div>{slot.startTime} - {slot.endTime}</div>
                                                        <div className="slot-price">{slot.price.toLocaleString()}đ</div>
                                                        <div className="mt-1">{getSlotStatusBadge(slot.status)}</div>
                                                    </Button>
                                                ))}
                                            </div>
                                        ) : null}
                                    </Form.Group>

                                    {selectedSlot && (
                                        <Alert variant="success">
                                            <strong>Đã chọn:</strong><br />
                                            {selectedSlot.startTime} - {selectedSlot.endTime}<br />
                                            <strong>{selectedSlot.price.toLocaleString()}đ</strong>
                                        </Alert>
                                    )}

                                    <div className="d-grid">
                                        <Button 
                                            variant="primary" 
                                            size="lg"
                                            onClick={handleBooking}
                                            disabled={!selectedSlot || field.status !== 'active'}
                                        >
                                            🏟️ Tiếp Tục Đặt Sân
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

export default FieldDetail;
