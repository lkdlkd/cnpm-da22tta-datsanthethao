import React, { useState, useEffect } from 'react';
import { revenueService } from '../../services/api';
import './AdminCommon.css';
import './SelectArrow.css';
import './Quanlydoanhthu.css';

const Quanlydoanhthu = () => {
    const [revenue, setRevenue] = useState({
        total: 0,
        monthly: 0,
        daily: 0,
        totalBookings: 0
    });
    const [bookings, setBookings] = useState([]);
    const [statusStats, setStatusStats] = useState([]);
    const [monthlyStats, setMonthlyStats] = useState([]);
    const [topFields, setTopFields] = useState([]);
    const [filter, setFilter] = useState({
        startDate: '',
        endDate: '',
        status: 'completed' // Mặc định hiển thị booking hoàn thành
    });
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchRevenueStats();
        fetchTopFields();
    }, [filter]);

    const fetchRevenueStats = async () => {
        setLoading(true);
        try {
            const params = {
                status: filter.status
            };
            
            if (filter.startDate) params.startDate = filter.startDate;
            if (filter.endDate) params.endDate = filter.endDate;
            
            const response = await revenueService.getRevenueStats(params);
            
            if (response.data.success) {
                const { summary, statusStats, monthlyStats, bookings } = response.data.data;
                setRevenue({
                    total: summary.total || 0,
                    monthly: summary.monthly || 0,
                    daily: summary.daily || 0,
                    totalBookings: summary.totalBookings || 0
                });
                setStatusStats(statusStats || []);
                setMonthlyStats(monthlyStats || []);
                setBookings(bookings || []);
            }
        } catch (error) {
            console.error('Error fetching revenue stats:', error);
            alert(error.response?.data?.message || 'Không thể tải thống kê doanh thu');
        } finally {
            setLoading(false);
        }
    };

    const fetchTopFields = async () => {
        try {
            const params = {
                limit: 5
            };
            
            if (filter.startDate) params.startDate = filter.startDate;
            if (filter.endDate) params.endDate = filter.endDate;
            
            const response = await revenueService.getTopFields(params);
            
            if (response.data.success) {
                setTopFields(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching top fields:', error);
        }
    };

    const handleViewDetail = (booking) => {
        setSelectedBooking(booking);
        setShowDetailModal(true);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('vi-VN');
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'pending': { text: 'Chờ xác nhận', class: 'bg-warning' },
            'confirmed': { text: 'Đã xác nhận', class: 'bg-info' },
            'completed': { text: 'Hoàn thành', class: 'bg-success' },
            'cancelled': { text: 'Đã hủy', class: 'bg-danger' }
        };
        const statusInfo = statusMap[status] || { text: status, class: 'bg-secondary' };
        return <span className={`badge ${statusInfo.class}`}>{statusInfo.text}</span>;
    };

    return (
        <div className="quanlydoanhthu-page">
            <h2>
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '12px', verticalAlign: 'middle' }}>
                    <path d="M4 11H2v3h2v-3zm5-4H7v7h2V7zm5-5v12h-2V2h2zm-2-1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1h-2zM6 7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7zm-5 4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-3z"/>
                </svg>
                Quản lý Doanh Thu
            </h2>

            {/* Revenue Cards */}
            <div className="row mb-4">
                <div className="col-md-4">
                    <div className="card revenue-card">
                        <div className="card-body">
                            <div className="revenue-icon total">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
                                </svg>
                            </div>
                            <h3>{formatCurrency(revenue.total)}</h3>
                            <p className="text-muted">Tổng doanh thu ({revenue.totalBookings} đơn)</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card revenue-card">
                        <div className="card-body">
                            <div className="revenue-icon monthly">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/>
                                </svg>
                            </div>
                            <h3>{formatCurrency(revenue.monthly)}</h3>
                            <p className="text-muted">Doanh thu tháng này</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card revenue-card">
                        <div className="card-body">
                            <div className="revenue-icon daily">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                                </svg>
                            </div>
                            <h3>{formatCurrency(revenue.daily)}</h3>
                            <p className="text-muted">Doanh thu hôm nay</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Section */}
            <div className="card filter-section mb-4">
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-3">
                            <label className="form-label">Từ ngày</label>
                            <input
                                type="date"
                                className="form-control"
                                value={filter.startDate}
                                onChange={(e) => setFilter({ ...filter, startDate: e.target.value })}
                            />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">Đến ngày</label>
                            <input
                                type="date"
                                className="form-control"
                                value={filter.endDate}
                                onChange={(e) => setFilter({ ...filter, endDate: e.target.value })}
                            />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">Trạng thái</label>
                            <select
                                className="form-select"
                                value={filter.status}
                                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                            >
                                <option value="all">Tất cả</option>
                                <option value="pending">Chờ xác nhận</option>
                                <option value="confirmed">Đã xác nhận</option>
                                <option value="completed">Hoàn thành</option>
                                <option value="cancelled">Đã hủy</option>
                            </select>
                        </div>
                        <div className="col-md-3 d-flex align-items-end">
                            <button 
                                className="btn btn-primary w-100" 
                                onClick={() => {
                                    fetchRevenueStats();
                                    fetchTopFields();
                                }}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Đang tải...
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                                            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                                        </svg>
                                        Lọc
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Statistics Sections */}
            <div className="row mb-4">
                {/* Monthly Stats */}
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="mb-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '8px' }}>
                                    <path d="M1 11a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-3zm5-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7zm5-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V2z"/>
                                </svg>
                                Doanh thu 6 tháng gần nhất
                            </h5>
                            {monthlyStats.length === 0 ? (
                                <p className="text-muted text-center py-3">Chưa có dữ liệu</p>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-sm table-hover">
                                        <thead>
                                            <tr>
                                                <th>Tháng/Năm</th>
                                                <th className="text-end">Số đơn</th>
                                                <th className="text-end">Doanh thu</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {monthlyStats.map((stat, index) => (
                                                <tr key={index}>
                                                    <td>{stat._id.month}/{stat._id.year}</td>
                                                    <td className="text-end">
                                                        <span className="badge bg-info">{stat.count}</span>
                                                    </td>
                                                    <td className="text-end fw-bold text-success">
                                                        {formatCurrency(stat.revenue || 0)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Top Fields */}
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="mb-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '8px' }}>
                                    <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5V2zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1H4z"/>
                                    <path d="M10.854 5.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 7.793l2.646-2.647a.5.5 0 0 1 .708 0z"/>
                                </svg>
                                Top 5 sân có doanh thu cao nhất
                            </h5>
                            {topFields.length === 0 ? (
                                <p className="text-muted text-center py-3">Chưa có dữ liệu</p>
                            ) : (
                                <div className="top-fields-list">
                                    {topFields.map((field, index) => (
                                        <div key={field._id} className="top-field-item d-flex align-items-center mb-3 p-3 border rounded">
                                            <div className="rank-badge me-3">
                                                <span className={`badge ${index === 0 ? 'bg-warning' : index === 1 ? 'bg-secondary' : index === 2 ? 'bg-info' : 'bg-light text-dark'} rounded-circle`} style={{ fontSize: '16px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    {index + 1}
                                                </span>
                                            </div>
                                            <div className="flex-grow-1">
                                                <div className="fw-bold">{field.fieldInfo?.name || 'N/A'}</div>
                                                <small className="text-muted">
                                                    {field.fieldInfo?.fieldType || 'N/A'} • {field.fieldInfo?.location || 'N/A'}
                                                </small>
                                            </div>
                                            <div className="text-end">
                                                <div className="fw-bold text-success">{formatCurrency(field.revenue || 0)}</div>
                                                <small className="text-muted">{field.count || 0} đơn</small>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

           

            {/* Bookings Table - Compact */}
            {loading ? (
                <div className="card">
                    <div className="card-body text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3">Đang tải dữ liệu...</p>
                    </div>
                </div>
            ) : (
                <div className="card">
                    <div className="card-body">
                        <h5 className="mb-3">
                            Danh sách đặt sân 
                            <span className="badge bg-primary ms-2">{bookings.length} đơn</span>
                        </h5>
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Mã đơn</th>
                                        <th>Khách hàng</th>
                                        <th>Ngày đặt</th>
                                        <th>Tổng tiền</th>
                                        <th>Trạng thái</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="text-center py-4">
                                                <p className="text-muted mb-0">Không có dữ liệu</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        bookings.map((booking) => (
                                            <tr key={booking._id}>
                                                <td>#{booking._id?.slice(-6)}</td>
                                                <td>{booking.user?.fullName || 'N/A'}</td>
                                                <td>{formatDate(booking.bookingDate)}</td>
                                                <td className="fw-bold text-success">{formatCurrency(booking.totalPrice)}</td>
                                                <td>{getStatusBadge(booking.status)}</td>
                                                <td>
                                                    <button 
                                                        className="action-btn view"
                                                        onClick={() => handleViewDetail(booking)}
                                                        title="Xem chi tiết"
                                                    >
                                                        
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {showDetailModal && selectedBooking && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Chi tiết đặt sân #{selectedBooking._id?.slice(-6)}</h5>
                                <button type="button" className="btn-close" onClick={() => setShowDetailModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <strong>Khách hàng:</strong> {selectedBooking.user?.fullName || 'N/A'}
                                    </div>
                                    <div className="col-md-6">
                                        <strong>Email:</strong> {selectedBooking.user?.email || 'N/A'}
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <strong>Điện thoại:</strong> {selectedBooking.user?.phoneNumber || 'N/A'}
                                    </div>
                                    <div className="col-md-6">
                                        <strong>Trạng thái:</strong> {getStatusBadge(selectedBooking.status)}
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <strong>Ngày đặt:</strong> {formatDate(selectedBooking.bookingDate)}
                                    </div>
                                    <div className="col-md-6">
                                        <strong>Ngày tạo:</strong> {formatDate(selectedBooking.createdAt)}
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <strong>Sân:</strong> {selectedBooking.field?.name || 'N/A'}
                                    </div>
                                    <div className="col-md-6">
                                        <strong>Loại sân:</strong> {selectedBooking.field?.fieldType || 'N/A'}
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <strong>Khung giờ:</strong> {selectedBooking.timeSlot?.startTime} - {selectedBooking.timeSlot?.endTime}
                                    </div>
                                    <div className="col-md-6">
                                        <strong>Giá sân:</strong> {formatCurrency(selectedBooking.timeSlot?.price || 0)}
                                    </div>
                                </div>
                                
                                {selectedBooking.services && selectedBooking.services.length > 0 && (
                                    <div className="mb-3">
                                        <strong>Dịch vụ:</strong>
                                        <ul>
                                            {selectedBooking.services.map((serviceItem, index) => (
                                                <li key={index}>
                                                    {serviceItem.service?.name} - SL: {serviceItem.quantity} - {formatCurrency((serviceItem.service?.price || 0) * serviceItem.quantity)}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                
                                <div className="row mb-3">
                                    <div className="col-md-12">
                                        <strong>Ghi chú:</strong> {selectedBooking.notes || 'Không có'}
                                    </div>
                                </div>
                                
                                <div className="row">
                                    <div className="col-md-12 text-end">
                                        <h4>Tổng tiền: <span className="text-success">{formatCurrency(selectedBooking.totalPrice)}</span></h4>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowDetailModal(false)}>Đóng</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Quanlydoanhthu;
