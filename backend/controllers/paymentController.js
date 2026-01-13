const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');

// Tạo thanh toán
exports.createPayment = async (req, res) => {
    try {
        const { booking: bookingId, amount, paymentMethod } = req.body;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Không tìm thấy đơn đặt' });
        }

        // Kiểm tra quyền
        if (booking.user.toString() !== req.userId) {
            return res.status(403).json({ message: 'Không có quyền thanh toán đơn này' });
        }

        const payment = new Payment({
            booking: bookingId,
            user: req.userId,
            amount,
            paymentMethod,
            status: paymentMethod === 'cash' ? 'pending' : 'pending'
        });

        await payment.save();

        // Nếu thanh toán tiền mặt, đánh dấu là chờ xác nhận
        if (paymentMethod === 'cash') {
            booking.paymentStatus = 'unpaid';
        }

        await booking.save();

        res.status(201).json({ message: 'Tạo thanh toán thành công', payment });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// Xử lý callback từ cổng thanh toán
exports.handlePaymentCallback = async (req, res) => {
    try {
        const { paymentId, transactionId, status } = req.body;

        const payment = await Payment.findById(paymentId);
        if (!payment) {
            return res.status(404).json({ message: 'Không tìm thấy thanh toán' });
        }

        payment.status = status;
        payment.transactionId = transactionId;
        if (status === 'success') {
            payment.paymentDate = new Date();
        }
        await payment.save();

        // Cập nhật trạng thái booking
        const booking = await Booking.findById(payment.booking);
        if (status === 'success') {
            booking.paymentStatus = 'paid';
            booking.status = 'confirmed';
        }
        await booking.save();

        // Tạo thông báo
        await Notification.create({
            user: payment.user,
            title: status === 'success' ? 'Thanh toán thành công' : 'Thanh toán thất bại',
            message: status === 'success' 
                ? `Thanh toán cho đơn ${booking.bookingCode} đã thành công`
                : `Thanh toán cho đơn ${booking.bookingCode} thất bại`,
            type: 'payment',
            relatedId: payment._id,
            relatedModel: 'Payment'
        });

        res.json({ message: 'Cập nhật thanh toán thành công', payment });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// Lấy thông tin thanh toán
exports.getPaymentByBooking = async (req, res) => {
    try {
        const payment = await Payment.findOne({ booking: req.params.bookingId })
            .populate('booking')
            .populate('user', 'fullName email');

        if (!payment) {
            return res.status(404).json({ message: 'Không tìm thấy thanh toán' });
        }

        res.json(payment);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// Xác nhận thanh toán tiền mặt (Admin/Staff)
exports.confirmCashPayment = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id);
        if (!payment) {
            return res.status(404).json({ message: 'Không tìm thấy thanh toán' });
        }

        payment.status = 'success';
        payment.paymentDate = new Date();
        await payment.save();

        // Cập nhật booking
        const booking = await Booking.findById(payment.booking);
        booking.paymentStatus = 'paid';
        booking.status = 'confirmed';
        await booking.save();

        // Tạo thông báo
        await Notification.create({
            user: payment.user,
            title: 'Thanh toán đã xác nhận',
            message: `Thanh toán tiền mặt cho đơn ${booking.bookingCode} đã được xác nhận`,
            type: 'payment',
            relatedId: payment._id,
            relatedModel: 'Payment'
        });

        res.json({ message: 'Xác nhận thanh toán thành công', payment });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// Lấy lịch sử thanh toán của user
exports.getUserPayments = async (req, res) => {
    try {
        const payments = await Payment.find({ user: req.userId })
            .populate({
                path: 'booking',
                populate: { path: 'field', select: 'name fieldType' }
            })
            .sort({ createdAt: -1 });

        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};
