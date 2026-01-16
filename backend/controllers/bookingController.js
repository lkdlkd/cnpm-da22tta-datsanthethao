const Booking = require('../models/Booking');
const TimeSlot = require('../models/TimeSlot');
const Notification = require('../models/Notification');

// Tạo booking mới
exports.createBooking = async (req, res) => {
    try {
        const { field, timeSlot, bookingDate, startTime, endTime, totalPrice, customerName, customerPhone, notes, services, paymentMethod } = req.body;

        // Kiểm tra khung giờ còn trống
        const slot = await TimeSlot.findById(timeSlot);
        if (!slot || slot.status !== 'available') {
            return res.status(400).json({ 
                success: false,
                message: 'Khung giờ không khả dụng' 
            });
        }

        // Kiểm tra và cập nhật số lượng services nếu có
        if (services && services.length > 0) {
            const Service = require('../models/Service');
            for (const serviceItem of services) {
                const service = await Service.findById(serviceItem.service);
                if (!service) {
                    return res.status(400).json({ 
                        success: false,
                        message: `Dịch vụ không tồn tại` 
                    });
                }
                if (service.stock < serviceItem.quantity) {
                    return res.status(400).json({ 
                        success: false,
                        message: `Dịch vụ ${service.name} không đủ số lượng` 
                    });
                }
                // Trừ số lượng tồn kho
                service.stock -= serviceItem.quantity;
                await service.save();
            }
        }

        // Tạo mã booking
        const count = await Booking.countDocuments();
        const bookingCode = 'BK' + String(count + 1).padStart(6, '0');

        // Tạo booking
        const booking = new Booking({
            bookingCode,
            user: req.userId,
            field,
            timeSlot,
            bookingDate,
            startTime,
            endTime,
            totalPrice,
            customerName,
            customerPhone,
            notes,
            services: services || []
        });

        await booking.save();

        // Cập nhật trạng thái khung giờ
        slot.status = 'booked';
        await slot.save();

        // Tạo payment record tự động
        const Payment = require('../models/Payment');
        const payment = new Payment({
            booking: booking._id,
            user: req.userId,
            amount: totalPrice,
            paymentMethod: paymentMethod || 'cash',
            status: 'pending'
        });
        await payment.save();

        // Tạo thông báo
        await Notification.create({
            user: req.userId,
            title: 'Đặt sân thành công',
            message: `Đơn đặt ${booking.bookingCode} đã được tạo thành công`,
            type: 'booking',
            relatedId: booking._id,
            relatedModel: 'Booking'
        });

        res.status(201).json({ 
            success: true,
            message: 'Đặt sân thành công', 
            data: {
                booking,
                payment
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Lỗi server', 
            error: error.message 
        });
    }
};

// Lấy danh sách booking của user
exports.getUserBookings = async (req, res) => {
    try {
        const { status, page , limit  } = req.query;
        let query = { user: req.userId };
        
        if (status) query.status = status;

        // Tính toán phân trang
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Lấy tổng số bookings
        const total = await Booking.countDocuments(query);

        const bookings = await Booking.find(query)
            .populate('field', 'name fieldType location images')
            .populate('timeSlot', 'startTime endTime')
            .populate('services.service', 'name price unit category')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        // Tự động cập nhật status sang completed nếu đã qua thời gian đá
        const now = new Date();
        for (const booking of bookings) {
            if (booking.status === 'confirmed' && booking.paymentStatus === 'paid') {
                const bookingEndDateTime = new Date(`${booking.bookingDate.toISOString().split('T')[0]}T${booking.endTime}`);
                if (now > bookingEndDateTime) {
                    booking.status = 'completed';
                    await booking.save();
                }
            }
        }

        // Kiểm tra xem từng booking đã có review chưa
        const Review = require('../models/Review');
        const bookingsWithReview = await Promise.all(bookings.map(async (booking) => {
            const review = await Review.findOne({ booking: booking._id });
            return {
                ...booking.toObject(),
                hasReviewed: !!review
            };
        }));

        res.json({
            success: true,
            data: {
                bookings: bookingsWithReview,
                pagination: {
                    total,
                    page: pageNum,
                    limit: limitNum,
                    totalPages: Math.ceil(total / limitNum)
                }
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Lỗi server', 
            error: error.message 
        });
    }
};

// Lấy chi tiết booking
exports.getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('user', 'fullName email phone')
            .populate('field')
            .populate('timeSlot')
            .populate('services.service', 'name price unit category description');

        if (!booking) {
            return res.status(404).json({ 
                success: false,
                message: 'Không tìm thấy đơn đặt' 
            });
        }

        res.json({
            success: true,
            data: booking
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Lỗi server', 
            error: error.message 
        });
    }
};

