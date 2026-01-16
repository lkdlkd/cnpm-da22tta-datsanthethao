import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Row,
    Col,
    Card,
    Form,
    Button,
    Badge,
    Spinner,
    Alert,
    InputGroup
} from 'react-bootstrap';
import { fieldService } from '../../services/api';
import './Danhsachsan.css';

// Helper function để format loại sân
const formatFieldType = (fieldType) => {
    const typeMap = {
        '5vs5': 'Sân 5',
        '7vs7': 'Sân 7',
        '11vs11': 'Sân 11'
    };
    return typeMap[fieldType] || fieldType;
};

const Danhsachsan = () => {
    const navigate = useNavigate();
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Filter states
    const [searchText, setSearchText] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [sortBy, setSortBy] = useState('name'); // name, price-asc, price-desc, rating

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(6);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 12,
        totalPages: 0
    });

    useEffect(() => {
        fetchFields(1);
    }, []);

    // Auto-fetch when filters or sortBy change
    useEffect(() => {
        if (fields.length > 0) {
            setCurrentPage(1);
            fetchFields(1);
        }
    }, [sortBy]);

    const fetchFields = async (page = currentPage) => {
        setLoading(true);
        try {
            const params = {
                page: page,
                limit: itemsPerPage,
                status: 'active'
            };
            if (selectedType) params.fieldType = selectedType;
            if (selectedLocation) params.location = selectedLocation;
            if (minPrice) params.minPrice = minPrice;
            if (maxPrice) params.maxPrice = maxPrice;
            if (searchText) params.search = searchText;
            
            // Add sort parameter for backend sorting
            if (sortBy) params.sort = sortBy;

            const response = await fieldService.getAllFields(params);
            
            // Check for success flag in response
            if (response.data && response.data.success !== false) {
                const fieldsData = response.data.data.fields || [];
                setFields(fieldsData);

                setPagination(response.data.data.pagination || {
                    total: 0,
                    page: page,
                    limit: itemsPerPage,
                    totalPages: 0
                });
            } else {
                setError(response.data?.message || 'Không thể tải danh sách sân');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Không thể tải danh sách sân';
            setError(errorMessage);
            console.error('Lỗi khi tải danh sách sân:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleApplyFilters = () => {
        setCurrentPage(1);
        fetchFields(1);
    };

    const resetFilters = () => {
        setSearchText('');
        setSelectedType('');
        setSelectedLocation('');
        setMinPrice('');
        setMaxPrice('');
        setSortBy('name');
        setCurrentPage(1);
        setTimeout(() => fetchFields(1), 100);
    };

    const handleViewDetail = (fieldId) => {
        navigate(`/field/${fieldId}`);
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        fetchFields(pageNumber);
        window.scrollTo({ top: 400, behavior: 'smooth' });
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
            <div className="pagination-container d-flex justify-content-center align-items-center mt-4 mb-4">
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

    if (loading) {
        return (
            <Container className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">Đang tải danh sách sân...</p>
            </Container>
        );
    }

    return (
        <div className="danhsachsan-page">
            {/* Banner Section */}
            <div className="page-banner">
                <Container>
                    <div className="banner-content">
                        <div className="banner-badge">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
                            </svg>
                            Sân bóng chất lượng cao
                        </div>
                        <h1 className="banner-title">Danh Sách Sân Bóng</h1>
                        <p className="banner-subtitle">Tìm kiếm và đặt sân bóng phù hợp với bạn</p>
                    </div>
                </Container>
            </div>

            <Container className="py-4">
                {/* Breadcrumb */}
                <nav aria-label="breadcrumb" className="mb-3">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item">
                            <a href="/home" style={{ color: '#0f2e71', textDecoration: 'none' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '6px', verticalAlign: 'text-bottom' }}>
                                    <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.707 1.5ZM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5 5 5Z"/>
                                </svg>
                                Trang chủ
                            </a>
                        </li>
                        <li className="breadcrumb-item active" aria-current="page">Danh sách sân</li>
                    </ol>
                </nav>

                {error && <Alert variant="danger">{error}</Alert>}

                <Row>
                    {/* Sidebar Filter */}
                    <Col lg={3} className="mb-4">
                        <Card className="filter-card">
                            <Card.Header>
                                <div className="filter-header-content">
                                    <div className="filter-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5v-2z"/>
                                        </svg>
                                    </div>
                                    <div>
                                        <h5>Bộ Lọc Tìm Kiếm</h5>
                                        <p>Tùy chỉnh tìm kiếm của bạn</p>
                                    </div>
                                </div>
                            </Card.Header>
                            <Card.Body>
                                {/* Tìm kiếm */}
                                <Form.Group className="mb-4">
                                    <Form.Label>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '6px', verticalAlign: 'text-bottom' }}>
                                            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                                        </svg>
                                        Tìm kiếm
                                    </Form.Label>
                                    <div className="search-input-wrapper">
                                        <Form.Control
                                            type="text"
                                            placeholder="Nhập tên sân hoặc địa điểm..."
                                            value={searchText}
                                            onChange={(e) => setSearchText(e.target.value)}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleApplyFilters();
                                                }
                                            }}
                                            className="search-input"
                                        />
                                        {searchText && (
                                            <button
                                                className="clear-search-btn"
                                                onClick={() => setSearchText('')}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                    <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </Form.Group>

                                {/* Loại sân */}
                                <Form.Group className="mb-4">
                                    <Form.Label>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '6px', verticalAlign: 'text-bottom' }}>
                                            <path d="M6 1a.5.5 0 0 1 .5.5V3h3V1.5a.5.5 0 0 1 1 0V3h2a.5.5 0 0 1 .5.5v3A3.5 3.5 0 0 1 9.5 10c-.002.434-.01.845-.04 1.22-.041.514-.126 1.003-.317 1.424a2.083 2.083 0 0 1-.97 1.028C7.725 13.9 7.169 14 6.5 14c-.63 0-1.155-.09-1.606-.303a2.082 2.082 0 0 1-.977-1.028c-.181-.42-.266-.91-.308-1.424a12.36 12.36 0 0 1-.04-1.22A3.5 3.5 0 0 1 0 6.5v-3A.5.5 0 0 1 .5 3h2V1.5a.5.5 0 0 1 1 0V3h3V1.5A.5.5 0 0 1 6 1z"/>
                                        </svg>
                                        Loại sân
                                    </Form.Label>
                                    <Form.Select
                                        value={selectedType}
                                        onChange={(e) => setSelectedType(e.target.value)}
                                        className="filter-select"
                                    >
                                        <option value="">Tất cả loại sân</option>
                                        <option value="5vs5">⚽ Sân 5 người</option>
                                        <option value="7vs7">⚽ Sân 7 người</option>
                                        <option value="11vs11">⚽ Sân 11 người</option>
                                    </Form.Select>
                                </Form.Group>

                                {/* Địa điểm */}
                                <Form.Group className="mb-4">
                                    <Form.Label>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '6px', verticalAlign: 'text-bottom' }}>
                                            <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
                                        </svg>
                                        Địa điểm
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Nhập quận, khu vực..."
                                        value={selectedLocation}
                                        onChange={(e) => setSelectedLocation(e.target.value)}
                                        className="filter-input"
                                    />
                                </Form.Group>

                                {/* Giá */}
                                <Form.Group className="mb-4">
                                    <Form.Label>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '6px', verticalAlign: 'text-bottom' }}>
                                            <path d="M4 10.781c.148 1.667 1.513 2.85 3.591 3.003V15h1.043v-1.216c2.27-.179 3.678-1.438 3.678-3.3 0-1.59-.947-2.51-2.956-3.028l-.722-.187V3.467c1.122.11 1.879.714 2.07 1.616h1.47c-.166-1.6-1.54-2.748-3.54-2.875V1H7.591v1.233c-1.939.23-3.27 1.472-3.27 3.156 0 1.454.966 2.483 2.661 2.917l.61.162v4.031c-1.149-.17-1.94-.8-2.131-1.718H4zm3.391-3.836c-1.043-.263-1.6-.825-1.6-1.616 0-.944.704-1.641 1.8-1.828v3.495l-.2-.05zm1.591 1.872c1.287.323 1.852.859 1.852 1.769 0 1.097-.826 1.828-2.2 1.939V8.73l.348.086z"/>
                                        </svg>
                                        Khoảng giá (đ/giờ)
                                    </Form.Label>
                                    <div className="price-range-inputs">
                                        <Form.Control
                                            type="number"
                                            placeholder="Từ"
                                            value={minPrice}
                                            onChange={(e) => setMinPrice(e.target.value)}
                                            className="filter-input"
                                        />
                                        <span className="price-separator">—</span>
                                        <Form.Control
                                            type="number"
                                            placeholder="Đến"
                                            value={maxPrice}
                                            onChange={(e) => setMaxPrice(e.target.value)}
                                            className="filter-input"
                                        />
                                    </div>
                                </Form.Group>

                                {/* Action buttons */}
                                <div className="filter-actions">
                                    <Button
                                        className="filter-apply-btn"
                                        onClick={handleApplyFilters}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '8px' }}>
                                            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                                        </svg>
                                        Tìm Kiếm Ngay
                                    </Button>
                                    <Button
                                        className="filter-reset-btn"
                                        onClick={resetFilters}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '8px' }}>
                                            <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
                                            <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
                                        </svg>
                                        Đặt Lại
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Main Content */}
                    <Col lg={9}>
                        {/* Sort và Count */}
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div className="results-count">
                                <strong>{pagination.total}</strong> sân được tìm thấy
                                {pagination.totalPages > 1 && (
                                    <span className="text-muted ms-2">
                                        (Trang {currentPage}/{pagination.totalPages})
                                    </span>
                                )}
                            </div>
                            <Form.Group className="mb-0" style={{ width: '200px' }}>
                                <Form.Select
                                    size="sm"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                >
                                    <option value="name">Sắp xếp: Tên A-Z</option>
                                    <option value="price-asc">Giá: Thấp → Cao</option>
                                    <option value="price-desc">Giá: Cao → Thấp</option>
                                    <option value="rating">Đánh giá cao nhất</option>
                                </Form.Select>
                            </Form.Group>
                        </div>

                        {/* Fields Grid */}
                        {fields.length === 0 ? (
                            <Alert variant="info" className="text-center">
                                <h5>Không tìm thấy sân phù hợp</h5>
                                <p className="mb-0">Thử thay đổi bộ lọc để xem nhiều kết quả hơn</p>
                            </Alert>
                        ) : (
                            <>
                                <Row>
                                    {fields.map((field) => (
                                        <Col md={6} lg={4} key={field._id} className="mb-4">
                                            <Card className="field-card h-100">
                                                <div className="field-image-wrapper">
                                                    <Card.Img
                                                        variant="top"
                                                        src={
                                                            field.images && field.images.length > 0
                                                                ? field.images[0]
                                                                : 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&q=80'
                                                        }
                                                        alt={field.name}
                                                        onError={(e) => {
                                                            e.target.src = 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&q=80';
                                                        }}
                                                    />
                                                </div>
                                                <Card.Body>
                                                    <div className="field-meta-badges mb-3">
                                                        <span className="meta-badge type">
                                                            {formatFieldType(field.fieldType)}
                                                        </span>
                                                        {field.status === 'available' && (
                                                            <span className="meta-badge status">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '4px' }}>
                                                                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                                                                </svg>
                                                                Sẵn sàng
                                                            </span>
                                                        )}
                                                    </div>
                                                    <Card.Title className="field-name">{field.name}</Card.Title>
                                                    
                                                    <div className="field-location mb-3">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                            <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
                                                        </svg>
                                                        <span>{field.location}</span>
                                                    </div>

                                                    <div className="field-rating mb-3">
                                                        <div className="rating-stars">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#ffc107" viewBox="0 0 16 16">
                                                                <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
                                                            </svg>
                                                            <strong>{(field.rating || 0).toFixed(1)}</strong>
                                                        </div>
                                                        <span className="reviews-count">({field.totalReviews || 0} đánh giá)</span>
                                                    </div>

                                                    {field.facilities && field.facilities.length > 0 && (
                                                        <div className="facilities mb-3">
                                                            {field.facilities.slice(0, 3).map((facility, idx) => (
                                                                <span key={idx} className="facility-badge">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '4px' }}>
                                                                        <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
                                                                    </svg>
                                                                    {facility}
                                                                </span>
                                                            ))}
                                                            {field.facilities.length > 3 && (
                                                                <span className="facility-badge more">+{field.facilities.length - 3}</span>
                                                            )}
                                                        </div>
                                                    )}

                                                    <div className="field-price">
                                                        <div className="price-amount">
                                                            {field.pricePerHour.toLocaleString()}đ
                                                            <small>/giờ</small>
                                                        </div>
                                                        <Button
                                                            className="btn-view-detail"
                                                            onClick={() => handleViewDetail(field._id)}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                                <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                                                                <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                                                            </svg>
                                                            Xem chi tiết
                                                        </Button>
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    ))}                                </Row>
                                {renderPagination()}
                            </>
                        )}
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Danhsachsan;
