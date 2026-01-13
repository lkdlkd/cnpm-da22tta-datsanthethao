import React, { useState, useEffect } from 'react';
import { 
    Container, 
    Row, 
    Col, 
    Table, 
    Button, 
    Modal, 
    Form,
    InputGroup,
    Badge,
    Card,
    Alert,
    Spinner
} from 'react-bootstrap';
import { authService } from '../../services/api';
import './AdminCommon.css';

const Quanlykhachhang = () => {
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('');
    const [filterActive, setFilterActive] = useState('');

    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        role: 'customer',
        isActive: true
    });

    useEffect(() => {
        fetchUsers();
    }, [filterRole, filterActive]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filterRole) params.role = filterRole;
            if (filterActive !== '') params.isActive = filterActive;
            if (searchTerm) params.search = searchTerm;
            
            const response = await authService.getAllUsers(params);
            setUsers(response.data.data || []);
        } catch (err) {
            setError('Không thể tải danh sách khách hàng');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        fetchUsers();
    };

    const handleShowModal = (user) => {
        setCurrentUser(user);
        setFormData({
            fullName: user.fullName,
            phone: user.phone,
            role: user.role,
            isActive: user.isActive
        });
        setError('');
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setCurrentUser(null);
        setError('');
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await authService.updateUserByAdmin(currentUser._id, formData);
            setSuccess('Cập nhật thông tin thành công!');
            await fetchUsers();
            handleCloseModal();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa khách hàng này?')) return;

        setLoading(true);
        try {
            await authService.deleteUser(id);
            setSuccess('Xóa khách hàng thành công!');
            await fetchUsers();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể xóa khách hàng');
            setTimeout(() => setError(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    const getRoleBadge = (role) => {
        const roleMap = {
            customer: { variant: 'primary', text: 'Khách hàng' },
            admin: { variant: 'danger', text: 'Quản trị viên' }
        };
        const { variant, text } = roleMap[role] || roleMap.customer;
        return <Badge bg={variant}>{text}</Badge>;
    };

    const getStatusBadge = (isActive) => {
        return isActive 
            ? <Badge bg="success">Hoạt động</Badge>
            : <Badge bg="secondary">Đã khóa</Badge>;
    };

    return (
        <Container fluid className="admin-page">
            <h2>👥 Quản Lý Khách Hàng</h2>

            {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}
            {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

            <Card className="mb-4 filter-section">
                <Card.Body>
                    <Row className="align-items-end">
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Tìm kiếm</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text>🔍</InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        placeholder="Tên, email, số điện thoại..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                    <Button variant="primary" onClick={handleSearch}>
                                        Tìm
                                    </Button>
                                </InputGroup>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Vai trò</Form.Label>
                                <Form.Select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                                    <option value="">Tất cả</option>
                                    <option value="customer">Khách hàng</option>
                                    <option value="admin">Quản trị viên</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Trạng thái</Form.Label>
                                <Form.Select value={filterActive} onChange={(e) => setFilterActive(e.target.value)}>
                                    <option value="">Tất cả</option>
                                    <option value="true">Hoạt động</option>
                                    <option value="false">Đã khóa</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            <Card>
                <Card.Body>
                    {loading && !showModal ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-2">Đang tải...</p>
                        </div>
                    ) : (
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Họ Tên</th>
                                    <th>Email</th>
                                    <th>Số Điện Thoại</th>
                                    <th>Vai Trò</th>
                                    <th>Trạng Thái</th>
                                    <th>Ngày Đăng Ký</th>
                                    <th>Thao Tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="text-center">
                                            Không có dữ liệu
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user, index) => (
                                        <tr key={user._id}>
                                            <td>{index + 1}</td>
                                            <td><strong>{user.fullName}</strong></td>
                                            <td>{user.email}</td>
                                            <td>{user.phone || 'Chưa cập nhật'}</td>
                                            <td>{getRoleBadge(user.role)}</td>
                                            <td>{getStatusBadge(user.isActive)}</td>
                                            <td>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                                            <td>
                                                <Button 
                                                    variant="warning" 
                                                    size="sm" 
                                                    className="me-2"
                                                    onClick={() => handleShowModal(user)}
                                                >
                                                    ✏️ Sửa
                                                </Button>
                                                <Button 
                                                    variant="danger" 
                                                    size="sm"
                                                    onClick={() => handleDelete(user._id)}
                                                    disabled={user.role === 'admin'}
                                                >
                                                    🗑️ Xóa
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    )}

                    <div className="mt-3">
                        <small className="text-muted">
                            Tổng số: <strong>{users.length}</strong> khách hàng
                        </small>
                    </div>
                </Card.Body>
            </Card>

            {/* Modal Chỉnh Sửa */}
            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>✏️ Chỉnh Sửa Thông Tin</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        {error && <Alert variant="danger">{error}</Alert>}
                        
                        {currentUser && (
                            <Alert variant="info">
                                <strong>Email:</strong> {currentUser.email}
                            </Alert>
                        )}

                        <Form.Group className="mb-3">
                            <Form.Label>Họ Tên <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Số Điện Thoại</Form.Label>
                            <Form.Control
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Vai Trò <span className="text-danger">*</span></Form.Label>
                            <Form.Select
                                name="role"
                                value={formData.role}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="customer">Khách hàng</option>
                                <option value="staff">Nhân viên</option>
                                <option value="admin">Quản trị viên</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Check
                                type="checkbox"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleInputChange}
                                label="Tài khoản hoạt động"
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal}>
                            Hủy
                        </Button>
                        <Button variant="primary" type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    Đang xử lý...
                                </>
                            ) : (
                                '💾 Cập Nhật'
                            )}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
};

export default Quanlykhachhang;
