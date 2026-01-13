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

const Danhsachsan = () => {
    const navigate = useNavigate();
    const [fields, setFields] = useState([]);
    const [filteredFields, setFilteredFields] = useState([]);
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

    // Auto-fetch chỉ khi thay đổi sortBy (sắp xếp)
    useEffect(() => {
        if (fields.length > 0) {
            applySorting();
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

            const response = await fieldService.getAllFields(params);
            const fieldsData = response.data.data || [];
            setFields(fieldsData);

            // Apply client-side sorting
            applySorting(fieldsData);

            setPagination(response.data.pagination || {
                total: 0,
                page: page,
                limit: itemsPerPage,
                totalPages: 0
            });
        } catch (err) {
            setError('Không thể tải danh sách sân');
        } finally {
            setLoading(false);
        }
    };



    const applySorting = (data = fields) => {
        let sortedFields = [...data];
        switch (sortBy) {
            case 'price-asc':
                sortedFields.sort((a, b) => a.pricePerHour - b.pricePerHour);
                break;
            case 'price-desc':
                sortedFields.sort((a, b) => b.pricePerHour - a.pricePerHour);
                break;
            case 'rating':
                sortedFields.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            case 'name':
            default:
                sortedFields.sort((a, b) => a.name.localeCompare(b.name));
                break;
        }
        setFilteredFields(sortedFields);
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
            <Container className="py-4">
                <div className="page-header mb-4">
                    <h2>🏟️ Danh Sách Sân Bóng</h2>
                    <p className="text-muted">Tìm và đặt sân phù hợp với bạn</p>
                </div>

                {error && <Alert variant="danger">{error}</Alert>}

                <Row>
                    {/* Sidebar Filter */}
                    <Col lg={3} className="mb-4">
                        <Card className="filter-card">
                            <Card.Header className="bg-primary text-white">
                                <h5 className="mb-0">🔍 Bộ Lọc</h5>
                            </Card.Header>
                            <Card.Body>
                                {/* Tìm kiếm */}
                                <Form.Group className="mb-3">
                                    <Form.Label>Tìm kiếm</Form.Label>
                                    <InputGroup>
                                        <Form.Control
                                            type="text"
                                            placeholder="Tên sân, địa điểm..."
                                            value={searchText}
                                            onChange={(e) => setSearchText(e.target.value)}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleApplyFilters();
                                                }
                                            }}
                                        />
                                        {searchText && (
                                            <Button
                                                variant="outline-secondary"
                                                onClick={() => setSearchText('')}
                                            >
                                                ✕
                                            </Button>
                                        )}
                                    </InputGroup>
                                </Form.Group>

                                {/* Loại sân */}
                                <Form.Group className="mb-3">
                                    <Form.Label>Loại sân</Form.Label>
                                    <Form.Select
                                        value={selectedType}
                                        onChange={(e) => setSelectedType(e.target.value)}
                                    >
                                        <option value="">Tất cả</option>
                                        <option value="5vs5">Sân 5 người</option>
                                        <option value="7vs7">Sân 7 người</option>
                                        <option value="11vs11">Sân 11 người</option>
                                    </Form.Select>
                                </Form.Group>

                                {/* Địa điểm */}
                                <Form.Group className="mb-3">
                                    <Form.Label>Địa điểm</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Nhập quận, khu vực..."
                                        value={selectedLocation}
                                        onChange={(e) => setSelectedLocation(e.target.value)}
                                    />
                                </Form.Group>

                                {/* Giá */}
                                <Form.Group className="mb-3">
                                    <Form.Label>Khoảng giá (đ/giờ)</Form.Label>
                                    <Row>
                                        <Col>
                                            <Form.Control
                                                type="number"
                                                placeholder="Từ"
                                                value={minPrice}
                                                onChange={(e) => setMinPrice(e.target.value)}
                                            />
                                        </Col>
                                        <Col xs="auto" className="px-0 text-center">-</Col>
                                        <Col>
                                            <Form.Control
                                                type="number"
                                                placeholder="Đến"
                                                value={maxPrice}
                                                onChange={(e) => setMaxPrice(e.target.value)}
                                            />
                                        </Col>
                                    </Row>
                                </Form.Group>

                                {/* Action buttons */}
                                <div className="d-grid gap-2">
                                    <Button
                                        variant="primary"
                                        onClick={handleApplyFilters}
                                    >
                                        🔍 Tìm kiếm
                                    </Button>
                                    <Button
                                        variant="outline-secondary"
                                        onClick={resetFilters}
                                    >
                                        🔄 Đặt lại bộ lọc
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
                        {filteredFields.length === 0 ? (
                            <Alert variant="info" className="text-center">
                                <h5>Không tìm thấy sân phù hợp</h5>
                                <p className="mb-0">Thử thay đổi bộ lọc để xem nhiều kết quả hơn</p>
                            </Alert>
                        ) : (
                            <>
                                <Row>
                                    {filteredFields.map((field) => (
                                        <Col md={6} lg={4} key={field._id} className="mb-4">
                                            <Card className="field-card h-100 shadow-sm">
                                                <div className="field-image-container">
                                                    <Card.Img
                                                        variant="top"
                                                        src={
                                                            field.images && field.images.length > 0
                                                                ? field.images[0]
                                                                : 'https://via.placeholder.com/300x200?text=Sân+Bóng'
                                                        }
                                                        alt={field.name}
                                                        style={{ height: '180px', objectFit: 'cover' }}
                                                        onError={(e) => {
                                                            e.target.src = 'https://via.placeholder.com/300x200?text=Sân+Bóng';
                                                        }}
                                                    />
                                                    <Badge
                                                        bg="primary"
                                                        className="position-absolute top-0 end-0 m-2"
                                                    >
                                                        {field.fieldType}
                                                    </Badge>
                                                </div>
                                                <Card.Body>
                                                    <Card.Title className="field-name">
                                                        {field.name}
                                                    </Card.Title>
                                                    <div className="field-info mb-2">
                                                        <div className="mb-1">
                                                            <span className="text-warning">⭐</span>
                                                            <strong> {(field.rating || 0).toFixed(1)}</strong>
                                                            <small className="text-muted">
                                                                {' '}({field.totalReviews || 0} đánh giá)
                                                            </small>
                                                        </div>
                                                        <div className="text-muted small mb-1">
                                                            📍 {field.location}
                                                        </div>
                                                        <div className="text-primary fw-bold fs-5">
                                                            {field.pricePerHour.toLocaleString()}đ
                                                            <small className="text-muted fw-normal">/giờ</small>
                                                        </div>
                                                    </div>
                                                    {field.facilities && field.facilities.length > 0 && (
                                                        <div className="facilities mb-2">
                                                            {field.facilities.slice(0, 2).map((facility, idx) => (
                                                                <Badge
                                                                    key={idx}
                                                                    bg="light"
                                                                    text="dark"
                                                                    className="me-1 mb-1"
                                                                >
                                                                    ✓ {facility}
                                                                </Badge>
                                                            ))}
                                                            {field.facilities.length > 2 && (
                                                                <Badge bg="light" text="dark">
                                                                    +{field.facilities.length - 2}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    )}
                                                </Card.Body>
                                                <Card.Footer className="bg-white border-0">
                                                    <div className="d-grid">
                                                        <Button
                                                            variant="primary"
                                                            onClick={() => handleViewDetail(field._id)}
                                                        >
                                                            👁️ Xem Chi Tiết & Đặt Sân
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
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Danhsachsan;
