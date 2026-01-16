import React, { useState, useEffect } from 'react';
import {
    Container,
    Row,
    Col,
    Card,
    Button,
    Badge,
    Tabs,
    Tab,
    Form,
    Alert
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { serviceService } from '../../services/api';
import './DichVu.css';

const DichVu = ({ onSelectService }) => {
    const navigate = useNavigate();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeCategory, setActiveCategory] = useState('all');
    const [selectedServices, setSelectedServices] = useState([]);
    const [bookingDraft, setBookingDraft] = useState(null);

    useEffect(() => {
        // Load booking draft if exists
        const draft = sessionStorage.getItem('bookingDraft');
        if (draft) {
            try {
                setBookingDraft(JSON.parse(draft));
            } catch (e) {
                console.error('Error parsing bookingDraft:', e);
                sessionStorage.removeItem('bookingDraft');
            }
        }

        // Load previously selected services
        const saved = sessionStorage.getItem('selectedServices');
        if (saved) {
            try {
                setSelectedServices(JSON.parse(saved));
            } catch (e) {
                console.error('Error parsing services:', e);
            }
        }
    }, []);

    useEffect(() => {
        fetchServices();
    }, [activeCategory]);

    const fetchServices = async () => {
        setLoading(true);
        try {
            let response;
            if (activeCategory === 'all') {
                response = await serviceService.getAllServices({ limit: 100 });
            } else {
                response = await serviceService.getServicesByCategory(activeCategory);
            }
            setServices(response.data.data || []);
        } catch (err) {
            console.error('Error fetching services:', err);
        } finally {
            setLoading(false);
        }
    };

    const getCategoryText = (category) => {
        const map = {
            equipment: 'Thiết bị',
            beverage: 'Đồ uống',
            referee: 'Trọng tài',
            other: 'Khác'
        };
        return map[category] || category;
    };

    const handleQuantityChange = (serviceId, quantity) => {
        const parsedQty = parseInt(quantity);
        if (parsedQty <= 0 || isNaN(parsedQty)) {
            setSelectedServices(prev => prev.filter(s => s.serviceId !== serviceId));
        } else {
            setSelectedServices(prev => {
                const exists = prev.find(s => s.serviceId === serviceId);
                if (exists) {
                    return prev.map(s =>
                        s.serviceId === serviceId
                            ? { ...s, quantity: parsedQty }
                            : s
                    );
                } else {
                    const service = services.find(s => s._id === serviceId);
                    return [...prev, {
                        serviceId: service._id,
                        name: service.name,
                        price: service.price,
                        quantity: parsedQty,
                        unit: service.unit
                    }];
                }
            });
        }
    };

    const getSelectedQuantity = (serviceId) => {
        const selected = selectedServices.find(s => s.serviceId === serviceId);
        return selected ? selected.quantity : 0;
    };

    const getTotalPrice = () => {
        return selectedServices.reduce((total, s) => total + (s.price * s.quantity), 0);
    };

    const handleAddToBooking = () => {
        if (selectedServices.length === 0) {
            alert('Vui lòng chọn ít nhất một dịch vụ');
            return;
        }

        // Save to sessionStorage
        sessionStorage.setItem('selectedServices', JSON.stringify(selectedServices));

        if (onSelectService) {
            // If used as component with callback
            onSelectService(selectedServices);
        } else if (bookingDraft) {
            // If came from booking form, go back to booking
            navigate('/booking', { 
                state: bookingDraft,
                replace: true 
            });
            sessionStorage.removeItem('bookingDraft');
        } else {
            // Otherwise go to field list
            alert('✅ Đã lưu dịch vụ! Hãy chọn sân để đặt.');
            navigate('/danh-sach-san');
        }
    };

    const renderServiceCard = (service) => (
        <Col md={6} lg={4} xl={3} key={service._id} className="mb-4">
            <Card className="service-card h-100">
                <Card.Body className="p-4">
                    <div className="service-header">
                        <div className="service-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
                                <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319z"/>
                            </svg>
                        </div>
                        <Badge className={`stock-badge ${service.stock > 0 ? 'in-stock' : 'out-stock'}`}>
                            {service.stock > 0 ? (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '4px' }}>
                                        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                                    </svg>
                                    SL: {service.stock}
                                </>
                            ) : (
                                'Hết hàng'
                            )}
                        </Badge>
                    </div>

                    <h5 className="service-name">{service.name}</h5>
                    
                    {service.description && (
                        <p className="service-description">{service.description}</p>
                    )}

                    <div className="service-price">
                        <span className="price-amount">
                            {service.price.toLocaleString()}đ
                        </span>
                        <span className="price-unit">/{service.unit}</span>
                    </div>

                    {service.stock > 0 && service.isAvailable ? (
                        <Form.Group className="quantity-control">
                            <Form.Label>Số lượng</Form.Label>
                            <div className="quantity-buttons">
                                <button
                                    type="button"
                                    className="qty-btn minus"
                                    onClick={() => {
                                        const current = getSelectedQuantity(service._id);
                                        if (current > 0) {
                                            handleQuantityChange(service._id, current - 1);
                                        }
                                    }}
                                    disabled={getSelectedQuantity(service._id) === 0}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8z"/>
                                    </svg>
                                </button>
                                <input
                                    type="number"
                                    className="qty-input"
                                    min="0"
                                    max={service.stock}
                                    value={getSelectedQuantity(service._id)}
                                    onChange={(e) => handleQuantityChange(service._id, e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="qty-btn plus"
                                    onClick={() => {
                                        const current = getSelectedQuantity(service._id);
                                        if (current < service.stock) {
                                            handleQuantityChange(service._id, current + 1);
                                        }
                                    }}
                                    disabled={getSelectedQuantity(service._id) >= service.stock}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                                    </svg>
                                </button>
                            </div>
                        </Form.Group>
                    ) : (
                        <div className="unavailable-notice">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                                <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
                            </svg>
                            Tạm thời không có sẵn
                        </div>
                    )}
                </Card.Body>
            </Card>
        </Col>
    );

    return (
        <div className="dichvu-page">
            {/* Banner */}
            <div className="page-banner">
                <Container>
                    <div className="banner-content">
                        <div className="banner-badge">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '6px' }}>
                                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                            </svg>
                            Dịch vụ bổ sung
                        </div>
                        <h1 className="banner-title">Dịch Vụ Bổ Sung</h1>
                        <p className="banner-subtitle">Chọn thêm các dịch vụ để trải nghiệm tốt hơn</p>
                    </div>
                </Container>
            </div>

            <Container className="py-5" style={{maxWidth: 1200}}>
                {/* Breadcrumb */}
                <nav aria-label="breadcrumb" className="mb-4">
                    <ol className="breadcrumb-modern">
                        <li className="breadcrumb-modern-item">
                            <a href="/home" onClick={(e) => { e.preventDefault(); navigate('/home'); }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.707 1.5ZM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5 5 5Z"/>
                                </svg>
                                Trang chủ
                            </a>
                        </li>
                        <li className="breadcrumb-modern-item active">Dịch vụ</li>
                    </ol>
                </nav>

                {/* Category Tabs */}
                <div className="category-tabs mb-4">
                    <button 
                        className={`category-tab ${activeCategory === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveCategory('all')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zM2.5 2a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zM1 10.5A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3z"/>
                        </svg>
                        Tất cả
                    </button>
                    <button 
                        className={`category-tab ${activeCategory === 'equipment' ? 'active' : ''}`}
                        onClick={() => setActiveCategory('equipment')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M6 1a.5.5 0 0 1 .5.5V3h3V1.5a.5.5 0 0 1 1 0V3h2a.5.5 0 0 1 .5.5v3A3.5 3.5 0 0 1 9.5 10c-.002.434-.01.845-.04 1.22-.041.514-.126 1.003-.317 1.424a2.083 2.083 0 0 1-.97 1.028C7.725 13.9 7.169 14 6.5 14c-.63 0-1.155-.09-1.606-.303a2.082 2.082 0 0 1-.977-1.028c-.181-.42-.266-.91-.308-1.424a12.36 12.36 0 0 1-.04-1.22A3.5 3.5 0 0 1 0 6.5v-3A.5.5 0 0 1 .5 3h2V1.5a.5.5 0 0 1 1 0V3h3V1.5A.5.5 0 0 1 6 1z"/>
                        </svg>
                        Thiết bị
                    </button>
                    <button 
                        className={`category-tab ${activeCategory === 'beverage' ? 'active' : ''}`}
                        onClick={() => setActiveCategory('beverage')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M13 8V0L9 4 5 0v8a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2zM8 15a1 1 0 0 1-1-1v-1h2v1a1 1 0 0 1-1 1zm5-9a2.5 2.5 0 0 1 0 5V8.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5V11h1.5A2.5 2.5 0 0 1 13 6z"/>
                        </svg>
                        Đồ uống
                    </button>
                    <button 
                        className={`category-tab ${activeCategory === 'referee' ? 'active' : ''}`}
                        onClick={() => setActiveCategory('referee')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
                        </svg>
                        Trọng tài
                    </button>
                    <button 
                        className={`category-tab ${activeCategory === 'other' ? 'active' : ''}`}
                        onClick={() => setActiveCategory('other')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
                            <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319z"/>
                        </svg>
                        Khác
                    </button>
                </div>

            {loading ? (
                <div className="loading-state">
                    <div className="spinner-border" role="status"></div>
                    <p>Đang tải dịch vụ...</p>
                </div>
            ) : services.length === 0 ? (
                <div className="empty-state">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="#d1d5db" viewBox="0 0 16 16">
                        <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
                        <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319z"/>
                    </svg>
                    <h4>Chưa có dịch vụ nào</h4>
                    <p>Hiện chưa có dịch vụ nào trong danh mục này</p>
                </div>
            ) : (
                <Row>
                    {services.map(renderServiceCard)}
                </Row>
            )}

                {/* Selected Services Summary */}
                {selectedServices.length > 0 && (
                    <Card className="selected-services-card">
                        <Card.Body className="p-4">
                            <div className="summary-header">
                                <div className="summary-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zM2.5 2a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zM1 10.5A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3z"/>
                                    </svg>
                                </div>
                                <div>
                                    <h5>Dịch vụ đã chọn</h5>
                                    <p>{selectedServices.length} dịch vụ</p>
                                </div>
                            </div>
                            
                            <div className="selected-items">
                                {selectedServices.map((s, idx) => (
                                    <div key={idx} className="selected-item">
                                        <div className="item-info">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                                                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                                            </svg>
                                            <div>
                                                <strong>{s.name}</strong>
                                                <span className="item-quantity">x {s.quantity}</span>
                                            </div>
                                        </div>
                                        <div className="item-price">
                                            {(s.price * s.quantity).toLocaleString()}đ
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="summary-total">
                                <span>Tổng cộng:</span>
                                <span className="total-amount">{getTotalPrice().toLocaleString()}đ</span>
                            </div>
                            
                            <Button
                                className="summary-submit-btn"
                                onClick={handleAddToBooking}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '10px' }}>
                                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                                </svg>
                                {bookingDraft ? 'Quay lại đặt sân' : 'Lưu & Đi đặt sân'}
                            </Button>
                            {bookingDraft && (
                                <Button
                                    className="summary-clear-btn"
                                    onClick={() => {
                                        sessionStorage.removeItem('selectedServices');
                                        setSelectedServices([]);
                                    }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '8px' }}>
                                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z"/>
                                        <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z"/>
                                    </svg>
                                    Xóa tất cả
                                </Button>
                            )}
                        </Card.Body>
                    </Card>
                )}

                {selectedServices.length === 0 && bookingDraft && (
                    <Alert className="info-tip">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                            <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                        </svg>
                        <div>
                            <strong>Mẹo:</strong> Chọn các dịch vụ bạn cần, sau đó nhấn nút để quay lại trang đặt sân
                        </div>
                    </Alert>
                )}
            </Container>
        </div>
    );
};

export default DichVu;
