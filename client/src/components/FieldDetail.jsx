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
            // Backend trả về trực tiếp array, không có nested data
            const slots = Array.isArray(response.data.data) ? response.data.data : [];
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
            <Container className="py-5">
                {/* Breadcrumb */}
                <nav aria-label="breadcrumb" className="mb-4">
                    <ol className="breadcrumb-modern">
                        <li className="breadcrumb-modern-item">
                            <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.707 1.5ZM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5 5 5Z"/>
                                </svg>
                                Trang chủ
                            </a>
                        </li>
                        <li className="breadcrumb-modern-item">
                            <a href="/danh-sach-san" onClick={(e) => { e.preventDefault(); navigate('/danh-sach-san'); }}>
                                Danh sách sân
                            </a>
                        </li>
                        <li className="breadcrumb-modern-item active">{field.name}</li>
                    </ol>
                </nav>

                <Row>
                    <Col lg={8}>
                        {/* Image Gallery */}
                        <Card className="image-gallery-card mb-4">
                            <Card.Body className="p-0">
                                {field.images && field.images.length > 0 ? (
                                    <Carousel className="field-carousel" indicators={true} controls={field.images.length > 1}>
                                        {field.images.map((image, idx) => (
                                            <Carousel.Item key={idx}>
                                                <div className="carousel-image-wrapper">
                                                    <img
                                                        className="d-block w-100"
                                                        src={image}
                                                        alt={`${field.name} - ${idx + 1}`}
                                                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=1200&q=80' }}
                                                    />
                                                </div>
                                            </Carousel.Item>
                                        ))}
                                    </Carousel>
                                ) : (
                                    <div className="carousel-image-wrapper">
                                        <img 
                                            src="https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=1200&q=80" 
                                            alt={field.name} 
                                            className="w-100" 
                                        />
                                    </div>
                                )}
                            </Card.Body>
                        </Card>

                        {/* Field Info */}
                        <Card className="field-info-card mb-4">
                            <Card.Body className="p-4">
                                <div className="field-header mb-4">
                                    <div className="field-title-section">
                                        <h1 className="field-title">{field.name}</h1>
                                        <div className="field-badges mt-3">
                                            <Badge className="type-badge">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '6px' }}>
                                                    <path d="M6 1a.5.5 0 0 1 .5.5V3h3V1.5a.5.5 0 0 1 1 0V3h2a.5.5 0 0 1 .5.5v3A3.5 3.5 0 0 1 9.5 10c-.002.434-.01.845-.04 1.22-.041.514-.126 1.003-.317 1.424a2.083 2.083 0 0 1-.97 1.028C7.725 13.9 7.169 14 6.5 14c-.63 0-1.155-.09-1.606-.303a2.082 2.082 0 0 1-.977-1.028c-.181-.42-.266-.91-.308-1.424a12.36 12.36 0 0 1-.04-1.22A3.5 3.5 0 0 1 0 6.5v-3A.5.5 0 0 1 .5 3h2V1.5a.5.5 0 0 1 1 0V3h3V1.5A.5.5 0 0 1 6 1z"/>
                                                </svg>
                                                {field.fieldType}
                                            </Badge>
                                            <Badge className={`status-badge ${field.status === 'active' ? 'active' : 'inactive'}`}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '6px' }}>
                                                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                                                </svg>
                                                {field.status === 'active' ? 'Hoạt động' : 'Bảo trì'}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="field-rating-price">
                                        <div className="rating-section">
                                            <div className="rating-stars">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#ffc107" viewBox="0 0 16 16">
                                                    <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
                                                </svg>
                                                <strong className="rating-value">{(field.rating || 0).toFixed(1)}</strong>
                                            </div>
                                            <span className="reviews-count">({field.totalReviews || 0} đánh giá)</span>
                                        </div>
                                        <div className="price-section">
                                            <div className="price-amount">
                                                {(field.pricePerHour || 0).toLocaleString()}đ
                                            </div>
                                            <small className="price-unit">/giờ</small>
                                        </div>
                                    </div>
                                </div>

                                <div className="field-details">
                                    <div className="detail-section">
                                        <div className="detail-icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                                <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
                                            </svg>
                                        </div>
                                        <div className="detail-content">
                                            <h6>Địa chỉ</h6>
                                            <p className="detail-text"><strong>{field.location}</strong></p>
                                            {field.address && <p className="detail-subtext">{field.address}</p>}
                                        </div>
                                    </div>

                                    {field.description && (
                                        <div className="detail-section">
                                            <div className="detail-icon">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                                    <path d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4.414A2 2 0 0 0 3 11.586l-2 2V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12.793a.5.5 0 0 0 .854.353l2.853-2.853A1 1 0 0 1 4.414 12H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                                                </svg>
                                            </div>
                                            <div className="detail-content">
                                                <h6>Mô tả</h6>
                                                <p className="detail-text">{field.description}</p>
                                            </div>
                                        </div>
                                    )}

                                    {field.facilities && field.facilities.length > 0 && (
                                        <div className="detail-section">
                                            <div className="detail-icon">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                                    <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                                                </svg>
                                            </div>
                                            <div className="detail-content">
                                                <h6>Tiện ích</h6>
                                                <div className="facilities-grid">
                                                    {field.facilities.map((facility, idx) => (
                                                        <span key={idx} className="facility-item">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                                                                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                                                            </svg>
                                                            {facility}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Card.Body>
                        </Card>

                        {/* Reviews */}
                        <Card className="reviews-card">
                            <Card.Header>
                                <div className="reviews-header">
                                    <div className="reviews-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M2.678 11.894a1 1 0 0 1 .287.801 10.97 10.97 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8.06 8.06 0 0 0 8 14c3.996 0 7-2.807 7-6 0-3.192-3.004-6-7-6S1 4.808 1 8c0 1.468.617 2.83 1.678 3.894zm-.493 3.905a21.682 21.682 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a9.68 9.68 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105z"/>
                                        </svg>
                                    </div>
                                    <div>
                                        <h5>Đánh giá của khách hàng</h5>
                                        <p>{reviews.length} đánh giá</p>
                                    </div>
                                </div>
                            </Card.Header>
                            <Card.Body>
                                {reviews.length === 0 ? (
                                    <div className="empty-reviews">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="#d1d5db" viewBox="0 0 16 16">
                                            <path d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4.414A2 2 0 0 0 3 11.586l-2 2V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12.793a.5.5 0 0 0 .854.353l2.853-2.853A1 1 0 0 1 4.414 12H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                                        </svg>
                                        <p>Chưa có đánh giá nào</p>
                                    </div>
                                ) : (
                                    <div className="reviews-list">
                                        {reviews.map((review) => (
                                            <div key={review._id} className="review-item">
                                                <div className="review-header">
                                                    <div className="reviewer-info">
                                                        <div className="reviewer-avatar">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                                                <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
                                                                <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"/>
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <h6>{review.user?.fullName || 'Khách hàng'}</h6>
                                                            <span className="review-date">
                                                                {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="review-rating">
                                                        {[...Array(5)].map((_, i) => (
                                                            <svg key={i} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill={i < review.rating ? '#ffc107' : '#e5e7eb'} viewBox="0 0 16 16">
                                                                <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
                                                            </svg>
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="review-comment">{review.comment}</p>
                                                
                                                {review.reply && (
                                                    <div className="admin-reply">
                                                        <div className="reply-header">
                                                            <Badge className="admin-badge">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '4px' }}>
                                                                    <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
                                                                </svg>
                                                                Quản trị viên
                                                            </Badge>
                                                            <span className="reply-date">
                                                                {new Date(review.reply.createdAt).toLocaleDateString('vi-VN')}
                                                            </span>
                                                        </div>
                                                        <p className="reply-content">{review.reply.content}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col lg={4}>
                        <Card className="booking-card">
                            <Card.Header>
                                <div className="booking-header">
                                    <div className="booking-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                                        </svg>
                                    </div>
                                    <div>
                                        <h5>Đặt Sân Ngay</h5>
                                        <p>Chọn ngày và giờ phù hợp</p>
                                    </div>
                                </div>
                            </Card.Header>
                            <Card.Body className="p-4">
                                <Form>
                                    <Form.Group className="mb-4">
                                        <Form.Label className="booking-label">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '8px' }}>
                                                <path d="M11 6.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm-3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm-5 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1z"/>
                                            </svg>
                                            Chọn ngày
                                        </Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={selectedDate}
                                            min={new Date().toISOString().split('T')[0]}
                                            onChange={(e) => setSelectedDate(e.target.value)}
                                            className="booking-input"
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-4">
                                        <Form.Label className="booking-label">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '8px' }}>
                                                <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                                                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
                                            </svg>
                                            Khung giờ còn trống
                                        </Form.Label>
                                        {timeSlotsError && (
                                            <Alert variant="warning" className="time-slots-alert">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '8px' }}>
                                                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                                                    <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
                                                </svg>
                                                {timeSlotsError}
                                            </Alert>
                                        )}
                                        {!timeSlotsError && timeSlots.length === 0 ? (
                                            <div className="time-slots-loading">
                                                <Spinner animation="border" size="sm" />
                                                <span>Đang tải khung giờ...</span>
                                            </div>
                                        ) : timeSlots.length > 0 ? (
                                            <div className="time-slots-grid">
                                                {timeSlots.map((slot) => (
                                                    <button
                                                        key={slot._id}
                                                        type="button"
                                                        className={`time-slot-btn ${
                                                            selectedSlot?._id === slot._id ? 'selected' : ''
                                                        } ${
                                                            slot.status !== 'available' ? 'disabled' : ''
                                                        }`}
                                                        disabled={slot.status !== 'available'}
                                                        onClick={() => setSelectedSlot(slot)}
                                                    >
                                                        <div className="slot-time">
                                                            {slot.startTime} - {slot.endTime}
                                                        </div>
                                                        <div className="slot-price">
                                                            {slot.price.toLocaleString()}đ
                                                        </div>
                                                        <div className="slot-status">
                                                            {getSlotStatusBadge(slot.status)}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        ) : null}
                                    </Form.Group>

                                    {selectedSlot && (
                                        <Alert className="selected-slot-alert">
                                            <div className="selected-slot-header">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                                                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                                                </svg>
                                                <strong>Đã chọn</strong>
                                            </div>
                                            <div className="selected-slot-content">
                                                <p>{selectedSlot.startTime} - {selectedSlot.endTime}</p>
                                                <p className="selected-slot-price">{selectedSlot.price.toLocaleString()}đ</p>
                                            </div>
                                        </Alert>
                                    )}

                                    <Button 
                                        className="booking-submit-btn"
                                        onClick={handleBooking}
                                        disabled={!selectedSlot || field.status !== 'active'}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '10px' }}>
                                            <path d="M6 1a.5.5 0 0 1 .5.5V3h3V1.5a.5.5 0 0 1 1 0V3h2a.5.5 0 0 1 .5.5v3A3.5 3.5 0 0 1 9.5 10c-.002.434-.01.845-.04 1.22-.041.514-.126 1.003-.317 1.424a2.083 2.083 0 0 1-.97 1.028C7.725 13.9 7.169 14 6.5 14c-.63 0-1.155-.09-1.606-.303a2.082 2.082 0 0 1-.977-1.028c-.181-.42-.266-.91-.308-1.424a12.36 12.36 0 0 1-.04-1.22A3.5 3.5 0 0 1 0 6.5v-3A.5.5 0 0 1 .5 3h2V1.5a.5.5 0 0 1 1 0V3h3V1.5A.5.5 0 0 1 6 1z"/>
                                        </svg>
                                        Tiếp Tục Đặt Sân
                                    </Button>
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
