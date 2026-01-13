const mongoose = require('mongoose');

const fieldSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    fieldType: {
        type: String,
        enum: ['5vs5', '7vs7', '11vs11'],
        required: true
    },
    location: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    images: [{
        type: String
    }],
    pricePerHour: {
        type: Number,
        required: true,
        min: 0
    },
    facilities: [{
        type: String
    }], // Tiện ích: đèn, phòng thay đồ, bãi đỗ xe, etc.
    status: {
        type: String,
        enum: ['active', 'maintenance', 'inactive'],
        default: 'active'
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalReviews: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Field', fieldSchema);
