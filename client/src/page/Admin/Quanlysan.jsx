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
import Swal from 'sweetalert2';
import { fieldService, timeSlotService } from '../../services/api';
import './AdminCommon.css';
import './SelectArrow.css';
import './Quanlysan.css';

const Quanlysan = () => {
    const [fields, setFields] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [currentField, setCurrentField] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('');

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
    });

    const [formData, setFormData] = useState({
        name: '',
        fieldType: '5vs5',
        location: '',
        address: '',
        description: '',
        pricePerHour: '',
        facilities: '',
        images: '',
        status: 'active'
    });

    const [imageLinks, setImageLinks] = useState(['']);
    const [uploadMode, setUploadMode] = useState('link'); // 'link' or 'file'
    const [selectedFiles, setSelectedFiles] = useState([]);

    // Time slot states
    const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
    const [selectedFieldForTimeSlot, setSelectedFieldForTimeSlot] = useState(null);
    const [timeSlotForm, setTimeSlotForm] = useState({
        date: '',
        startHour: 6,
        endHour: 22,
        slotDuration: 1
    });

    useEffect(() => {
        fetchFields(currentPage);
    }, [currentPage, searchTerm, filterType]);

    const fetchFields = async (page = currentPage) => {
        setLoading(true);
        try {
            const params = {
                page: page,
                limit: itemsPerPage
            };

            // Add search parameter
            if (searchTerm) {
                params.search = searchTerm;
            }

            // Add fieldType filter
            if (filterType) {
                params.fieldType = filterType;
            }

            const response = await fieldService.getAllFields(params);

            // Check for success flag in response
            if (response.data && response.data.success !== false) {
                setFields(response.data.data.fields || []);
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
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (value) => {
        setSearchTerm(value);
        setCurrentPage(1); // Reset to page 1 when searching
    };

    const handleFilterChange = (value) => {
        setFilterType(value);
        setCurrentPage(1); // Reset to page 1 when filtering
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleShowModal = (mode, field = null) => {
        setModalMode(mode);
        setError('');
        setSuccess('');

        if ((mode === 'edit' || mode === 'view') && field) {
            setCurrentField(field);
            setFormData({
                name: field.name,
                fieldType: field.fieldType,
                location: field.location,
                address: field.address,
                description: field.description || '',
                pricePerHour: field.pricePerHour,
                facilities: Array.isArray(field.facilities) ? field.facilities.join(', ') : '',
                images: Array.isArray(field.images) ? field.images.join(', ') : '',
                status: field.status
            });
            setImageLinks(Array.isArray(field.images) && field.images.length > 0 ? field.images : ['']);
        } else {
            setCurrentField(null);
            setFormData({
                name: '',
                fieldType: '5vs5',
                location: '',
                address: '',
                description: '',
                pricePerHour: '',
                facilities: '',
                images: '',
                status: 'active'
            });
            setImageLinks(['']);
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setCurrentField(null);
        setError('');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleImageLinkChange = (index, value) => {
        const newLinks = [...imageLinks];
        newLinks[index] = value;
        setImageLinks(newLinks);
    };

    const addImageLink = () => {
        setImageLinks([...imageLinks, '']);
    };

    const removeImageLink = (index) => {
        if (imageLinks.length > 1) {
            const newLinks = imageLinks.filter((_, i) => i !== index);
            setImageLinks(newLinks);
        }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles([...selectedFiles, ...files]);
    };

    const removeFile = (index) => {
        const newFiles = selectedFiles.filter((_, i) => i !== index);
        setSelectedFiles(newFiles);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            let imageUrls = [];

            // Xử lý theo chế độ upload
            if (uploadMode === 'link') {
                imageUrls = imageLinks.map(img => img.trim()).filter(img => img);
            } else if (uploadMode === 'file' && selectedFiles.length > 0) {
                // Upload files lên server
                const formDataUpload = new FormData();
                selectedFiles.forEach(file => {
                    formDataUpload.append('images', file);
                });

                if (modalMode === 'edit' && currentField) {
                    // EDIT MODE: Upload vào sân đang sửa (backend tự động lưu)
                    await fieldService.uploadFieldImages(
                        currentField._id,
                        formDataUpload
                    );

                    // Backend đã lưu images rồi, chỉ cần update thông tin khác (không gửi images)
                    const dataToSend = {
                        name: formData.name,
                        fieldType: formData.fieldType,
                        location: formData.location,
                        address: formData.address,
                        description: formData.description,
                        pricePerHour: Number(formData.pricePerHour),
                        facilities: formData.facilities.split(',').map(f => f.trim()).filter(f => f),
                        status: formData.status
                        // Không gửi images vì đã upload xong
                    };

                    await fieldService.updateField(currentField._id, dataToSend);
                    setSuccess('Cập nhật sân thành công!');
                    await fetchFields(currentPage);
                    handleCloseModal();
                    setTimeout(() => setSuccess(''), 3000);
                    setLoading(false);
                    return;
                } else {
                    // ADD MODE: Tạo sân mới trước, sau đó upload ảnh
                    const response = await fieldService.createField({
                        name: formData.name,
                        fieldType: formData.fieldType,
                        location: formData.location,
                        address: formData.address,
                        description: formData.description,
                        pricePerHour: Number(formData.pricePerHour),
                        facilities: formData.facilities.split(',').map(f => f.trim()).filter(f => f),
                        status: formData.status,
                        images: []
                    });

                    // Upload ảnh cho field vừa tạo (backend tự động lưu images)
                    if (response.data.data && response.data.data._id) {
                        await fieldService.uploadFieldImages(
                            response.data.data._id,
                            formDataUpload
                        );
                    }

                    setSuccess('Thêm sân thành công!');
                    await fetchFields(currentPage);
                    handleCloseModal();
                    setTimeout(() => setSuccess(''), 3000);
                    setLoading(false);
                    return;
                }
            }

            // Chế độ link URL (không upload file)
            const dataToSend = {
                name: formData.name,
                fieldType: formData.fieldType,
                location: formData.location,
                address: formData.address,
                description: formData.description,
                pricePerHour: Number(formData.pricePerHour),
                facilities: formData.facilities.split(',').map(f => f.trim()).filter(f => f),
                status: formData.status,
                images: imageUrls
            };

            if (modalMode === 'add') {
                await fieldService.createField(dataToSend);
                setSuccess('Thêm sân thành công!');
            } else {
                await fieldService.updateField(currentField._id, dataToSend);
                setSuccess('Cập nhật sân thành công!');
            }

            await fetchFields(currentPage);
            handleCloseModal();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Xóa sân',
            text: 'Bạn có chắc muốn xóa sân này?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy'
        });

        if (!result.isConfirmed) return;

        setLoading(true);
        try {
            await fieldService.deleteField(id);
            Swal.fire({
                icon: 'success',
                title: 'Thành công!',
                text: 'Xóa sân thành công!',
                timer: 2000,
                showConfirmButton: false
            });
            await fetchFields(currentPage);
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi!',
                text: err.response?.data?.message || 'Không thể xóa sân'
            });
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            active: { variant: 'success', text: 'Hoạt động' },
            maintenance: { variant: 'warning', text: 'Bảo trì' },
            inactive: { variant: 'secondary', text: 'Không hoạt động' }
        };
        const { variant, text } = statusMap[status] || statusMap.active;
        return <Badge bg={variant}>{text}</Badge>;
    };

    const handleShowTimeSlotModal = (field) => {
        setSelectedFieldForTimeSlot(field);
        setTimeSlotForm({
            date: new Date().toISOString().split('T')[0],
            startHour: 6,
            endHour: 22,
            slotDuration: 1
        });
        setShowTimeSlotModal(true);
    };

    const handleGenerateTimeSlots = async () => {
        if (!selectedFieldForTimeSlot || !timeSlotForm.date) {
            setError('Vui lòng chọn ngày');
            setTimeout(() => setError(''), 3000);
            return;
        }

        setLoading(true);
        try {
            const response = await timeSlotService.generateTimeSlots({
                fieldId: selectedFieldForTimeSlot._id,
                date: timeSlotForm.date,
                startHour: timeSlotForm.startHour,
                endHour: timeSlotForm.endHour,
                slotDuration: timeSlotForm.slotDuration
            });

            if (response.data && response.data.success !== false) {
                setSuccess(response.data.message || 'Tạo khung giờ thành công!');
                setShowTimeSlotModal(false);
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(response.data?.message || 'Có lỗi xảy ra');
                setTimeout(() => setError(''), 3000);
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi tạo khung giờ';
            setError(errorMsg);
            setTimeout(() => setError(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    const renderPagination = () => {
        const totalPages = pagination.totalPages;
        if (totalPages <= 1) return null;

        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        return (
            <div className="quanlysan-pagination">
                <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    <span>‹</span>
                    <span>Trước</span>
                </button>

                {startPage > 1 && (
                    <>
                        <button
                            className="pagination-btn"
                            onClick={() => handlePageChange(1)}
                        >
                            1
                        </button>
                        {startPage > 2 && <span className="pagination-dots">...</span>}
                    </>
                )}

                {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(page => (
                    <button
                        key={page}
                        className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                        onClick={() => handlePageChange(page)}
                    >
                        {page}
                    </button>
                ))}

                {endPage < totalPages && (
                    <>
                        {endPage < totalPages - 1 && <span className="pagination-dots">...</span>}
                        <button
                            className="pagination-btn"
                            onClick={() => handlePageChange(totalPages)}
                        >
                            {totalPages}
                        </button>
                    </>
                )}

                <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    <span>Sau</span>
                    <span>›</span>
                </button>
            </div>
        );
    };

    return (
        <Container fluid className="quanlysan-page">
            <h2>
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '12px', verticalAlign: 'middle' }}>
                    <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z" />
                </svg>
                Quản Lý Sân Bóng
            </h2>

            {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}
            {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

            <Card className="mb-4 filter-section">
                <Card.Body>
                    <Row className="align-items-end">
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Tìm kiếm</Form.Label>
                                <div style={{ position: 'relative' }}>
                                    <Form.Control
                                        type="text"
                                        placeholder="Tìm theo tên hoặc khu vực..."
                                        value={searchTerm}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        style={{ paddingRight: '45px' }}
                                    />
                                    <button
                                        style={{
                                            position: 'absolute',
                                            right: '8px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            color: '#6c757d'
                                        }}
                                        onClick={() => { }}
                                        title="Tìm kiếm"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                                        </svg>
                                    </button>
                                </div>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Loại sân</Form.Label>
                                <Form.Select value={filterType} onChange={(e) => handleFilterChange(e.target.value)}>
                                    <option value="">Tất cả</option>
                                    <option value="5vs5">Sân 5 người</option>
                                    <option value="7vs7">Sân 7 người</option>
                                    <option value="11vs11">Sân 11 người</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={5} className="text-end">
                            <Button variant="primary" size="lg" onClick={() => handleShowModal('add')}>
                                ➕ Thêm Sân Mới
                            </Button>
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
                                    <th>STT</th>
                                    <th>Hình Ảnh</th>
                                    <th>Tên Sân</th>
                                    <th>Loại Sân</th>
                                    <th>Giá/Giờ</th>
                                    <th>Trạng Thái</th>
                                    <th>Thao Tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fields.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center">
                                            {searchTerm || filterType ? 'Không tìm thấy sân phù hợp' : 'Không có dữ liệu'}
                                        </td>
                                    </tr>
                                ) : (
                                    fields.map((field, index) => (
                                        <tr key={field._id}>
                                            <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                            <td>
                                                {field.images && field.images.length > 0 ? (
                                                    <img
                                                        src={field.images[0]}
                                                        alt={field.name}
                                                        style={{ width: '60px', height: '45px', objectFit: 'cover', borderRadius: '8px' }}
                                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/60x45?text=No+Image' }}
                                                    />
                                                ) : (
                                                    <div style={{ width: '60px', height: '45px', background: '#e9ecef', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#6c757d' }}>
                                                        Chưa có ảnh
                                                    </div>
                                                )}
                                            </td>
                                            <td><strong>{field.name}</strong></td>
                                            <td>
                                                <Badge bg="info">{field.fieldType}</Badge>
                                            </td>
                                            <td className="text-end">
                                                <strong>{(field.pricePerHour || 0).toLocaleString()}đ</strong>
                                            </td>
                                            <td>{getStatusBadge(field.status)}</td>
                                            <td>
                                                <div className="action-btn-group">
                                                    <button
                                                        className="action-btn view"
                                                        onClick={() => handleShowModal('view', field)}
                                                        title="Xem chi tiết"
                                                    >
                                                    </button>
                                                    <button
                                                        className="action-btn edit"
                                                        onClick={() => handleShowModal('edit', field)}
                                                        title="Chỉnh sửa"
                                                    >
                                                    </button>
                                                    <button
                                                        className="action-btn confirm"
                                                        onClick={() => handleShowTimeSlotModal(field)}
                                                        title="Tạo khung giờ"
                                                        style={{ background: '#e8f5e9' }}
                                                    >
                                                    </button>
                                                    <button
                                                        className="action-btn delete"
                                                        onClick={() => handleDelete(field._id)}
                                                        title="Xóa"
                                                    >
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    )}

                    <div className="d-flex justify-content-between align-items-center mt-3">
                        <small className="text-muted">
                            Tổng số: <strong>{pagination.total}</strong> sân
                            {pagination.totalPages > 1 && (
                                <span className="ms-2">
                                    (Trang {currentPage}/{pagination.totalPages})
                                </span>
                            )}
                        </small>
                    </div>

                    {renderPagination()}
                </Card.Body>
            </Card>

            {/* Modal Thêm/Sửa/Xem Sân */}
            <Modal show={showModal} onHide={handleCloseModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        {modalMode === 'add' ? 'Thêm Sân Mới' : modalMode === 'view' ? 'Chi Tiết Sân' : 'Chỉnh Sửa Sân'}
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        {error && <Alert variant="danger">{error}</Alert>}

                        {modalMode === 'view' ? (
                            /* View Mode - Display Only */
                            <div>
                                <Row className="mb-3">
                                    <Col md={8}>
                                        <h5>{formData.name}</h5>
                                        <Badge bg="info" className="me-2">{formData.fieldType}</Badge>
                                        {getStatusBadge(formData.status)}
                                    </Col>
                                    <Col md={4} className="text-end">
                                        <h4 className="text-success">{Number(formData.pricePerHour).toLocaleString()}đ/giờ</h4>
                                    </Col>
                                </Row>

                                <Row className="mb-3">
                                    <Col md={6}>
                                        <p><strong>Khu vực:</strong> {formData.location}</p>
                                    </Col>
                                    <Col md={6}>
                                        <p><strong>Đánh giá:</strong> ⭐ {(currentField?.rating || 0).toFixed(1)} ({currentField?.totalReviews || 0} đánh giá)</p>
                                    </Col>
                                </Row>

                                <Row className="mb-3">
                                    <Col md={12}>
                                        <p><strong>Địa chỉ:</strong> {formData.address}</p>
                                    </Col>
                                </Row>

                                <Row className="mb-3">
                                    <Col md={12}>
                                        <p><strong>Mô tả:</strong></p>
                                        <p>{formData.description || 'Chưa có mô tả'}</p>
                                    </Col>
                                </Row>

                                <Row className="mb-3">
                                    <Col md={12}>
                                        <p><strong>Tiện nghi:</strong></p>
                                        <p>{formData.facilities || 'Chưa cập nhật'}</p>
                                    </Col>
                                </Row>

                                {imageLinks.length > 0 && imageLinks[0] && (
                                    <Row>
                                        <Col md={12}>
                                            <p><strong>Hình ảnh:</strong></p>
                                            <div className="d-flex flex-wrap gap-2">
                                                {imageLinks.map((img, idx) => (
                                                    img && (
                                                        <img
                                                            key={idx}
                                                            src={img}
                                                            alt={`Field ${idx + 1}`}
                                                            style={{ width: '150px', height: '100px', objectFit: 'cover', borderRadius: '8px' }}
                                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/150x100?text=Error' }}
                                                        />
                                                    )
                                                ))}
                                            </div>
                                        </Col>
                                    </Row>
                                )}
                            </div>
                        ) : (
                            /* Edit/Add Mode - Form Fields */
                            <>
                                <Row>
                                    <Col md={8}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Tên Sân <span className="text-danger">*</span></Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                placeholder="VD: Sân Bóng Mỹ Đình"
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Loại Sân <span className="text-danger">*</span></Form.Label>
                                            <Form.Select
                                                name="fieldType"
                                                value={formData.fieldType}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="5vs5">Sân 5 người</option>
                                                <option value="7vs7">Sân 7 người</option>
                                                <option value="11vs11">Sân 11 người</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Khu Vực <span className="text-danger">*</span></Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="location"
                                                value={formData.location}
                                                onChange={handleInputChange}
                                                placeholder="VD: Hà Nội"
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Giá/Giờ (VNĐ) <span className="text-danger">*</span></Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="pricePerHour"
                                                value={formData.pricePerHour}
                                                onChange={handleInputChange}
                                                placeholder="VD: 500000"
                                                min="0"
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-3">
                                    <Form.Label>Địa Chỉ <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        placeholder="VD: Số 1 Đường ABC, Quận XYZ"
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Mô Tả</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Mô tả về sân bóng..."
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Tiện Ích</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="facilities"
                                        value={formData.facilities}
                                        onChange={handleInputChange}
                                        placeholder="VD: Đèn chiếu sáng, Phòng thay đồ, Bãi đỗ xe (Cách nhau bởi dấu phẩy)"
                                    />
                                    <Form.Text className="text-muted">
                                        Nhập các tiện ích cách nhau bởi dấu phẩy
                                    </Form.Text>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Hình Ảnh Sân</Form.Label>

                                    {/* Toggle giữa Link và File Upload */}
                                    <div className="mb-3">
                                        <Button
                                            variant={uploadMode === 'link' ? 'primary' : 'outline-primary'}
                                            size="sm"
                                            onClick={() => setUploadMode('link')}
                                            className="me-2"
                                        >
                                            🔗 Thêm Link
                                        </Button>
                                        <Button
                                            variant={uploadMode === 'file' ? 'primary' : 'outline-primary'}
                                            size="sm"
                                            onClick={() => setUploadMode('file')}
                                        >
                                            📁 Upload File
                                        </Button>
                                    </div>

                                    {uploadMode === 'link' ? (
                                        <>
                                            <Form.Text className="text-muted d-block mb-2">
                                                Thêm link hình ảnh của sân (có thể thêm nhiều ảnh)
                                            </Form.Text>
                                            {imageLinks.map((link, index) => (
                                                <InputGroup className="mb-2" key={index}>
                                                    <InputGroup.Text>#{index + 1}</InputGroup.Text>
                                                    <Form.Control
                                                        type="url"
                                                        value={link}
                                                        onChange={(e) => handleImageLinkChange(index, e.target.value)}
                                                        placeholder="https://example.com/image.jpg"
                                                    />
                                                    {imageLinks.length > 1 && (
                                                        <Button
                                                            variant="outline-danger"
                                                            onClick={() => removeImageLink(index)}
                                                        >
                                                            ❌
                                                        </Button>
                                                    )}
                                                </InputGroup>
                                            ))}

                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                onClick={addImageLink}
                                                className="mt-2"
                                            >
                                                ➕ Thêm Ảnh
                                            </Button>

                                            {imageLinks.some(link => link.trim()) && (
                                                <div className="mt-3">
                                                    <strong>Xem trước:</strong>
                                                    <div className="d-flex flex-wrap gap-2 mt-2">
                                                        {imageLinks.map((img, idx) => {
                                                            const trimmedImg = img.trim();
                                                            if (!trimmedImg) return null;
                                                            return (
                                                                <div key={idx} style={{ position: 'relative' }}>
                                                                    <img
                                                                        src={trimmedImg}
                                                                        alt={`Preview ${idx + 1}`}
                                                                        style={{ width: '120px', height: '90px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #dee2e6' }}
                                                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/120x90?text=Invalid+URL' }}
                                                                    />
                                                                    <Badge
                                                                        bg="dark"
                                                                        style={{
                                                                            position: 'absolute',
                                                                            top: '5px',
                                                                            right: '5px',
                                                                            fontSize: '10px'
                                                                        }}
                                                                    >
                                                                        #{idx + 1}
                                                                    </Badge>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <Form.Text className="text-muted d-block mb-2">
                                                Chọn ảnh từ máy tính (có thể chọn nhiều ảnh cùng lúc)
                                            </Form.Text>
                                            <Form.Control
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="mb-2"
                                            />

                                            {selectedFiles.length > 0 && (
                                                <div className="mt-3">
                                                    <strong>Đã chọn {selectedFiles.length} file:</strong>
                                                    <div className="d-flex flex-wrap gap-2 mt-2">
                                                        {selectedFiles.map((file, idx) => (
                                                            <div key={idx} style={{ position: 'relative' }}>
                                                                <img
                                                                    src={URL.createObjectURL(file)}
                                                                    alt={`Preview ${idx + 1}`}
                                                                    style={{ width: '120px', height: '90px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #dee2e6' }}
                                                                />
                                                                <Badge
                                                                    bg="dark"
                                                                    style={{
                                                                        position: 'absolute',
                                                                        top: '5px',
                                                                        right: '5px',
                                                                        fontSize: '10px'
                                                                    }}
                                                                >
                                                                    #{idx + 1}
                                                                </Badge>
                                                                <Button
                                                                    variant="danger"
                                                                    size="sm"
                                                                    style={{
                                                                        position: 'absolute',
                                                                        bottom: '5px',
                                                                        right: '5px',
                                                                        fontSize: '10px',
                                                                        padding: '2px 6px'
                                                                    }}
                                                                    onClick={() => removeFile(idx)}
                                                                >
                                                                    ❌
                                                                </Button>
                                                                <div style={{ fontSize: '11px', marginTop: '4px', textAlign: 'center' }}>
                                                                    {file.name.length > 15 ? file.name.substring(0, 15) + '...' : file.name}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Trạng Thái <span className="text-danger">*</span></Form.Label>
                                    <Form.Select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="active">Hoạt động</option>
                                        <option value="maintenance">Bảo trì</option>
                                        <option value="inactive">Không hoạt động</option>
                                    </Form.Select>
                                </Form.Group>
                            </>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        {modalMode === 'view' ? (
                            <>
                                <Button variant="secondary" onClick={handleCloseModal}>
                                    Đóng
                                </Button>
                                <Button variant="primary" onClick={() => {
                                    setModalMode('edit');
                                }}>
                                    Chỉnh sửa
                                </Button>
                            </>
                        ) : (
                            <>
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
                                        modalMode === 'add' ? 'Thêm Sân' : 'Cập Nhật'
                                    )}
                                </Button>
                            </>
                        )}
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Modal Tạo Khung Giờ */}
            <Modal show={showTimeSlotModal} onHide={() => setShowTimeSlotModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Tạo Khung Giờ - {selectedFieldForTimeSlot?.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedFieldForTimeSlot && (
                        <Alert variant="info" className="mb-3">
                            <strong>Sân:</strong> {selectedFieldForTimeSlot.name} ({selectedFieldForTimeSlot.fieldType})<br />
                            <strong>Giá:</strong> {selectedFieldForTimeSlot.pricePerHour?.toLocaleString()}đ/giờ
                        </Alert>
                    )}

                    <Form.Group className="mb-3">
                        <Form.Label>Chọn Ngày <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="date"
                            value={timeSlotForm.date}
                            onChange={(e) => setTimeSlotForm({ ...timeSlotForm, date: e.target.value })}
                            min={new Date().toISOString().split('T')[0]}
                            required
                        />
                    </Form.Group>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Giờ Bắt Đầu</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="0"
                                    max="23"
                                    value={timeSlotForm.startHour}
                                    onChange={(e) => setTimeSlotForm({ ...timeSlotForm, startHour: Number(e.target.value) })}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Giờ Kết Thúc</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="1"
                                    max="24"
                                    value={timeSlotForm.endHour}
                                    onChange={(e) => setTimeSlotForm({ ...timeSlotForm, endHour: Number(e.target.value) })}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3">
                        <Form.Label>Thời Lượng Mỗi Khung Giờ</Form.Label>
                        <Form.Select
                            value={timeSlotForm.slotDuration}
                            onChange={(e) => setTimeSlotForm({ ...timeSlotForm, slotDuration: Number(e.target.value) })}
                        >
                            <option value="1">1 giờ</option>
                            <option value="1.5">1.5 giờ</option>
                            <option value="2">2 giờ</option>
                        </Form.Select>
                    </Form.Group>

                    <Alert variant="success">
                        <strong>Sẽ tạo khoảng {Math.floor((timeSlotForm.endHour - timeSlotForm.startHour) / timeSlotForm.slotDuration)} khung giờ</strong>
                        <div className="mt-2" style={{ fontSize: '0.9rem' }}>
                            📅 Ngày: {timeSlotForm.date ? new Date(timeSlotForm.date).toLocaleDateString('vi-VN') : 'Chưa chọn'}<br />
                            ⏰ Từ {timeSlotForm.startHour}:00 đến {timeSlotForm.endHour}:00<br />
                            💰 Giá mỗi khung: {(selectedFieldForTimeSlot?.pricePerHour * timeSlotForm.slotDuration)?.toLocaleString()}đ
                        </div>
                    </Alert>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowTimeSlotModal(false)}>
                        Hủy
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleGenerateTimeSlots}
                        disabled={loading || !timeSlotForm.date}
                    >
                        {loading ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                Đang tạo...
                            </>
                        ) : (
                            '✅ Tạo Khung Giờ'
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Quanlysan;