// Hủy booking
exports.cancelBooking = async (req, res) => {
    try {
        const { cancelReason } = req.body;
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ 
                success: false,
                message: 'Không tìm thấy đơn đặt' 
            });
        }

        // Kiểm tra quyền hủy
        if (booking.user.toString() !== req.userId && req.userRole !== 'admin') {
            return res.status(403).json({ 
                success: false,
                message: 'Không có quyền hủy đơn này' 
            });
        }

        // Kiểm tra trạng thái
        if (booking.status === 'cancelled' || booking.status === 'completed') {
            return res.status(400).json({ 
                success: false,
                message: 'Không thể hủy đơn đặt này' 
            });
        }

        booking.status = 'cancelled';
        booking.cancelReason = cancelReason;
        booking.cancelledAt = new Date();
        await booking.save();

        // Giải phóng khung giờ
        await TimeSlot.findByIdAndUpdate(booking.timeSlot, { status: 'available' });

        // Tạo thông báo
        await Notification.create({
            user: booking.user,
            title: 'Đơn đặt đã hủy',
            message: `Đơn đặt ${booking.bookingCode} đã được hủy`,
            type: 'booking',
            relatedId: booking._id,
            relatedModel: 'Booking'
        });

        res.json({ 
            success: true,
            message: 'Hủy đơn đặt thành công', 
            data: booking 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Lỗi server', 
            error: error.message 
        });
    }
};

// Lấy tất cả bookings (Admin)
exports.getAllBookings = async (req, res) => {
    try {
        const { status, startDate, endDate , page, limit } = req.query;
        let query = {};

        if (status) query.status = status;
        if (startDate && endDate) {
            query.bookingDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // Tính toán phân trang
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Lấy tổng số bookings
        const total = await Booking.countDocuments(query);

        const bookings = await Booking.find(query)
            .populate('user', 'fullName email phone')
            .populate('field', 'name fieldType')
            .populate({
                path: 'timeSlot',
                select: 'startTime endTime price'
            })
            .populate('services.service', 'name price unit category')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        // Lấy thông tin payment cho từng booking
        const Payment = require('../models/Payment');
        const bookingsWithPayment = await Promise.all(
            bookings.map(async (booking) => {
                const payment = await Payment.findOne({ booking: booking._id }).select('paymentMethod status');
                return {
                    ...booking.toObject(),
                    payment: payment
                };
            })
        );

        res.json({
            success: true,
            data: {
                bookings: bookingsWithPayment,
                pagination: {
                    total,
                    page: pageNum,
                    limit: limitNum,
                    totalPages: Math.ceil(total / limitNum)
                }
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Lỗi server', 
            error: error.message 
        });
    }
};

// Xác nhận booking (Admin)
exports.confirmBooking = async (req, res) => {
    try {
        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status: 'confirmed' },
            { new: true }
        );

        if (!booking) {
            return res.status(404).json({ 
                success: false,
                message: 'Không tìm thấy đơn đặt' 
            });
        }

        // Tạo thông báo
        await Notification.create({
            user: booking.user,
            title: 'Đơn đặt đã xác nhận',
            message: `Đơn đặt ${booking.bookingCode} đã được xác nhận`,
            type: 'booking',
            relatedId: booking._id,
            relatedModel: 'Booking'
        });

        res.json({ 
            success: true,
            message: 'Xác nhận đơn đặt thành công', 
            data: booking 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Lỗi server', 
            error: error.message 
        });
    }
};
