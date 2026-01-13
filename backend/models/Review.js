const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    field: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Field',
        required: true
    },
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true,
        trim: true
    },
    images: [{
        type: String
    }],
    isVerified: {
        type: Boolean,
        default: false
    }, // Đánh giá từ người dùng đã đặt sân
    reply: {
        content: String,
        createdAt: Date
    }, // Phản hồi từ admin/chủ sân
    likes: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Một booking chỉ được đánh giá 1 lần
reviewSchema.index({ booking: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
