const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['booking', 'payment', 'promotion', 'system', 'reminder'],
        default: 'system'
    },
    relatedId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    }, // ID liên quan (booking, payment, etc.)
    relatedModel: {
        type: String,
        enum: ['Booking', 'Payment', 'Review', null],
        default: null
    },
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Index để query thông báo chưa đọc của user
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
