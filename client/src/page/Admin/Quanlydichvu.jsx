import React, { useState, useEffect } from 'react';
import {
    Container,
    Row,
    Col,
    Card,
    Button,
    Table,
    Modal,
    Form,
    Badge,
    InputGroup,
    Alert
} from 'react-bootstrap';
import { serviceService } from '../../services/api';
import './AdminCommon.css';
import './SelectArrow.css';
import './Quanlydichvu.css';

const Quanlydichvu = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Filter & Search
    const [searchText, setSearchText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
    });
    
    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
    const [currentService, setCurrentService] = useState({
        name: '',
        category: 'equipment',
        description: '',
        price: 0,
        unit: 'item',
        stock: 0,
        isAvailable: true
    });
    
    // Stock modal
    const [showStockModal, setShowStockModal] = useState(false);
    const [stockUpdate, setStockUpdate] = useState({
        serviceId: '',
        serviceName: '',
        currentStock: 0,
        quantity: 0,
        action: 'add'
    });

    // Stats
    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetchServices(1);
        fetchStats();
    }, [selectedCategory]);

    const fetchServices = async (page = currentPage) => {
        setLoading(true);
        try {
            const params = {
                page: page,
                limit: 10
            };
            if (selectedCategory) params.category = selectedCategory;
            if (searchText) params.search = searchText;

            const response = await serviceService.getAllServices(params);
            setServices(response.data.data || []);
            setPagination(response.data.pagination);
        } catch (err) {
            setError('Không thể tải danh sách dịch vụ');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await serviceService.getServicesStats();
            setStats(response.data);
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    };

    const handleSearch = () => {
        setCurrentPage(1);
        fetchServices(1);
    };

    const handleReset = () => {
        setSearchText('');
        setSelectedCategory('');
        setCurrentPage(1);
        setTimeout(() => fetchServices(1), 100);
    };

    const openCreateModal = () => {
        setModalMode('create');
        setCurrentService({
            name: '',
            category: 'equipment',
            description: '',
            price: 0,
            unit: 'item',
            stock: 0,
            isAvailable: true
        });
        setShowModal(true);
    };

    const openEditModal = (service) => {
        setModalMode('edit');
        setCurrentService(service);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (modalMode === 'create') {
                await serviceService.createService(currentService);
                alert('Tạo dịch vụ thành công!');
            } else {
                await serviceService.updateService(currentService._id, currentService);
                alert('Cập nhật dịch vụ thành công!');
            }
            setShowModal(false);
            fetchServices(currentPage);
            fetchStats();
        } catch (err) {
            alert(err.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa dịch vụ này?')) return;
        
        try {
            await serviceService.deleteService(id);
            alert('Xóa dịch vụ thành công!');
            fetchServices(currentPage);
            fetchStats();
        } catch (err) {
            alert(err.response?.data?.message || 'Không thể xóa dịch vụ');
        }
    };

    const openStockModal = (service) => {
        setStockUpdate({
            serviceId: service._id,
            serviceName: service.name,
            currentStock: service.stock,
            quantity: 0,
            action: 'add'
        });
        setShowStockModal(true);
    };

    const handleStockUpdate = async () => {
        try {
            await serviceService.updateStock(stockUpdate.serviceId, {
                quantity: parseInt(stockUpdate.quantity),
                action: stockUpdate.action
            });
            alert('Cập nhật tồn kho thành công!');
            setShowStockModal(false);
            fetchServices(currentPage);
            fetchStats();
        } catch (err) {
            alert(err.response?.data?.message || 'Không thể cập nhật tồn kho');
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

    const getCategoryBadge = (category) => {
        const variants = {
            equipment: 'primary',
            beverage: 'success',
            referee: 'warning',
            other: 'secondary'
        };
        return <Badge bg={variants[category] || 'secondary'}>{getCategoryText(category)}</Badge>;
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        fetchServices(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const renderPagination = () => {
        if (pagination.totalPages <= 1) return null;

        return (
            <div className="d-flex justify-content-center mt-3">
                <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="mx-1"
                >
                    ‹ Trước
                </Button>
                
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
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

                <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pagination.totalPages}
                    className="mx-1"
                >
                    Sau ›
                </Button>
            </div>
        );
    };

    return (
        <Container fluid className="quanlydichvu-page">
            <Row className="mb-4">
                <Col>
                    <h2>
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '12px', verticalAlign: 'middle' }}>
                            <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5V2zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1H4z"/>
                        </svg>
                        Quản Lý Dịch Vụ
                    </h2>
                    <p className="text-muted">Quản lý các dịch vụ bổ sung cho sân bóng</p>
                </Col>
                <Col xs="auto">
                    <Button variant="primary" onClick={openCreateModal}>
                        ➕ Thêm Dịch Vụ
                    </Button>
                </Col>
            </Row>

            {/* Stats Cards */}
            {stats && (
                <Row className="mb-4">
                    <Col md={3}>
                        <Card className="stats-card primary text-center">
                            <Card.Body>
                                <h3 className="text-primary">{stats.total}</h3>
                                <p className="text-muted mb-0">Tổng dịch vụ</p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="stats-card success text-center">
                            <Card.Body>
                                <h3 className="text-success">{stats.available}</h3>
                                <p className="text-muted mb-0">Đang hoạt động</p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="stats-card danger text-center">
                            <Card.Body>
                                <h3 className="text-danger">{stats.outOfStock}</h3>
                                <p className="text-muted mb-0">Hết hàng</p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="stats-card info text-center">
                            <Card.Body>
                                <h3 className="text-info">{stats.byCategory?.length || 0}</h3>
                                <p className="text-muted mb-0">Danh mục</p>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}

            {/* Filters */}
            <Card className="mb-4">
                <Card.Body>
                    <Row className="g-3">
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Tìm kiếm</Form.Label>
                                <InputGroup>
                                    <Form.Control
                                        type="text"
                                        placeholder="Tên dịch vụ..."
                                        value={searchText}
                                        onChange={(e) => setSearchText(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                </InputGroup>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Danh mục</Form.Label>
                                <Form.Select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                >
                                    <option value="">Tất cả</option>
                                    <option value="equipment">Thiết bị</option>
                                    <option value="beverage">Đồ uống</option>
                                    <option value="referee">Trọng tài</option>
                                    <option value="other">Khác</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={5} className="d-flex align-items-end">
                            <Button variant="primary" onClick={handleSearch} className="me-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '6px' }}>
                                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                                </svg>
                                Tìm kiếm
                            </Button>
                            <Button variant="outline-secondary" onClick={handleReset}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '6px' }}>
                                    <path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
                                    <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
                                </svg>
                                Đặt lại
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {error && <Alert variant="danger">{error}</Alert>}

            {/* Services Table */}
            <Card>
                <Card.Body>
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary"></div>
                            <p className="mt-2">Đang tải...</p>
                        </div>
                    ) : services.length === 0 ? (
                        <Alert variant="info" className="text-center">
                            Không tìm thấy dịch vụ nào
                        </Alert>
                    ) : (
                        <>
                            <Table responsive hover>
                                <thead>
                                    <tr>
                                        <th>Tên dịch vụ</th>
                                        <th>Danh mục</th>
                                        <th>Giá</th>
                                        <th>Tồn kho</th>
                                        <th>Trạng thái</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {services.map((service) => (
                                        <tr key={service._id}>
                                            <td>
                                                <strong>{service.name}</strong>
                                            </td>
                                            <td>{getCategoryBadge(service.category)}</td>
                                            <td className="text-primary fw-bold">
                                                {service.price.toLocaleString()}đ
                                            </td>
                                            <td>
                                                <Badge bg={service.stock > 0 ? 'success' : 'danger'}>
                                                    {service.stock} {service.unit}
                                                </Badge>
                                            </td>
                                            <td>
                                                <Badge bg={service.isAvailable ? 'success' : 'secondary'}>
                                                    {service.isAvailable ? 'Hoạt động' : 'Tạm ngưng'}
                                                </Badge>
                                            </td>
                                            <td>
                                                <div className="action-btn-group">
                                                    <button
                                                        className="action-btn view"
                                                        onClick={() => openEditModal(service)}
                                                        title="Xem chi tiết"
                                                    >
                                                    </button>
                                                    <button
                                                        className="action-btn edit"
                                                        onClick={() => openEditModal(service)}
                                                        title="Chỉnh sửa"
                                                    >
                                                    </button>
                                                    <button
                                                        className="action-btn delete"
                                                        onClick={() => handleDelete(service._id)}
                                                        title="Xóa"
                                                    >
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                            {renderPagination()}
                        </>
                    )}
                </Card.Body>
            </Card>

            {/* Create/Edit Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        {modalMode === 'create' ? 'Thêm Dịch Vụ' : 'Sửa Dịch Vụ'}
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Tên dịch vụ *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={currentService.name}
                                        onChange={(e) => setCurrentService({
                                            ...currentService,
                                            name: e.target.value
                                        })}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Danh mục *</Form.Label>
                                    <Form.Select
                                        value={currentService.category}
                                        onChange={(e) => setCurrentService({
                                            ...currentService,
                                            category: e.target.value
                                        })}
                                        required
                                    >
                                        <option value="equipment">Thiết bị</option>
                                        <option value="beverage">Đồ uống</option>
                                        <option value="referee">Trọng tài</option>
                                        <option value="other">Khác</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Mô tả</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                value={currentService.description}
                                onChange={(e) => setCurrentService({
                                    ...currentService,
                                    description: e.target.value
                                })}
                            />
                        </Form.Group>

                        <Row>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Giá *</Form.Label>
                                    <InputGroup>
                                        <Form.Control
                                            type="number"
                                            min="0"
                                            value={currentService.price}
                                            onChange={(e) => setCurrentService({
                                                ...currentService,
                                                price: parseFloat(e.target.value)
                                            })}
                                            required
                                        />
                                        <InputGroup.Text>đ</InputGroup.Text>
                                    </InputGroup>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Đơn vị</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={currentService.unit}
                                        onChange={(e) => setCurrentService({
                                            ...currentService,
                                            unit: e.target.value
                                        })}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Tồn kho</Form.Label>
                                    <Form.Control
                                        type="number"
                                        min="0"
                                        value={currentService.stock}
                                        onChange={(e) => setCurrentService({
                                            ...currentService,
                                            stock: parseInt(e.target.value)
                                        })}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Check
                                type="checkbox"
                                label="Đang hoạt động"
                                checked={currentService.isAvailable}
                                onChange={(e) => setCurrentService({
                                    ...currentService,
                                    isAvailable: e.target.checked
                                })}
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>
                            Hủy
                        </Button>
                        <Button variant="primary" type="submit">
                            {modalMode === 'create' ? '➕ Tạo' : '💾 Lưu'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Stock Update Modal */}
            <Modal show={showStockModal} onHide={() => setShowStockModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Cập Nhật Tồn Kho</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Alert variant="info">
                        <strong>{stockUpdate.serviceName}</strong><br />
                        Tồn kho hiện tại: <strong>{stockUpdate.currentStock}</strong>
                    </Alert>

                    <Form.Group className="mb-3">
                        <Form.Label>Thao tác</Form.Label>
                        <Form.Select
                            value={stockUpdate.action}
                            onChange={(e) => setStockUpdate({
                                ...stockUpdate,
                                action: e.target.value
                            })}
                        >
                            <option value="add">Nhập thêm</option>
                            <option value="subtract">Xuất kho</option>
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Số lượng</Form.Label>
                        <Form.Control
                            type="number"
                            min="1"
                            value={stockUpdate.quantity}
                            onChange={(e) => setStockUpdate({
                                ...stockUpdate,
                                quantity: e.target.value
                            })}
                        />
                    </Form.Group>

                    <Alert variant={stockUpdate.action === 'add' ? 'success' : 'warning'}>
                        Tồn kho sau khi cập nhật:{' '}
                        <strong>
                            {stockUpdate.action === 'add'
                                ? stockUpdate.currentStock + parseInt(stockUpdate.quantity || 0)
                                : stockUpdate.currentStock - parseInt(stockUpdate.quantity || 0)}
                        </strong>
                    </Alert>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowStockModal(false)}>
                        Hủy
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleStockUpdate}
                        disabled={!stockUpdate.quantity || stockUpdate.quantity <= 0}
                    >
                        💾 Cập Nhật
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Quanlydichvu;
