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

// Helper function để format loại sân
const formatFieldType = (fieldType) => {
    const typeMap = {
        '5vs5': 'Sân 5',
        '7vs7': 'Sân 7',
        '11vs11': 'Sân 11'
    };
    return typeMap[fieldType] || fieldType;
};

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
            
            // Check for success flag in response
            if (response.data && response.data.success !== false) {
                // Handle both paginated and non-paginated response formats
                const responseData = response.data.data;
                const fieldsData = responseData?.fields || responseData || [];
                
                // Validate that fieldsData is an array
                if (Array.isArray(fieldsData)) {
                    setFields(fieldsData);
                } else {
                    console.error('Response data is not an array:', fieldsData);
                    setFields([]);
                }
                
                // Set pagination info
                setPagination(responseData?.pagination || {
                    total: Array.isArray(fieldsData) ? fieldsData.length : 0,
                    page: page,
                    limit: itemsPerPage,
                    totalPages: Array.isArray(fieldsData) ? Math.ceil(fieldsData.length / itemsPerPage) : 0
                });
            } else {
                console.error('Lỗi khi tải danh sách sân:', response.data?.message);
                setFields([]);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Không thể tải danh sách sân';
            console.error('Lỗi khi tải danh sách sân:', errorMessage);
            setFields([]);
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
                        <Col lg={6} className="text-center text-lg-start">
                            <div className="hero-badge mb-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '8px' }}>
                                    <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
                                </svg>
                                Nền tảng đặt sân #1 Việt Nam
                            </div>
                            <h1 className="hero-title">Đặt Sân Bóng Đá Dễ Dàng</h1>
                            <p className="hero-subtitle">Nhanh chóng - Tiện lợi - Uy tín</p>
                            <p className="hero-description">
                                Hệ thống đặt sân bóng đá trực tuyến hàng đầu với <strong>hơn 500+ sân</strong> trên toàn quốc.<br/>
                                <strong>Đặt sân 24/7, thanh toán an toàn, trải nghiệm hoàn hảo!</strong>
                            </p>
                            <div className="hero-cta mt-4">
                                <Button 
                                    variant="success" 
                                    size="lg" 
                                    className="me-3 cta-primary"
                                    onClick={() => navigate('/danh-sach-san')}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '8px' }}>
                                        <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                                    </svg>
                                    Tìm Sân Ngay
                                </Button>
                                <Button 
                                    variant="outline-light" 
                                    size="lg"
                                    className="cta-secondary"
                                    onClick={() => navigate('/gioi-thieu')}
                                >
                                    Tìm Hiểu Thêm
                                </Button>
                            </div>
                        </Col>
                        <Col lg={6} className="text-center mt-5 mt-lg-0">
                            <div className="hero-gallery">
                                <div className="hero-images-grid">
                                    <div className="hero-img img-1">
                                        <img src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=600" alt="Sân bóng đá" />
                                        <div className="img-overlay">
                                            <span className="badge-label">Sân cỏ tự nhiên</span>
                                        </div>
                                    </div>
                                    <div className="hero-img img-2">
                                        <img src="https://images.unsplash.com/photo-1459865264687-595d652de67e?q=80&w=600" alt="Sân 5 người" />
                                        <div className="img-overlay">
                                            <span className="badge-label">Sân 5 người</span>
                                        </div>
                                    </div>
                                    <div className="hero-img img-3">
                                        <img src="https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?q=80&w=600" alt="Sân 7 người" />
                                        <div className="img-overlay">
                                            <span className="badge-label">Sân 7 người</span>
                                        </div>
                                    </div>
                                    <div className="hero-img img-4">
                                        <img src="https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?q=80&w=600" alt="Đèn chiếu sáng" />
                                        <div className="img-overlay">
                                            <span className="badge-label">Ánh sáng chuyên nghiệp</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="floating-card card-check">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#10b981" viewBox="0 0 16 16">
                                        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                                    </svg>
                                    <div>
                                        <div className="card-title">Xác nhận tức thì</div>
                                        <div className="card-desc">Đặt sân trong 1 phút</div>
                                    </div>
                                </div>
                                <div className="floating-card card-star">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#f59e0b" viewBox="0 0 16 16">
                                        <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
                                    </svg>
                                    <div>
                                        <div className="card-title">Đánh giá 4.8/5</div>
                                        <div className="card-desc">Từ 500+ người dùng</div>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* Features Highlights */}
            <Container className="features-highlight-section">
                <Row className="g-4">
                    <Col md={3} sm={6}>
                        <div className="feature-highlight">
                            <div className="feature-icon-wrapper">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
                                    <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"/>
                                </svg>
                            </div>
                            <h4>Đăng ký nhanh</h4>
                            <p>Tạo tài khoản chỉ trong 30 giây</p>
                        </div>
                    </Col>
                    <Col md={3} sm={6}>
                        <div className="feature-highlight">
                            <div className="feature-icon-wrapper">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
                                </svg>
                            </div>
                            <h4>Chọn sân gần bạn</h4>
                            <p>500+ sân khắp Việt Nam</p>
                        </div>
                    </Col>
                    <Col md={3} sm={6}>
                        <div className="feature-highlight">
                            <div className="feature-icon-wrapper">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2.5 1a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-2zm0 3a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zm0 2a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1h-1zm3 0a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1h-1zm3 0a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1h-1zm3 0a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1h-1z"/>
                                </svg>
                            </div>
                            <h4>Thanh toán dễ</h4>
                            <p>Nhiều hình thức thanh toán</p>
                        </div>
                    </Col>
                    <Col md={3} sm={6}>
                        <div className="feature-highlight">
                            <div className="feature-icon-wrapper">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                                </svg>
                            </div>
                            <h4>Hoàn thành</h4>
                            <p>Nhận xác nhận tức thì</p>
                        </div>
                    </Col>
                </Row>
            </Container>

            {/* Filter Section */}
            <Container className="filter-section">
                <Card className="shadow-sm">
                    <Card.Header className="bg-white border-0 pt-4 pb-3">
                        <div className="d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#0f2e71" viewBox="0 0 16 16" style={{ marginRight: '12px' }}>
                                    <path d="M6 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"/>
                                </svg>
                                <h5 className="mb-0" style={{ color: '#0f2e71', fontWeight: '700' }}>Tìm Kiếm Sân</h5>
                            </div>
                            <Badge bg="primary" className="px-3 py-2">{pagination.total} sân</Badge>
                        </div>
                    </Card.Header>
                    <Card.Body className="pb-4">
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
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '6px' }}>
                                            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                                        </svg>
                                        Tìm
                                    </Button>
                                    <Button variant="outline-secondary" onClick={handleReset}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '6px' }}>
                                            <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
                                            <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
                                        </svg>
                                        Đặt lại
                                    </Button>
                                </div>
                            </Col>
                        </Row>
                        
                        <Row className="mt-3">
                            <Col>
                                <InputGroup>
                                    <InputGroup.Text>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                                        </svg>
                                    </InputGroup.Text>
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
                                            {formatFieldType(field.fieldType)}
                                        </Badge>
                                    </div>
                                    <Card.Body>
                                        <Card.Title className="field-name">{field.name}</Card.Title>
                                        <div className="field-info">
                                            <p className="mb-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#0f2e71" viewBox="0 0 16 16" style={{ marginRight: '6px', verticalAlign: 'text-bottom' }}>
                                                    <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
                                                </svg>
                                                <strong>{field.location}</strong>
                                            </p>
                                            <p className="mb-2 text-muted small">
                                                {field.address}
                                            </p>
                                            <p className="mb-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#ffc107" viewBox="0 0 16 16" style={{ marginRight: '6px', verticalAlign: 'text-bottom' }}>
                                                    <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
                                                </svg>
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
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '6px', verticalAlign: 'text-bottom' }}>
                                                    <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                                                    <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                                                </svg>
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
                <div className="section-header-center mb-5">
                    <h2>Quy Trình Đặt Sân Đơn Giản</h2>
                    <p>Chỉ với 4 bước dễ dàng, bạn đã có sân để chơi</p>
                </div>
                <Row className="g-4">
                    <Col md={3} sm={6}>
                        <div className="process-box">
                            <div className="process-number">1</div>
                            <div className="process-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                                </svg>
                            </div>
                            <h4>Tìm Sân</h4>
                            <p>Tìm kiếm sân gần bạn theo loại sân, giá, vị trí</p>
                        </div>
                    </Col>
                    <Col md={3} sm={6}>
                        <div className="process-box">
                            <div className="process-number">2</div>
                            <div className="process-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M11 6.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1z"/>
                                    <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                                </svg>
                            </div>
                            <h4>Chọn Giờ</h4>
                            <p>Xem lịch trống và chọn khung giờ phù hợp</p>
                        </div>
                    </Col>
                    <Col md={3} sm={6}>
                        <div className="process-box">
                            <div className="process-number">3</div>
                            <div className="process-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2.5 1a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-2zm0 3a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zm0 2a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1h-1zm3 0a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1h-1zm3 0a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1h-1zm3 0a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1h-1z"/>
                                </svg>
                            </div>
                            <h4>Thanh Toán</h4>
                            <p>Đặt cọc hoặc thanh toán toàn bộ an toàn</p>
                        </div>
                    </Col>
                    <Col md={3} sm={6}>
                        <div className="process-box">
                            <div className="process-number">4</div>
                            <div className="process-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
                                </svg>
                            </div>
                            <h4>Hoàn Tất</h4>
                            <p>Nhận xác nhận qua email và SMS ngay lập tức</p>
                        </div>
                    </Col>
                </Row>
            </Container>

            {/* Why Choose Us */}
            <div className="why-choose-section">
                <Container>
                    <Row className="align-items-center">
                        <Col lg={6}>
                            <div className="why-choose-image">
                                <img 
                                    src="https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?q=80&w=600" 
                                    alt="Sân bóng chất lượng"
                                    className="rounded-4 shadow-lg"
                                />
                            </div>
                        </Col>
                        <Col lg={6}>
                            <div className="why-choose-content">
                                <h2 className="mb-4">Tại Sao Chọn DatSan24H?</h2>
                                <div className="benefit-item">
                                    <div className="benefit-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                                        </svg>
                                    </div>
                                    <div>
                                        <h5>Hệ Thống Sân Rộng Khắp</h5>
                                        <p>500+ sân bóng chất lượng tại 63 tỉnh thành</p>
                                    </div>
                                </div>
                                <div className="benefit-item">
                                    <div className="benefit-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                                        </svg>
                                    </div>
                                    <div>
                                        <h5>Giá Cả Minh Bạch</h5>
                                        <p>So sánh giá từ nhiều sân, không phí ẩn</p>
                                    </div>
                                </div>
                                <div className="benefit-item">
                                    <div className="benefit-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                                        </svg>
                                    </div>
                                    <div>
                                        <h5>Thanh Toán An Toàn</h5>
                                        <p>Bảo mật SSL, hỗ trợ nhiều hình thức</p>
                                    </div>
                                </div>
                                <div className="benefit-item">
                                    <div className="benefit-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                                        </svg>
                                    </div>
                                    <div>
                                        <h5>Hỗ Trợ 24/7</h5>
                                        <p>Đội ngũ tư vấn sẵn sàng hỗ trợ mọi lúc</p>
                                    </div>
                                </div>
                                <Button 
                                    variant="primary" 
                                    size="lg"
                                    className="mt-4"
                                    onClick={() => navigate('/gioi-thieu')}
                                >
                                    Tìm Hiểu Thêm
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ marginLeft: '8px' }}>
                                        <path fillRule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/>
                                    </svg>
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* Testimonials */}
            <Container className="testimonials-section">
                <div className="section-header-center mb-5">
                    <h2>Khách Hàng Nói Gì Về Chúng Tôi</h2>
                    <p>Hơn 10,000 khách hàng tin tưởng sử dụng dịch vụ</p>
                </div>
                <Row className="g-4">
                    <Col md={4}>
                        <div className="testimonial-card">
                            <div className="testimonial-rating">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#ffc107" viewBox="0 0 16 16">
                                        <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
                                    </svg>
                                ))}
                            </div>
                            <p className="testimonial-text">
                                "Đặt sân rất nhanh và tiện lợi. Giao diện dễ sử dụng, thanh toán an toàn. 
                                Tôi đã đặt được sân cho team trong vài phút!"
                            </p>
                            <div className="testimonial-author">
                                <div className="author-avatar">NV</div>
                                <div>
                                    <div className="author-name">Nguyễn Văn A</div>
                                    <div className="author-role">Đội trưởng FC Blue</div>
                                </div>
                            </div>
                        </div>
                    </Col>
                    <Col md={4}>
                        <div className="testimonial-card">
                            <div className="testimonial-rating">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#ffc107" viewBox="0 0 16 16">
                                        <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
                                    </svg>
                                ))}
                            </div>
                            <p className="testimonial-text">
                                "Giá cả rất hợp lý và minh bạch. Sân đẹp, chất lượng tốt. 
                                Dịch vụ khách hàng nhiệt tình, phản hồi nhanh!"
                            </p>
                            <div className="testimonial-author">
                                <div className="author-avatar">PT</div>
                                <div>
                                    <div className="author-name">Phạm Thị B</div>
                                    <div className="author-role">Giám đốc Startup XYZ</div>
                                </div>
                            </div>
                        </div>
                    </Col>
                    <Col md={4}>
                        <div className="testimonial-card">
                            <div className="testimonial-rating">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#ffc107" viewBox="0 0 16 16">
                                        <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
                                    </svg>
                                ))}
                            </div>
                            <p className="testimonial-text">
                                "Ứng dụng số 1! Tìm sân dễ, đặt nhanh, xác nhận tức thì. 
                                Cảm ơn DatSan24H đã giúp chúng tôi tổ chức giải đấu!"
                            </p>
                            <div className="testimonial-author">
                                <div className="author-avatar">LH</div>
                                <div>
                                    <div className="author-name">Lê Hoàng C</div>
                                    <div className="author-role">Trưởng CLB Sao Mai</div>
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Home;
