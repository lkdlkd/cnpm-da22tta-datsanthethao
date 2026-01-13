const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
    field: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Field',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    startTime: {
        type: String,
        required: true
    }, // Format: "HH:MM" - VD: "08:00"
    endTime: {
        type: String,
        required: true
    }, // Format: "HH:MM" - VD: "09:00"
    price: {
        type: Number,
        required: true,
        min: 0
    }, // Giá có thể thay đổi theo khung giờ (giờ vàng)
    status: {
        type: String,
        enum: ['available', 'booked', 'blocked'],
        default: 'available'
    },
    isWeekend: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index để tìm kiếm nhanh theo sân và ngày
timeSlotSchema.index({ field: 1, date: 1, startTime: 1 });

module.exports = mongoose.model('TimeSlot', timeSlotSchema);
