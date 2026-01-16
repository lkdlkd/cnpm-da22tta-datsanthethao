const Booking = require('../models/Booking');

// Lấy thống kê doanh thu tổng quan
exports.getRevenueStats = async (req, res) => {
    try {
        const { startDate, endDate, status } = req.query;
        
        let query = {};
        
        // Filter by date range
        if (startDate || endDate) {
            query.bookingDate = {};
            if (startDate) query.bookingDate.$gte = new Date(startDate);
            if (endDate) query.bookingDate.$lte = new Date(endDate);
        }
        
        // Filter by status - chỉ tính completed bookings
        if (status && status !== 'all') {
            query.status = status;
        } else {
            // Mặc định chỉ tính booking completed
            query.status = 'completed';
        }
        
        // Lấy tất cả bookings phù hợp
        const bookings = await Booking.find(query)
            .populate('user', 'fullName email phoneNumber')
            .populate('field', 'name fieldType')
            .populate('timeSlot', 'startTime endTime price')
            .populate('services.service', 'name price')
            .sort({ createdAt: -1 });
        
        // Tính tổng doanh thu
        const total = bookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
        
        // Tính doanh thu tháng này
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthly = bookings
            .filter(b => new Date(b.bookingDate) >= startOfMonth)
            .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
        
        // Tính doanh thu hôm nay
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const daily = bookings
            .filter(b => new Date(b.bookingDate) >= startOfDay)
            .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
        
        // Thống kê theo trạng thái
        const statusStats = await Booking.aggregate([
            { $match: query },
            { 
                $group: { 
                    _id: '$status', 
                    count: { $sum: 1 },
                    total: { $sum: '$totalPrice' }
                } 
            }
        ]);
        
        // Thống kê theo tháng (6 tháng gần nhất)
        const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);
        const monthlyStats = await Booking.aggregate([
            {
                $match: {
                    bookingDate: { $gte: sixMonthsAgo },
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$bookingDate' },
                        month: { $month: '$bookingDate' }
                    },
                    count: { $sum: 1 },
                    revenue: { $sum: '$totalPrice' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);
        
        res.json({
            success: true,
            data: {
                summary: {
                    total,
                    monthly,
                    daily,
                    totalBookings: bookings.length
                },
                statusStats,
                monthlyStats,
                bookings
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thống kê doanh thu',
            error: error.message
        });
    }
};

// Lấy thống kê chi tiết theo ngày
exports.getDailyRevenue = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp startDate và endDate'
            });
        }
        
        const dailyStats = await Booking.aggregate([
            {
                $match: {
                    bookingDate: {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate)
                    },
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$bookingDate' },
                        month: { $month: '$bookingDate' },
                        day: { $dayOfMonth: '$bookingDate' }
                    },
                    count: { $sum: 1 },
                    revenue: { $sum: '$totalPrice' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ]);
        
        res.json({
            success: true,
            data: dailyStats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thống kê theo ngày',
            error: error.message
        });
    }
};

// Lấy top sân có doanh thu cao nhất
exports.getTopFields = async (req, res) => {
    try {
        const { limit = 5 } = req.query;
        
        const topFields = await Booking.aggregate([
            {
                $match: { status: 'completed' }
            },
            {
                $group: {
                    _id: '$field',
                    count: { $sum: 1 },
                    revenue: { $sum: '$totalPrice' }
                }
            },
            { $sort: { revenue: -1 } },
            { $limit: parseInt(limit) },
            {
                $lookup: {
                    from: 'fields',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'fieldInfo'
                }
            },
            { $unwind: '$fieldInfo' }
        ]);
        
        res.json({
            success: true,
            data: topFields
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy top sân',
            error: error.message
        });
    }
};
