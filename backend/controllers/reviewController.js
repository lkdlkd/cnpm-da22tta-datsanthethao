const Review = require('../models/Review');
const Field = require('../models/Field');
const Booking = require('../models/Booking');

// Tạo đánh giá mới
exports.createReview = async (req, res) => {
    try {
        const { field, booking, rating, comment, images } = req.body;

        // Kiểm tra booking có tồn tại và đã hoàn thành
        const bookingData = await Booking.findById(booking);
        if (!bookingData) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn đặt' });
        }

        if (bookingData.user.toString() !== req.userId) {
            return res.status(403).json({ success: false, message: 'Không có quyền đánh giá đơn này' });
        }

        if (bookingData.status !== 'completed') {
            return res.status(400).json({ success: false, message: 'Chỉ có thể đánh giá sau khi hoàn thành' });
        }

        // Kiểm tra đã đánh giá chưa
        const existingReview = await Review.findOne({ booking });
        if (existingReview) {
            return res.status(400).json({ success: false, message: 'Đã đánh giá đơn này rồi' });
        }

        const review = new Review({
            user: req.userId,
            field,
            booking,
            rating,
            comment,
            images,
            isVerified: true
        });

        await review.save();

        // Cập nhật rating trung bình của sân
        const fieldData = await Field.findById(field);
        const reviews = await Review.find({ field });
        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
        fieldData.rating = totalRating / reviews.length;
        fieldData.totalReviews = reviews.length;
        await fieldData.save();

        res.status(201).json({ success: true, message: 'Đánh giá thành công', data: review });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

// Lấy đánh giá của một sân (có phân trang)
exports.getReviewsByField = async (req, res) => {
    try {
        const { fieldId } = req.params;
        const { rating, sort, page = 1, limit = 10 } = req.query;

        let query = { field: fieldId };
        if (rating) query.rating = Number(rating);

        let sortOption = { createdAt: -1 };
        if (sort === 'rating-high') sortOption = { rating: -1 };
        if (sort === 'rating-low') sortOption = { rating: 1 };
        if (sort === 'likes') sortOption = { likes: -1 };

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const total = await Review.countDocuments(query);

        const reviews = await Review.find(query)
            .populate('user', 'fullName avatar')
            .sort(sortOption)
            .skip(skip)
            .limit(limitNum);

        res.json({
            success: true,
            data: reviews,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};


// Trả lời đánh giá (Admin)
exports.replyToReview = async (req, res) => {
    try {
        const { content } = req.body;
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đánh giá' });
        }

        review.reply = {
            content,
            createdAt: new Date()
        };

        await review.save();
        res.json({ success: true, message: 'Phản hồi thành công', data: review });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

// Lấy tất cả đánh giá (Admin)
exports.getAllReviews = async (req, res) => {
    try {
        const { rating, page = 1, limit = 10 } = req.query;
        let query = {};

        if (rating) query.rating = Number(rating);

        // Tính toán phân trang
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Lấy tổng số reviews
        const total = await Review.countDocuments(query);

        const reviews = await Review.find(query)
            .populate('user', 'fullName email phone avatar')
            .populate('field', 'name fieldType')
            .populate('booking', 'bookingCode')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        res.json({
            success: true,
            data: reviews,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

// Xóa đánh giá (Admin hoặc chủ đánh giá)
exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đánh giá' });
        }

        // Kiểm tra quyền
        if (review.user.toString() !== req.userId && req.userRole !== 'admin') {
            return res.status(403).json({ success: false, message: 'Không có quyền xóa đánh giá này' });
        }

        await review.deleteOne();

        // Cập nhật lại rating của sân
        const fieldData = await Field.findById(review.field);
        const reviews = await Review.find({ field: review.field });
        if (reviews.length > 0) {
            const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
            fieldData.rating = totalRating / reviews.length;
            fieldData.totalReviews = reviews.length;
        } else {
            fieldData.rating = 0;
            fieldData.totalReviews = 0;
        }
        await fieldData.save();

        res.json({ success: true, message: 'Xóa đánh giá thành công' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};
