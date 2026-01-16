const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'vnpay', 'momo', 'banking', 'zalopay'],
        required: true
    },
    transactionId: {
        type: String,
        default: null
    }, // Mã giao dịch từ cổng thanh toán
    status: {
        type: String,
        enum: ['pending', 'success', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentDate: {
        type: Date,
        default: null
    }
    // refundAmount: {
    //     type: Number,
    //     default: 0
    // },
    // refundDate: {
    //     type: Date,
    //     default: null
    // },
    // description: {
    //     type: String,
    //     default: ''
    // }
}, {
    timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);
