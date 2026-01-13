import React, { useState, useEffect } from 'react';
import {
    Container,
    Row,
    Col,
    Table,
    Button,
    Modal,
    Form,
    Card,
    Alert,
    Badge
} from 'react-bootstrap';
import { timeSlotService, fieldService } from '../../services/api';
import './AdminCommon.css';

const Quanlykhungio = () => {
    const [fields, setFields] = useState([]);
    const [selectedField, setSelectedField] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [timeSlots, setTimeSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const [generateForm, setGenerateForm] = useState({
        startHour: 6,
        endHour: 22,
        slotDuration: 1
    });

    useEffect(() => {
        fetchFields();
    }, []);

    useEffect(() => {
        if (selectedField && selectedDate) {
            fetchTimeSlots();
        } else {
            setTimeSlots([]);
        }
    }, [selectedField, selectedDate]);

    const fetchFields = async () => {
        try {
            const response = await fieldService.getAllFields();
            setFields(response.data.data || []);
        } catch (err) {
            setError('Không thể tải danh sách sân');
        }
    };

    const fetchTimeSlots = async () => {
        setLoading(true);
        try {
            const response = await timeSlotService.getTimeSlotsByFieldAndDate(selectedField, selectedDate);
            setTimeSlots(response.data || []);
        } catch (err) {

            setTimeSlots([]);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateSlots = async () => {
        if (!selectedField || !selectedDate) {
            setError('Vui lòng chọn sân và ngày');
            return;
        }

        try {
            await timeSlotService.generateTimeSlots({
                fieldId: selectedField,
                date: selectedDate,
                startHour: generateForm.startHour,
                endHour: generateForm.endHour,
                slotDuration: generateForm.slotDuration
            });
            setSuccess('Tạo khung giờ thành công!');
            setShowModal(false);
            fetchTimeSlots(); // Refresh danh sách
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleDeleteSlot = async (slotId, slotStatus) => {
        const confirmMsg = slotStatus === 'booked' 
            ? 'Khung giờ này đã có người đặt! Bạn có chắc muốn xóa?' 
            : 'Bạn có chắc muốn xóa khung giờ này?';
            
        if (!window.confirm(confirmMsg)) return;
        
        try {
            await timeSlotService.deleteTimeSlot(slotId);
            setSuccess('Xóa khung giờ thành công!');
            fetchTimeSlots();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể xóa khung giờ');
        }
    };

    const handleResetSlot = async (slotId) => {
        if (!window.confirm('Bạn có chắc muốn reset khung giờ này về trạng thái trống?')) return;
        
        try {
            await timeSlotService.updateTimeSlot(slotId, { status: 'available' });
            setSuccess('Reset khung giờ thành công!');
            fetchTimeSlots();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể reset khung giờ');
        }
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            available: { variant: 'success', text: 'Trống' },
            booked: { variant: 'danger', text: 'Đã đặt' },
            pending: { variant: 'warning', text: 'Chờ xác nhận' }
        };
        const { variant, text } = statusMap[status] || { variant: 'secondary', text: status };
        return <Badge bg={variant}>{text}</Badge>;
    };

    return (
        <Container fluid className="admin-page">
            <h2>⏰ Quản Lý Khung Giờ Sân</h2>

            {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}
            {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

            <Card className="mb-4">
                <Card.Header>
                    <h5>🎯 Tạo Khung Giờ Tự Động</h5>
                </Card.Header>
                <Card.Body>
                    <Row>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Chọn Sân</Form.Label>
                                <Form.Select
                                    value={selectedField}
                                    onChange={(e) => setSelectedField(e.target.value)}
                                >
                                    <option value="">-- Chọn sân --</option>
                                    {fields.map(field => (
                                        <option key={field._id} value={field._id}>
                                            {field.name} ({field.fieldType})
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Chọn Ngày</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4} className="d-flex align-items-end">
                            <Button 
                                variant="primary" 
                                className="w-100 mb-3"
                                onClick={() => setShowModal(true)}
                                disabled={!selectedField || !selectedDate}
                            >
                                ⚙️ Cấu Hình & Tạo
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Hiển thị danh sách khung giờ */}
            {selectedField && selectedDate && (
                <Card className="mb-4">
                    <Card.Header className="d-flex justify-content-between align-items-center">
                        <h5>Danh Sách Khung Giờ</h5>
                        <small className="text-muted">
                            {new Date(selectedDate).toLocaleDateString('vi-VN')} - {fields.find(f => f._id === selectedField)?.name}
                        </small>
                    </Card.Header>
                    <Card.Body>
                        {loading ? (
                            <div className="text-center py-4">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : timeSlots.length === 0 ? (
                            <Alert variant="warning">
                                Chưa có khung giờ nào cho sân này trong ngày đã chọn. 
                                Vui lòng tạo khung giờ mới.
                            </Alert>
                        ) : (
                            <Table striped bordered hover responsive>
                                <thead>
                                    <tr>
                                        <th>STT</th>
                                        <th>Giờ Bắt Đầu</th>
                                        <th>Giờ Kết Thúc</th>
                                        <th>Giá (VNĐ)</th>
                                        <th>Trạng Thái</th>
                                        <th>Thao Tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {timeSlots.map((slot, index) => (
                                        <tr key={slot._id}>
                                            <td>{index + 1}</td>
                                            <td>{slot.startTime}</td>
                                            <td>{slot.endTime}</td>
                                            <td>{slot.price?.toLocaleString()}</td>
                                            <td>{getStatusBadge(slot.status)}</td>
                                            <td>
                                                <div className="d-flex gap-2">
                                                    {slot.status !== 'available' && (
                                                        <Button 
                                                            variant="warning" 
                                                            size="sm"
                                                            onClick={() => handleResetSlot(slot._id)}
                                                            title="Reset về trạng thái trống"
                                                        >
                                                            🔄 Reset
                                                        </Button>
                                                    )}
                                                    <Button 
                                                        variant="danger" 
                                                        size="sm"
                                                        onClick={() => handleDeleteSlot(slot._id, slot.status)}
                                                        title="Xóa khung giờ"
                                                    >
                                                        🗑️ Xóa
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        )}
                    </Card.Body>
                </Card>
            )}

            <Card>
                <Card.Header>
                    <h5>Hướng Dẫn</h5>
                </Card.Header>
                <Card.Body>
                    <ol>
                        <li>Chọn sân bóng muốn xem/tạo khung giờ</li>
                        <li>Chọn ngày cần xem/tạo lịch</li>
                        <li>Xem danh sách khung giờ đã tạo (nếu có)</li>
                        <li>Nhấn "Cấu Hình & Tạo" để tạo thêm khung giờ mới</li>
                    </ol>
                    <Alert variant="info">
                        <strong>Lưu ý:</strong> Các khung giờ sẽ được tạo tự động với trạng thái "available". 
                        Giá sẽ lấy theo giá mặc định của sân.
                        <ul className="mt-2 mb-0">
                            <li><strong>Reset:</strong> Chuyển khung giờ đã đặt về trạng thái trống</li>
                            <li><strong>Xóa:</strong> Xóa hoàn toàn khung giờ (kể cả đã đặt)</li>
                        </ul>
                    </Alert>
                </Card.Body>
            </Card>

            {/* Modal Cấu Hình */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>⚙️ Cấu Hình Khung Giờ</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Giờ Bắt Đầu</Form.Label>
                        <Form.Control
                            type="number"
                            min="0"
                            max="23"
                            value={generateForm.startHour}
                            onChange={(e) => setGenerateForm({...generateForm, startHour: Number(e.target.value)})}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Giờ Kết Thúc</Form.Label>
                        <Form.Control
                            type="number"
                            min="1"
                            max="24"
                            value={generateForm.endHour}
                            onChange={(e) => setGenerateForm({...generateForm, endHour: Number(e.target.value)})}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Thời Lượng Mỗi Slot (giờ)</Form.Label>
                        <Form.Select
                            value={generateForm.slotDuration}
                            onChange={(e) => setGenerateForm({...generateForm, slotDuration: Number(e.target.value)})}
                        >
                            <option value="1">1 giờ</option>
                            <option value="1.5">1.5 giờ</option>
                            <option value="2">2 giờ</option>
                        </Form.Select>
                    </Form.Group>

                    <Alert variant="warning">
                        Sẽ tạo khoảng <strong>
                            {Math.floor((generateForm.endHour - generateForm.startHour) / generateForm.slotDuration)}
                        </strong> khung giờ
                    </Alert>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Hủy
                    </Button>
                    <Button variant="primary" onClick={handleGenerateSlots}>
                        ✅ Tạo Khung Giờ
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Quanlykhungio;
                                 
