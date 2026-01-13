import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Container, 
    Row, 
    Col, 
    Card, 
    Button, 
    Form,
    InputGroup,
    Badge,
    Spinner
} from 'react-bootstrap';
import { fieldService } from '../services/api';
import './Home.css';

const Home = () => {
    const navigate = useNavigate();
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        fieldType: '',
        location: '',
        minPrice: '',
        maxPrice: ''
    });
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(6);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 6,
        totalPages: 0
    });

    useEffect(() => {
        fetchFields(1);
    }, []);

    const fetchFields = async (page = currentPage) => {
        setLoading(true);
        try {
            const params = { 
                status: 'active',
                page: page,
                limit: itemsPerPage
            };
            if (filters.fieldType) params.fieldType = filters.fieldType;
            if (filters.location) params.location = filters.location;
            if (filters.minPrice) params.minPrice = filters.minPrice;
            if (filters.maxPrice) params.maxPrice = filters.maxPrice;
            if (searchTerm) params.search = searchTerm;

            const response = await fieldService.getAllFields(params);
            setFields(response.data.data || []);
            setPagination(response.data.pagination || {
                total: 0,
                page: page,
                limit: itemsPerPage,
                totalPages: 0
            });
        } catch (error) {
            console.error('Lỗi khi tải danh sách sân:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters({
            ...filters,
            [name]: value
        });
    };

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        setCurrentPage(1);
        fetchFields(1);
    };

    const handleReset = () => {
        setFilters({
            fieldType: '',
            location: '',
            minPrice: '',
            maxPrice: ''
        });
        setSearchTerm('');
        setCurrentPage(1);
        setTimeout(() => fetchFields(1), 100);
    };

    const handleViewDetail = (fieldId) => {
        navigate(`/field/${fieldId}`);
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        fetchFields(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const renderPagination = () => {
        const totalPages = pagination.totalPages;
        if (totalPages <= 1) return null;

        const pages = [];
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
                            onClick={() => handlePageChange(totalPages)}
                            className="mx-1"
                        >
                            {totalPages}
                        </Button>
                    </>
                )}

                <Button
                    variant="outline-primary"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="mx-1"
                >
                    Sau ›
                </Button>
            </div>
        );
    };

    return (
        <div className="home-page">
            {/* Hero Section */}
            <div className="hero-section">
                <Container>
                    <Row className="align-items-center">
                        <Col lg={6}>
                            <h1 className="hero-title">Đặt Sân Bóng Đá</h1>
                            <p className="hero-subtitle">Nhanh chóng - Tiện lợi - Uy tín</p>
                            <p className="hero-description">
                                Hệ thống đặt sân bóng đá trực tuyến hàng đầu. 
                                Tìm và đặt sân yêu thích của bạn chỉ với vài thao tác đơn giản.
                            </p>
                        </Col>
                        <Col lg={6} className="text-center">
                            <div className="hero-stats">
                                <div className="stat-item">
                                    <h3>{fields.length}+</h3>
                                    <p>Sân Bóng</p>
                                </div>
                                <div className="stat-item">
                                    <h3>1000+</h3>
                                    <p>Khách Hàng</p>
                                </div>
                                <div className="stat-item">
                                    <h3>5000+</h3>
                                    <p>Đặt Sân</p>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* Filter Section */}
            <Container className="filter-section">
                <Card className="shadow-sm">
                    <Card.Body>
                        <Row className="g-3">
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>Loại Sân</Form.Label>
                                    <Form.Select 
                                        name="fieldType"
                                        value={filters.fieldType}
                                        onChange={handleFilterChange}
                                    >
                                        <option value="">Tất cả</option>
                                        <option value="5vs5">Sân 5 người</option>
                                        <option value="7vs7">Sân 7 người</option>
                                        <option value="11vs11">Sân 11 người</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>Khu Vực</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="location"
                                        placeholder="VD: Hà Nội"
                                        value={filters.location}
                                        onChange={handleFilterChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={2}>
                                <Form.Group>
                                    <Form.Label>Giá Từ (VNĐ)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="minPrice"
                                        placeholder="0"
                                        value={filters.minPrice}
                                        onChange={handleFilterChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={2}>
                                <Form.Group>
                                    <Form.Label>Giá Đến (VNĐ)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="maxPrice"
                                        placeholder="1000000"
                                        value={filters.maxPrice}
                                        onChange={handleFilterChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={2} className="d-flex align-items-end">
                                <div className="d-grid gap-2 w-100">
                                    <Button variant="primary" onClick={handleSearch}>
                                        🔍 Tìm
                                    </Button>
                                    <Button variant="outline-secondary" onClick={handleReset}>
                                        ↺ Reset
                                    </Button>
                                </div>
                            </Col>
                        </Row>
                        
                        <Row className="mt-3">
                            <Col>
                                <InputGroup>
                                    <InputGroup.Text>🔍</InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        placeholder="Tìm kiếm theo tên sân, khu vực, địa chỉ..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                handleSearch();
                                            }
                                        }}
                                    />
                                </InputGroup>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            </Container>

            {/* Fields List */}
            <Container className="fields-section">
                <div className="section-header">
                    <h2>Danh Sách Sân Bóng</h2>
                    <p className="text-muted">
                        Tìm thấy <strong>{pagination.total}</strong> sân bóng
                        {pagination.totalPages > 1 && (
                            <span> - Trang <strong>{currentPage}</strong> / <strong>{pagination.totalPages}</strong></span>
                        )}
                    </p>
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-2">Đang tải...</p>
                    </div>
                ) : fields.length === 0 ? (
                    <div className="text-center py-5">
                        <h4>Không tìm thấy sân bóng nào</h4>
                        <p className="text-muted">Vui lòng thử lại với bộ lọc khác</p>
                    </div>
                ) : (
                    <>
                        <Row className="g-4">
                            {fields.map((field) => (
                            <Col key={field._id} md={6} lg={4}>
                                <Card className="field-card h-100 shadow-sm">
                                    <div className="field-image">
                                        {field.images && field.images.length > 0 ? (
                                            <Card.Img 
                                                variant="top" 
                                                src={field.images[0]} 
                                                alt={field.name}
                                                onError={(e) => { 
                                                    e.target.src = 'https://via.placeholder.com/400x250?text=Sân+Bóng+Đá' 
                                                }}
                                            />
                                        ) : (
                                            <Card.Img 
                                                variant="top" 
                                                src="https://via.placeholder.com/400x250?text=Sân+Bóng+Đá" 
                                                alt={field.name}
                                            />
                                        )}
                                        <Badge bg="primary" className="field-type-badge">
                                            {field.fieldType}
                                        </Badge>
                                    </div>
                                    <Card.Body>
                                        <Card.Title className="field-name">{field.name}</Card.Title>
                                        <div className="field-info">
                                            <p className="mb-2">
                                                <span className="info-icon">📍</span>
                                                <strong>{field.location}</strong>
                                            </p>
                                            <p className="mb-2 text-muted small">
                                                {field.address}
                                            </p>
                                            <p className="mb-2">
                                                <span className="info-icon">⭐</span>
                                                <strong>{(field.rating || 0).toFixed(1)}</strong> 
                                                <span className="text-muted"> ({field.totalReviews || 0} đánh giá)</span>
                                            </p>
                                            <p className="field-price mb-3">
                                                <strong>{(field.pricePerHour || 0).toLocaleString()}đ</strong>
                                                <span className="text-muted">/giờ</span>
                                            </p>
                                            
                                            {field.facilities && field.facilities.length > 0 && (
                                                <div className="facilities mb-3">
                                                    {field.facilities.slice(0, 3).map((facility, idx) => (
                                                        <Badge key={idx} bg="light" text="dark" className="me-1 mb-1">
                                                            {facility}
                                                        </Badge>
                                                    ))}
                                                    {field.facilities.length > 3 && (
                                                        <Badge bg="light" text="dark">
                                                            +{field.facilities.length - 3}
                                                        </Badge>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </Card.Body>
                                    <Card.Footer className="bg-white border-0 pb-3">
                                        <div className="d-grid">
                                            <Button 
                                                variant="primary" 
                                                onClick={() => handleViewDetail(field._id)}
                                            >
                                                Xem Chi Tiết & Đặt Sân
                                            </Button>
                                        </div>
                                    </Card.Footer>
                                </Card>
                            </Col>
                        ))}
                        </Row>
                        {renderPagination()}
                    </>
                )}
            </Container>

            {/* Features Section */}
            <Container className="features-section">
                <h2 className="text-center mb-5">Tại Sao Chọn Chúng Tôi?</h2>
                <Row className="g-4">
                    <Col md={4}>
                        <div className="feature-box text-center">
                            <div className="feature-icon">⚡</div>
                            <h4>Đặt Sân Nhanh Chóng</h4>
                            <p>Chỉ với vài thao tác đơn giản, bạn có thể đặt sân trong vài phút</p>
                        </div>
                    </Col>
                    <Col md={4}>
                        <div className="feature-box text-center">
                            <div className="feature-icon">💰</div>
                            <h4>Giá Cả Hợp Lý</h4>
                            <p>So sánh giá từ nhiều sân để tìm lựa chọn phù hợp với ngân sách</p>
                        </div>
                    </Col>
                    <Col md={4}>
                        <div className="feature-box text-center">
                            <div className="feature-icon">🔒</div>
                            <h4>Thanh Toán An Toàn</h4>
                            <p>Hệ thống thanh toán được bảo mật và đảm bảo an toàn tuyệt đối</p>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Home;
