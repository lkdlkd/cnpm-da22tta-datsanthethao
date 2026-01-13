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
        <Col md={6} lg={4} xl={3} key={service._id} className="mb-3">
            <Card className="h-100 service-card">
                <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="mb-0">{service.name}</h6>
                        <Badge bg={service.stock > 0 ? 'success' : 'danger'}>
                            {service.stock > 0 ? `SL: ${service.stock}` : 'Hết hàng'}
                        </Badge>
                    </div>
                    
                    {service.description && (
                        <p className="text-muted small mb-2">{service.description}</p>
                    )}

                    <div className="mb-3">
                        <span className="text-primary fw-bold fs-5">
                            {service.price.toLocaleString()}đ
                        </span>
                        <span className="text-muted small">/{service.unit}</span>
                    </div>

                    {service.stock > 0 && service.isAvailable ? (
                        <Form.Group>
                            <Form.Label className="small">Số lượng</Form.Label>
                            <div className="d-flex gap-2">
                                <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    onClick={() => {
                                        const current = getSelectedQuantity(service._id);
                                        if (current > 0) {
                                            handleQuantityChange(service._id, current - 1);
                                        }
                                    }}
                                    disabled={getSelectedQuantity(service._id) === 0}
                                >
                                    -
                                </Button>
                                <Form.Control
                                    type="number"
                                    size="sm"
                                    min="0"
                                    max={service.stock}
                                    value={getSelectedQuantity(service._id)}
                                    onChange={(e) => handleQuantityChange(service._id, e.target.value)}
                                    style={{ maxWidth: '80px', textAlign: 'center' }}
                                />
                                <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    onClick={() => {
                                        const current = getSelectedQuantity(service._id);
                                        if (current < service.stock) {
                                            handleQuantityChange(service._id, current + 1);
                                        }
                                    }}
                                    disabled={getSelectedQuantity(service._id) >= service.stock}
                                >
                                    +
                                </Button>
                            </div>
                        </Form.Group>
                    ) : (
                        <Alert variant="secondary" className="mb-0 py-2 small">
                            Tạm thời không có sẵn
                        </Alert>
                    )}
                </Card.Body>
            </Card>
        </Col>
    );

    return (
        <Container fluid className="py-4"style={{maxWidth: 1200}} >
            <Row className="mb-4">
                <Col>
                    <h3>🛍️ Dịch Vụ Bổ Sung</h3>
                    <p className="text-muted">Chọn thêm các dịch vụ để trải nghiệm tốt hơn</p>
                </Col>
            </Row>

            {/* Category Tabs */}
            <Tabs
                activeKey={activeCategory}
                onSelect={(k) => setActiveCategory(k)}
                className="mb-4"
            >
                <Tab eventKey="all" title="Tất cả" />
                <Tab eventKey="equipment" title="🏐 Thiết bị" />
                <Tab eventKey="beverage" title="☕ Đồ uống" />
                <Tab eventKey="referee" title="👨‍⚖️ Trọng tài" />
                <Tab eventKey="other" title="➕ Khác" />
            </Tabs>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary"></div>
                    <p className="mt-2">Đang tải dịch vụ...</p>
                </div>
            ) : services.length === 0 ? (
                <Alert variant="info">
                    Hiện chưa có dịch vụ nào trong danh mục này
                </Alert>
            ) : (
                <Row>
                    {services.map(renderServiceCard)}
                </Row>
            )}

            {/* Selected Services Summary */}
            {selectedServices.length > 0 && (
                <Card className="mt-4 sticky-bottom shadow">
                    <Card.Body>
                        <h5 className="mb-3">📋 Dịch vụ đã chọn</h5>
                        {selectedServices.map((s, idx) => (
                            <div key={idx} className="d-flex justify-content-between align-items-center mb-2">
                                <div>
                                    <strong>{s.name}</strong> x {s.quantity}
                                </div>
                                <div className="text-primary fw-bold">
                                    {(s.price * s.quantity).toLocaleString()}đ
                                </div>
                            </div>
                        ))}
                        <hr />
                        <div className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Tổng cộng:</h5>
                            <h4 className="text-primary mb-0">
                                {getTotalPrice().toLocaleString()}đ
                            </h4>
                        </div>
                        <Button
                            variant="primary"
                            className="w-100 mt-3"
                            onClick={handleAddToBooking}
                        >
                            {bookingDraft ? '✅ Quay lại đặt sân' : '✅ Lưu & Đi đặt sân'}
                        </Button>
                        {bookingDraft && (
                            <Button
                                variant="outline-secondary"
                                className="w-100 mt-2"
                                onClick={() => {
                                    sessionStorage.removeItem('selectedServices');
                                    setSelectedServices([]);
                                }}
                            >
                                🗑️ Xóa tất cả
                            </Button>
                        )}
                    </Card.Body>
                </Card>
            )}

            {selectedServices.length === 0 && bookingDraft && (
                <Alert variant="info" className="mt-4">
                    <strong>💡 Mẹo:</strong> Chọn các dịch vụ bạn cần, sau đó nhấn nút để quay lại trang đặt sân
                </Alert>
            )}
        </Container>
    );
};

export default DichVu;
