const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    bookingCode: {
        type: String,
        required: true,
        unique: true
    },
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
    timeSlot: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TimeSlot',
        required: true
    },
    bookingDate: {
        type: Date,
        required: true
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true,
        min: 0
    },
    services: [{
        service: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Service'
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true,
            min: 0
        }
    }],
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['unpaid', 'paid', 'refunded'],
        default: 'unpaid'
    },
    customerName: {
        type: String,
        required: true
    },
    customerPhone: {
        type: String,
        required: true
    },
    notes: {
        type: String,
        default: ''
    },
    cancelReason: {
        type: String,
        default: null
    },
    cancelledAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Tự động tạo mã đặt lịch
bookingSchema.pre('save', async function(next) {
    if (!this.bookingCode) {
        const count = await mongoose.model('Booking').countDocuments();
        this.bookingCode = 'BK' + String(count + 1).padStart(6, '0');
    }
    next();
});

module.exports = mongoose.model('Booking', bookingSchema);
